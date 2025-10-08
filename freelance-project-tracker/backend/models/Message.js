import mongoose from 'mongoose';
import CryptoJS from 'crypto-js';
import { MESSAGE_TYPES } from '../../shared/constants.js';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  type: {
    type: String,
    enum: Object.values(MESSAGE_TYPES),
    default: MESSAGE_TYPES.TEXT
  },
  text: {
    type: String,
    required: function() {
      return this.type === MESSAGE_TYPES.TEXT || this.type === MESSAGE_TYPES.SYSTEM;
    }
  },
  encryptedText: {
    type: String
  },
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String
  }],
  metadata: {
    editedAt: Date,
    deletedAt: Date,
    readAt: Date,
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  parentMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    addedAt: {
      type: Date,
      default: Date.now
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

// Encrypt message text before saving
messageSchema.pre('save', function(next) {
  if (this.isModified('text') && this.text) {
    try {
      const secretKey = process.env.JWT_SECRET || 'devsecretchange';
      this.encryptedText = CryptoJS.AES.encrypt(this.text, secretKey).toString();
    } catch (error) {
      return next(error);
    }
  }
  
  this.updatedAt = new Date();
  next();
});

// Decrypt message text when retrieving
messageSchema.methods.getDecryptedText = function() {
  if (!this.encryptedText) return this.text;
  
  try {
    const secretKey = process.env.JWT_SECRET || 'devsecretchange';
    const decryptedBytes = CryptoJS.AES.decrypt(this.encryptedText, secretKey);
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Message decryption failed:', error);
    return '[Message could not be decrypted]';
  }
};

// Override toJSON to include decrypted text
messageSchema.methods.toJSON = function() {
  const messageObject = this.toObject();
  messageObject.text = this.getDecryptedText();
  delete messageObject.encryptedText;
  return messageObject;
};

// Mark message as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.metadata.readAt = new Date();
  return this.save();
};

// Soft delete message
messageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.metadata.deletedAt = new Date();
  this.text = '[This message was deleted]';
  this.encryptedText = '';
  return this.save();
};

// Find conversation between two users
messageSchema.statics.getConversation = function(userId1, userId2, options = {}) {
  const { limit = 50, page = 1, projectId } = options;
  const skip = (page - 1) * limit;
  
  const query = {
    $or: [
      { senderId: userId1, recipientId: userId2 },
      { senderId: userId2, recipientId: userId1 }
    ],
    isDeleted: false
  };
  
  if (projectId) {
    query.projectId = projectId;
  }
  
  return this.find(query)
    .populate('senderId', 'name email')
    .populate('recipientId', 'name email')
    .populate('projectId', 'title')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Get unread message count for a user
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipientId: userId,
    isRead: false,
    isDeleted: false
  });
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
