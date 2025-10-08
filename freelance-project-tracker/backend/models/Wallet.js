import mongoose from 'mongoose';

const transactionHistorySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['credit', 'debit', 'hold', 'release', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  heldBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  totalEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  transactionHistory: [transactionHistorySchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated before saving
walletSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Add transaction to history
walletSchema.methods.addTransaction = function(transaction) {
  this.transactionHistory.unshift(transaction); // Add to beginning
  
  // Keep only last 100 transactions for performance
  if (this.transactionHistory.length > 100) {
    this.transactionHistory = this.transactionHistory.slice(0, 100);
  }
};

// Credit money to wallet
walletSchema.methods.credit = function(amount, description, fromUserId = null, projectId = null, transactionId = null) {
  this.balance += amount;
  this.totalEarned += amount;
  
  this.addTransaction({
    type: 'credit',
    amount,
    description,
    fromUserId,
    projectId,
    transactionId,
    status: 'completed'
  });
};

// Debit money from wallet
walletSchema.methods.debit = function(amount, description, toUserId = null, projectId = null, transactionId = null) {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  this.balance -= amount;
  this.totalSpent += amount;
  
  this.addTransaction({
    type: 'debit',
    amount,
    description,
    toUserId,
    projectId,
    transactionId,
    status: 'completed'
  });
};

// Hold money (for escrow)
walletSchema.methods.hold = function(amount, description, projectId = null, transactionId = null) {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  this.balance -= amount;
  this.heldBalance += amount;
  
  this.addTransaction({
    type: 'hold',
    amount,
    description,
    projectId,
    transactionId,
    status: 'completed'
  });
};

// Release held money
walletSchema.methods.release = function(amount, description, toUserId = null, projectId = null, transactionId = null) {
  if (this.heldBalance < amount) {
    throw new Error('Insufficient held balance');
  }
  
  this.heldBalance -= amount;
  
  this.addTransaction({
    type: 'release',
    amount,
    description,
    toUserId,
    projectId,
    transactionId,
    status: 'completed'
  });
};

// Get available balance (balance - held)
walletSchema.methods.getAvailableBalance = function() {
  return this.balance - this.heldBalance;
};

// Get total balance (balance + held)
walletSchema.methods.getTotalBalance = function() {
  return this.balance + this.heldBalance;
};

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;