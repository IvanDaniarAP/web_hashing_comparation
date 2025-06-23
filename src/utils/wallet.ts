import { ethers } from 'ethers';

export class WalletUtils {
  static generateWallet(): { address: string; privateKey: string; mnemonic: string } {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || ''
    };
  }

  static async getBalance(address: string): Promise<{ eth: string; usd: string }> {
    try {
      // In a real application, you would use a proper provider
      // For now, we'll return mock data
      const ethBalance = (Math.random() * 5).toFixed(4);
      const usdBalance = (parseFloat(ethBalance) * 2000).toFixed(2);
      
      return {
        eth: ethBalance,
        usd: usdBalance
      };
    } catch (error) {
      return { eth: '0.0000', usd: '0.00' };
    }
  }
}