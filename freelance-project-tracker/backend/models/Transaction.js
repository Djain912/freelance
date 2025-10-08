import mongoose from 'mongoose';
import { TRANSACTION_STATUS } from '../../shared/constants.js';

const transactionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  milestoneId: {
    type: mongoose.Schema.Types.ObjectId
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: Object.values(TRANSACTION_STATUS),
    default: TRANSACTION_STATUS.HELD
  },
  description: {
    type: String,
    trim: true
  },
  fees: {
    platform: {
      type: Number,
      default: 0
    },
    payment: {
      type: Number,
      default: 0
    }
  },
  paymentMethod: {
    type: String,
    default: 'dummy'
  },
  externalTransactionId: {
    type: String
  },
  metadata: {
    holdReason: String,
    releaseReason: String,
    refundReason: String,
    holdAt: Date,
    releaseAt: Date,
    refundAt: Date,
    authorizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  events: [{
    type: {
      type: String,
      enum: ['held', 'released', 'refunded', 'failed']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
transactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add event to transaction
transactionSchema.methods.addEvent = function(type, details, performedBy) {
  this.events.push({
    type,
    details,
    performedBy,
    timestamp: new Date()
  });
};

// Hold funds (dummy implementation)
transactionSchema.methods.hold = function(reason, authorizedBy) {
  if (this.status !== TRANSACTION_STATUS.HELD) {
    this.status = TRANSACTION_STATUS.HELD;
    this.metadata.holdReason = reason;
    this.metadata.holdAt = new Date();
    this.metadata.authorizedBy = authorizedBy;
    this.addEvent('held', reason, authorizedBy);
  }
  return this.save();
};

// Release funds (dummy implementation)
transactionSchema.methods.release = function(reason, authorizedBy) {
  if (this.status === TRANSACTION_STATUS.HELD) {
    this.status = TRANSACTION_STATUS.RELEASED;
    this.metadata.releaseReason = reason;
    this.metadata.releaseAt = new Date();
    this.metadata.authorizedBy = authorizedBy;
    this.addEvent('released', reason, authorizedBy);
  }
  return this.save();
};

// Refund funds (dummy implementation)
transactionSchema.methods.refund = function(reason, authorizedBy) {
  if (this.status === TRANSACTION_STATUS.HELD) {
    this.status = TRANSACTION_STATUS.REFUNDED;
    this.metadata.refundReason = reason;
    this.metadata.refundAt = new Date();
    this.metadata.authorizedBy = authorizedBy;
    this.addEvent('refunded', reason, authorizedBy);
  }
  return this.save();
};

// Calculate net amount after fees
transactionSchema.methods.getNetAmount = function() {
  return this.amount - (this.fees.platform + this.fees.payment);
};

// Get transaction summary
transactionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    amount: this.amount,
    netAmount: this.getNetAmount(),
    status: this.status,
    currency: this.currency,
    createdAt: this.createdAt,
    lastEvent: this.events[this.events.length - 1]
  };
};

// Static method to get transactions for a user
transactionSchema.statics.getForUser = function(userId, role = 'all') {
  const query = {};
  
  if (role === 'client') {
    query.clientId = userId;
  } else if (role === 'freelancer') {
    query.freelancerId = userId;
  } else {
    query.$or = [
      { clientId: userId },
      { freelancerId: userId }
    ];
  }
  
  return this.find(query)
    .populate('projectId', 'title')
    .populate('clientId', 'name email')
    .populate('freelancerId', 'name email')
    .sort({ createdAt: -1 });
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
