import express from 'express';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { authMiddleware } from '../middleware/auth.js';
import { SecurityUtils } from '../utils/security.js';

const router = express.Router();

// Run security test
router.post('/test', authMiddleware, async (req, res) => {
  try {
    const { testType = 'collision', input, method = 'SHA512' } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        message: 'Input data is required'
      });
    }

    let result;
    switch (testType) {
      case 'collision':
        result = await SecurityUtils.collisionTest(input, method);
        break;
      case 'entropy':
        result = await SecurityUtils.entropyTest(input, method);
        break;
      case 'avalanche':
        result = await SecurityUtils.avalancheTest(input, method);
        break;
      default:
        result = await SecurityUtils.comprehensiveTest(input, method);
    }

    // Save security test result
    const testData = {
      testType,
      method,
      input,
      result: result.result,
      score: result.score,
      details: result.details,
      userId: req.user.uid,
      timestamp: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'securityTests'), testData);

    res.json({
      success: true,
      result: {
        id: docRef.id,
        ...testData
      }
    });

  } catch (error) {
    console.error('Security test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform security test'
    });
  }
});

// Get user's security tests
router.get('/tests', authMiddleware, async (req, res) => {
  try {
    const q = query(
      collection(db, 'securityTests'),
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
    console.error('Get security tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get security tests'
    });
  }
});

export default router;