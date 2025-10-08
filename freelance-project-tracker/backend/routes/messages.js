import express from 'express';
import Joi from 'joi';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { MESSAGE_TYPES } from '../../shared/constants.js';
import { notificationService } from '../services/notification.js';

const router = express.Router();

// Validation schemas
const sendMessageSchema = Joi.object({
  recipientId: Joi.string().required(),
  text: Joi.string().min(1).required(),
  projectId: Joi.string().optional(),
  type: Joi.string().valid(...Object.values(MESSAGE_TYPES)).default(MESSAGE_TYPES.TEXT),
  parentMessageId: Joi.string().optional()
});

// Get conversation with a specific user
router.get('/:withUserId', auth, async (req, res) => {
  try {
    const { withUserId } = req.params;
    const { page = 1, limit = 50, projectId } = req.query;
    
    // Verify the other user exists
    const otherUser = await User.findById(withUserId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get conversation
    const messages = await Message.getConversation(
      req.user.id,
      withUserId,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        projectId
      }
    );
    
    // Mark messages as read (messages sent to current user)
    const unreadMessages = messages.filter(
      msg => msg.recipientId._id.toString() === req.user.id && !msg.isRead
    );
    
    if (unreadMessages.length > 0) {
      await Promise.all(
        unreadMessages.map(msg => msg.markAsRead())
      );
    }
    
    res.json({
      messages: messages.reverse(), // Return in chronological order (oldest first)
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      },
      otherUser: {
        id: otherUser._id,
        name: otherUser.name,
        email: otherUser.email
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      message: 'Failed to fetch conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Send a new message
router.post('/', auth, async (req, res) => {
  try {
    const { error, value } = sendMessageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    
    const { recipientId, text, projectId, type, parentMessageId } = value;
    
    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Prevent sending messages to self
    if (recipientId === req.user.id) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }
    
    // Create message
    const message = new Message({
      senderId: req.user.id,
      recipientId,
      text,
      type,
      projectId,
      parentMessageId
    });
    
    await message.save();
    
    // Populate sender and recipient info
    await message.populate('senderId', 'name email');
    await message.populate('recipientId', 'name email');
    
    if (projectId) {
      await message.populate('projectId', 'title');
    }
    
    // Send real-time notification via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Emit to recipient
      io.to(`user:${recipientId}`).emit('message:receive', message);
      
      // Send notification
      await notificationService.notifyNewMessage(
        {
          messageId: message._id,
          senderId: req.user.id,
          senderName: req.user.name,
          recipientId,
          projectId,
          text: text.substring(0, 100) // Truncate for notification
        },
        io
      );
    }
    
    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all conversations for current user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    // Get latest message from each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user.id },
            { recipientId: req.user.id }
          ],
          isDeleted: false
        }
      },
      {
        $addFields: {
          otherUserId: {
            $cond: {
              if: { $eq: ['$senderId', req.user.id] },
              then: '$recipientId',
              else: '$senderId'
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$otherUserId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$recipientId', req.user.id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $unwind: '$otherUser'
      },
      {
        $project: {
          otherUser: {
            _id: 1,
            name: 1,
            email: 1
          },
          lastMessage: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    ]);
    
    res.json({
      conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: conversations.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      message: 'Failed to fetch conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark message as read
router.patch('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      recipientId: req.user.id
    });
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    if (!message.isRead) {
      await message.markAsRead();
    }
    
    res.json({
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      message: 'Failed to mark message as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete message (soft delete)
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      senderId: req.user.id
    });
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found or you can only delete your own messages' });
    }
    
    await message.softDelete();
    
    res.json({
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      message: 'Failed to delete message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get unread message count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.getUnreadCount(req.user.id);
    
    res.json({
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      message: 'Failed to get unread count',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add reaction to message
router.post('/:messageId/reaction', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    
    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }
    
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is part of this conversation
    const isParticipant = (
      message.senderId.toString() === req.user.id ||
      message.recipientId.toString() === req.user.id
    );
    
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      reaction => reaction.userId.toString() === req.user.id && reaction.emoji === emoji
    );
    
    if (existingReaction) {
      // Remove existing reaction
      message.reactions = message.reactions.filter(
        reaction => !(reaction.userId.toString() === req.user.id && reaction.emoji === emoji)
      );
    } else {
      // Add new reaction
      message.reactions.push({
        userId: req.user.id,
        emoji
      });
    }
    
    await message.save();
    
    // Emit reaction update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      const otherUserId = message.senderId.toString() === req.user.id 
        ? message.recipientId 
        : message.senderId;
        
      io.to(`user:${otherUserId}`).emit('message:reaction', {
        messageId: message._id,
        reactions: message.reactions
      });
    }
    
    res.json({
      message: 'Reaction updated successfully',
      reactions: message.reactions
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      message: 'Failed to add reaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Search messages
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20, withUserId } = req.query;
    const skip = (page - 1) * limit;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }
    
    // Build search query
    const searchQuery = {
      $or: [
        { senderId: req.user.id },
        { recipientId: req.user.id }
      ],
      isDeleted: false,
      $text: { $search: query }
    };
    
    // Filter by specific user if provided
    if (withUserId) {
      searchQuery.$or = [
        { senderId: req.user.id, recipientId: withUserId },
        { senderId: withUserId, recipientId: req.user.id }
      ];
    }
    
    const messages = await Message.find(searchQuery)
      .populate('senderId', 'name email')
      .populate('recipientId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Message.countDocuments(searchQuery);
    
    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      query
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      message: 'Failed to search messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
