import { ethers } from 'ethers';
import { sha256, keccak256 } from 'ethers';
import { sha512 } from 'js-sha512';
import { hash as blake3Hash } from 'blake3';
import contractInfo from '../contracts/MyTestUSD.json';

// Alchemy provider untuk Sepolia
const provider = new ethers.JsonRpcProvider(
  `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY || 'heIOyFtNvVl6AKDrWjMVO'}`
);

// Private key untuk signing (dalam production, gunakan wallet connect)
const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

export class ContractUtils {
  private static contract: ethers.Contract | null = null;
  private static signer: ethers.Wallet | null = null;

  static getContract() {
    if (!this.contract) {
      this.signer = new ethers.Wallet(PRIVATE_KEY, provider);
      this.contract = new ethers.Contract(
        contractInfo.address,
        contractInfo.abi,
        this.signer
      );
    }
    return this.contract;
  }

  static async generateHash(data: string, method: string): Promise<{ hash: string; time: number }> {
    const start = performance.now();
    let hash: string;

    switch (method) {
      case 'KECCAK256':
        hash = keccak256(ethers.toUtf8Bytes(data));
        break;
      case 'SHA256':
        hash = sha256(ethers.toUtf8Bytes(data));
        break;
      case 'SHA512':
        hash = '0x' + sha512(data);
        break;
      case 'BLAKE3':
        const encoder = new TextEncoder();
        hash = '0x' + blake3Hash(encoder.encode(data)).toString('hex');
        break;
      default:
        hash = keccak256(ethers.toUtf8Bytes(data));
    }

    const time = performance.now() - start;
    return { hash, time };
  }

  static async transferByEmail(
    toEmail: string,
    amount: string,
    hashMethod: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const contract = this.getContract();
      
      // Generate transaction data untuk hash
      const transactionData = `${this.signer?.address}${toEmail}${amount}${Date.now()}`;
      const { hash: transactionHash, time: executionTime } = await this.generateHash(transactionData, hashMethod);
      
      // Convert amount to wei
      const amountWei = ethers.parseEther(amount);
      
      // Execute transfer
      const tx = await contract.transferByEmail(
        toEmail,
        amountWei,
        hashMethod,
        transactionHash,
        Math.round(executionTime)
      );
      
      await tx.wait();
      
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Transfer error:', error);
      return { success: false, error: error.message };
    }
  }

  static async getBalance(address: string): Promise<string> {
    try {
      const contract = this.getContract();
      const balance = await contract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Balance error:', error);
      return '0';
    }
  }

  static async registerUser(email: string, address: string): Promise<{ success: boolean; error?: string }> {
    try {
      const contract = this.getContract();
      const tx = await contract.registerUser(email, address);
      await tx.wait();
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  static async getAddressByEmail(email: string): Promise<string | null> {
    try {
      const contract = this.getContract();
      const address = await contract.getAddressByEmail(email);
      return address !== ethers.ZeroAddress ? address : null;
    } catch (error) {
      console.error('Get address error:', error);
      return null;
    }
  }

  static async getTransactionHistory(address: string): Promise<any[]> {
    try {
      const contract = this.getContract();
      const filter = contract.filters.TransactionWithHash();
      const events = await contract.queryFilter(filter);
      
      return events
        .filter(event => 
          event.args && (
            event.args[0].toLowerCase() === address.toLowerCase() ||
            event.args[1].toLowerCase() === address.toLowerCase()
          )
        )
        .map(event => ({
          from: event.args?.[0] || '',
          to: event.args?.[1] || '',
          amount: ethers.formatEther(event.args?.[2] || 0),
          hashMethod: event.args?.[3] || '',
          transactionHash: event.args?.[4] || '',
          executionTime: Number(event.args?.[5] || 0),
          blockNumber: event.blockNumber,
          txHash: event.transactionHash
        }));
    } catch (error) {
      console.error('Transaction history error:', error);
      return [];
    }
  }
}