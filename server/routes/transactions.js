import express from 'express';
import { collection, addDoc, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { authMiddleware } from '../middleware/auth.js';
import { HashingUtils } from '../utils/hashing.js';
import { BlockchainUtils } from '../utils/blockchain.js';

const router = express.Router();

// Create transaction by email
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { toEmail, amount, hashingMethod = 'SHA512' } = req.body;

    if (!toEmail || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email and amount are required'
      });
    }

    // Get sender's wallet data
    const walletDoc = await getDoc(doc(db, 'wallets', req.user.uid));
    const walletData = walletDoc.data();

    if (!walletData?.privateKey) {
      return res.status(400).json({
        success: false,
        message: 'Sender wallet not found'
      });
    }

    // Check if recipient email exists
    const recipientAddress = await BlockchainUtils.getAddressByEmail(toEmail);
    if (!recipientAddress) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email not found'
      });
    }

    // Create transaction data for hashing
    const transactionData = {
      from: walletData.address,
      to: recipientAddress,
      toEmail,
      amount: parseFloat(amount),
      hashingMethod,
      status: 'pending',
      userId: req.user.uid,
      createdAt: new Date().toISOString()
    };

    // Generate hash based on method
    const dataToHash = `${transactionData.from}${transactionData.to}${transactionData.amount}${Date.now()}`;
    let hashResult;

    switch (hashingMethod) {
      case 'BLAKE3':
        hashResult = await HashingUtils.blake3HashFn(dataToHash);
        break;
      case 'SHA512+BLAKE3':
        hashResult = await HashingUtils.combinedHash(dataToHash);
        break;
      default:
        hashResult = await HashingUtils.sha512Hash(dataToHash);
    }

    // Execute blockchain transaction
    const blockchainResult = await BlockchainUtils.transferByEmail(
      walletData.privateKey,
      toEmail,
      amount,
      hashingMethod,
      hashResult.hash,
      Math.round(hashResult.time)
    );

    if (!blockchainResult.success) {
      return res.status(400).json({
        success: false,
        message: blockchainResult.error || 'Transaction failed'
      });
    }

    transactionData.hash = hashResult.hash;
    transactionData.executionTime = hashResult.time;
    transactionData.status = 'confirmed';
    transactionData.blockchainTxHash = blockchainResult.txHash;

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'transactions'), transactionData);

    res.status(201).json({
      success: true,
      message: 'Transaction sent successfully',
      transaction: {
        id: docRef.id,
        ...transactionData
      }
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction'
    });
  }
});

// Get user transactions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Get user's wallet address
    const userDoc = await getDoc(doc(db, 'users', req.user.uid));
    const userData = userDoc.data();

    if (!userData?.walletAddress) {
      return res.json({
        success: true,
        transactions: [],
        total: 0,
        page: parseInt(page),
        totalPages: 0
      });
    }

    // Get blockchain transaction history
    const blockchainTxs = await BlockchainUtils.getTransactionHistory(userData.walletAddress);

    // Get Firestore transactions for additional data
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', req.user.uid),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const firestoreTxs = [];

    querySnapshot.forEach((doc) => {
      firestoreTxs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Merge blockchain and Firestore data
    const allTransactions = blockchainTxs.map(blockchainTx => {
      const firestoreTx = firestoreTxs.find(tx => tx.hash === blockchainTx.transactionHash);
      return {
        id: firestoreTx?.id || blockchainTx.txHash,
        from: blockchainTx.from,
        to: blockchainTx.to,
        amount: blockchainTx.amount,
        hashingMethod: blockchainTx.hashMethod,
        hash: blockchainTx.transactionHash,
        executionTime: blockchainTx.executionTime,
        status: 'confirmed',
        createdAt: firestoreTx?.createdAt || new Date().toISOString(),
        blockchainTxHash: blockchainTx.txHash,
        toEmail: firestoreTx?.toEmail || ''
      };
    });

    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTransactions = allTransactions.slice(startIndex, endIndex);

    res.json({
      success: true,
      transactions: paginatedTransactions,
      total: allTransactions.length,
      page: parseInt(page),
      totalPages: Math.ceil(allTransactions.length / limit)
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions'
    });
  }
});

// Get transaction by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const transactionDoc = await getDoc(doc(db, 'transactions', req.params.id));
    
    if (!transactionDoc.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const transactionData = transactionDoc.data();

    // Check if user owns this transaction
    if (transactionData.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      transaction: {
        id: transactionDoc.id,
        ...transactionData
      }
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction'
    });
  }
});

export default router;