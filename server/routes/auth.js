import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { auth, db } from '../config/firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { WalletUtils } from '../utils/wallet.js';
import { BlockchainUtils } from '../utils/blockchain.js';

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('displayName').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, displayName } = req.body;

    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, { displayName });

    // Generate wallet
    const wallet = WalletUtils.generateWallet();

    // Register user on blockchain contract
    const blockchainResult = await BlockchainUtils.registerUserOnContract(email, wallet.address);
    if (!blockchainResult.success) {
      console.error('Failed to register user on blockchain:', blockchainResult.error);
    }

    // Save user data to Firestore
    const userData = {
      uid: user.uid,
      email,
      displayName,
      walletAddress: wallet.address,
      createdAt: new Date().toISOString(),
      isActive: true,
      hasInitialSupply: true
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    // Save wallet data (encrypted in production)
    await setDoc(doc(db, 'wallets', user.uid), {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic,
      createdAt: new Date().toISOString()
    });

    // Generate JWT token with 30 minute expiry
    const token = jwt.sign(
      { uid: user.uid, email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30m' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userData,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    // Generate JWT token with 30 minute expiry
    const token = jwt.sign(
      { uid: user.uid, email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30m' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Reset password
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    await sendPasswordResetEmail(auth, email);

    res.json({
      success: true,
      message: 'Password reset email sent'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send reset email'
    });
  }
});

export default router;