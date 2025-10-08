import express from 'express';
import Joi from 'joi';
import { auth, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../../shared/constants.js';
import { walletService } from '../services/walletService.js';
import { notificationService } from '../services/notification.js';

const router = express.Router();

// Validation schemas
const addFundsSchema = Joi.object({
  amount: Joi.number().min(1).max(10000).required(),
  description: Joi.string().max(200).optional()
});

const transferFundsSchema = Joi.object({
  freelancerId: Joi.string().required(),
  amount: Joi.number().min(1).required(),
  projectId: Joi.string().required(),
  description: Joi.string().max(200).optional()
});

const withdrawFundsSchema = Joi.object({
  amount: Joi.number().min(1).required(),
  description: Joi.string().max(200).optional()
});

// Get user's wallet
router.get('/me', auth, async (req, res) => {
  try {
    const result = await walletService.getWallet(req.user.id);
    
    if (!result.success) {
      return res.status(500).json({
        message: 'Failed to get wallet',
        error: result.error
      });
    }

    res.json({
      message: 'Wallet retrieved successfully',
      wallet: result.wallet
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      message: 'Failed to get wallet',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get wallet statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const result = await walletService.getWalletStats(req.user.id);
    
    if (!result.success) {
      return res.status(500).json({
        message: 'Failed to get wallet statistics',
        error: result.error
      });
    }

    res.json({
      message: 'Wallet statistics retrieved successfully',
      stats: result.stats
    });
  } catch (error) {
    console.error('Get wallet stats error:', error);
    res.status(500).json({
      message: 'Failed to get wallet statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get transaction history
router.get('/transactions', auth, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await walletService.getTransactionHistory(
      req.user.id, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    if (!result.success) {
      return res.status(500).json({
        message: 'Failed to get transaction history',
        error: result.error
      });
    }

    res.json({
      message: 'Transaction history retrieved successfully',
      transactions: result.transactions,
      total: result.total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({
      message: 'Failed to get transaction history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add funds to wallet (mock funding)
router.post('/add-funds', auth, async (req, res) => {
  try {
    const { error, value } = addFundsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const { amount, description } = value;
    
    const result = await walletService.addFunds(
      req.user.id,
      amount,
      description || `Added $${amount} to wallet`
    );
    
    if (!result.success) {
      return res.status(500).json({
        message: 'Failed to add funds',
        error: result.error
      });
    }

    res.status(201).json({
      message: result.message,
      wallet: result.wallet,
      transaction: result.transaction
    });
  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({
      message: 'Failed to add funds',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Transfer funds to freelancer (for project payment)
router.post('/transfer', auth, authorize(USER_ROLES.CLIENT, USER_ROLES.ADMIN), async (req, res) => {
  try {
    const { error, value } = transferFundsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const { freelancerId, amount, projectId, description } = value;
    
    const result = await walletService.transferFunds(
      req.user.id,
      freelancerId,
      amount,
      projectId,
      description || `Payment for project`
    );
    
    if (!result.success) {
      return res.status(400).json({
        message: result.error
      });
    }

    // Send notification to freelancer about the payment
    try {
      await notificationService.notifyPaymentUpdate({
        amount: amount,
        status: 'received',
        transactionId: result.transaction._id,
        projectId: projectId
      }, [freelancerId], req.io);
    } catch (notificationError) {
      console.error('Failed to send payment notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      message: result.message,
      transaction: result.transaction,
      clientWallet: result.clientWallet,
      freelancerWallet: result.freelancerWallet
    });
  } catch (error) {
    console.error('Transfer funds error:', error);
    res.status(500).json({
      message: 'Failed to transfer funds',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Hold funds in escrow
router.post('/hold', auth, authorize(USER_ROLES.CLIENT, USER_ROLES.ADMIN), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      amount: Joi.number().min(1).required(),
      projectId: Joi.string().required(),
      description: Joi.string().max(200).optional()
    }).validate(req.body);
    
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const { amount, projectId, description } = value;
    
    const result = await walletService.holdFunds(
      req.user.id,
      amount,
      projectId,
      description || `Held funds for project`
    );
    
    if (!result.success) {
      return res.status(400).json({
        message: result.error
      });
    }

    res.status(201).json({
      message: result.message,
      transaction: result.transaction,
      wallet: result.wallet
    });
  } catch (error) {
    console.error('Hold funds error:', error);
    res.status(500).json({
      message: 'Failed to hold funds',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Release held funds to freelancer
router.post('/release', auth, authorize(USER_ROLES.CLIENT, USER_ROLES.ADMIN), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      freelancerId: Joi.string().required(),
      amount: Joi.number().min(1).required(),
      projectId: Joi.string().required(),
      description: Joi.string().max(200).optional()
    }).validate(req.body);
    
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const { freelancerId, amount, projectId, description } = value;
    
    const result = await walletService.releaseFunds(
      req.user.id,
      freelancerId,
      amount,
      projectId,
      description || `Released payment for project`
    );
    
    if (!result.success) {
      return res.status(400).json({
        message: result.error
      });
    }

    res.status(201).json({
      message: result.message,
      transaction: result.transaction,
      clientWallet: result.clientWallet,
      freelancerWallet: result.freelancerWallet
    });
  } catch (error) {
    console.error('Release funds error:', error);
    res.status(500).json({
      message: 'Failed to release funds',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Withdraw funds from wallet
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { error, value } = withdrawFundsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const { amount, description } = value;
    
    const result = await walletService.withdrawFunds(
      req.user.id,
      amount,
      description || `Withdrew $${amount} from wallet`
    );
    
    if (!result.success) {
      return res.status(400).json({
        message: result.error
      });
    }

    res.status(201).json({
      message: result.message,
      wallet: result.wallet,
      transaction: result.transaction
    });
  } catch (error) {
    console.error('Withdraw funds error:', error);
    res.status(500).json({
      message: 'Failed to withdraw funds',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;