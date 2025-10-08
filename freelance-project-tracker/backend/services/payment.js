import Transaction from '../models/Transaction.js';
import { TRANSACTION_STATUS } from '../../shared/constants.js';

class PaymentService {
  // Hold funds (dummy implementation)
  async holdFunds(data) {
    const { projectId, clientId, freelancerId, amount, description, milestoneId } = data;
    
    try {
      // Create new transaction with HELD status
      const transaction = new Transaction({
        projectId,
        clientId,
        freelancerId,
        milestoneId,
        amount,
        description: description || 'Funds held for project milestone',
        status: TRANSACTION_STATUS.HELD,
        paymentMethod: 'dummy',
        externalTransactionId: `dummy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          holdReason: 'Project milestone payment',
          holdAt: new Date()
        }
      });
      
      // Calculate platform fees (e.g., 5% platform fee)
      transaction.fees.platform = amount * 0.05;
      transaction.fees.payment = 0; // No payment processing fees for dummy
      
      await transaction.save();
      
      console.log(`💰 DUMMY PAYMENT: Held $${amount} for project ${projectId}`);
      
      return {
        success: true,
        transaction,
        message: 'Funds held successfully'
      };
    } catch (error) {
      console.error('Hold funds error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to hold funds'
      };
    }
  }
  
  // Release funds (dummy implementation)
  async releaseFunds(transactionId, authorizedBy, reason = 'Milestone completed') {
    try {
      const transaction = await Transaction.findById(transactionId);
      
      if (!transaction) {
        return {
          success: false,
          message: 'Transaction not found'
        };
      }
      
      if (transaction.status !== TRANSACTION_STATUS.HELD) {
        return {
          success: false,
          message: `Cannot release funds. Current status: ${transaction.status}`
        };
      }
      
      await transaction.release(reason, authorizedBy);
      
      console.log(`💸 DUMMY PAYMENT: Released $${transaction.amount} from transaction ${transactionId}`);
      
      return {
        success: true,
        transaction,
        message: 'Funds released successfully'
      };
    } catch (error) {
      console.error('Release funds error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to release funds'
      };
    }
  }
  
  // Refund funds (dummy implementation)
  async refundFunds(transactionId, authorizedBy, reason = 'Project cancelled') {
    try {
      const transaction = await Transaction.findById(transactionId);
      
      if (!transaction) {
        return {
          success: false,
          message: 'Transaction not found'
        };
      }
      
      if (transaction.status !== TRANSACTION_STATUS.HELD) {
        return {
          success: false,
          message: `Cannot refund funds. Current status: ${transaction.status}`
        };
      }
      
      await transaction.refund(reason, authorizedBy);
      
      console.log(`🔄 DUMMY PAYMENT: Refunded $${transaction.amount} from transaction ${transactionId}`);
      
      return {
        success: true,
        transaction,
        message: 'Funds refunded successfully'
      };
    } catch (error) {
      console.error('Refund funds error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to refund funds'
      };
    }
  }
  
  // Get transaction details
  async getTransaction(transactionId) {
    try {
      const transaction = await Transaction.findById(transactionId)
        .populate('projectId', 'title')
        .populate('clientId', 'name email')
        .populate('freelancerId', 'name email');
      
      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('Get transaction error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to get transaction'
      };
    }
  }
  
  // Get transactions for a user
  async getUserTransactions(userId, role = 'all') {
    try {
      const transactions = await Transaction.getForUser(userId, role);
      
      return {
        success: true,
        transactions
      };
    } catch (error) {
      console.error('Get user transactions error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to get transactions'
      };
    }
  }
  
  // Get transactions for a project
  async getProjectTransactions(projectId) {
    try {
      const transactions = await Transaction.find({ projectId })
        .populate('clientId', 'name email')
        .populate('freelancerId', 'name email')
        .sort({ createdAt: -1 });
      
      return {
        success: true,
        transactions
      };
    } catch (error) {
      console.error('Get project transactions error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to get project transactions'
      };
    }
  }
  
  // Validate payment amount
  validateAmount(amount) {
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return {
        valid: false,
        message: 'Amount must be a positive number'
      };
    }
    
    if (amount > 100000) {
      return {
        valid: false,
        message: 'Amount exceeds maximum limit ($100,000)'
      };
    }
    
    if (amount < 1) {
      return {
        valid: false,
        message: 'Amount must be at least $1'
      };
    }
    
    return { valid: true };
  }
  
  // Calculate fees
  calculateFees(amount, currency = 'USD') {
    const platformFeeRate = 0.05; // 5% platform fee
    const paymentFeeRate = 0.029; // 2.9% payment processing fee (for real payments)
    
    return {
      platform: Math.round(amount * platformFeeRate * 100) / 100,
      payment: 0, // No payment fees for dummy system
      total: Math.round(amount * platformFeeRate * 100) / 100
    };
  }
  
  // Get payment summary for a user
  async getPaymentSummary(userId, role) {
    try {
      const transactions = await Transaction.getForUser(userId, role);
      
      const summary = {
        total: {
          held: 0,
          released: 0,
          refunded: 0,
          count: transactions.length
        },
        recent: transactions.slice(0, 5).map(t => t.getSummary())
      };
      
      transactions.forEach(transaction => {
        switch (transaction.status) {
          case TRANSACTION_STATUS.HELD:
            summary.total.held += transaction.amount;
            break;
          case TRANSACTION_STATUS.RELEASED:
            summary.total.released += transaction.amount;
            break;
          case TRANSACTION_STATUS.REFUNDED:
            summary.total.refunded += transaction.amount;
            break;
        }
      });
      
      return {
        success: true,
        summary
      };
    } catch (error) {
      console.error('Get payment summary error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to get payment summary'
      };
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
