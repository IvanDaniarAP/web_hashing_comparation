import React, { useState, useEffect } from 'react';
import { Hash, Play, Clock, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { hashingAPI } from '../services/api';
import toast from 'react-hot-toast';

const HashingTests: React.FC = () => {
  const [inputData, setInputData] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'SHA512' | 'BLAKE3' | 'SHA512+BLAKE3'>('SHA512');
  const [results, setResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [recentTests, setRecentTests] = useState<any[]>([]);

  useEffect(() => {
    loadRecentTests();
  }, []);

  const loadRecentTests = async () => {
    try {
      const response = await hashingAPI.getTests();
      if (response.data.success) {
        setRecentTests(response.data.tests.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading recent tests:', error);
    }
  };

  const handleSingleTest = async () => {
    if (!inputData.trim()) {
      toast.error('Please enter some data to hash');
      return;
    }

    setIsRunning(true);
    try {
      const response = await hashingAPI.test({
        input: inputData,
        method: selectedMethod
      });

      if (response.data.success) {
        setResults(response.data.result);
        toast.success('Hash generated successfully!');
        loadRecentTests(); // Refresh recent tests
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error generating hash');
    } finally {
      setIsRunning(false);
    }
  };

  const handlePerformanceTest = async () => {
    if (!inputData.trim()) {
      toast.error('Please enter some data for performance testing');
      return;
    }

    setIsRunning(true);
    try {
      const response = await hashingAPI.performanceTest({
        input: inputData,
        iterations: 100
      });

      if (response.data.success) {
        setPerformanceData(response.data.result.results);
        toast.success('Performance test completed!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error running performance test');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hashing Tests</h1>
          <p className="text-gray-600 mt-2">
            Test and compare different hashing algorithms for your data
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Hash className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Test Configuration</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input Data
            </label>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter the data you want to hash..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hashing Method
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(['SHA512', 'BLAKE3', 'SHA512+BLAKE3'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setSelectedMethod(method)}
                  className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                    selectedMethod === method
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{method}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {method === 'SHA512' && 'Secure Hash Algorithm 512-bit'}
                    {method === 'BLAKE3' && 'Modern cryptographic hash'}
                    {method === 'SHA512+BLAKE3' && 'Combined approach'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSingleTest}
              disabled={isRunning || !inputData.trim()}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isRunning ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>Single Test</span>
            </button>
            <button
              onClick={handlePerformanceTest}
              disabled={isRunning || !inputData.trim()}
              className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isRunning ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>Performance Test (100 iterations)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Single Test Results */}
      {results && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Hash Output</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-mono text-sm text-gray-800 break-all">
                  {results.output}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Test Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium">{results.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Execution Time:</span>
                    <span className="font-medium">{results.executionTime.toFixed(3)} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hash Length:</span>
                    <span className="font-medium">{results.output.length} characters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timestamp:</span>
                    <span className="font-medium">{new Date(results.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Test Results */}
      {performanceData && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">Performance Test Results</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(performanceData).map(([method, data]: [string, any]) => (
              <div key={method} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{method.toUpperCase()}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Time:</span>
                    <span className="font-medium">{data.averageTime.toFixed(3)} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Time:</span>
                    <span className="font-medium">{data.minTime.toFixed(3)} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Time:</span>
                    <span className="font-medium">{data.maxTime.toFixed(3)} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Throughput:</span>
                    <span className="font-medium">{data.throughput.toFixed(0)} ops/sec</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tests */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Tests</h2>
        
        {recentTests.length > 0 ? (
          <div className="space-y-4">
            {recentTests.map((test) => (
              <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{test.method}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(test.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Input: {test.input.substring(0, 50)}...
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Hash: {test.output.substring(0, 20)}...
                  </span>
                  <span className="text-blue-600 font-medium">
                    {test.executionTime.toFixed(3)} ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Hash className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recent tests found</p>
            <p className="text-sm">Run your first hash test to see results here</p>
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Hashing Algorithm Information</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">SHA512</h3>
            <p className="text-gray-600 text-sm mb-2">
              Part of the SHA-2 family, SHA512 produces a 512-bit hash value and is widely used in security applications.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• High security level</li>
              <li>• Industry standard</li>
              <li>• Well-tested and trusted</li>
            </ul>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">BLAKE3</h3>
            <p className="text-gray-600 text-sm mb-2">
              A modern cryptographic hash function that's designed to be fast, secure, and highly parallelizable.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Very fast performance</li>
              <li>• Parallel processing</li>
              <li>• Modern security design</li>
            </ul>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">SHA512 + BLAKE3</h3>
            <p className="text-gray-600 text-sm mb-2">
              A combined approach that applies BLAKE3 to the SHA512 output, providing enhanced security.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Double hashing security</li>
              <li>• Balanced performance</li>
              <li>• Redundant protection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashingTests;