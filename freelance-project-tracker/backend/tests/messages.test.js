import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

const MONGODB_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/fpt_test';

describe('Message Routes', () => {
  let server;
  let clientUser, freelancerUser;
  let clientToken, freelancerToken;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
    server = app.listen(0);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  beforeEach(async () => {
    // Clear database
    await User.deleteMany({});
    await Message.deleteMany({});

    // Create test users
    clientUser = new User({
      email: 'client@example.com',
      password: 'password123',
      name: 'Client User',
      role: 'client'
    });
    await clientUser.save();

    freelancerUser = new User({
      email: 'freelancer@example.com',
      password: 'password123',
      name: 'Freelancer User',
      role: 'freelancer'
    });
    await freelancerUser.save();

    // Get auth tokens
    const clientLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'client@example.com',
        password: 'password123'
      });
    clientToken = clientLogin.body.token;

    const freelancerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'freelancer@example.com',
        password: 'password123'
      });
    freelancerToken = freelancerLogin.body.token;
  });

  describe('POST /api/messages', () => {
    it('should send a message successfully', async () => {
      const messageData = {
        recipientId: freelancerUser._id.toString(),
        text: 'Hello, I would like to discuss a project with you.'
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.message).toBe('Message sent successfully');
      expect(response.body.data.text).toBe(messageData.text);
      expect(response.body.data.senderId._id).toBe(clientUser._id.toString());
      expect(response.body.data.recipientId._id).toBe(freelancerUser._id.toString());
    });

    it('should encrypt message text', async () => {
      const messageData = {
        recipientId: freelancerUser._id.toString(),
        text: 'This is a secret message that should be encrypted'
      };

      await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(messageData)
        .expect(201);

      // Check in database that text is encrypted
      const savedMessage = await Message.findOne({
        senderId: clientUser._id,
        recipientId: freelancerUser._id
      });

      expect(savedMessage.encryptedText).toBeDefined();
      expect(savedMessage.encryptedText).not.toBe(messageData.text);
      
      // But decryption should work
      expect(savedMessage.getDecryptedText()).toBe(messageData.text);
    });

    it('should not send message to non-existent user', async () => {
      const messageData = {
        recipientId: new mongoose.Types.ObjectId().toString(),
        text: 'Hello'
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(messageData)
        .expect(404);

      expect(response.body.message).toBe('Recipient not found');
    });

    it('should not send message to self', async () => {
      const messageData = {
        recipientId: clientUser._id.toString(),
        text: 'Hello myself'
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(messageData)
        .expect(400);

      expect(response.body.message).toBe('Cannot send message to yourself');
    });

    it('should require authentication', async () => {
      const messageData = {
        recipientId: freelancerUser._id.toString(),
        text: 'Hello'
      };

      await request(app)
        .post('/api/messages')
        .send(messageData)
        .expect(401);
    });
  });

  describe('GET /api/messages/:withUserId', () => {
    beforeEach(async () => {
      // Create some test messages
      const messages = [
        {
          senderId: clientUser._id,
          recipientId: freelancerUser._id,
          text: 'Hello freelancer',
          createdAt: new Date(Date.now() - 3000)
        },
        {
          senderId: freelancerUser._id,
          recipientId: clientUser._id,
          text: 'Hello client',
          createdAt: new Date(Date.now() - 2000)
        },
        {
          senderId: clientUser._id,
          recipientId: freelancerUser._id,
          text: 'How are you?',
          createdAt: new Date(Date.now() - 1000)
        }
      ];

      for (const messageData of messages) {
        const message = new Message(messageData);
        await message.save();
      }
    });

    it('should get conversation between two users', async () => {
      const response = await request(app)
        .get(`/api/messages/${freelancerUser._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.messages).toHaveLength(3);
      expect(response.body.otherUser.name).toBe('Freelancer User');
      
      // Messages should be in chronological order (oldest first)
      expect(response.body.messages[0].text).toBe('Hello freelancer');
      expect(response.body.messages[1].text).toBe('Hello client');
      expect(response.body.messages[2].text).toBe('How are you?');
    });

    it('should return decrypted message text', async () => {
      const response = await request(app)
        .get(`/api/messages/${freelancerUser._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      response.body.messages.forEach(message => {
        expect(message.text).toBeDefined();
        expect(message.encryptedText).toBeUndefined();
      });
    });

    it('should mark messages as read', async () => {
      // First, check that messages are unread
      const unreadMessage = await Message.findOne({
        senderId: freelancerUser._id,
        recipientId: clientUser._id
      });
      expect(unreadMessage.isRead).toBe(false);

      // Get conversation (should mark messages as read)
      await request(app)
        .get(`/api/messages/${freelancerUser._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      // Check that messages are now read
      const readMessage = await Message.findOne({
        senderId: freelancerUser._id,
        recipientId: clientUser._id
      });
      expect(readMessage.isRead).toBe(true);
    });

    it('should require authentication', async () => {
      await request(app)
        .get(`/api/messages/${freelancerUser._id}`)
        .expect(401);
    });
  });

  describe('GET /api/messages/unread/count', () => {
    beforeEach(async () => {
      // Create unread messages
      const messages = [
        {
          senderId: freelancerUser._id,
          recipientId: clientUser._id,
          text: 'Unread message 1',
          isRead: false
        },
        {
          senderId: freelancerUser._id,
          recipientId: clientUser._id,
          text: 'Unread message 2',
          isRead: false
        },
        {
          senderId: clientUser._id,
          recipientId: freelancerUser._id,
          text: 'Sent message',
          isRead: false
        }
      ];

      for (const messageData of messages) {
        const message = new Message(messageData);
        await message.save();
      }
    });

    it('should get correct unread count', async () => {
      const response = await request(app)
        .get('/api/messages/unread/count')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      // Client should have 2 unread messages (sent to them)
      expect(response.body.unreadCount).toBe(2);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/messages/unread/count')
        .expect(401);
    });
  });
});
