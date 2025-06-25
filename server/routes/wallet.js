import express from 'express';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { authMiddleware } from '../middleware/auth.js';
import { BlockchainUtils } from '../utils/blockchain.js';

const router = express.Router();

// Get wallet info
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', req.user.uid));
    const userData = userDoc.data();

    if (!userData?.walletAddress) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Get SUSD balance from blockchain
    const susdBalance = await BlockchainUtils.getBalance(userData.walletAddress);

    res.json({
      success: true,
      wallet: {
        address: userData.walletAddress,
        balance: {
          susd: parseFloat(susdBalance).toFixed(4),
          usd: (parseFloat(susdBalance) * 1).toFixed(2) // SUSD is pegged to USD
        }
      }
    });

  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet information'
    });
  }
});

export default router;