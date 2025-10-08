import express from 'express';
import Project from './models/Project.js';
import { auth } from './middleware/auth.js';

const router = express.Router();

// Debug endpoint - Add this to your routes temporarily
router.get('/debug/pending-proposals/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('DEBUG - Looking for pending proposals for user:', userId);
    
    // Find all projects by this client
    const allProjects = await Project.find({ clientId: userId })
      .populate('applicants.freelancerId', 'name email');
    
    console.log('DEBUG - All projects by client:', allProjects.length);
    
    // Find open projects with applicants
    const openWithApplicants = allProjects.filter(p => 
      p.status === 'open' && p.applicants && p.applicants.length > 0
    );
    
    console.log('DEBUG - Open projects with applicants:', openWithApplicants.length);
    
    const response = {
      userId,
      totalProjects: allProjects.length,
      openProjectsWithApplicants: openWithApplicants.length,
      projects: openWithApplicants.map(p => ({
        title: p.title,
        status: p.status,
        applicantsCount: p.applicants.length,
        applicants: p.applicants.map(app => ({
          freelancerName: app.freelancerId.name,
          status: app.status,
          budget: app.proposedBudget
        }))
      }))
    };
    
    res.json(response);
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to create a test in-progress project
router.post('/debug/create-test-project', auth, async (req, res) => {
  try {
    const { clientId, freelancerId, title = "Test In-Progress Project" } = req.body;
    
    if (!clientId || !freelancerId) {
      return res.status(400).json({ message: 'clientId and freelancerId required' });
    }
    
    const project = new Project({
      title,
      description: "This is a test project for testing completion workflow",
      clientId,
      freelancerId,
      status: 'in_progress',
      budget: { total: 1000, agreed: 1000, currency: 'USD' },
      timeline: { 
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      skills: ['Testing'],
      completion: {
        clientMarkedComplete: false,
        freelancerMarkedComplete: false,
        clientCompletedAt: null,
        freelancerCompletedAt: null,
        finalCompletedAt: null
      },
      applicants: [{
        freelancerId,
        proposedBudget: 1000,
        proposedTimeline: 30,
        coverLetter: "Test proposal",
        status: 'accepted',
        acceptedAt: new Date()
      }]
    });
    
    await project.save();
    await project.populate('clientId', 'name email');
    await project.populate('freelancerId', 'name email');
    
    res.json({
      message: 'Test project created successfully',
      project
    });
  } catch (error) {
    console.error('Debug create project error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
