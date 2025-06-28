import React, { useState, useEffect } from 'react';
import { Mail, DollarSign, Hash, Clock, Send, Eye, AlertCircle } from 'lucide-react';
import { ContractUtils } from '../../utils/contractUtils';
import toast from 'react-hot-toast';

interface TransferFormProps {
  onSuccess?: () => void;
  userBalance?: string;
  userAddress?: string;
}

const TransferForm: React.FC<TransferFormProps> = ({ onSuccess, userBalance = '0', userAddress }) => {
  const [formData, setFormData] = useState({
    toEmail: '',
    amount: '',
    hashMethod: 'KECCAK256' as 'KECCAK256' | 'SHA256' | 'SHA512' | 'BLAKE3'
  });
  
  const [previewHash, setPreviewHash] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [recipientExists, setRecipientExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Validate email format
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(formData.toEmail));
  }, [formData.toEmail]);

  // Check if recipient exists
  useEffect(() => {
    const checkRecipient = async () => {
      if (isValidEmail) {
        const address = await ContractUtils.getAddressByEmail(formData.toEmail);
        setRecipientExists(!!address);
      } else {
        setRecipientExists(false);
      }
    };

    const timeoutId = setTimeout(checkRecipient, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.toEmail, isValidEmail]);

  // Generate preview hash
  useEffect(() => {
    const generatePreview = async () => {
      if (formData.toEmail && formData.amount && userAddress) {
        try {
          const transactionData = `${userAddress}${formData.toEmail}${formData.amount}${Date.now()}`;
          const { hash } = await ContractUtils.generateHash(transactionData, formData.hashMethod);
          setPreviewHash(hash);
        } catch (error) {
          setPreviewHash('Error generating hash');
        }
      } else {
        setPreviewHash('');
      }
    };

    generatePreview();
  }, [formData, userAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!recipientExists) {
      toast.error('Recipient email not found in system');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (parseFloat(formData.amount) > parseFloat(userBalance)) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const result = await ContractUtils.transferByEmail(
        formData.toEmail,
        formData.amount,
        formData.hashMethod
      );

      if (result.success) {
        toast.success('Transfer completed successfully!');
        setFormData({ toEmail: '', amount: '', hashMethod: 'KECCAK256' });
        onSuccess?.();
      } else {
        toast.error(result.error || 'Transfer failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const hashMethods = [
    { value: 'KECCAK256', label: 'Keccak256', description: 'Ethereum standard' },
    { value: 'SHA256', label: 'SHA256', description: 'Bitcoin standard' },
    { value: 'SHA512', label: 'SHA512', description: 'High security' },
    { value: 'BLAKE3', label: 'BLAKE3', description: 'Modern fast' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Send SUSD</h2>
          <p className="text-sm text-gray-600">Transfer stable coins by email</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={formData.toEmail}
              onChange={(e) => setFormData({ ...formData, toEmail: e.target.value })}
              placeholder="recipient@example.com"
              className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                formData.toEmail === '' ? 'border-gray-300 focus:ring-blue-500' :
                isValidEmail && recipientExists ? 'border-green-300 focus:ring-green-500 bg-green-50' :
                isValidEmail && !recipientExists ? 'border-yellow-300 focus:ring-yellow-500 bg-yellow-50' :
                'border-red-300 focus:ring-red-500 bg-red-50'
              }`}
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {formData.toEmail !== '' && (
                isValidEmail && recipientExists ? (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                ) : isValidEmail && !recipientExists ? (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )
              )}
            </div>
          </div>
          {formData.toEmail !== '' && (
            <p className={`text-xs mt-1 ${
              isValidEmail && recipientExists ? 'text-green-600' :
              isValidEmail && !recipientExists ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {isValidEmail && recipientExists ? 'Recipient found ✓' :
               isValidEmail && !recipientExists ? 'Email not registered in system' :
               'Invalid email format'}
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (SUSD)
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              step="0.0001"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.0000"
              max={userBalance}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Available: {userBalance} SUSD</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, amount: userBalance })}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Max
            </button>
          </div>
        </div>

        {/* Hash Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hash Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            {hashMethods.map((method) => (
              <label
                key={method.value}
                className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.hashMethod === method.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="hashMethod"
                  value={method.value}
                  checked={formData.hashMethod === method.value}
                  onChange={(e) => setFormData({ ...formData, hashMethod: e.target.value as any })}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{method.label}</div>
                  <div className="text-xs text-gray-500">{method.description}</div>
                </div>
                {formData.hashMethod === method.value && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Hash Preview */}
        {previewHash && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Transaction Hash Preview
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>{showPreview ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            {showPreview && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-mono text-xs text-gray-800 break-all">
                      {previewHash}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Method: {formData.hashMethod}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isValidEmail || !recipientExists || !formData.amount}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send SUSD</span>
            </>
          )}
        </button>
      </form>

      {/* Transaction Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Transaction Details:</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Hash will be generated using {formData.hashMethod}</li>
              <li>• Execution time will be recorded</li>
              <li>• Transaction will be stored on Sepolia testnet</li>
              <li>• Recipient must be registered in the system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferForm;