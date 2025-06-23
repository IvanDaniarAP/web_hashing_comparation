import express from 'express';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', req.user.uid));
    
    if (!userDoc.exists()) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: userDoc.data()
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { displayName, preferences } = req.body;
    const updateData = {
      ...(displayName && { displayName }),
      ...(preferences && { preferences }),
      updatedAt: new Date().toISOString()
    };

    await updateDoc(doc(db, 'users', req.user.uid), updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

export default router;