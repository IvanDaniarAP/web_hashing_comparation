import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Zap, TrendingUp, Activity } from 'lucide-react';
import { performanceAPI, hashingAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Performance: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await performanceAPI.getAnalytics();
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const performanceData = analytics ? [
    { 
      name: 'SHA512', 
      avgTime: analytics.averageExecutionTime.SHA512 || 0,
      throughput: analytics.throughput.SHA512 || 0,
      reliability: analytics.reliability.SHA512 || 0
    },
    { 
      name: 'BLAKE3', 
      avgTime: analytics.averageExecutionTime.BLAKE3 || 0,
      throughput: analytics.throughput.BLAKE3 || 0,
      reliability: analytics.reliability.BLAKE3 || 0
    },
    { 
      name: 'Combined', 
      avgTime: analytics.averageExecutionTime['SHA512+BLAKE3'] || 0,
      throughput: analytics.throughput['SHA512+BLAKE3'] || 0,
      reliability: analytics.reliability['SHA512+BLAKE3'] || 0
    }
  ] : [];

  const reliabilityData = performanceData.map(item => ({
    name: item.name,
    value: item.reliability
  }));

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive performance analysis of hashing algorithms
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalTests || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Performance Tests</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.performanceTests || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fastest Algorithm</p>
              <p className="text-2xl font-bold text-gray-900">
                {performanceData.length > 0 ? 
                  performanceData.reduce((prev, current) => 
                    (prev.avgTime < current.avgTime && prev.avgTime > 0) ? prev : current
                  ).name : 'N/A'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Reliability</p>
              <p className="text-2xl font-bold text-gray-900">
                {performanceData.length > 0 ? 
                  (performanceData.reduce((sum, item) => sum + item.reliability, 0) / performanceData.length).toFixed(1) + '%'
                  : '0%'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Comparison Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Execution Time Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Execution Time Comparison</h2>
          {performanceData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toFixed(3)} ms`, 'Execution Time']} />
                  <Bar dataKey="avgTime" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No performance data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Throughput Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Throughput Comparison</h2>
          {performanceData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toFixed(0)} ops/sec`, 'Throughput']} />
                  <Bar dataKey="throughput" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No throughput data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reliability and Detailed Metrics */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Reliability Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Reliability Scores</h2>
          {reliabilityData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reliabilityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reliabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No reliability data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Metrics Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Performance Metrics</h2>
          {performanceData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Algorithm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Time (ms)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Throughput (ops/sec)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reliability (%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {performanceData.map((item, index) => {
                    const performanceScore = item.throughput > 0 ? 
                      Math.round((item.throughput / Math.max(...performanceData.map(d => d.throughput))) * 100) : 0;
                    
                    return (
                      <tr key={item.name}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: COLORS[index] }}></div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.avgTime.toFixed(3)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.throughput.toFixed(0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.reliability.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${performanceScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{performanceScore}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No performance metrics available</p>
              <p className="text-sm">Run some performance tests to see detailed metrics</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Insights</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Speed Analysis</h3>
            <p className="text-gray-600 text-sm">
              {performanceData.length > 0 ? (
                `BLAKE3 typically shows ${((performanceData.find(d => d.name === 'BLAKE3')?.throughput || 0) / 
                (performanceData.find(d => d.name === 'SHA512')?.throughput || 1) * 100 - 100).toFixed(0)}% 
                better throughput compared to SHA512.`
              ) : (
                'Run performance tests to see speed analysis.'
              )}
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Reliability Assessment</h3>
            <p className="text-gray-600 text-sm">
              {performanceData.length > 0 ? (
                `All algorithms maintain high reliability scores above ${Math.min(...performanceData.map(d => d.reliability)).toFixed(0)}%, 
                ensuring consistent performance.`
              ) : (
                'Run tests to see reliability assessment.'
              )}
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Recommendation</h3>
            <p className="text-gray-600 text-sm">
              {performanceData.length > 0 ? (
                `For optimal performance, consider using ${
                  performanceData.reduce((prev, current) => 
                    (prev.throughput > current.throughput) ? prev : current
                  ).name
                } for high-throughput applications.`
              ) : (
                'Run performance tests to get personalized recommendations.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;