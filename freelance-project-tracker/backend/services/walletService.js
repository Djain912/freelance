import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { TRANSACTION_STATUS } from '../../shared/constants.js';

class WalletService {
  // Create wallet for new user
  async createWallet(userId) {
    try {
      const existingWallet = await Wallet.findOne({ userId });
      if (existingWallet) {
        return { success: true, wallet: existingWallet };
      }

      const wallet = new Wallet({
        userId,
        balance: 0,
        heldBalance: 0,
        totalEarned: 0,
        totalSpent: 0
      });

      await wallet.save();
      return { success: true, wallet };
    } catch (error) {
      console.error('Create wallet error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's wallet
  async getWallet(userId) {
    try {
      let wallet = await Wallet.findOne({ userId }).populate('userId', 'name email');
      
      if (!wallet) {
        const createResult = await this.createWallet(userId);
        if (!createResult.success) {
          throw new Error(createResult.error);
        }
        wallet = createResult.wallet;
      }

      return { success: true, wallet };
    } catch (error) {
      console.error('Get wallet error:', error);
      return { success: false, error: error.message };
    }
  }

  // Add money to wallet (mock funding)
  async addFunds(userId, amount, description = 'Added funds to wallet') {
    try {
      const walletResult = await this.getWallet(userId);
      if (!walletResult.success) {
        return walletResult;
      }

      const wallet = walletResult.wallet;
      
      // Create transaction record
      const transaction = new Transaction({
        clientId: userId,
        freelancerId: userId,
        projectId: null,
        amount,
        status: TRANSACTION_STATUS.RELEASED,
        description,
        type: 'wallet_funding'
      });

      await transaction.save();

      // Credit wallet
      wallet.credit(amount, description, null, null, transaction._id);
      await wallet.save();

      return { 
        success: true, 
        wallet, 
        transaction,
        message: `Successfully added $${amount} to wallet` 
      };
    } catch (error) {
      console.error('Add funds error:', error);
      return { success: false, error: error.message };
    }
  }

  // Transfer money from client to freelancer
  async transferFunds(clientId, freelancerId, amount, projectId, description = 'Project payment') {
    try {
      // Get both wallets
      const clientWalletResult = await this.getWallet(clientId);
      const freelancerWalletResult = await this.getWallet(freelancerId);

      if (!clientWalletResult.success || !freelancerWalletResult.success) {
        return { success: false, error: 'Failed to get wallets' };
      }

      const clientWallet = clientWalletResult.wallet;
      const freelancerWallet = freelancerWalletResult.wallet;

      // Check if client has sufficient balance
      if (clientWallet.balance < amount) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Create transaction record
      const transaction = new Transaction({
        clientId,
        freelancerId,
        projectId,
        amount,
        status: TRANSACTION_STATUS.RELEASED,
        description,
        type: 'project_payment'
      });

      await transaction.save();

      // Debit from client
      clientWallet.debit(amount, description, freelancerId, projectId, transaction._id);
      await clientWallet.save();

      // Credit to freelancer
      freelancerWallet.credit(amount, description, clientId, projectId, transaction._id);
      await freelancerWallet.save();

      return { 
        success: true, 
        transaction,
        clientWallet,
        freelancerWallet,
        message: `Successfully transferred $${amount} to freelancer` 
      };
    } catch (error) {
      console.error('Transfer funds error:', error);
      return { success: false, error: error.message };
    }
  }

  // Hold funds in escrow
  async holdFunds(clientId, amount, projectId, description = 'Project escrow') {
    try {
      const walletResult = await this.getWallet(clientId);
      if (!walletResult.success) {
        return walletResult;
      }

      const wallet = walletResult.wallet;

      // Check if client has sufficient balance
      if (wallet.balance < amount) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Create transaction record
      const transaction = new Transaction({
        clientId,
        freelancerId: null,
        projectId,
        amount,
        status: TRANSACTION_STATUS.HELD,
        description,
        type: 'escrow_hold'
      });

      await transaction.save();

      // Hold funds
      wallet.hold(amount, description, projectId, transaction._id);
      await wallet.save();

      return { 
        success: true, 
        transaction,
        wallet,
        message: `Successfully held $${amount} in escrow` 
      };
    } catch (error) {
      console.error('Hold funds error:', error);
      return { success: false, error: error.message };
    }
  }

  // Release held funds to freelancer
  async releaseFunds(clientId, freelancerId, amount, projectId, description = 'Project payment release') {
    try {
      // Get both wallets
      const clientWalletResult = await this.getWallet(clientId);
      const freelancerWalletResult = await this.getWallet(freelancerId);

      if (!clientWalletResult.success || !freelancerWalletResult.success) {
        return { success: false, error: 'Failed to get wallets' };
      }

      const clientWallet = clientWalletResult.wallet;
      const freelancerWallet = freelancerWalletResult.wallet;

      // Check if client has sufficient held balance
      if (clientWallet.heldBalance < amount) {
        return { success: false, error: 'Insufficient held balance' };
      }

      // Create transaction record
      const transaction = new Transaction({
        clientId,
        freelancerId,
        projectId,
        amount,
        status: TRANSACTION_STATUS.RELEASED,
        description,
        type: 'escrow_release'
      });

      await transaction.save();

      // Release from client's held balance
      clientWallet.release(amount, description, freelancerId, projectId, transaction._id);
      await clientWallet.save();

      // Credit to freelancer
      freelancerWallet.credit(amount, description, clientId, projectId, transaction._id);
      await freelancerWallet.save();

      return { 
        success: true, 
        transaction,
        clientWallet,
        freelancerWallet,
        message: `Successfully released $${amount} to freelancer` 
      };
    } catch (error) {
      console.error('Release funds error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get wallet transaction history
  async getTransactionHistory(userId, limit = 50, offset = 0) {
    try {
      const walletResult = await this.getWallet(userId);
      if (!walletResult.success) {
        return walletResult;
      }

      const wallet = walletResult.wallet;
      const transactionHistory = wallet.transactionHistory || [];
      const transactions = transactionHistory
        .slice(offset, offset + limit)
        .map(transaction => ({
          ...transaction.toObject(),
          createdAt: transaction.createdAt
        }));

      return { success: true, transactions, total: transactionHistory.length };
    } catch (error) {
      console.error('Get transaction history error:', error);
      return { success: false, error: error.message };
    }
  }

  // Withdraw funds (mock - in real app would integrate with payment processor)
  async withdrawFunds(userId, amount, description = 'Wallet withdrawal') {
    try {
      const walletResult = await this.getWallet(userId);
      if (!walletResult.success) {
        return walletResult;
      }

      const wallet = walletResult.wallet;

      // Check if user has sufficient balance
      if (wallet.balance < amount) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Create transaction record
      const transaction = new Transaction({
        clientId: userId,
        freelancerId: userId,
        projectId: null,
        amount,
        status: TRANSACTION_STATUS.RELEASED,
        description,
        type: 'wallet_withdrawal'
      });

      await transaction.save();

      // Debit from wallet
      wallet.debit(amount, description, null, null, transaction._id);
      await wallet.save();

      return { 
        success: true, 
        wallet, 
        transaction,
        message: `Successfully withdrew $${amount} from wallet` 
      };
    } catch (error) {
      console.error('Withdraw funds error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get wallet statistics
  async getWalletStats(userId) {
    try {
      const walletResult = await this.getWallet(userId);
      if (!walletResult.success) {
        return walletResult;
      }

      const wallet = walletResult.wallet;
      
      const stats = {
        currentBalance: wallet.balance || 0,
        heldBalance: wallet.heldBalance || 0,
        availableBalance: wallet.getAvailableBalance ? wallet.getAvailableBalance() : (wallet.balance || 0),
        totalEarned: wallet.totalEarned || 0,
        totalSpent: wallet.totalSpent || 0,
        transactionCount: wallet.transactionHistory ? wallet.transactionHistory.length : 0,
        lastTransaction: wallet.transactionHistory && wallet.transactionHistory.length > 0 ? wallet.transactionHistory[0] : null
      };

      return { success: true, stats };
    } catch (error) {
      console.error('Get wallet stats error:', error);
      return { success: false, error: error.message };
    }
  }
}

export const walletService = new WalletService();