import express from 'express';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { authMiddleware } from '../middleware/auth.js';
import { HashingUtils } from '../utils/hashing.js';

const router = express.Router();

// Single hash test
router.post('/test', authMiddleware, async (req, res) => {
  try {
    const { input, method = 'SHA512' } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        message: 'Input data is required'
      });
    }

    let result;
    switch (method) {
      case 'BLAKE3':
        result = await HashingUtils.blake3HashFn(input);
        break;
      case 'SHA512+BLAKE3':
        result = await HashingUtils.combinedHash(input);
        break;
      default:
        result = await HashingUtils.sha512Hash(input);
    }

    // Save test result
    const testData = {
      method,
      input,
      output: result.hash,
      executionTime: result.time,
      userId: req.user.uid,
      timestamp: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'hashingTests'), testData);

    res.json({
      success: true,
      result: {
        id: docRef.id,
        ...testData
      }
    });

  } catch (error) {
    console.error('Hash test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform hash test'
    });
  }
});

// Performance test
router.post('/performance', authMiddleware, async (req, res) => {
  try {
    const { input, iterations = 100 } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        message: 'Input data is required'
      });
    }

    const performanceData = await HashingUtils.performanceTest(input, iterations);

    // Save performance test result
    const testData = {
      input,
      iterations,
      results: performanceData,
      userId: req.user.uid,
      timestamp: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'performanceTests'), testData);

    res.json({
      success: true,
      result: {
        id: docRef.id,
        ...testData
      }
    });

  } catch (error) {
    console.error('Performance test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform performance test'
    });
  }
});

// Get user's hash tests
router.get('/tests', authMiddleware, async (req, res) => {
  try {
    const q = query(
      collection(db, 'hashingTests'),
      where('userId', '==', req.user.uid),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const tests = [];

    querySnapshot.forEach((doc) => {
      tests.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      tests
    });

  } catch (error) {
    console.error('Get hash tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get hash tests'
    });
  }
});

export default router;