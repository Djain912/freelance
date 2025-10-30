import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Import models
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Project from '../models/Project.js';
import Message from '../models/Message.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import Wallet from '../models/Wallet.js';

// Import constants
import { USER_ROLES, PROJECT_STATUS, MILESTONE_STATUS, TRANSACTION_STATUS } from '../../shared/constants.js';

dotenv.config();

async function comprehensiveSeed() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fpt';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // 🧹 CLEAR ALL DATA
    console.log('\n🧹 Cleaning database...');
    await Promise.all([
      User.deleteMany({}),
      Profile.deleteMany({}),
      Project.deleteMany({}),
      Message.deleteMany({}),
      Transaction.deleteMany({}),
      Notification.deleteMany({}),
      Wallet.deleteMany({})
    ]);
    console.log('✅ Database cleaned');

    // 👥 CREATE USERS
    console.log('\n👥 Creating users...');
    
    // Client User
    const clientUser = new User({
      email: 'rajesh.kumar@demo.com',
      password: 'rajesh123',
      name: 'Rajesh Kumar',
      role: USER_ROLES.CLIENT
    });
    await clientUser.save();

    // Freelancer User
    const freelancerUser = new User({
      email: 'priya.sharma@demo.com',
      password: 'priya123',
      name: 'Priya Sharma',
      role: USER_ROLES.FREELANCER
    });
    await freelancerUser.save();

    // Admin User
    const adminUser = new User({
      email: 'admin@demo.com',
      password: 'admin123',
      name: 'Admin User',
      role: USER_ROLES.ADMIN
    });
    await adminUser.save();

    console.log('✅ Users created');
    console.log(`   Client: ${clientUser.email} / rajesh123`);
    console.log(`   Freelancer: ${freelancerUser.email} / priya123`);
    console.log(`   Admin: ${adminUser.email} / admin123`);

    // 📝 CREATE PROFILES
    console.log('\n📝 Creating profiles...');

    const clientProfile = new Profile({
      userId: clientUser._id,
      bio: 'Tech entrepreneur and founder of a successful fintech startup based in Bangalore. With 10+ years of experience in building innovative products, I\'m passionate about leveraging technology to solve real-world problems. Looking for talented developers to bring my vision to life. I value quality work, timely delivery, and clear communication.',
      skills: ['Project Management', 'Business Strategy', 'Product Design', 'Agile', 'Scrum', 'Fintech'],
      experience: 10,
      availability: 'available',
      location: {
        country: 'India',
        city: 'Bangalore',
        timezone: 'IST'
      },
      languages: [
        { name: 'Hindi', proficiency: 'native' },
        { name: 'English', proficiency: 'fluent' },
        { name: 'Kannada', proficiency: 'conversational' }
      ],
      preferences: {
        projectTypes: ['Web Development', 'Mobile Development', 'Full Stack Development', 'Fintech Solutions'],
        budgetRange: { min: 50000, max: 500000 }
      },
      socialLinks: {
        linkedin: 'https://linkedin.com/in/rajeshkumar',
        website: 'https://rajeshkumar.in'
      }
    });
    await clientProfile.save();

    const freelancerProfile = new Profile({
      userId: freelancerUser._id,
      bio: 'Senior Full-Stack Developer from Mumbai with 6+ years of experience specializing in MERN stack. I have successfully delivered 45+ projects for startups and enterprises across India and internationally. Expert in React, Node.js, MongoDB, and modern web technologies. Passionate about writing clean, scalable code and creating exceptional user experiences. I believe in continuous learning and staying updated with the latest tech trends.',
      skills: [
        'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express',
        'MongoDB', 'PostgreSQL', 'MySQL', 'REST API', 'GraphQL', 'AWS', 'Azure',
        'Docker', 'Git', 'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Material-UI',
        'Redux', 'Jest', 'Mocha', 'WebSocket', 'Socket.io'
      ],
      experience: 6,
      hourlyRate: 2500, // ₹2500 per hour
      availability: 'available',
      portfolio: [
        {
          title: 'EdTech Learning Platform',
          description: 'Built a comprehensive online learning platform for an Indian EdTech startup using MERN stack. Features include live classes, assignments, progress tracking, and payment integration with Razorpay. Served 50,000+ students.',
          url: 'https://example.com/portfolio/edtech-platform',
          imageUrl: 'https://via.placeholder.com/600x400'
        },
        {
          title: 'Food Delivery App',
          description: 'Developed a food delivery application similar to Swiggy with real-time order tracking, restaurant management, and payment gateway integration. Built with React Native for cross-platform support.',
          url: 'https://example.com/portfolio/food-delivery',
          imageUrl: 'https://via.placeholder.com/600x400'
        },
        {
          title: 'Healthcare Management System',
          description: 'Created a complete hospital management system with patient records, appointment scheduling, doctor availability, and billing. Integrated telemedicine features for remote consultations.',
          url: 'https://example.com/portfolio/healthcare-system',
          imageUrl: 'https://via.placeholder.com/600x400'
        }
      ],
      rating: {
        average: 4.8,
        count: 42
      },
      completedProjects: 45,
      location: {
        country: 'India',
        city: 'Mumbai',
        timezone: 'IST'
      },
      languages: [
        { name: 'Hindi', proficiency: 'native' },
        { name: 'English', proficiency: 'fluent' },
        { name: 'Marathi', proficiency: 'native' }
      ],
      socialLinks: {
        github: 'https://github.com/priyasharma',
        linkedin: 'https://linkedin.com/in/priyasharma',
        website: 'https://priyasharma.dev'
      },
      preferences: {
        projectTypes: ['Web Development', 'Full Stack Development', 'Mobile Development', 'API Development'],
        budgetRange: { min: 30000, max: 400000 }
      }
    });
    await freelancerProfile.save();

    const adminProfile = new Profile({
      userId: adminUser._id,
      bio: 'Platform administrator',
      skills: ['System Administration'],
      experience: 0,
      availability: 'available'
    });
    await adminProfile.save();

    console.log('✅ Profiles created');

    // 💼 CREATE PROJECTS WITH VARIOUS STATUSES
    console.log('\n💼 Creating projects...');

    // Project 1: In Progress (has freelancer, has completed milestone)
    const project1 = new Project({
      title: 'Fintech Payment Gateway Integration',
      description: 'Build a comprehensive payment gateway integration system for our fintech platform. The system should support multiple payment methods popular in India:\n\n- UPI integration (PhonePe, Google Pay, Paytm)\n- Razorpay payment gateway\n- Netbanking and card payments\n- QR code generation for payments\n- Real-time payment status tracking\n- Webhook handling for payment confirmations\n- Transaction history and reporting\n- GST invoice generation\n- Refund management system\n- Admin dashboard for transaction monitoring\n\nThis is a high-priority project with tight deadlines. Looking for an experienced full-stack developer with fintech experience.',
      budget: { total: 250000, currency: 'INR' },
      skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Payment Integration', 'REST API', 'Razorpay', 'UPI'],
      category: 'Web Development',
      priority: 'high',
      status: PROJECT_STATUS.IN_PROGRESS,
      clientId: clientUser._id,
      freelancerId: freelancerUser._id,
      milestones: [
        {
          title: 'Project Setup & Architecture Design',
          description: 'Set up project structure, database schema, and design payment flow architecture',
          amount: 50000,
          dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.COMPLETED,
          completedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Razorpay & UPI Integration',
          description: 'Implement Razorpay payment gateway and UPI payment methods',
          amount: 80000,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.IN_PROGRESS
        },
        {
          title: 'Transaction Management & Webhooks',
          description: 'Build transaction tracking system and webhook handlers',
          amount: 60000,
          dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.PENDING
        },
        {
          title: 'Admin Dashboard & Reporting',
          description: 'Create admin panel with analytics and GST invoice generation',
          amount: 40000,
          dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.PENDING
        },
        {
          title: 'Testing & Production Deployment',
          description: 'Complete testing with sandbox, security audit, and production deployment',
          amount: 20000,
          dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.PENDING
        }
      ],
      timeline: {
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        estimatedHours: 150
      },
      proposals: [
        {
          freelancerId: freelancerUser._id,
          coverLetter: 'Namaste Rajesh ji! I\'m very interested in this fintech payment integration project. I have extensive experience working with Razorpay, UPI, and other Indian payment gateways. I\'ve built similar systems for 3 fintech startups and understand the compliance requirements. I\'ve reviewed your requirements carefully and I\'m confident I can deliver a secure, scalable solution on time. My portfolio includes a payment gateway project that processes 10,000+ transactions daily. Looking forward to working with you!',
          proposedBudget: 250000,
          estimatedDuration: 45,
          status: 'accepted',
          submittedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000)
        }
      ],
      bids: [
        {
          freelancerId: freelancerUser._id,
          amount: 250000,
          proposedTimeline: 45,
          coverLetter: 'I have expertise in fintech and can deliver this project with high quality and security.',
          status: 'accepted',
          createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000)
        }
      ]
    });
    project1.calculateHealthScore();
    await project1.save();

    // Project 2: Open (no freelancer yet, has proposals)
    const project2 = new Project({
      title: 'Ayurveda E-commerce Platform',
      description: 'Looking for a full-stack developer to create an e-commerce platform for Ayurvedic products. The platform should cater to the Indian market with features like:\n\n- Multi-language support (Hindi, English, Tamil, Telugu)\n- Product catalog with categories (herbs, oils, medicines)\n- Ayurvedic product recommendations\n- Doctor consultation booking\n- Multiple payment options (UPI, COD, Cards)\n- Pincode-based delivery\n- GST compliant billing\n- Prescription upload for medicines\n- Order tracking\n- Customer reviews and ratings\n- Blog section for health tips\n- Admin panel for inventory management\n\nPrefer MERN stack with responsive design for mobile and desktop.',
      budget: { total: 350000, currency: 'INR' },
      skills: ['React', 'Node.js', 'MongoDB', 'Express', 'E-commerce', 'Payment Integration', 'Multi-language'],
      category: 'Web Development',
      priority: 'high',
      status: PROJECT_STATUS.OPEN,
      clientId: clientUser._id,
      milestones: [
        {
          title: 'Platform Setup & Design',
          description: 'Design platform architecture, database schema, and UI/UX mockups',
          amount: 70000,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.PENDING
        },
        {
          title: 'Core E-commerce Features',
          description: 'Implement product catalog, cart, checkout, and payment integration',
          amount: 140000,
          dueDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.PENDING
        },
        {
          title: 'Doctor Consultation & Multi-language',
          description: 'Add consultation booking and implement multi-language support',
          amount: 90000,
          dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.PENDING
        },
        {
          title: 'Testing & Launch',
          description: 'Complete testing, security audit, and production deployment',
          amount: 50000,
          dueDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.PENDING
        }
      ],
      timeline: {
        endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        estimatedHours: 200
      },
      proposals: [],
      bids: []
    });
    project2.calculateHealthScore();
    await project2.save();

    // Project 3: Completed
    const project3 = new Project({
      title: 'Restaurant Management System',
      description: 'Completed project: Built a complete restaurant management system for a chain of restaurants in Delhi. Features included table booking, menu management, order processing, and billing with GST.',
      budget: { total: 180000, currency: 'INR' },
      skills: ['React', 'Node.js', 'MongoDB', 'POS System', 'Billing', 'QR Code'],
      category: 'Web Development',
      priority: 'medium',
      status: PROJECT_STATUS.COMPLETED,
      clientId: clientUser._id,
      freelancerId: freelancerUser._id,
      milestones: [
        {
          title: 'System Design & Database Setup',
          description: 'Create system architecture and database schema for restaurant operations',
          amount: 40000,
          dueDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.COMPLETED,
          completedAt: new Date(Date.now() - 52 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Core Features Development',
          description: 'Implement menu management, table booking, and order processing',
          amount: 90000,
          dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.COMPLETED,
          completedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Billing & GST Integration',
          description: 'Implement billing system with GST calculation and invoice generation',
          amount: 35000,
          dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.COMPLETED,
          completedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Testing & Deployment',
          description: 'Testing, staff training, and production deployment',
          amount: 15000,
          dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.COMPLETED,
          completedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
        }
      ],
      timeline: {
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        estimatedHours: 120
      },
      proposals: [
        {
          freelancerId: freelancerUser._id,
          coverLetter: 'I have experience building restaurant POS systems and can deliver exactly what you need!',
          proposedBudget: 180000,
          estimatedDuration: 45,
          status: 'accepted',
          submittedAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000)
        }
      ],
      bids: [
        {
          freelancerId: freelancerUser._id,
          amount: 180000,
          proposedTimeline: 45,
          coverLetter: 'I can deliver this project with quality.',
          status: 'accepted',
          createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000)
        }
      ]
    });
    project3.calculateHealthScore();
    await project3.save();

    // Project 4: Draft
    const project4 = new Project({
      title: 'EdTech Video Streaming Platform',
      description: 'Planning to build a video streaming platform for online education similar to Unacademy. Should support live classes, recorded lectures, quizzes, and student progress tracking. Need detailed proposal before starting.',
      budget: { total: 450000, currency: 'INR' },
      skills: ['React', 'Node.js', 'Video Streaming', 'AWS', 'WebRTC', 'Live Streaming'],
      category: 'Web Development',
      priority: 'medium',
      status: PROJECT_STATUS.DRAFT,
      clientId: clientUser._id,
      milestones: [
        {
          title: 'Platform Architecture & Design',
          description: 'Design scalable architecture for video streaming and create UI mockups',
          amount: 100000,
          dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.PENDING
        },
        {
          title: 'Core Development',
          description: 'Build video streaming, live classes, and user management',
          amount: 250000,
          dueDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.PENDING
        },
        {
          title: 'Testing & Launch',
          description: 'Load testing, security audit, and deployment',
          amount: 100000,
          dueDate: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.PENDING
        }
      ],
      timeline: {
        endDate: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
        estimatedHours: 250
      }
    });
    project4.calculateHealthScore();
    await project4.save();

    // Project 5: Cancelled (with reported issues)
    const project5 = new Project({
      title: 'Matrimony Portal Development',
      description: 'Started development of a matrimony website but cancelled due to budget constraints and change in business model.',
      budget: { total: 120000, currency: 'INR' },
      skills: ['React', 'Node.js', 'MongoDB', 'Profile Matching'],
      category: 'Web Development',
      priority: 'low',
      status: PROJECT_STATUS.CANCELLED,
      clientId: clientUser._id,
      freelancerId: freelancerUser._id,
      milestones: [
        {
          title: 'Initial Setup & Design',
          description: 'Setup project and create designs',
          amount: 50000,
          dueDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.PENDING
        },
        {
          title: 'Development',
          description: 'Build core features',
          amount: 70000,
          dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          status: MILESTONE_STATUS.PENDING
        }
      ],
      timeline: {
        startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        estimatedHours: 80
      },
      adminFlags: {
        isReported: true,
        reportReason: 'Client requested cancellation due to business model pivot and budget constraints. Mutual agreement reached.',
        reportedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        reportedBy: clientUser._id,
        adminNotes: 'Resolved: Partial refund processed to client (₹30,000). No work was delivered as project was in planning phase.'
      }
    });
    project5.calculateHealthScore();
    await project5.save();

    console.log('✅ Projects created (5 projects with various statuses)');

    // 💳 CREATE WALLETS
    console.log('\n💳 Creating wallets...');

    const clientWallet = new Wallet({
      userId: clientUser._id,
      balance: 200000,
      heldBalance: 80000,
      totalSpent: 510000,
      transactionHistory: []
    });

    const freelancerWallet = new Wallet({
      userId: freelancerUser._id,
      balance: 150000,
      heldBalance: 0,
      totalEarned: 280000,
      transactionHistory: []
    });

    await clientWallet.save();
    await freelancerWallet.save();

    console.log('✅ Wallets created');

    // 💰 CREATE TRANSACTIONS
    console.log('\n💰 Creating transactions...');

    // Transaction 1: Released (for completed milestone in project 1)
    const transaction1 = new Transaction({
      projectId: project1._id,
      clientId: clientUser._id,
      freelancerId: freelancerUser._id,
      milestoneId: project1.milestones[0]._id,
      amount: 50000,
      status: TRANSACTION_STATUS.RELEASED,
      description: 'Payment for Project Setup & Architecture Design milestone',
      paymentMethod: 'razorpay',
      externalTransactionId: 'rzp_released_001',
      fees: {
        platform: 2500,
        payment: 500
      },
      metadata: {
        holdReason: 'Milestone payment held in escrow',
        releaseReason: 'Milestone completed and approved by client',
        holdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        releaseAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      events: [
        {
          type: 'held',
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          details: 'Funds held for milestone completion via Razorpay'
        },
        {
          type: 'released',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          details: 'Milestone completed and approved by client - funds released to freelancer'
        }
      ]
    });
    await transaction1.save();

    // Transaction 2: Held (for current milestone in project 1)
    const transaction2 = new Transaction({
      projectId: project1._id,
      clientId: clientUser._id,
      freelancerId: freelancerUser._id,
      milestoneId: project1.milestones[1]._id,
      amount: 80000,
      status: TRANSACTION_STATUS.HELD,
      description: 'Payment for Razorpay & UPI Integration milestone',
      paymentMethod: 'razorpay',
      externalTransactionId: 'rzp_held_002',
      fees: {
        platform: 4000,
        payment: 800
      },
      metadata: {
        holdReason: 'Milestone payment - work in progress',
        holdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      events: [
        {
          type: 'held',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          details: 'Funds held in escrow for milestone completion'
        }
      ]
    });
    await transaction2.save();

    // Transaction 3: Released (for completed project 3 - milestone 1)
    const transaction3 = new Transaction({
      projectId: project3._id,
      clientId: clientUser._id,
      freelancerId: freelancerUser._id,
      milestoneId: project3.milestones[0]._id,
      amount: 40000,
      status: TRANSACTION_STATUS.RELEASED,
      description: 'Payment for System Design & Database Setup milestone',
      paymentMethod: 'upi',
      externalTransactionId: 'upi_released_003',
      fees: {
        platform: 2000,
        payment: 0
      },
      metadata: {
        holdReason: 'Milestone payment',
        releaseReason: 'Milestone completed successfully',
        holdAt: new Date(Date.now() - 53 * 24 * 60 * 60 * 1000),
        releaseAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000)
      },
      events: [
        {
          type: 'held',
          timestamp: new Date(Date.now() - 53 * 24 * 60 * 60 * 1000),
          details: 'Funds held via UPI payment'
        },
        {
          type: 'released',
          timestamp: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
          details: 'Milestone completed - payment released'
        }
      ]
    });
    await transaction3.save();

    // Transaction 4: Released (for completed project 3 - milestone 2)
    const transaction4 = new Transaction({
      projectId: project3._id,
      clientId: clientUser._id,
      freelancerId: freelancerUser._id,
      milestoneId: project3.milestones[1]._id,
      amount: 90000,
      status: TRANSACTION_STATUS.RELEASED,
      description: 'Payment for Core Features Development milestone',
      paymentMethod: 'razorpay',
      externalTransactionId: 'rzp_released_004',
      fees: {
        platform: 4500,
        payment: 900
      },
      metadata: {
        holdReason: 'Milestone payment',
        releaseReason: 'All features tested and approved',
        holdAt: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000),
        releaseAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      events: [
        {
          type: 'held',
          timestamp: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000),
          details: 'Funds held for development phase'
        },
        {
          type: 'released',
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          details: 'Development completed successfully - payment released'
        }
      ]
    });
    await transaction4.save();

    // Transaction 5: Released (for completed project 3 - milestone 3)
    const transaction5 = new Transaction({
      projectId: project3._id,
      clientId: clientUser._id,
      freelancerId: freelancerUser._id,
      milestoneId: project3.milestones[2]._id,
      amount: 35000,
      status: TRANSACTION_STATUS.RELEASED,
      description: 'Payment for Billing & GST Integration milestone',
      paymentMethod: 'razorpay',
      externalTransactionId: 'rzp_released_005',
      fees: {
        platform: 1750,
        payment: 350
      },
      metadata: {
        holdReason: 'Final milestone payment',
        releaseReason: 'GST integration tested and verified',
        holdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        releaseAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      events: [
        {
          type: 'held',
          timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
          details: 'Funds held for GST integration'
        },
        {
          type: 'released',
          timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          details: 'GST integration completed - final payment released'
        }
      ]
    });
    await transaction5.save();

    // Transaction 6: Released (for completed project 3 - milestone 4)
    const transaction6 = new Transaction({
      projectId: project3._id,
      clientId: clientUser._id,
      freelancerId: freelancerUser._id,
      milestoneId: project3.milestones[3]._id,
      amount: 15000,
      status: TRANSACTION_STATUS.RELEASED,
      description: 'Payment for Testing & Deployment milestone',
      paymentMethod: 'upi',
      externalTransactionId: 'upi_released_006',
      fees: {
        platform: 750,
        payment: 0
      },
      metadata: {
        holdReason: 'Project completion payment',
        releaseReason: 'Project successfully deployed and staff trained',
        holdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        releaseAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      events: [
        {
          type: 'held',
          timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          details: 'Final payment held'
        },
        {
          type: 'released',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          details: 'Project completed successfully - final payment released'
        }
      ]
    });
    await transaction6.save();

    // Transaction 7: Refunded (for cancelled project)
    const transaction7 = new Transaction({
      projectId: project5._id,
      clientId: clientUser._id,
      freelancerId: freelancerUser._id,
      amount: 30000,
      status: TRANSACTION_STATUS.REFUNDED,
      description: 'Partial refund for cancelled Matrimony Portal project',
      paymentMethod: 'razorpay',
      externalTransactionId: 'rzp_refunded_007',
      fees: {
        platform: 0,
        payment: 0
      },
      metadata: {
        holdReason: 'Initial project payment',
        refundReason: 'Project cancelled by mutual agreement - partial refund as per policy',
        holdAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000),
        refundAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      },
      events: [
        {
          type: 'held',
          timestamp: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000),
          details: 'Initial payment held'
        },
        {
          type: 'refunded',
          timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          details: 'Project cancelled due to business model change - partial refund processed'
        }
      ]
    });
    await transaction7.save();

    console.log('✅ Transactions created (7 transactions: 5 released, 1 held, 1 refunded)');

    // 💬 CREATE MESSAGES
    console.log('\n💬 Creating messages...');

    const messages = [
      // Project 1 messages
      {
        senderId: clientUser._id,
        recipientId: freelancerUser._id,
        projectId: project1._id,
        text: 'Namaste Priya! Welcome aboard! I\'m really excited to work with you on this fintech payment gateway project. I\'ve gone through your portfolio and I\'m very impressed with your EdTech and healthcare projects. Your experience with Razorpay will be invaluable.',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        senderId: freelancerUser._id,
        recipientId: clientUser._id,
        projectId: project1._id,
        text: 'Thank you so much Rajesh ji! I\'m very excited about this project. Fintech is my forte and I\'ve already started planning the architecture. The payment flow looks straightforward. When would be a good time for our kickoff call?',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 + 3600000)
      },
      {
        senderId: clientUser._id,
        recipientId: freelancerUser._id,
        projectId: project1._id,
        text: 'How about tomorrow at 4 PM IST? I can share the detailed requirements document and we can discuss the security requirements and compliance aspects for financial transactions.',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        senderId: freelancerUser._id,
        recipientId: clientUser._id,
        projectId: project1._id,
        text: 'Perfect! 4 PM IST works great for me. I\'ll prepare some questions about the business logic and edge cases. Looking forward to it!',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 1800000)
      },
      {
        senderId: freelancerUser._id,
        recipientId: clientUser._id,
        projectId: project1._id,
        text: 'Hi Rajesh ji, I\'ve completed the first milestone - Project Setup & Architecture Design. I\'ve set up the complete project structure with Node.js and MongoDB, designed the database schema for transactions, and created the system architecture diagram. The payment flow design is also ready. Please review and let me know if you need any changes.',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      },
      {
        senderId: clientUser._id,
        recipientId: freelancerUser._id,
        projectId: project1._id,
        text: 'This looks excellent! The architecture is very well thought out and the transaction flow is perfect. I\'m approving the milestone and releasing the payment. Great work Priya! 👍',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        senderId: freelancerUser._id,
        recipientId: clientUser._id,
        projectId: project1._id,
        text: 'Thank you so much! Payment received ₹50,000. I\'ve now started working on the second milestone - Razorpay & UPI Integration. I\'ve already integrated Razorpay SDK and testing the UPI flow. Should have it ready by this weekend.',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        senderId: clientUser._id,
        recipientId: freelancerUser._id,
        projectId: project1._id,
        text: 'Sounds great! Keep me updated on the progress. Also, please make sure to test with multiple UPI apps - PhonePe, Google Pay, and Paytm.',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 3600000)
      },
      {
        senderId: freelancerUser._id,
        recipientId: clientUser._id,
        projectId: project1._id,
        text: 'Quick update: Razorpay integration is complete and working perfectly! All payment methods are integrated - UPI, cards, netbanking. I\'ve tested with PhonePe, GPay, and Paytm. QR code generation is also working. Now working on the webhook handlers for payment confirmations.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        senderId: clientUser._id,
        recipientId: freelancerUser._id,
        projectId: project1._id,
        text: 'Excellent progress! This is even faster than expected. Can\'t wait to see the webhook implementation. Great work! 🎉',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      // Project 3 messages (completed project)
      {
        senderId: freelancerUser._id,
        recipientId: clientUser._id,
        projectId: project3._id,
        text: 'Hi Rajesh ji, I\'ve completed the Restaurant Management System project. All milestones are done - the POS system is live and working smoothly. GST billing is integrated. Thank you for this amazing opportunity!',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        senderId: clientUser._id,
        recipientId: freelancerUser._id,
        projectId: project3._id,
        text: 'The restaurant management system is fantastic! The restaurant staff found it very easy to use. The GST invoice generation is perfect. You did an amazing job Priya! I\'m very satisfied with the quality. Will definitely work with you again on future projects. 5 stars! ⭐⭐⭐⭐⭐',
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
      },
      // General messages
      {
        senderId: freelancerUser._id,
        recipientId: clientUser._id,
        text: 'Hi Rajesh ji! Just wanted to check in - do you have any new projects coming up? I really enjoyed working with you and would love to collaborate again. Your project requirements are always so clear and detailed.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        senderId: clientUser._id,
        recipientId: freelancerUser._id,
        text: 'Hi Priya! Yes, I\'m planning to post an Ayurveda e-commerce platform project soon. It\'s a big project with multi-language support and doctor consultation features. I\'ll send you the detailed requirements once I finalize everything. Would you be interested?',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        senderId: freelancerUser._id,
        recipientId: clientUser._id,
        text: 'Absolutely interested! E-commerce with healthcare features sounds very exciting. I have experience with e-commerce platforms and multi-language implementation. Looking forward to the details!',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 1800000)
      },
      {
        senderId: clientUser._id,
        recipientId: freelancerUser._id,
        text: 'Great! I\'ll share the requirements by next week. Budget will be around ₹3-3.5 lakhs. Timeline is 2-3 months. Let me know if that works for you.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        senderId: freelancerUser._id,
        recipientId: clientUser._id,
        text: 'Sounds perfect! The budget and timeline both work for me. Eagerly waiting for the detailed requirements. Thank you! 😊',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 7200000)
      }
    ];

    for (const messageData of messages) {
      const message = new Message(messageData);
      await message.save();
    }

    console.log('✅ Messages created (15 messages across projects)');

    // 🔔 CREATE NOTIFICATIONS
    console.log('\n🔔 Creating notifications...');

    const notifications = [
      // For Client
      {
        userId: clientUser._id,
        type: 'project_update',
        title: 'Milestone Completed',
        message: 'Sarah has completed the "Project Setup & Design" milestone for E-commerce Platform Development',
        data: {
          projectId: project1._id,
          fromUserId: freelancerUser._id,
          actionUrl: `/projects/${project1._id}`
        },
        priority: 'high',
        read: true,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      },
      {
        userId: clientUser._id,
        type: 'message',
        title: 'New Message',
        message: 'You have a new message from Sarah Martinez',
        data: {
          fromUserId: freelancerUser._id,
          actionUrl: `/messages/${freelancerUser._id}`
        },
        priority: 'medium',
        read: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        userId: clientUser._id,
        type: 'payment',
        title: 'Payment Processed',
        message: 'Payment of $1,500 has been held for milestone completion',
        data: {
          projectId: project1._id,
          transactionId: transaction1._id,
          actionUrl: '/wallet'
        },
        priority: 'high',
        read: true,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        userId: clientUser._id,
        type: 'message',
        title: 'New Message',
        message: 'Sarah sent you a message about the mobile app project',
        data: {
          fromUserId: freelancerUser._id,
          actionUrl: `/messages/${freelancerUser._id}`
        },
        priority: 'medium',
        read: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: clientUser._id,
        type: 'system',
        title: 'Welcome to Freelance Project Tracker!',
        message: 'Thank you for joining our platform. Start by posting your first project or exploring talented freelancers.',
        data: {
          actionUrl: '/projects/new'
        },
        priority: 'low',
        read: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      
      // For Freelancer
      {
        userId: freelancerUser._id,
        type: 'project_update',
        title: 'Project Assigned',
        message: 'You have been assigned to "E-commerce Platform Development" by Alex Johnson',
        data: {
          projectId: project1._id,
          fromUserId: clientUser._id,
          actionUrl: `/projects/${project1._id}`
        },
        priority: 'high',
        read: true,
        createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000)
      },
      {
        userId: freelancerUser._id,
        type: 'milestone',
        title: 'Milestone Approved',
        message: 'Your milestone "Project Setup & Design" has been approved by Alex',
        data: {
          projectId: project1._id,
          fromUserId: clientUser._id,
          actionUrl: `/projects/${project1._id}`
        },
        priority: 'high',
        read: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        userId: freelancerUser._id,
        type: 'payment',
        title: 'Payment Released',
        message: 'Payment of $1,500 has been released to your wallet',
        data: {
          projectId: project1._id,
          transactionId: transaction1._id,
          amount: 1500,
          actionUrl: '/wallet'
        },
        priority: 'high',
        read: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        userId: freelancerUser._id,
        type: 'payment',
        title: 'Funds Held',
        message: 'Payment of $2,000 has been held for "User Authentication & Product Catalog" milestone',
        data: {
          projectId: project1._id,
          transactionId: transaction2._id,
          amount: 2000,
          actionUrl: '/wallet'
        },
        priority: 'medium',
        read: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        userId: freelancerUser._id,
        type: 'message',
        title: 'New Message',
        message: 'Alex sent you a message',
        data: {
          fromUserId: clientUser._id,
          actionUrl: `/messages/${clientUser._id}`
        },
        priority: 'medium',
        read: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: freelancerUser._id,
        type: 'project_update',
        title: 'Project Completed',
        message: 'Congratulations! "Company Website Redesign" has been marked as completed',
        data: {
          projectId: project3._id,
          fromUserId: clientUser._id,
          actionUrl: `/projects/${project3._id}`
        },
        priority: 'high',
        read: true,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        userId: freelancerUser._id,
        type: 'payment',
        title: 'Payment Released',
        message: 'Final payment of $500 released for Website Redesign project',
        data: {
          projectId: project3._id,
          transactionId: transaction5._id,
          amount: 500,
          actionUrl: '/wallet'
        },
        priority: 'high',
        read: true,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        userId: freelancerUser._id,
        type: 'system',
        title: 'Profile Views Milestone',
        message: 'Great job! Your profile has been viewed 100+ times this month',
        data: {
          actionUrl: '/profile'
        },
        priority: 'low',
        read: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        userId: freelancerUser._id,
        type: 'system',
        title: 'Welcome to Freelance Project Tracker!',
        message: 'Welcome! Complete your profile to start receiving project invitations.',
        data: {
          actionUrl: '/profile'
        },
        priority: 'low',
        read: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },

      // For Admin
      {
        userId: adminUser._id,
        type: 'system',
        title: 'Project Reported',
        message: 'Project "Blog Platform Development" has been reported by a user',
        data: {
          projectId: project5._id,
          actionUrl: `/admin/projects/${project5._id}`
        },
        priority: 'high',
        read: false,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      },
      {
        userId: adminUser._id,
        type: 'system',
        title: 'New User Registration',
        message: '2 new users registered today',
        data: {
          actionUrl: '/admin/users'
        },
        priority: 'low',
        read: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    for (const notificationData of notifications) {
      const notification = new Notification(notificationData);
      await notification.save();
    }

    console.log('✅ Notifications created (16 notifications for all users)');

    // Update wallet transaction histories
    console.log('\n💼 Updating wallet transaction histories...');

    clientWallet.transactionHistory = [
      {
        type: 'debit',
        amount: 50000,
        description: 'Payment held for Project Setup & Architecture Design milestone',
        projectId: project1._id,
        transactionId: transaction1._id,
        toUserId: freelancerUser._id,
        status: 'completed',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'debit',
        amount: 80000,
        description: 'Payment held for Razorpay & UPI Integration milestone',
        projectId: project1._id,
        transactionId: transaction2._id,
        toUserId: freelancerUser._id,
        status: 'completed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'debit',
        amount: 180000,
        description: 'Payment for Restaurant Management System project (all milestones)',
        projectId: project3._id,
        toUserId: freelancerUser._id,
        status: 'completed',
        createdAt: new Date(Date.now() - 52 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'credit',
        amount: 30000,
        description: 'Partial refund for cancelled Matrimony Portal project',
        projectId: project5._id,
        transactionId: transaction7._id,
        fromUserId: freelancerUser._id,
        status: 'completed',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'credit',
        amount: 500000,
        description: 'Initial wallet deposit via Razorpay',
        status: 'completed',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      }
    ];

    freelancerWallet.transactionHistory = [
      {
        type: 'credit',
        amount: 50000,
        description: 'Payment received for Project Setup & Architecture Design milestone',
        projectId: project1._id,
        transactionId: transaction1._id,
        fromUserId: clientUser._id,
        status: 'completed',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'hold',
        amount: 80000,
        description: 'Payment held for Razorpay & UPI Integration milestone',
        projectId: project1._id,
        transactionId: transaction2._id,
        fromUserId: clientUser._id,
        status: 'completed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'credit',
        amount: 40000,
        description: 'Payment for System Design & Database Setup',
        projectId: project3._id,
        transactionId: transaction3._id,
        fromUserId: clientUser._id,
        status: 'completed',
        createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'credit',
        amount: 90000,
        description: 'Payment for Core Features Development',
        projectId: project3._id,
        transactionId: transaction4._id,
        fromUserId: clientUser._id,
        status: 'completed',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'credit',
        amount: 35000,
        description: 'Payment for Billing & GST Integration',
        projectId: project3._id,
        transactionId: transaction5._id,
        fromUserId: clientUser._id,
        status: 'completed',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'credit',
        amount: 15000,
        description: 'Final payment for Restaurant Management System',
        projectId: project3._id,
        transactionId: transaction6._id,
        fromUserId: clientUser._id,
        status: 'completed',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    ];

    await clientWallet.save();
    await freelancerWallet.save();

    console.log('✅ Wallet histories updated');

    // 📊 PRINT SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPREHENSIVE DATABASE SEEDING COMPLETED!');
    console.log('='.repeat(60));
    
    console.log('\n📊 DATABASE SUMMARY:');
    console.log('├─ 👥 Users: 3 (1 Client, 1 Freelancer, 1 Admin)');
    console.log('├─ 📝 Profiles: 3 (Complete with Indian context, skills, portfolio, ratings)');
    console.log('├─ 💼 Projects: 5');
    console.log('│  ├─ In Progress: 1 (Fintech Payment Gateway - ₹2.5L)');
    console.log('│  ├─ Open: 1 (Ayurveda E-commerce - ₹3.5L)');
    console.log('│  ├─ Completed: 1 (Restaurant Management - ₹1.8L)');
    console.log('│  ├─ Draft: 1 (EdTech Video Platform - ₹4.5L)');
    console.log('│  └─ Cancelled: 1 (Matrimony Portal - ₹1.2L - Reported)');
    console.log('├─ 💰 Transactions: 7');
    console.log('│  ├─ Released: 5 (₹2.3L total)');
    console.log('│  ├─ Held: 1 (₹80K)');
    console.log('│  └─ Refunded: 1 (₹30K)');
    console.log('├─ 💳 Wallets: 2');
    console.log('│  ├─ Client Balance: ₹2L (Held: ₹80K, Spent: ₹5.1L)');
    console.log('│  └─ Freelancer Balance: ₹1.5L (Earned: ₹2.8L)');
    console.log('├─ 💬 Messages: 17 (Indian context, conversations across projects)');
    console.log('└─ 🔔 Notifications: 16 (All types, read and unread)');

    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('┌────────────────────────────────────────────────────────┐');
    console.log('│ CLIENT (Rajesh Kumar)                                  │');
    console.log('│ Email: rajesh.kumar@demo.com                           │');
    console.log('│ Password: rajesh123                                    │');
    console.log('│ Location: Bangalore, India                             │');
    console.log('├────────────────────────────────────────────────────────┤');
    console.log('│ FREELANCER (Priya Sharma)                              │');
    console.log('│ Email: priya.sharma@demo.com                           │');
    console.log('│ Password: priya123                                     │');
    console.log('│ Location: Mumbai, India                                │');
    console.log('├────────────────────────────────────────────────────────┤');
    console.log('│ ADMIN                                                  │');
    console.log('│ Email: admin@demo.com                                  │');
    console.log('│ Password: admin123                                     │');
    console.log('└────────────────────────────────────────────────────────┘');

    console.log('\n✨ FEATURES POPULATED:');
    console.log('✅ User authentication (all roles)');
    console.log('✅ Complete user profiles with portfolios');
    console.log('✅ Projects in all statuses');
    console.log('✅ Milestones (pending, in progress, completed)');
    console.log('✅ Proposals and bids');
    console.log('✅ Payment transactions (held, released, refunded)');
    console.log('✅ Wallet balances and transaction histories');
    console.log('✅ Messages and conversations');
    console.log('✅ Notifications (all types, read/unread)');
    console.log('✅ Admin flags (reported project)');
    console.log('✅ Project health scores');
    console.log('✅ Ratings and reviews');

    console.log('\n🚀 READY TO TEST:');
    console.log('• Client Dashboard - View projects, messages, wallet');
    console.log('• Freelancer Dashboard - View assigned projects, earnings');
    console.log('• Project Management - Milestones, status updates');
    console.log('• Payment System - Held, released, refunded transactions');
    console.log('• Messaging - Real-time chat with history');
    console.log('• Notifications - All notification types');
    console.log('• Admin Panel - Manage users, view reported projects');
    console.log('• Wallet - Balance, transaction history');

    console.log('\n' + '='.repeat(60));
    console.log('💡 TIP: Start your backend server and login with any');
    console.log('    of the credentials above to explore the platform!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seed script
comprehensiveSeed();
