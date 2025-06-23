import React, { useState, useEffect } from 'react';
import { Shield, Play, CheckCircle, AlertTriangle, Info, Target } from 'lucide-react';
import { securityAPI } from '../services/api';
import toast from 'react-hot-toast';

const Security: React.FC = () => {
  const [inputData, setInputData] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'SHA512' | 'BLAKE3' | 'SHA512+BLAKE3'>('SHA512');
  const [selectedTest, setSelectedTest] = useState<'collision' | 'entropy' | 'avalanche' | 'comprehensive'>('comprehensive');
  const [results, setResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [recentTests, setRecentTests] = useState<any[]>([]);

  useEffect(() => {
    loadRecentTests();
  }, []);

  const loadRecentTests = async () => {
    try {
      const response = await securityAPI.getTests();
      if (response.data.success) {
        setRecentTests(response.data.tests.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading recent tests:', error);
    }
  };

  const handleSecurityTest = async () => {
    if (!inputData.trim()) {
      toast.error('Please enter some data to test');
      return;
    }

    setIsRunning(true);
    try {
      const response = await securityAPI.test({
        input: inputData,
        method: selectedMethod,
        testType: selectedTest
      });

      if (response.data.success) {
        setResults(response.data.result);
        toast.success('Security test completed!');
        loadRecentTests();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error running security test');
    } finally {
      setIsRunning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'PASS':
      case 'EXCELLENT':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'GOOD':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Testing</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive security analysis of hashing algorithms
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Test Configuration */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Test Configuration</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Data
            </label>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter the data you want to test for security..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hashing Method
              </label>
              <div className="space-y-2">
                {(['SHA512', 'BLAKE3', 'SHA512+BLAKE3'] as const).map((method) => (
                  <label key={method} className="flex items-center">
                    <input
                      type="radio"
                      name="method"
                      value={method}
                      checked={selectedMethod === method}
                      onChange={(e) => setSelectedMethod(e.target.value as any)}
                      className="mr-3 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-gray-700">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Test Type
              </label>
              <div className="space-y-2">
                {[
                  { value: 'comprehensive', label: 'Comprehensive Test', desc: 'All security tests' },
                  { value: 'collision', label: 'Collision Resistance', desc: 'Test for hash collisions' },
                  { value: 'entropy', label: 'Entropy Analysis', desc: 'Measure randomness' },
                  { value: 'avalanche', label: 'Avalanche Effect', desc: 'Input sensitivity test' }
                ].map((test) => (
                  <label key={test.value} className="flex items-start">
                    <input
                      type="radio"
                      name="testType"
                      value={test.value}
                      checked={selectedTest === test.value as any}
                      onChange={(e) => setSelectedTest(e.target.value as any)}
                      className="mr-3 mt-1 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <span className="text-gray-700 font-medium">{test.label}</span>
                      <p className="text-sm text-gray-500">{test.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSecurityTest}
            disabled={isRunning || !inputData.trim()}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isRunning ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>Run Security Test</span>
          </button>
        </div>
      </div>

      {/* Test Results */}
      {results && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            {getResultIcon(results.result)}
            <h2 className="text-xl font-semibold text-gray-900">Security Test Results</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(results.score)}`}>
              Score: {results.score}/100
            </span>
          </div>

          {selectedTest === 'comprehensive' && results.details ? (
            <div className="space-y-6">
              {/* Overall Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Overall Assessment</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{results.score}</div>
                    <div className="text-sm text-gray-600">Security Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {results.details.summary?.passedTests || 0}/{results.details.summary?.totalTests || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tests Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{results.result}</div>
                    <div className="text-sm text-gray-600">Overall Result</div>
                  </div>
                </div>
              </div>

              {/* Individual Test Results */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Collision Test */}
                {results.details.collision && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Collision Resistance</h4>
                      {getResultIcon(results.details.collision.result)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Score:</span>
                        <span className="font-medium">{results.details.collision.score}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unique Hashes:</span>
                        <span className="font-medium">{results.details.collision.details.uniqueHashes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Collisions:</span>
                        <span className="font-medium">{results.details.collision.details.collisions}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Entropy Test */}
                {results.details.entropy && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Entropy Analysis</h4>
                      {getResultIcon(results.details.entropy.result)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Score:</span>
                        <span className="font-medium">{results.details.entropy.score}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Entropy:</span>
                        <span className="font-medium">{results.details.entropy.details.entropy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unique Chars:</span>
                        <span className="font-medium">{results.details.entropy.details.uniqueChars}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Avalanche Test */}
                {results.details.avalanche && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Avalanche Effect</h4>
                      {getResultIcon(results.details.avalanche.result)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Score:</span>
                        <span className="font-medium">{results.details.avalanche.score}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Change %:</span>
                        <span className="font-medium">{results.details.avalanche.details.changePercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Different Chars:</span>
                        <span className="font-medium">{results.details.avalanche.details.differentChars}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Single Test Result */
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Test Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Test Type:</span>
                      <span className="font-medium capitalize">{selectedTest}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium">{selectedMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Result:</span>
                      <span className="font-medium">{results.result}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Score:</span>
                      <span className="font-medium">{results.score}/100</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Detailed Results</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(results.details, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Security Tests */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Security Tests</h2>
        
        {recentTests.length > 0 ? (
          <div className="space-y-4">
            {recentTests.map((test) => (
              <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getResultIcon(test.result)}
                    <span className="font-medium">{test.method}</span>
                    <span className="text-sm text-gray-500 capitalize">({test.testType})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(test.score)}`}>
                      {test.score}/100
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(test.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Input: {test.input.substring(0, 50)}...
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recent security tests found</p>
            <p className="text-sm">Run your first security test to see results here</p>
          </div>
        )}
      </div>

      {/* Security Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Test Information</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Collision Resistance</h3>
            <p className="text-gray-600 text-sm">
              Tests the algorithm's ability to prevent different inputs from producing the same hash output.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Entropy Analysis</h3>
            <p className="text-gray-600 text-sm">
              Measures the randomness and unpredictability of the hash output distribution.
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Avalanche Effect</h3>
            <p className="text-gray-600 text-sm">
              Tests how small changes in input create large changes in the hash output.
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Comprehensive</h3>
            <p className="text-gray-600 text-sm">
              Runs all security tests and provides an overall security assessment score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;