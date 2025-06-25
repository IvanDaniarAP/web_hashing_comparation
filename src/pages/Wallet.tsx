import React, { useState, useEffect } from 'react';
import { Wallet, Send, Copy, ExternalLink, Plus, ArrowUpRight, ArrowDownLeft, Mail } from 'lucide-react';
import { walletAPI, transactionAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendForm, setSendForm] = useState({
    toEmail: '',
    amount: '',
    hashingMethod: 'SHA512' as 'SHA512' | 'BLAKE3' | 'SHA512+BLAKE3'
  });
  const [sending, setSending] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadWalletData();
    loadRecentTransactions();
  }, []);

  const loadWalletData = async () => {
    try {
      const response = await walletAPI.getWallet();
      if (response.data.success) {
        setWallet(response.data.wallet);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const response = await transactionAPI.getAll({ limit: 10 });
      if (response.data.success) {
        setRecentTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast.success('Address copied to clipboard!');
    }
  };

  const handleSendTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sendForm.toEmail || !sendForm.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sendForm.toEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSending(true);
    try {
      const response = await transactionAPI.create({
        toEmail: sendForm.toEmail,
        amount: parseFloat(sendForm.amount),
        hashingMethod: sendForm.hashingMethod
      });

      if (response.data.success) {
        toast.success('Transaction sent successfully!');
        setShowSendModal(false);
        setSendForm({ toEmail: '', amount: '', hashingMethod: 'SHA512' });
        loadRecentTransactions();
        loadWalletData(); // Refresh balance
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send transaction');
    } finally {
      setSending(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600 mt-2">
            Manage your SUSD stable coin wallet and transactions
          </p>
        </div>
        <button
          onClick={() => setShowSendModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        >
          <Send className="w-4 h-4" />
          <span>Send SUSD</span>
        </button>
      </div>

      {/* Wallet Overview */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Your SUSD Wallet</h2>
              <p className="text-green-100">Stable USD Token</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{wallet?.balance?.susd || '0.0000'} SUSD</div>
            <div className="text-green-100">${wallet?.balance?.usd || '0.00'} USD</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Wallet Address</p>
              <p className="font-mono text-sm">{wallet?.address || 'Loading...'}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={copyAddress}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <button
          onClick={() => setShowSendModal(true)}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 text-left"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Send className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Send SUSD</h3>
          <p className="text-gray-600 text-sm">Send stable coins to another user by email</p>
        </button>

        <button className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 text-left">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Receive</h3>
          <p className="text-gray-600 text-sm">Share your email to receive SUSD payments</p>
        </button>

        <button className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 text-left">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <ExternalLink className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Explorer</h3>
          <p className="text-gray-600 text-sm">View transactions on blockchain explorer</p>
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </button>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.from === wallet?.address ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {transaction.from === wallet?.address ? (
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {transaction.from === wallet?.address ? 'Sent' : 'Received'}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {transaction.toEmail || 
                        (transaction.from === wallet?.address ? 
                          `To ${transaction.to.substring(0, 10)}...` :
                          `From ${transaction.from.substring(0, 10)}...`
                        )
                      }
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${
                    transaction.from === wallet?.address ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.from === wallet?.address ? '-' : '+'}{transaction.amount} SUSD
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.hashingMethod}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No transactions yet</p>
            <p className="text-sm">Your transaction history will appear here</p>
          </div>
        )}
      </div>

      {/* Send Transaction Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Send SUSD</h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSendTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={sendForm.toEmail}
                    onChange={(e) => setSendForm({ ...sendForm, toEmail: e.target.value })}
                    placeholder="recipient@example.com"
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (SUSD)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={sendForm.amount}
                  onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                  placeholder="0.0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hashing Method
                </label>
                <select
                  value={sendForm.hashingMethod}
                  onChange={(e) => setSendForm({ ...sendForm, hashingMethod: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SHA512">SHA512</option>
                  <option value="BLAKE3">BLAKE3</option>
                  <option value="SHA512+BLAKE3">SHA512 + BLAKE3</option>
                </select>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
                >
                  {sending ? 'Sending...' : 'Send SUSD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;