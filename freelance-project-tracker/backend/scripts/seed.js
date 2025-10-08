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

// Import constants
import { USER_ROLES, PROJECT_STATUS, MILESTONE_STATUS, TRANSACTION_STATUS } from '../../shared/constants.js';

dotenv.config();

// Sample data
const sampleUsers = [
  {
    email: 'client@example.com',
    password: 'password',
    name: 'John Client',
    role: USER_ROLES.CLIENT
  },
  {
    email: 'freelancer@example.com',
    password: 'password',
    name: 'Jane Freelancer',
    role: USER_ROLES.FREELANCER
  },
  {
    email: 'admin@example.com',
    password: 'password',
    name: 'Admin User',
    role: USER_ROLES.ADMIN
  },
  {
    email: 'client2@example.com',
    password: 'password',
    name: 'Sarah Client',
    role: USER_ROLES.CLIENT
  },
  {
    email: 'freelancer2@example.com',
    password: 'password',
    name: 'Mike Developer',
    role: USER_ROLES.FREELANCER
  }
];

const sampleProfiles = [
  {
    bio: 'Experienced business owner looking for talented freelancers to help grow my startup.',
    skills: ['Project Management', 'Business Strategy', 'Marketing'],
    experience: 5,
    availability: 'available',
    location: {
      country: 'United States',
      city: 'San Francisco',
      timezone: 'PST'
    },
    languages: [
      { name: 'English', proficiency: 'native' }
    ],
    preferences: {
      projectTypes: ['Web Development', 'Mobile Development', 'Design'],
      budgetRange: { min: 1000, max: 10000 }
    }
  },
  {
    bio: 'Full-stack developer with 8+ years of experience in React, Node.js, and MongoDB. Passionate about creating efficient, scalable solutions.',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'HTML', 'CSS', 'Git'],
    experience: 8,
    hourlyRate: 75,
    availability: 'available',
    portfolio: [
      {
        title: 'E-commerce Platform',
        description: 'Built a complete e-commerce solution using MERN stack',
        url: 'https://example.com/portfolio/ecommerce'
      },
      {
        title: 'Task Management App',
        description: 'React-based task management application with real-time updates',
        url: 'https://example.com/portfolio/taskapp'
      }
    ],
    rating: {
      average: 4.8,
      count: 23
    },
    completedProjects: 23,
    location: {
      country: 'Canada',
      city: 'Toronto',
      timezone: 'EST'
    },
    languages: [
      { name: 'English', proficiency: 'fluent' },
      { name: 'French', proficiency: 'conversational' }
    ],
    socialLinks: {
      github: 'https://github.com/janefreelancer',
      linkedin: 'https://linkedin.com/in/janefreelancer'
    },
    preferences: {
      projectTypes: ['Web Development', 'API Development', 'Database Design'],
      budgetRange: { min: 500, max: 5000 }
    }
  },
  {
    bio: 'System administrator with extensive experience in cloud platforms and DevOps.',
    skills: ['System Administration', 'DevOps', 'Cloud Computing', 'Security'],
    experience: 10,
    availability: 'available',
    location: {
      country: 'United States',
      city: 'Austin',
      timezone: 'CST'
    }
  },
  {
    bio: 'Marketing professional specializing in digital campaigns and content strategy.',
    skills: ['Digital Marketing', 'Content Strategy', 'SEO', 'Social Media'],
    experience: 6,
    availability: 'available',
    location: {
      country: 'United Kingdom',
      city: 'London',
      timezone: 'GMT'
    }
  },
  {
    bio: 'Mobile app developer with expertise in React Native and Flutter. Love creating beautiful, performant mobile experiences.',
    skills: ['React Native', 'Flutter', 'iOS', 'Android', 'JavaScript', 'Dart'],
    experience: 5,
    hourlyRate: 65,
    availability: 'available',
    portfolio: [
      {
        title: 'Fitness Tracking App',
        description: 'Cross-platform fitness app built with React Native',
        url: 'https://example.com/portfolio/fitness'
      }
    ],
    rating: {
      average: 4.6,
      count: 15
    },
    completedProjects: 15,
    location: {
      country: 'Australia',
      city: 'Sydney',
      timezone: 'AEST'
    },
    languages: [
      { name: 'English', proficiency: 'native' }
    ],
    socialLinks: {
      github: 'https://github.com/mikedeveloper'
    },
    preferences: {
      projectTypes: ['Mobile Development', 'Cross-platform Development'],
      budgetRange: { min: 1000, max: 8000 }
    }
  }
];

