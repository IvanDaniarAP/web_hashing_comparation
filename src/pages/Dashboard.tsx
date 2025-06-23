import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Zap, 
  Shield, 
  Clock, 
  TrendingUp, 
  Wallet,
  Activity,
  Hash,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { walletAPI, performanceAPI, transactionAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState({ eth: '0.0000', usd: '0.00' });
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load wallet balance
        const walletResponse = await walletAPI.getWallet();
        if (walletResponse.data.success) {
          setBalance(walletResponse.data.wallet.balance);
        }

        // Load analytics
        const analyticsResponse = await performanceAPI.getAnalytics();
        if (analyticsResponse.data.success) {
          setAnalytics(analyticsResponse.data.analytics);
        }

        // Load recent transactions
        const transactionsResponse = await transactionAPI.getAll({ limit: 5 });
        if (transactionsResponse.data.success) {
          setRecentTransactions(transactionsResponse.data.transactions);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const quickStats = [
    {
      title: 'Total Hash Tests',
      value: analytics?.totalTests || 0,
      icon: Hash,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Performance Tests',
      value: analytics?.performanceTests || 0,
      icon: BarChart3,
      color: 'from-green-500 to-green-600',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Avg SHA512 Time',
      value: `${analytics?.averageExecutionTime?.SHA512?.toFixed(2) || 0}ms`,
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      change: '-2%',
      trend: 'down'
    },
    {
      title: 'Transactions',
      value: recentTransactions.length,
      icon: Activity,
      color: 'from-orange-500 to-orange-600',
      change: '+8%',
      trend: 'up'
    }
  ];

  const performanceData = analytics ? [
    { name: 'SHA512', time: analytics.averageExecutionTime.SHA512 || 0, throughput: analytics.throughput.SHA512 || 0 },
    { name: 'BLAKE3', time: analytics.averageExecutionTime.BLAKE3 || 0, throughput: analytics.throughput.BLAKE3 || 0 },
    { name: 'Combined', time: analytics.averageExecutionTime['SHA512+BLAKE3'] || 0, throughput: analytics.throughput['SHA512+BLAKE3'] || 0 }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.displayName}!</h1>
            <p className="text-blue-100">
              Ready to test some hashing algorithms today?
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{balance.eth} ETH</div>
            <div className="text-blue-100">${balance.usd} USD</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-gray-500 text-sm">
                {stat.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/dashboard/hashing"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 group"
              >
                <Zap className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-700 group-hover:text-blue-700 text-center">
                  Start Hash Test
                </div>
              </Link>
              <Link 
                to="/dashboard/security"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200 group"
              >
                <Shield className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-700 group-hover:text-purple-700 text-center">
                  Security Test
                </div>
              </Link>
              <Link 
                to="/dashboard/performance"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors duration-200 group"
              >
                <BarChart3 className="w-8 h-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-700 group-hover:text-green-700 text-center">
                  View Reports
                </div>
              </Link>
              <Link 
                to="/dashboard/wallet"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200 group"
              >
                <Wallet className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-700 group-hover:text-orange-700 text-center">
                  Send Transaction
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <Link to="/dashboard/history" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    transaction.status === 'confirmed' ? 'bg-green-500' :
                    transaction.status === 'pending' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {transaction.hashingMethod} transaction to {transaction.to.substring(0, 10)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Performance Overview</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Execution Time (ms)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Throughput (ops/sec)</span>
            </div>
          </div>
        </div>
        
        {performanceData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="time" fill="#3B82F6" name="Execution Time (ms)" />
                <Bar yAxisId="right" dataKey="throughput" fill="#10B981" name="Throughput (ops/sec)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Performance chart will appear here</p>
              <p className="text-sm">Run some tests to see your data</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;