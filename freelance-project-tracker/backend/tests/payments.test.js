import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import { paymentService } from '../services/payment.js';
import { TRANSACTION_STATUS, PROJECT_STATUS } from '../../shared/constants.js';

const MONGODB_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/fpt_test';

describe('Payment Service', () => {
  let clientUser, freelancerUser, testProject;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear database
    await User.deleteMany({});
    await Project.deleteMany({});
    await Transaction.deleteMany({});

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

    // Create test project
    testProject = new Project({
      title: 'Test Project',
      description: 'A test project for payment testing',
      clientId: clientUser._id,
      freelancerId: freelancerUser._id,
      budget: { total: 1000, currency: 'USD' },
      timeline: {
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      skills: ['JavaScript'],
      category: 'Web Development',
      status: PROJECT_STATUS.IN_PROGRESS,
      milestones: [
        {
          title: 'Test Milestone',
          description: 'A test milestone',
          amount: 500,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        }
      ]
    });
    await testProject.save();
  });

  describe('holdFunds', () => {
    it('should hold funds successfully', async () => {
      const holdData = {
        projectId: testProject._id,
        clientId: clientUser._id,
        freelancerId: freelancerUser._id,
        amount: 500,
        description: 'Test milestone payment'
      };

      const result = await paymentService.holdFunds(holdData);

      expect(result.success).toBe(true);
      expect(result.transaction.status).toBe(TRANSACTION_STATUS.HELD);
      expect(result.transaction.amount).toBe(500);
      expect(result.transaction.clientId.toString()).toBe(clientUser._id.toString());
      expect(result.transaction.freelancerId.toString()).toBe(freelancerUser._id.toString());
      expect(result.transaction.projectId.toString()).toBe(testProject._id.toString());
      expect(result.transaction.fees.platform).toBe(25); // 5% of 500
    });

    it('should calculate platform fees correctly', async () => {
      const holdData = {
        projectId: testProject._id,
        clientId: clientUser._id,
        freelancerId: freelancerUser._id,
        amount: 1000,
        description: 'Test payment'
      };

      const result = await paymentService.holdFunds(holdData);

      expect(result.success).toBe(true);
      expect(result.transaction.fees.platform).toBe(50); // 5% of 1000
      expect(result.transaction.fees.payment).toBe(0); // No payment fees for dummy
    });

    it('should handle missing required data', async () => {
      const incompleteData = {
        projectId: testProject._id,
        clientId: clientUser._id,
        // Missing freelancerId and amount
      };

      const result = await paymentService.holdFunds(incompleteData);
      expect(result.success).toBe(false);
    });
  });

  describe('releaseFunds', () => {
    let heldTransaction;

    beforeEach(async () => {
      // Create a held transaction
      heldTransaction = new Transaction({
        projectId: testProject._id,
        clientId: clientUser._id,
        freelancerId: freelancerUser._id,
        amount: 500,
        status: TRANSACTION_STATUS.HELD,
        description: 'Test payment',
        paymentMethod: 'dummy'
      });
      await heldTransaction.save();
    });

    it('should release held funds successfully', async () => {
      const result = await paymentService.releaseFunds(
        heldTransaction._id,
        clientUser._id,
        'Milestone completed'
      );

      expect(result.success).toBe(true);
      expect(result.transaction.status).toBe(TRANSACTION_STATUS.RELEASED);
      expect(result.transaction.metadata.releaseReason).toBe('Milestone completed');
      expect(result.transaction.metadata.releaseAt).toBeDefined();
    });

    it('should not release already released funds', async () => {
      // First release
      await paymentService.releaseFunds(
        heldTransaction._id,
        clientUser._id,
        'First release'
      );

      // Try to release again
      const result = await paymentService.releaseFunds(
        heldTransaction._id,
        clientUser._id,
        'Second release'
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot release funds');
    });

    it('should not release non-existent transaction', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = await paymentService.releaseFunds(
        fakeId,
        clientUser._id,
        'Test release'
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Transaction not found');
    });
  });

  describe('refundFunds', () => {
    let heldTransaction;

    beforeEach(async () => {
      // Create a held transaction
      heldTransaction = new Transaction({
        projectId: testProject._id,
        clientId: clientUser._id,
        freelancerId: freelancerUser._id,
        amount: 500,
        status: TRANSACTION_STATUS.HELD,
        description: 'Test payment',
        paymentMethod: 'dummy'
      });
      await heldTransaction.save();
    });

    it('should refund held funds successfully', async () => {
      const result = await paymentService.refundFunds(
        heldTransaction._id,
        clientUser._id,
        'Project cancelled'
      );

      expect(result.success).toBe(true);
      expect(result.transaction.status).toBe(TRANSACTION_STATUS.REFUNDED);
      expect(result.transaction.metadata.refundReason).toBe('Project cancelled');
      expect(result.transaction.metadata.refundAt).toBeDefined();
    });

    it('should not refund already released funds', async () => {
      // First release the funds
      await heldTransaction.release('Completed', clientUser._id);

      // Try to refund
      const result = await paymentService.refundFunds(
        heldTransaction._id,
        clientUser._id,
        'Test refund'
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot refund funds');
    });

    it('should not refund non-existent transaction', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = await paymentService.refundFunds(
        fakeId,
        clientUser._id,
        'Test refund'
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Transaction not found');
    });
  });

  describe('validateAmount', () => {
    it('should validate positive amounts', async () => {
      const result = paymentService.validateAmount(100);
      expect(result.valid).toBe(true);
    });

    it('should reject zero or negative amounts', async () => {
      expect(paymentService.validateAmount(0).valid).toBe(false);
      expect(paymentService.validateAmount(-50).valid).toBe(false);
    });

    it('should reject amounts that are too large', async () => {
      const result = paymentService.validateAmount(200000);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('exceeds maximum limit');
    });

    it('should reject non-numeric amounts', async () => {
      expect(paymentService.validateAmount('not-a-number').valid).toBe(false);
      expect(paymentService.validateAmount(null).valid).toBe(false);
      expect(paymentService.validateAmount(undefined).valid).toBe(false);
    });
  });

  describe('calculateFees', () => {
    it('should calculate platform fees correctly', async () => {
      const fees = paymentService.calculateFees(1000);
      
      expect(fees.platform).toBe(50); // 5% of 1000
      expect(fees.payment).toBe(0); // No payment fees for dummy
      expect(fees.total).toBe(50);
    });

    it('should handle small amounts', async () => {
      const fees = paymentService.calculateFees(10);
      
      expect(fees.platform).toBe(0.5); // 5% of 10
      expect(fees.total).toBe(0.5);
    });
  });

  describe('getUserTransactions', () => {
    beforeEach(async () => {
      // Create some test transactions
      const transactions = [
        {
          projectId: testProject._id,
          clientId: clientUser._id,
          freelancerId: freelancerUser._id,
          amount: 500,
          status: TRANSACTION_STATUS.HELD,
          paymentMethod: 'dummy'
        },
        {
          projectId: testProject._id,
          clientId: clientUser._id,
          freelancerId: freelancerUser._id,
          amount: 300,
          status: TRANSACTION_STATUS.RELEASED,
          paymentMethod: 'dummy'
        }
      ];

      for (const txData of transactions) {
        const transaction = new Transaction(txData);
        await transaction.save();
      }
    });

    it('should get all transactions for a user', async () => {
      const result = await paymentService.getUserTransactions(clientUser._id, 'all');
      
      expect(result.success).toBe(true);
      expect(result.transactions).toHaveLength(2);
    });

    it('should filter transactions by role', async () => {
      const clientResult = await paymentService.getUserTransactions(clientUser._id, 'client');
      const freelancerResult = await paymentService.getUserTransactions(freelancerUser._id, 'freelancer');
      
      expect(clientResult.success).toBe(true);
      expect(freelancerResult.success).toBe(true);
      expect(clientResult.transactions).toHaveLength(2);
      expect(freelancerResult.transactions).toHaveLength(2);
    });
  });
});
