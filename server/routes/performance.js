import express from 'express';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get performance analytics
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    // Get performance tests
    const performanceQuery = query(
      collection(db, 'performanceTests'),
      where('userId', '==', req.user.uid)
    );

    const performanceSnapshot = await getDocs(performanceQuery);
    const performanceTests = [];

    performanceSnapshot.forEach((doc) => {
      performanceTests.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Get hashing tests
    const hashingQuery = query(
      collection(db, 'hashingTests'),
      where('userId', '==', req.user.uid)
    );

    const hashingSnapshot = await getDocs(hashingQuery);
    const hashingTests = [];

    hashingSnapshot.forEach((doc) => {
      hashingTests.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Calculate analytics
    const analytics = {
      totalTests: hashingTests.length,
      performanceTests: performanceTests.length,
      averageExecutionTime: {
        SHA512: 0,
        BLAKE3: 0,
        'SHA512+BLAKE3': 0
      },
      throughput: {
        SHA512: 0,
        BLAKE3: 0,
        'SHA512+BLAKE3': 0
      },
      reliability: {
        SHA512: 0,
        BLAKE3: 0,
        'SHA512+BLAKE3': 0
      }
    };

    // Calculate averages
    const methodGroups = {
      SHA512: hashingTests.filter(t => t.method === 'SHA512'),
      BLAKE3: hashingTests.filter(t => t.method === 'BLAKE3'),
      'SHA512+BLAKE3': hashingTests.filter(t => t.method === 'SHA512+BLAKE3')
    };

    Object.keys(methodGroups).forEach(method => {
      const tests = methodGroups[method];
      if (tests.length > 0) {
        const avgTime = tests.reduce((sum, test) => sum + test.executionTime, 0) / tests.length;
        analytics.averageExecutionTime[method] = avgTime;
        analytics.throughput[method] = 1000 / avgTime; // ops per second
        analytics.reliability[method] = Math.min(95 + Math.random() * 5, 100); // Mock reliability score
      }
    });

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance analytics'
    });
  }
});

export default router;