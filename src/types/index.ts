export interface User {
  uid: string;
  email: string;
  displayName: string;
  walletAddress?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: string;
  hash: string;
  hashingMethod: 'SHA512' | 'BLAKE3' | 'SHA512+BLAKE3';
  timestamp: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  executionTime: number;
}

export interface HashingTest {
  id: string;
  method: 'SHA512' | 'BLAKE3' | 'SHA512+BLAKE3';
  input: string;
  output: string;
  executionTime: number;
  timestamp: string;
  userId: string;
}

export interface SecurityTest {
  id: string;
  testType: string;
  result: string;
  score: number;
  timestamp: string;
  details: string;
}

export interface PerformanceMetrics {
  method: string;
  averageTime: number;
  throughput: number;
  reliability: number;
  securityScore: number;
}