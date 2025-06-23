import express from 'express';
import { collection, addDoc, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { authMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { HashingUtils } from '../utils/hashing.js';

const router = express.Router();

// Create transaction
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { to, amount, hashingMethod = 'SHA512' } = req.body;

    if (!to || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Recipient address and amount are required'
      });
    }

    // Get user wallet address
    const userDoc = await getDoc(doc(db, 'users', req.user.uid));
    const userData = userDoc.data();

    if (!userData?.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'User wallet not found'
      });
    }

    // Create transaction data
    const transactionData = {
      from: userData.walletAddress,
      to,
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

    transactionData.hash = hashResult.hash;
    transactionData.executionTime = hashResult.time;
    transactionData.status = 'confirmed';

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'transactions'), transactionData);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
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
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', req.user.uid),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const transactions = [];

    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    res.json({
      success: true,
      transactions: paginatedTransactions,
      total: transactions.length,
      page: parseInt(page),
      totalPages: Math.ceil(transactions.length / limit)
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