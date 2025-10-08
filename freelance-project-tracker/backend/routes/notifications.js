import express from 'express';
import Joi from 'joi';
import Notification from '../models/Notification.js';
import { auth } from '../middleware/auth.js';
import { NOTIFICATION_TYPES } from '../../shared/constants.js';
import { notificationService } from '../services/notification.js';

const router = express.Router();

// Validation schemas
const createNotificationSchema = Joi.object({
  userId: Joi.string().required(),
  type: Joi.string().valid(...Object.values(NOTIFICATION_TYPES)).required(),
  title: Joi.string().min(1).max(200).required(),
  message: Joi.string().min(1).required(),
  data: Joi.object({
    projectId: Joi.string().optional(),
    messageId: Joi.string().optional(),
    transactionId: Joi.string().optional(),
    fromUserId: Joi.string().optional(),
    actionUrl: Joi.string().optional(),
    metadata: Joi.any().optional()
  }).optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium')
});

// Get notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      unread_only = false,
      type,
      include_archived = false
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unread_only === 'true',
      type: type || null,
      includeArchived: include_archived === 'true'
    };
    
    const result = await notificationService.getUserNotifications(req.user.id, options);
    
    if (!result.success) {
      return res.status(500).json({
        message: result.error || 'Failed to fetch notifications'
      });
    }
    
    // Get unread count
    const unreadCountResult = await notificationService.getUnreadCount(req.user.id);
    const unreadCount = unreadCountResult.success ? unreadCountResult.count : 0;
    
    res.json({
      notifications: result.notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: result.notifications.length === parseInt(limit)
      },
      unreadCount,
      filters: {
        unreadOnly: options.unreadOnly,
        type: options.type,
        includeArchived: options.includeArchived
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      message: 'Failed to fetch notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create notification (admin only or system use)
router.post('/', auth, async (req, res) => {
  try {
    const { error, value } = createNotificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    
    // For security, only allow admins to create notifications for other users
    if (value.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Can only create notifications for yourself unless you are an admin.'
      });
    }
    
    const io = req.app.get('io');
    const result = await notificationService.createNotification(value, io);
    
    if (!result.success) {
      return res.status(500).json({
        message: result.error || 'Failed to create notification'
      });
    }
    
    res.status(201).json({
      message: 'Notification created successfully',
      notification: result.notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      message: 'Failed to create notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const result = await notificationService.markAsRead(req.params.id, req.user.id);
    
    if (!result.success) {
      return res.status(404).json({
        message: result.message || 'Notification not found'
      });
    }
    
    res.json({
      message: 'Notification marked as read',
      notification: result.notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      message: 'Failed to mark notification as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark all notifications as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    
    if (!result.success) {
      return res.status(500).json({
        message: result.error || 'Failed to mark all notifications as read'
      });
    }
    
    res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      message: 'Failed to mark all notifications as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Archive notification
router.patch('/:id/archive', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await notification.archive();
    
    res.json({
      message: 'Notification archived successfully',
      notification
    });
  } catch (error) {
    console.error('Archive notification error:', error);
    res.status(500).json({
      message: 'Failed to archive notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      message: 'Failed to delete notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get unread count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const result = await notificationService.getUnreadCount(req.user.id);
    
    if (!result.success) {
      return res.status(500).json({
        message: result.error || 'Failed to get unread count'
      });
    }
    
    res.json({
      unreadCount: result.count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      message: 'Failed to get unread count',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get notification types
router.get('/types', auth, (req, res) => {
  res.json({
    types: Object.values(NOTIFICATION_TYPES),
    descriptions: {
      [NOTIFICATION_TYPES.MESSAGE]: 'New message received',
      [NOTIFICATION_TYPES.PROJECT_UPDATE]: 'Project status or details updated',
      [NOTIFICATION_TYPES.PAYMENT]: 'Payment-related notifications',
      [NOTIFICATION_TYPES.MILESTONE]: 'Milestone status changes',
      [NOTIFICATION_TYPES.SYSTEM]: 'System-wide announcements'
    }
  });
});

// Get notification preferences (placeholder for future implementation)
router.get('/preferences', auth, async (req, res) => {
  try {
    // This would typically be stored in the user profile or a separate preferences model
    const defaultPreferences = {
      email: {
        [NOTIFICATION_TYPES.MESSAGE]: true,
        [NOTIFICATION_TYPES.PROJECT_UPDATE]: true,
        [NOTIFICATION_TYPES.PAYMENT]: true,
        [NOTIFICATION_TYPES.MILESTONE]: true,
        [NOTIFICATION_TYPES.SYSTEM]: false
      },
      push: {
        [NOTIFICATION_TYPES.MESSAGE]: true,
        [NOTIFICATION_TYPES.PROJECT_UPDATE]: true,
        [NOTIFICATION_TYPES.PAYMENT]: true,
        [NOTIFICATION_TYPES.MILESTONE]: true,
        [NOTIFICATION_TYPES.SYSTEM]: false
      },
      frequency: 'instant' // instant, daily, weekly
    };
    
    res.json({
      preferences: defaultPreferences
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      message: 'Failed to get notification preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update notification preferences (placeholder for future implementation)
router.put('/preferences', auth, async (req, res) => {
  try {
    // This would update user preferences in the database
    const { email, push, frequency } = req.body;
    
    // Validation would go here
    
    res.json({
      message: 'Notification preferences updated successfully',
      preferences: { email, push, frequency }
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      message: 'Failed to update notification preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get notification statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const [unreadCount, totalCount, typeBreakdown] = await Promise.all([
      Notification.getUnreadCount(req.user.id),
      Notification.countDocuments({ userId: req.user.id, isArchived: false }),
      Notification.aggregate([
        { $match: { userId: req.user.id, isArchived: false } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ])
    ]);
    
    const stats = {
      unread: unreadCount,
      total: totalCount,
      byType: typeBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      message: 'Failed to get notification statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
