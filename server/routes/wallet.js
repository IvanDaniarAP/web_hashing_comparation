import { ethers } from 'ethers';
import { alchemy } from '../config/alchemy.js';

export class WalletUtils {
  static generateWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || ''
    };
  }

  static async getBalance(address) {
    try {
      // Get ETH balance using Alchemy
      const balance = await alchemy.core.getBalance(address, 'latest');
      const ethBalance = ethers.formatEther(balance);
      
      // Mock USD conversion (in production, use real price API)
      const ethToUsd = 2000; // Mock ETH price
      const usdBalance = (parseFloat(ethBalance) * ethToUsd).toFixed(2);
      
      return {
        eth: parseFloat(ethBalance).toFixed(4),
        usd: usdBalance
      };
    } catch (error) {
      console.error('Balance fetch error:', error);
      return { eth: '0.0000', usd: '0.00' };
    }
  }

  static async getTransactionHistory(address) {
    try {
      const history = await alchemy.core.getAssetTransfers({
        fromAddress: address,
        category: ['external', 'internal', 'erc20', 'erc721', 'erc1155'],
        maxCount: 100
      });
      
      return history.transfers;
    } catch (error) {
      console.error('Transaction history error:', error);
      return [];
    }
  }
}