const sampleProjects = [
  {
    title: 'E-commerce Website Development',
    description: 'Need a modern e-commerce website built with React and Node.js. Should include user authentication, product catalog, shopping cart, and payment integration.',
    budget: { total: 5000, currency: 'USD' },
    timeline: {
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      estimatedHours: 80
    },
    skills: ['React', 'Node.js', 'MongoDB', 'Payment Integration'],
    category: 'Web Development',
    priority: 'high',
    status: PROJECT_STATUS.IN_PROGRESS,
    milestones: [
      {
        title: 'UI/UX Design',
        description: 'Complete the design mockups and user interface',
        amount: 1000,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: MILESTONE_STATUS.COMPLETED,
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Backend API',
        description: 'Develop the backend API and database schema',
        amount: 2000,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: MILESTONE_STATUS.IN_PROGRESS
      },
      {
        title: 'Frontend Implementation',
        description: 'Build the frontend components and integrate with API',
        amount: 1500,
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: MILESTONE_STATUS.PENDING
      },
      {
        title: 'Testing & Deployment',
        description: 'Test the application and deploy to production',
        amount: 500,
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: MILESTONE_STATUS.PENDING
      }
    ],
    timeline: {
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      estimatedHours: 80
    }
  },
  {
    title: 'Mobile App for Food Delivery',
    description: 'Looking for a mobile app developer to create a food delivery app similar to UberEats. Need both iOS and Android versions.',
    budget: { total: 8000, currency: 'USD' },
    timeline: {
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      estimatedHours: 120
    },
    skills: ['React Native', 'Mobile Development', 'API Integration', 'Maps'],
    category: 'Mobile Development',
    priority: 'medium',
    status: PROJECT_STATUS.OPEN,
    milestones: [
      {
        title: 'App Architecture',
        description: 'Design the app architecture and set up development environment',
        amount: 1500,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: MILESTONE_STATUS.PENDING
      },
      {
        title: 'Core Features',
        description: 'Implement core features like user registration, restaurant browsing, ordering',
        amount: 4000,
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: MILESTONE_STATUS.PENDING
      },
      {
        title: 'Payment & Delivery',
        description: 'Add payment processing and delivery tracking features',
        amount: 2000,
        dueDate: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
        status: MILESTONE_STATUS.PENDING
      },
      {
        title: 'Testing & Launch',
        description: 'Test the app thoroughly and publish to app stores',
        amount: 500,
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: MILESTONE_STATUS.PENDING
      }
    ]
  },
  {
    title: 'Company Website Redesign',
    description: 'Our company website needs a modern redesign. Looking for someone experienced in modern web design and development.',
    budget: { total: 3000, currency: 'USD' },
    timeline: {
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      estimatedHours: 40
    },
    skills: ['Web Design', 'HTML', 'CSS', 'JavaScript', 'Responsive Design'],
    category: 'Web Design',
    priority: 'low',
    status: PROJECT_STATUS.DRAFT,
    milestones: [
      {
        title: 'Design Mockups',
        description: 'Create design mockups for all pages',
        amount: 1000,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: MILESTONE_STATUS.PENDING
      },
      {
        title: 'Development',
        description: 'Convert designs to functional website',
        amount: 1500,
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: MILESTONE_STATUS.PENDING
      },
      {
        title: 'Content Migration',
        description: 'Migrate existing content and optimize for SEO',
        amount: 500,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: MILESTONE_STATUS.PENDING
      }
    ]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fpt';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Profile.deleteMany({}),
      Project.deleteMany({}),
      Message.deleteMany({}),
      Transaction.deleteMany({}),
      Notification.deleteMany({})
    ]);

    // Create users
    console.log('Creating users...');
    const createdUsers = [];
    for (let i = 0; i < sampleUsers.length; i++) {
      const userData = sampleUsers[i];
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.email}`);
    }

    // Create profiles
    console.log('Creating profiles...');
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const profileData = sampleProfiles[i] || {
        bio: '',
        skills: [],
        experience: 0,
        availability: 'available'
      };
      
      const profile = new Profile({
        userId: user._id,
        ...profileData
      });
      await profile.save();
      console.log(`Created profile for: ${user.email}`);
    }

    // Create projects
    console.log('Creating projects...');
    const createdProjects = [];
    for (let i = 0; i < sampleProjects.length; i++) {
      const projectData = sampleProjects[i];
      const clientIndex = i % 2 === 0 ? 0 : 3; // Alternate between first and fourth user (both clients)
      const freelancerIndex = i === 0 ? 1 : null; // Only assign freelancer to first project
      
      const project = new Project({
        ...projectData,
        clientId: createdUsers[clientIndex]._id,
        freelancerId: freelancerIndex ? createdUsers[freelancerIndex]._id : undefined
      });
      
      // Calculate health score
      project.calculateHealthScore();
      
      await project.save();
      createdProjects.push(project);
      console.log(`Created project: ${project.title}`);
    }

    // Create sample messages
    console.log('Creating sample messages...');
    if (createdProjects.length > 0 && createdUsers.length >= 2) {
      const messages = [
        {
          senderId: createdUsers[0]._id, // client
          recipientId: createdUsers[1]._id, // freelancer
          projectId: createdProjects[0]._id,
          text: 'Hi Jane! I\'m excited to work with you on this e-commerce project. When can we schedule a kick-off call?'
        },
        {
          senderId: createdUsers[1]._id, // freelancer
          recipientId: createdUsers[0]._id, // client
          projectId: createdProjects[0]._id,
          text: 'Hello John! I\'m excited too. I\'m available for a call tomorrow afternoon. How does 2 PM work for you?'
        },
        {
          senderId: createdUsers[0]._id, // client
          recipientId: createdUsers[1]._id, // freelancer
          projectId: createdProjects[0]._id,
          text: 'Perfect! 2 PM tomorrow works great. I\'ll send you a calendar invite.'
        }
      ];

      for (const messageData of messages) {
        const message = new Message(messageData);
        await message.save();
        console.log('Created sample message');
      }
    }

    // Create sample transactions
    console.log('Creating sample transactions...');
    if (createdProjects.length > 0 && createdUsers.length >= 2) {
      const transactions = [
        {
          projectId: createdProjects[0]._id,
          clientId: createdUsers[0]._id,
          freelancerId: createdUsers[1]._id,
          milestoneId: createdProjects[0].milestones[0]._id,
          amount: 1000,
          status: TRANSACTION_STATUS.RELEASED,
          description: 'Payment for UI/UX Design milestone',
          paymentMethod: 'dummy',
          externalTransactionId: 'dummy_released_001',
          fees: {
            platform: 50,
            payment: 0
          },
          metadata: {
            holdReason: 'Milestone payment',
            releaseReason: 'Milestone completed and approved',
            holdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            releaseAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          events: [
            {
              type: 'held',
              timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
              details: 'Funds held for milestone completion'
            },
            {
              type: 'released',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              details: 'Milestone completed and approved by client'
            }
          ]
        },
        {
          projectId: createdProjects[0]._id,
          clientId: createdUsers[0]._id,
          freelancerId: createdUsers[1]._id,
          milestoneId: createdProjects[0].milestones[1]._id,
          amount: 2000,
          status: TRANSACTION_STATUS.HELD,
          description: 'Payment for Backend API milestone',
          paymentMethod: 'dummy',
          externalTransactionId: 'dummy_held_002',
          fees: {
            platform: 100,
            payment: 0
          },
          metadata: {
            holdReason: 'Milestone payment',
            holdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
          },
          events: [
            {
              type: 'held',
              timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
              details: 'Funds held for milestone completion'
            }
          ]
        }
      ];

      for (const transactionData of transactions) {
        const transaction = new Transaction(transactionData);
        await transaction.save();
        console.log(`Created transaction: ${transaction.status} - $${transaction.amount}`);
      }
    }

    // Create sample notifications
    console.log('Creating sample notifications...');
    if (createdUsers.length >= 2) {
      const notifications = [
        {
          userId: createdUsers[1]._id, // freelancer
          type: 'project_update',
          title: 'Project Assignment',
          message: 'You have been assigned to the E-commerce Website Development project',
          data: {
            projectId: createdProjects[0]._id,
            fromUserId: createdUsers[0]._id,
            actionUrl: `/projects/${createdProjects[0]._id}`
          },
          priority: 'high'
        },
        {
          userId: createdUsers[0]._id, // client
          type: 'milestone',
          title: 'Milestone Completed',
          message: 'The UI/UX Design milestone has been completed',
          data: {
            projectId: createdProjects[0]._id,
            fromUserId: createdUsers[1]._id,
            actionUrl: `/projects/${createdProjects[0]._id}`
          },
          priority: 'medium'
        },
        {
          userId: createdUsers[1]._id, // freelancer
          type: 'payment',
          title: 'Payment Released',
          message: 'Payment of $1,000 has been released for the UI/UX Design milestone',
          data: {
            projectId: createdProjects[0]._id,
            actionUrl: `/transactions`
          },
          priority: 'high'
        }
      ];

      for (const notificationData of notifications) {
        const notification = new Notification(notificationData);
        await notification.save();
        console.log('Created sample notification');
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users created: ${createdUsers.length}`);
    console.log(`📋 Projects created: ${createdProjects.length}`);
    console.log(`💳 Transactions created: 2`);
    console.log(`💬 Messages created: 3`);
    console.log(`🔔 Notifications created: 3`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Client: client@example.com / password');
    console.log('Freelancer: freelancer@example.com / password');
    console.log('Admin: admin@example.com / password');
    
    console.log('\n🚀 You can now start the application!');

  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seed script
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
