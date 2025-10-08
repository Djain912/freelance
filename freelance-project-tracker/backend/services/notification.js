import nodemailer from 'nodemailer';
import Notification from '../models/Notification.js';
import { NOTIFICATION_TYPES } from '../../shared/constants.js';

class NotificationService {
  constructor() {
    this.transporter = null;
    this.initializeEmailTransporter();
  }
  
  // Initialize email transporter
  initializeEmailTransporter() {
    const emailTransport = process.env.EMAIL_TRANSPORT || 'console';
    
    if (emailTransport === 'console') {
      // Console transport for development
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    } else if (emailTransport === 'smtp') {
      // SMTP transport for production
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }
  
  // Create and send notification
  async createNotification(data, io = null) {
    try {
      const notification = await Notification.createNotification(data);
      
      // Send real-time notification via Socket.IO
      if (io) {
        io.to(`user:${data.userId}`).emit('notification', notification);
      }
      
      // Send email notification if priority is high or urgent
      if (data.priority === 'high' || data.priority === 'urgent') {
        await this.sendEmailNotification(notification);
      }
      
      return {
        success: true,
        notification
      };
    } catch (error) {
      console.error('Create notification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Send email notification
  async sendEmailNotification(notification) {
    try {
      if (!this.transporter) {
        console.log('📧 Email transporter not configured, skipping email notification');
        return { success: false, message: 'Email transporter not configured' };
      }
      
      // Get user details
      const user = await notification.populate('userId', 'email name');
      
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@freelancetracker.com',
        to: user.userId.email,
        subject: notification.title,
        text: notification.message,
        html: this.generateEmailHTML(notification)
      };
      
      if (process.env.EMAIL_TRANSPORT === 'console') {
        // Console logging for development
        console.log('📧 EMAIL NOTIFICATION:');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Message: ${mailOptions.text}`);
        console.log('---');
        
        await notification.markAsEmailed();
        return { success: true, message: 'Email logged to console' };
      } else {
        // Send actual email
        const result = await this.transporter.sendMail(mailOptions);
        await notification.markAsEmailed();
        
        return {
          success: true,
          messageId: result.messageId
        };
      }
    } catch (error) {
      console.error('Send email notification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Generate HTML email template
  generateEmailHTML(notification) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${notification.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Freelance Project Tracker</h1>
            </div>
            <div class="content">
              <h2>${notification.title}</h2>
              <p>${notification.message}</p>
              ${notification.data.actionUrl ? `<p><a href="${notification.data.actionUrl}" class="button">View Details</a></p>` : ''}
            </div>
            <div class="footer">
              <p>This is an automated message from Freelance Project Tracker.</p>
              <p>If you no longer wish to receive these emails, please update your notification preferences.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
  
  // Send message notification
  async notifyNewMessage(messageData, io) {
    const notification = {
      userId: messageData.recipientId,
      type: NOTIFICATION_TYPES.MESSAGE,
      title: 'New Message',
      message: `You received a new message from ${messageData.senderName}`,
      data: {
        messageId: messageData.messageId,
        fromUserId: messageData.senderId,
        projectId: messageData.projectId,
        actionUrl: `/messages/${messageData.senderId}`
      },
      priority: 'medium'
    };
    
    return this.createNotification(notification, io);
  }
  
  // Send project update notification
  async notifyProjectUpdate(projectData, userIds, io) {
    const notifications = userIds.map(userId => ({
      userId,
      type: NOTIFICATION_TYPES.PROJECT_UPDATE,
      title: 'Project Update',
      message: `Project "${projectData.title}" has been updated`,
      data: {
        projectId: projectData.projectId,
        actionUrl: `/projects/${projectData.projectId}`
      },
      priority: 'medium'
    }));
    
    const results = await Promise.all(
      notifications.map(notification => this.createNotification(notification, io))
    );
    
    return results;
  }
  
  // Send milestone notification
  async notifyMilestoneUpdate(milestoneData, userIds, io) {
    const notifications = userIds.map(userId => ({
      userId,
      type: NOTIFICATION_TYPES.MILESTONE,
      title: 'Milestone Update',
      message: `Milestone "${milestoneData.title}" status changed to ${milestoneData.status}`,
      data: {
        projectId: milestoneData.projectId,
        actionUrl: `/projects/${milestoneData.projectId}#milestone-${milestoneData.milestoneIndex}`
      },
      priority: 'high'
    }));
    
    const results = await Promise.all(
      notifications.map(notification => this.createNotification(notification, io))
    );
    
    return results;
  }
  
  // Send payment notification
  async notifyPaymentUpdate(paymentData, userIds, io) {
    const notifications = userIds.map(userId => ({
      userId,
      type: NOTIFICATION_TYPES.PAYMENT,
      title: 'Payment Update',
      message: `Payment of $${paymentData.amount} has been ${paymentData.status}`,
      data: {
        transactionId: paymentData.transactionId,
        projectId: paymentData.projectId,
        actionUrl: `/transactions/${paymentData.transactionId}`
      },
      priority: 'high'
    }));
    
    const results = await Promise.all(
      notifications.map(notification => this.createNotification(notification, io))
    );
    
    return results;
  }
  
  // Send system notification
  async notifySystem(message, userIds, io) {
    const notifications = userIds.map(userId => ({
      userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: 'System Notification',
      message,
      data: {},
      priority: 'medium'
    }));
    
    const results = await Promise.all(
      notifications.map(notification => this.createNotification(notification, io))
    );
    
    return results;
  }
  
  // Get notifications for user
  async getUserNotifications(userId, options = {}) {
    try {
      const notifications = await Notification.getForUser(userId, options);
      return {
        success: true,
        notifications
      };
    } catch (error) {
      console.error('Get user notifications error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        userId
      });
      
      if (!notification) {
        return {
          success: false,
          message: 'Notification not found'
        };
      }
      
      await notification.markAsRead();
      
      return {
        success: true,
        notification
      };
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const result = await Notification.markAllAsRead(userId);
      
      return {
        success: true,
        modifiedCount: result.modifiedCount
      };
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Get unread count
  async getUnreadCount(userId) {
    try {
      const count = await Notification.getUnreadCount(userId);
      
      return {
        success: true,
        count
      };
    } catch (error) {
      console.error('Get unread count error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Clean up old notifications
  async cleanup() {
    try {
      const result = await Notification.cleanupExpired();
      console.log(`🧹 Cleaned up ${result.deletedCount} expired notifications`);
      
      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error('Notification cleanup error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
