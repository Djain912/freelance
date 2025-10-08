import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../models/Project.js';
import User from '../models/User.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freelance-tracker');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const addTestBids = async () => {
  try {
    console.log('Adding test bids...');

    // Find the first open project
    const project = await Project.findOne({ status: 'open' }).populate('clientId');
    if (!project) {
      console.log('No open project found');
      return;
    }

    console.log('Found project:', project.title);

    // Find or create freelancer users
    const freelancers = [];
    
    // Create test freelancer 1
    let freelancer1 = await User.findOne({ email: 'freelancer1@test.com' });
    if (!freelancer1) {
      freelancer1 = new User({
        name: 'John Freelancer',
        email: 'freelancer1@test.com',
        password: 'password123',
        role: 'freelancer'
      });
      await freelancer1.save();
    }
    freelancers.push(freelancer1);

    // Create test freelancer 2
    let freelancer2 = await User.findOne({ email: 'freelancer2@test.com' });
    if (!freelancer2) {
      freelancer2 = new User({
        name: 'Sarah Developer',
        email: 'freelancer2@test.com',
        password: 'password123',
        role: 'freelancer'
      });
      await freelancer2.save();
    }
    freelancers.push(freelancer2);

    // Create test freelancer 3
    let freelancer3 = await User.findOne({ email: 'freelancer3@test.com' });
    if (!freelancer3) {
      freelancer3 = new User({
        name: 'Mike Designer',
        email: 'freelancer3@test.com',
        password: 'password123',
        role: 'freelancer'
      });
      await freelancer3.save();
    }
    freelancers.push(freelancer3);

    // Add bids to the project
    const testBids = [
      {
        freelancerId: freelancer1._id,
        proposedBudget: project.budget.total * 0.8,
        proposal: "I have 5+ years of experience in web development and can deliver this project with high quality. I specialize in React and Node.js and can complete this within the timeline.",
        estimatedDays: 7,
        submittedAt: new Date(),
        status: 'pending'
      },
      {
        freelancerId: freelancer2._id,
        proposedBudget: project.budget.total * 0.9,
        proposal: "As a full-stack developer with expertise in modern web technologies, I can bring your vision to life. I focus on clean code, responsive design, and user experience.",
        estimatedDays: 10,
        submittedAt: new Date(),
        status: 'pending'
      },
      {
        freelancerId: freelancer3._id,
        proposedBudget: project.budget.total * 1.1,
        proposal: "I'm a senior developer with extensive experience in similar projects. I can provide additional features and ensure scalability. My approach includes thorough testing and documentation.",
        estimatedDays: 14,
        submittedAt: new Date(),
        status: 'pending'
      }
    ];

    // Clear existing applicants and add new test bids
    project.applicants = testBids;
    await project.save();

    console.log('Test bids added successfully!');
    console.log(`Added ${testBids.length} bids to project: ${project.title}`);
    
  } catch (error) {
    console.error('Error adding test bids:', error);
  }
};

const main = async () => {
  await connectDB();
  await addTestBids();
  process.exit(0);
};

main();
