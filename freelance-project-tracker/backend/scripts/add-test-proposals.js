import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Project from '../models/Project.js';

dotenv.config();

async function addTestProposals() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    // Find a client and freelancer
    const client = await User.findOne({ role: 'client' });
    const freelancer = await User.findOne({ role: 'freelancer' });
    
    if (!client || !freelancer) {
      console.log('No client or freelancer found. Please run seed script first.');
      return;
    }

    console.log('Found client:', client.name, client._id);
    console.log('Found freelancer:', freelancer.name, freelancer._id);

    // Find an open project by the client
    let project = await Project.findOne({ 
      clientId: client._id, 
      status: 'open' 
    });

    // If no open project, create one
    if (!project) {
      project = new Project({
        title: 'Test Project with Proposals',
        description: 'This is a test project to demonstrate the proposal system.',
        clientId: client._id,
        status: 'open',
        budget: {
          total: 5000,
          currency: 'USD'
        },
        timeline: {
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          estimatedHours: 100
        },
        skills: ['JavaScript', 'React', 'Node.js'],
        category: 'Web Development',
        priority: 'medium',
        isPublic: true
      });

      await project.save();
      console.log('Created new project:', project.title, project._id);
    }

    // Add a proposal from the freelancer
    const proposalData = {
      freelancerId: freelancer._id,
      proposedBudget: 4500,
      proposedTimeline: 25,
      coverLetter: 'I am excited to work on your project. I have 5 years of experience in web development and can deliver high-quality results within your timeline.',
      status: 'pending',
      appliedAt: new Date(),
      submittedAt: new Date()
    };

    // Check if proposal already exists
    const existingProposal = project.applicants.find(
      app => app.freelancerId.toString() === freelancer._id.toString()
    );

    if (!existingProposal) {
      project.applicants.push(proposalData);
      await project.save();
      console.log('Added proposal to project');
    } else {
      console.log('Proposal already exists');
    }

    // Populate and display the project
    await project.populate('applicants.freelancerId', 'name email');
    console.log('Project with proposals:', {
      title: project.title,
      clientId: project.clientId,
      status: project.status,
      applicantsCount: project.applicants.length,
      applicants: project.applicants.map(app => ({
        freelancer: app.freelancerId.name,
        budget: app.proposedBudget,
        status: app.status
      }))
    });

    console.log('Test proposals added successfully!');
    
  } catch (error) {
    console.error('Error adding test proposals:', error);
  } finally {
    mongoose.disconnect();
  }
}

addTestProposals();
