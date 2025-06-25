import { ethers } from 'ethers';
import contractInfo from '../../src/contracts/MyTestUSD.json' assert { type: 'json' };

// Use local hardhat network for development
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

// Default hardhat account for contract owner operations
const ownerPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);

export class BlockchainUtils {
  static getContract(signer = null) {
    const contractAddress = contractInfo.address;
    const contractABI = JSON.parse(contractInfo.abi);
    
    if (signer) {
      return new ethers.Contract(contractAddress, contractABI, signer);
    }
    return new ethers.Contract(contractAddress, contractABI, provider);
  }

  static async registerUserOnContract(email, walletAddress) {
    try {
      const contract = this.getContract(ownerWallet);
      const tx = await contract.registerUser(email, walletAddress);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Error registering user on contract:', error);
      return { success: false, error: error.message };
    }
  }

  static async getAddressByEmail(email) {
    try {
      const contract = this.getContract();
      const address = await contract.getAddressByEmail(email);
      return address !== ethers.ZeroAddress ? address : null;
    } catch (error) {
      console.error('Error getting address by email:', error);
      return null;
    }
  }

  static async getBalance(address) {
    try {
      const contract = this.getContract();
      const balance = await contract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  static async transferByEmail(fromPrivateKey, toEmail, amount, hashMethod, transactionHash, executionTime) {
    try {
      const wallet = new ethers.Wallet(fromPrivateKey, provider);
      const contract = this.getContract(wallet);
      
      const amountWei = ethers.parseEther(amount.toString());
      const tx = await contract.transferByEmail(
        toEmail,
        amountWei,
        hashMethod,
        transactionHash,
        executionTime
      );
      
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Error transferring by email:', error);
      return { success: false, error: error.message };
    }
  }

  static async getTransactionHistory(address) {
    try {
      const contract = this.getContract();
      const filter = contract.filters.TransactionWithHash();
      const events = await contract.queryFilter(filter);
      
      return events
        .filter(event => 
          event.args.from.toLowerCase() === address.toLowerCase() ||
          event.args.to.toLowerCase() === address.toLowerCase()
        )
        .map(event => ({
          from: event.args.from,
          to: event.args.to,
          amount: ethers.formatEther(event.args.amount),
          hashMethod: event.args.hashMethod,
          transactionHash: event.args.transactionHash,
          executionTime: Number(event.args.executionTime),
          blockNumber: event.blockNumber,
          txHash: event.transactionHash
        }));
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }
}