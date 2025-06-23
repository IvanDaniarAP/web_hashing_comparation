import express from 'express';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { authMiddleware } from '../middleware/auth.js';
import { WalletUtils } from '../utils/wallet.js';

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

    // Get balance
    const balance = await WalletUtils.getBalance(userData.walletAddress);

    res.json({
      success: true,
      wallet: {
        address: userData.walletAddress,
        balance
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