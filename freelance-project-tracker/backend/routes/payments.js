import express from 'express';
import Joi from 'joi';
import Transaction from '../models/Transaction.js';
import Project from '../models/Project.js';
import { auth, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../../shared/constants.js';
import { paymentService } from '../services/payment.js';
import { notificationService } from '../services/notification.js';

const router = express.Router();

// Validation schemas
const holdFundsSchema = Joi.object({
  projectId: Joi.string().required(),
  freelancerId: Joi.string().required(),
  amount: Joi.number().min(1).required(),
  description: Joi.string().optional(),
  milestoneId: Joi.string().optional()
});

const paymentActionSchema = Joi.object({
  reason: Joi.string().max(500).optional()
});

// Hold funds for a project/milestone
router.post('/hold', auth, authorize(USER_ROLES.CLIENT, USER_ROLES.ADMIN), async (req, res) => {
  try {
    const { error, value } = holdFundsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    
    const { projectId, freelancerId, amount, description, milestoneId } = value;
    
    // Validate amount
    const amountValidation = paymentService.validateAmount(amount);
    if (!amountValidation.valid) {
      return res.status(400).json({
        message: amountValidation.message
      });
    }
    
    // Verify project exists and user has permission
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check permissions
    if (req.user.role !== USER_ROLES.ADMIN && project.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Verify freelancer matches project
    if (project.freelancerId && project.freelancerId.toString() !== freelancerId) {
      return res.status(400).json({ 
        message: 'Freelancer does not match project assignment' 
      });
    }
    
    // Hold funds using payment service
    const result = await paymentService.holdFunds({
      projectId,
      clientId: req.user.id,
      freelancerId,
      amount,
      description,
      milestoneId
    });
    
    if (!result.success) {
      return res.status(500).json({
        message: result.message,
        error: result.error
      });
    }
    
    // Notify relevant users
    const io = req.app.get('io');
    if (io) {
      await notificationService.notifyPaymentUpdate(
        {
          amount,
          status: 'held',
          transactionId: result.transaction._id,
          projectId
        },
        [freelancerId],
        io
      );
    }
    
    res.status(201).json({
      message: result.message,
      transaction: result.transaction
    });
  } catch (error) {
    console.error('Hold funds error:', error);
    res.status(500).json({
      message: 'Failed to hold funds',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Release funds
router.post('/:id/release', auth, async (req, res) => {
  try {
    const { error, value } = paymentActionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    
    const { reason = 'Milestone completed' } = value;
    
    // Get transaction
    const transaction = await Transaction.findById(req.params.id)
      .populate('projectId', 'title clientId freelancerId')
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Check permissions - client, assigned freelancer, or admin can release
    const canRelease = (
      req.user.role === USER_ROLES.ADMIN ||
      transaction.clientId._id.toString() === req.user.id ||
      (transaction.freelancerId && transaction.freelancerId._id.toString() === req.user.id)
    );
    
    if (!canRelease) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Release funds using payment service
    const result = await paymentService.releaseFunds(req.params.id, req.user.id, reason);
    
    if (!result.success) {
      return res.status(400).json({
        message: result.message,
        error: result.error
      });
    }
    
    // Notify relevant users
    const io = req.app.get('io');
    if (io) {
      const notifyUserIds = [transaction.clientId._id, transaction.freelancerId._id]
        .filter(id => id.toString() !== req.user.id); // Don't notify the user who made the action
      
      await notificationService.notifyPaymentUpdate(
        {
          amount: transaction.amount,
          status: 'released',
          transactionId: transaction._id,
          projectId: transaction.projectId._id
        },
        notifyUserIds,
        io
      );
    }
    
    res.json({
      message: result.message,
      transaction: result.transaction
    });
  } catch (error) {
    console.error('Release funds error:', error);
    res.status(500).json({
      message: 'Failed to release funds',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Refund funds
router.post('/:id/refund', auth, async (req, res) => {
  try {
    const { error, value } = paymentActionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    
    const { reason = 'Project cancelled' } = value;
    
    // Get transaction
    const transaction = await Transaction.findById(req.params.id)
      .populate('projectId', 'title clientId freelancerId')
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Check permissions - only client or admin can refund
    const canRefund = (
      req.user.role === USER_ROLES.ADMIN ||
      transaction.clientId._id.toString() === req.user.id
    );
    
    if (!canRefund) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Refund funds using payment service
    const result = await paymentService.refundFunds(req.params.id, req.user.id, reason);
    
    if (!result.success) {
      return res.status(400).json({
        message: result.message,
        error: result.error
      });
    }
    
    // Notify relevant users
    const io = req.app.get('io');
    if (io) {
      const notifyUserIds = [transaction.freelancerId._id]
        .filter(id => id.toString() !== req.user.id);
      
      await notificationService.notifyPaymentUpdate(
        {
          amount: transaction.amount,
          status: 'refunded',
          transactionId: transaction._id,
          projectId: transaction.projectId._id
        },
        notifyUserIds,
        io
      );
    }
    
    res.json({
      message: result.message,
      transaction: result.transaction
    });
  } catch (error) {
    console.error('Refund funds error:', error);
    res.status(500).json({
      message: 'Failed to refund funds',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get transaction details
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('projectId', 'title')
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Check permissions
    const canView = (
      req.user.role === USER_ROLES.ADMIN ||
      transaction.clientId._id.toString() === req.user.id ||
      (transaction.freelancerId && transaction.freelancerId._id.toString() === req.user.id)
    );
    
    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      message: 'Failed to fetch transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's transactions
router.get('/', auth, async (req, res) => {
  try {
    const { role = 'all', status, page = 1, limit = 20 } = req.query;
    
    // Validate role parameter
    const validRoles = ['all', 'client', 'freelancer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role parameter. Must be: all, client, or freelancer'
      });
    }
    
    // Get transactions using payment service
    const result = await paymentService.getUserTransactions(req.user.id, role);
    
    if (!result.success) {
      return res.status(500).json({
        message: result.message,
        error: result.error
      });
    }
    
    let transactions = result.transactions;
    
    // Apply status filter
    if (status) {
      transactions = transactions.filter(transaction => transaction.status === status);
    }
    
    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedTransactions = transactions.slice(skip, skip + parseInt(limit));
    const total = transactions.length;
    
    res.json({
      transactions: paginatedTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      filters: { role, status }
    });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      message: 'Failed to fetch transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get project transactions
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Verify project exists and user has permission
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check permissions
    const canView = (
      req.user.role === USER_ROLES.ADMIN ||
      project.clientId.toString() === req.user.id ||
      (project.freelancerId && project.freelancerId.toString() === req.user.id)
    );
    
    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get project transactions using payment service
    const result = await paymentService.getProjectTransactions(projectId);
    
    if (!result.success) {
      return res.status(500).json({
        message: result.message,
        error: result.error
      });
    }
    
    res.json({
      transactions: result.transactions,
      project: {
        id: project._id,
        title: project.title
      }
    });
  } catch (error) {
    console.error('Get project transactions error:', error);
    res.status(500).json({
      message: 'Failed to fetch project transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get payment summary for user
router.get('/summary/stats', auth, async (req, res) => {
  try {
    const { role = 'all' } = req.query;
    
    const result = await paymentService.getPaymentSummary(req.user.id, role);
    
    if (!result.success) {
      return res.status(500).json({
        message: result.message,
        error: result.error
      });
    }
    
    res.json({
      summary: result.summary,
      role
    });
  } catch (error) {
    console.error('Get payment summary error:', error);
    res.status(500).json({
      message: 'Failed to get payment summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Calculate fees for an amount
router.get('/fees/:amount', auth, async (req, res) => {
  try {
    const amount = parseFloat(req.params.amount);
    const { currency = 'USD' } = req.query;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: 'Invalid amount'
      });
    }
    
    const fees = paymentService.calculateFees(amount, currency);
    
    res.json({
      amount,
      currency,
      fees,
      netAmount: amount - fees.total
    });
  } catch (error) {
    console.error('Calculate fees error:', error);
    res.status(500).json({
      message: 'Failed to calculate fees',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
