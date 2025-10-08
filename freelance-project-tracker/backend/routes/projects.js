import express from 'express';
import Joi from 'joi';
import Project from '../models/Project.js';
import { auth, authorize } from '../middleware/auth.js';
import { PROJECT_STATUS, MILESTONE_STATUS, USER_ROLES } from '../../shared/constants.js';
import { notificationService } from '../services/notification.js';

const router = express.Router();

// Validation schemas
const createProjectSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).required(),
  budget: Joi.object({
    total: Joi.number().min(1).required(),
    currency: Joi.string().default('USD')
  }).required(),
  timeline: Joi.object({
    endDate: Joi.date().min('now').required(),
    estimatedHours: Joi.number().min(1).optional()
  }).required(),
  skills: Joi.array().items(Joi.string()).min(1).required(),
  category: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  status: Joi.string().valid(...Object.values(PROJECT_STATUS)).optional(),
  isPublic: Joi.boolean().optional(),
  milestones: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      description: Joi.string().optional(),
      amount: Joi.number().min(0).required(),
      dueDate: Joi.date().min('now').required()
    })
  ).optional()
});

const updateMilestoneSchema = Joi.object({
  status: Joi.string().valid(...Object.values(MILESTONE_STATUS)).required()
});

// Get projects for current user
router.get('/', auth, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query based on user role
    let query = {};
    
    if (req.user.role === USER_ROLES.CLIENT) {
      query.clientId = req.user.id;
    } else if (req.user.role === USER_ROLES.FREELANCER) {
      query.$or = [
        { freelancerId: req.user.id },
        { status: PROJECT_STATUS.OPEN, isPublic: true }
      ];
    } else if (req.user.role === USER_ROLES.ADMIN) {
      // Admin can see all projects
    }
    
    // Add status filter
    if (status && Object.values(PROJECT_STATUS).includes(status)) {
      query.status = status;
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const projects = await Project.find(query)
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email')
      .populate('applicants.freelancerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    // Calculate health scores
    projects.forEach(project => project.calculateHealthScore());
    
    const total = await Project.countDocuments(query);
    
    res.json({
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      message: 'Failed to fetch projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email')
      .populate('applicants.freelancerId', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check permissions
    const canView = (
      req.user.role === USER_ROLES.ADMIN ||
      project.clientId._id.toString() === req.user.id ||
      (project.freelancerId && project.freelancerId._id.toString() === req.user.id) ||
      (project.isPublic && project.status === PROJECT_STATUS.OPEN)
    );
    
    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Calculate health score
    project.calculateHealthScore();
    
    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      message: 'Failed to fetch project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new project
router.post('/', auth, authorize(USER_ROLES.CLIENT, USER_ROLES.ADMIN), async (req, res) => {
  try {
    console.log('Received project data:', req.body);
    const { error, value } = createProjectSchema.validate(req.body);
    if (error) {
      console.log('Project validation error:', error.details[0].message);
      console.log('Request body:', req.body);
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    
    console.log('Validated project data:', value);
    const projectData = {
      ...value,
      clientId: req.user.id,
      status: value.status || PROJECT_STATUS.OPEN
    };
    console.log('Final project data before save:', projectData);
    
    // Validate milestone amounts don't exceed total budget
    if (projectData.milestones && projectData.milestones.length > 0) {
      const totalMilestoneAmount = projectData.milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
      if (totalMilestoneAmount > projectData.budget.total) {
        return res.status(400).json({
          message: 'Total milestone amounts exceed project budget'
        });
      }
    }
    
    const project = new Project(projectData);
    console.log('Project status before save:', project.status);
    await project.save();
    console.log('Project status after save:', project.status);
    
    await project.populate('clientId', 'name email');
    
    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      message: 'Failed to create project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update project
router.patch('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check permissions
    const canEdit = (
      req.user.role === USER_ROLES.ADMIN ||
      project.clientId.toString() === req.user.id
    );
    
    if (!canEdit) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'status', 'timeline', 'skills', 'category', 'priority', 'isPublic'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    Object.assign(project, updates);
    await project.save();
    
    await project.populate('clientId', 'name email');
    await project.populate('freelancerId', 'name email');
    
    // Notify relevant users about project update
    const io = req.app.get('io');
    if (io && project.freelancerId) {
      await notificationService.notifyProjectUpdate(
        {
          projectId: project._id,
          title: project.title
        },
        [project.freelancerId._id],
        io
      );
    }
    
    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      message: 'Failed to update project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update milestone status
router.patch('/:id/milestone/:idx', auth, async (req, res) => {
  try {
    const { error, value } = updateMilestoneSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    
    const project = await Project.findById(req.params.id);
    const milestoneIndex = parseInt(req.params.idx);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (milestoneIndex < 0 || milestoneIndex >= project.milestones.length) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    
    // Check permissions
    const canUpdate = (
      req.user.role === USER_ROLES.ADMIN ||
      project.clientId.toString() === req.user.id ||
      (project.freelancerId && project.freelancerId.toString() === req.user.id)
    );
    
    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const milestone = project.milestones[milestoneIndex];
    const oldStatus = milestone.status;
    milestone.status = value.status;
    
    // Set completion/approval timestamps
    if (value.status === MILESTONE_STATUS.COMPLETED && oldStatus !== MILESTONE_STATUS.COMPLETED) {
      milestone.completedAt = new Date();
    }
    
    if (value.status === MILESTONE_STATUS.APPROVED && oldStatus !== MILESTONE_STATUS.APPROVED) {
      milestone.approvedAt = new Date();
    }
    
    // Recalculate health score
    project.calculateHealthScore();
    
    await project.save();
    await project.populate('clientId', 'name email');
    await project.populate('freelancerId', 'name email');
    
    // Notify relevant users about milestone update
    const io = req.app.get('io');
    if (io) {
      const notifyUserIds = [project.clientId._id];
      if (project.freelancerId) {
        notifyUserIds.push(project.freelancerId._id);
      }
      
      await notificationService.notifyMilestoneUpdate(
        {
          title: milestone.title,
          status: milestone.status,
          projectId: project._id,
          milestoneIndex
        },
        notifyUserIds.filter(id => id.toString() !== req.user.id), // Don't notify the user who made the change
        io
      );
    }
    
    res.json({
      message: 'Milestone updated successfully',
      project,
      milestone
    });
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({
      message: 'Failed to update milestone',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Apply to project (for freelancers)
router.post('/:id/apply', auth, authorize(USER_ROLES.FREELANCER), async (req, res) => {
  try {
    const { proposedBudget, proposedTimeline, coverLetter } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.status !== PROJECT_STATUS.OPEN) {
      return res.status(400).json({ message: 'Project is not open for applications' });
    }
    
    if (project.freelancerId) {
      return res.status(400).json({ message: 'Project already has an assigned freelancer' });
    }
    
    // Check if already applied
    const existingApplication = project.applicants.find(
      app => app.freelancerId.toString() === req.user.id
    );
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this project' });
    }
    
    // Add application
    project.applicants.push({
      freelancerId: req.user.id,
      proposedBudget,
      proposedTimeline,
      coverLetter
    });
    
    await project.save();
    await project.populate('clientId', 'name email');
    
    // Notify client about new application
    const io = req.app.get('io');
    if (io) {
      await notificationService.createNotification(
        {
          userId: project.clientId._id,
          type: 'project_update',
          title: 'New Project Application',
          message: `A freelancer has applied to your project "${project.title}"`,
          data: {
            projectId: project._id,
            fromUserId: req.user.id,
            actionUrl: `/projects/${project._id}`
          },
          priority: 'medium'
        },
        io
      );
    }
    
    res.json({
      message: 'Application submitted successfully',
      project
    });
  } catch (error) {
    console.error('Apply to project error:', error);
    res.status(500).json({
      message: 'Failed to apply to project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Assign freelancer to project
router.post('/:id/assign', auth, authorize(USER_ROLES.CLIENT, USER_ROLES.ADMIN), async (req, res) => {
  try {
    const { freelancerId } = req.body;
    
    if (!freelancerId) {
      return res.status(400).json({ message: 'Freelancer ID is required' });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check permissions
    if (req.user.role !== USER_ROLES.ADMIN && project.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (project.freelancerId) {
      return res.status(400).json({ message: 'Project already has an assigned freelancer' });
    }
    
    // Assign freelancer and update status
    project.freelancerId = freelancerId;
    project.status = PROJECT_STATUS.IN_PROGRESS;
    project.timeline.startDate = new Date();
    
    await project.save();
    await project.populate('clientId', 'name email');
    await project.populate('freelancerId', 'name email');
    
    // Notify freelancer about assignment
    const io = req.app.get('io');
    if (io) {
      await notificationService.createNotification(
        {
          userId: freelancerId,
          type: 'project_update',
          title: 'Project Assignment',
          message: `You have been assigned to project "${project.title}"`,
          data: {
            projectId: project._id,
            fromUserId: req.user.id,
            actionUrl: `/projects/${project._id}`
          },
          priority: 'high'
        },
        io
      );
    }
    
    res.json({
      message: 'Freelancer assigned successfully',
      project
    });
  } catch (error) {
    console.error('Assign freelancer error:', error);
    res.status(500).json({
      message: 'Failed to assign freelancer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Submit bid on project (enhanced version)
router.post('/:id/bid', auth, authorize(USER_ROLES.FREELANCER), async (req, res) => {
  try {
    const { bidAmount, proposal, estimatedDays } = req.body;
    
    if (!bidAmount || !proposal || !estimatedDays) {
      return res.status(400).json({ 
        message: 'Bid amount, proposal, and estimated days are required' 
      });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.status !== PROJECT_STATUS.OPEN) {
      return res.status(400).json({ message: 'Project is not open for bidding' });
    }
    
    if (project.freelancerId) {
      return res.status(400).json({ message: 'Project already has an assigned freelancer' });
    }
    
    // Check if already bid - allow overwrite
    const existingBidIndex = project.applicants.findIndex(
      app => app.freelancerId.toString() === req.user.id
    );
    
    const bidData = {
      freelancerId: req.user.id,
      proposedBudget: bidAmount,
      proposedTimeline: estimatedDays,
      coverLetter: proposal,
      submittedAt: new Date(),
      status: 'pending'
    };
    
    if (existingBidIndex !== -1) {
      // Update existing bid
      project.applicants[existingBidIndex] = bidData;
    } else {
      // Add new bid
      project.applicants.push(bidData);
    }
    
    await project.save();
    
    await project.populate('clientId', 'name email');
    await project.populate('applicants.freelancerId', 'name email');
    
    // Notify client about new bid
    const io = req.app.get('io');
    if (io) {
      await notificationService.createNotification(
        {
          userId: project.clientId._id,
          type: 'project_update',
          title: 'New Bid Received',
          message: `New bid received for your project "${project.title}"`,
          data: {
            projectId: project._id,
            fromUserId: req.user.id,
            actionUrl: `/projects/${project._id}`
          },
          priority: 'medium'
        },
        io
      );
    }
    
    res.json({
      message: 'Bid submitted successfully',
      project
    });
  } catch (error) {
    console.error('Submit bid error:', error);
    res.status(500).json({
      message: 'Failed to submit bid',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Accept bid on project
router.post('/:id/accept-bid', auth, authorize(USER_ROLES.CLIENT, USER_ROLES.ADMIN), async (req, res) => {
  try {
    const { freelancerId } = req.body;
    
    if (!freelancerId) {
      return res.status(400).json({ message: 'Freelancer ID is required' });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check permissions - handle populated clientId
    const projectClientId = project.clientId?._id || project.clientId;
    if (req.user.role !== USER_ROLES.ADMIN && projectClientId.toString() !== req.user.id.toString()) {
      console.log('DEBUG - Authorization check failed:', {
        userRole: req.user.role,
        userId: req.user.id,
        projectClientId: projectClientId,
        projectClientIdString: projectClientId.toString(),
        userIdString: req.user.id.toString(),
        comparison: projectClientId.toString() !== req.user.id.toString()
      });
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (project.freelancerId) {
      return res.status(400).json({ message: 'Project already has an assigned freelancer' });
    }
    
    // Find the accepted bid
    const acceptedBid = project.applicants.find(
      app => app.freelancerId.toString() === freelancerId
    );
    
    if (!acceptedBid) {
      return res.status(404).json({ message: 'Bid not found' });
    }
    
    // Update project with accepted freelancer
    project.freelancerId = freelancerId;
    project.status = PROJECT_STATUS.IN_PROGRESS;
    project.timeline.startDate = new Date();
    project.budget.agreed = acceptedBid.proposedBudget;
    
    // Initialize completion tracking
    if (!project.completion) {
      project.completion = {
        clientMarkedComplete: false,
        freelancerMarkedComplete: false,
        clientCompletedAt: null,
        freelancerCompletedAt: null,
        finalCompletedAt: null
      };
    }
    
    // Mark the accepted bid
    acceptedBid.status = 'accepted';
    acceptedBid.acceptedAt = new Date();
    
    await project.save();
    await project.populate('clientId', 'name email');
    await project.populate('freelancerId', 'name email');
    
    // Notify accepted freelancer
    const io = req.app.get('io');
    if (io) {
      await notificationService.createNotification(
        {
          userId: freelancerId,
          type: 'project_update',
          title: 'Bid Accepted!',
          message: `Your bid for project "${project.title}" has been accepted`,
          data: {
            projectId: project._id,
            fromUserId: req.user.id,
            actionUrl: `/projects/${project._id}`
          },
          priority: 'high'
        },
        io
      );
    }
    
    res.json({
      message: 'Bid accepted successfully',
      project
    });
  } catch (error) {
    console.error('Accept bid error:', error);
    res.status(500).json({
      message: 'Failed to accept bid',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Reject bid on project
router.post('/:id/reject-bid', auth, authorize(USER_ROLES.CLIENT, USER_ROLES.ADMIN), async (req, res) => {
  try {
    const { freelancerId } = req.body;
    
    if (!freelancerId) {
      return res.status(400).json({ message: 'Freelancer ID is required' });
    }

    const project = await Project.findById(req.params.id).populate('clientId');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the project owner (unless admin)
    if (req.user.role !== USER_ROLES.ADMIN && project.clientId._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied. Only the project owner can reject bids.' });
    }

    // Check if project is still open for bidding
    if (project.status !== PROJECT_STATUS.OPEN) {
      return res.status(400).json({ message: 'Project is not open for bidding' });
    }

    // Find and remove the rejected bid
    const bidIndex = project.applicants.findIndex(
      applicant => applicant.freelancerId.toString() === freelancerId
    );

    if (bidIndex === -1) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Remove the bid from applicants array
    const rejectedBid = project.applicants[bidIndex];
    project.applicants.splice(bidIndex, 1);

    await project.save();

    // Notify rejected freelancer
    try {
      await notificationService.createNotification({
        recipientId: freelancerId,
        senderId: req.user.id,
        type: 'bid_rejected',
        data: {
          projectId: project._id,
          projectTitle: project.title,
          title: 'Bid Rejected',
          message: `Your bid for project "${project.title}" was not selected`,
          category: 'project'
        }
      });
    } catch (notifError) {
      console.error('Failed to send rejection notification:', notifError);
    }

    res.json({
      message: 'Bid rejected successfully',
      project: await Project.findById(project._id)
        .populate('clientId', 'name email')
        .populate('freelancerId', 'name email')
        .populate('applicants.freelancerId', 'name email')
    });
  } catch (error) {
    console.error('Reject bid error:', error);
    res.status(500).json({
      message: 'Failed to reject bid',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark project as complete (requires both client and freelancer)
router.post('/:id/mark-complete', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('clientId freelancerId');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is either client or assigned freelancer
    const isClient = project.clientId?._id?.toString() === req.user.id.toString() || project.clientId?.toString() === req.user.id.toString();
    const isFreelancer = project.freelancerId?._id?.toString() === req.user.id.toString() || project.freelancerId?.toString() === req.user.id.toString();
    
    if (!isClient && !isFreelancer) {
      return res.status(403).json({ message: 'Access denied. You must be the client or assigned freelancer.' });
    }
    
    // Check if project is in progress
    if (project.status !== PROJECT_STATUS.IN_PROGRESS) {
      return res.status(400).json({ message: 'Project must be in progress to mark as complete' });
    }
    
    // Initialize completion object if it doesn't exist
    if (!project.completion) {
      project.completion = {
        clientMarkedComplete: false,
        freelancerMarkedComplete: false
      };
    }
    
    const now = new Date();
    
    // Mark completion based on user role
    if (isClient) {
      project.completion.clientMarkedComplete = true;
      project.completion.clientCompletedAt = now;
    }
    
    if (isFreelancer) {
      project.completion.freelancerMarkedComplete = true;
      project.completion.freelancerCompletedAt = now;
    }
    
    // Check if both parties have marked complete
    if (project.completion.clientMarkedComplete && project.completion.freelancerMarkedComplete) {
      project.status = PROJECT_STATUS.COMPLETED;
      project.completion.finalCompletedAt = now;
    }
    
    await project.save();
    
    // Send notifications
    const io = req.app.get('io');
    if (io) {
      const otherPartyId = isClient ? project.freelancerId : project.clientId;
      const otherPartyName = isClient ? 'freelancer' : 'client';
      const currentUserName = isClient ? 'client' : 'freelancer';
      
      if (project.status === PROJECT_STATUS.COMPLETED) {
        // Notify both parties of completion
        await notificationService.createNotification(
          {
            userId: otherPartyId,
            type: 'project_completed',
            title: 'Project Completed!',
            message: `Project "${project.title}" has been completed successfully`,
            data: {
              projectId: project._id,
              fromUserId: req.user.id,
              actionUrl: `/projects/${project._id}`
            },
            priority: 'high'
          },
          io
        );
      } else {
        // Notify other party that one person marked complete
        await notificationService.createNotification(
          {
            userId: otherPartyId,
            type: 'project_update',
            title: 'Completion Pending',
            message: `The ${currentUserName} has marked project "${project.title}" as complete. Please review and mark complete to finalize.`,
            data: {
              projectId: project._id,
              fromUserId: req.user.id,
              actionUrl: `/projects/${project._id}`
            },
            priority: 'medium'
          },
          io
        );
      }
    }
    
    res.json({
      message: project.status === PROJECT_STATUS.COMPLETED 
        ? 'Project completed successfully!' 
        : 'Marked as complete. Waiting for other party to confirm.',
      project,
      requiresOtherParty: project.status !== PROJECT_STATUS.COMPLETED
    });
  } catch (error) {
    console.error('Mark complete error:', error);
    res.status(500).json({
      message: 'Failed to mark project as complete',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update project status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check permissions
    console.log('DEBUG STATUS UPDATE PERMISSION CHECK:', {
      projectId: req.params.id,
      projectClientId: project.clientId,
      projectClientIdString: project.clientId.toString(),
      reqUserId: req.user.id,
      reqUserIdString: req.user.id.toString(),
      reqUserRole: req.user.role,
      comparison: project.clientId.toString() === req.user.id.toString()
    });
    
    const canUpdate = (
      req.user.role === USER_ROLES.ADMIN ||
      project.clientId.toString() === req.user.id.toString() ||
      (project.freelancerId && project.freelancerId.toString() === req.user.id.toString())
    );
    
    console.log('DEBUG PERMISSION RESULT:', {
      canUpdate,
      isAdmin: req.user.role === USER_ROLES.ADMIN,
      isClient: project.clientId.toString() === req.user.id.toString(),
      isFreelancer: project.freelancerId && project.freelancerId.toString() === req.user.id.toString(),
      USER_ROLES_ADMIN: USER_ROLES.ADMIN,
      actualUserRole: req.user.role
    });
    
    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Validate status transitions
    const allowedTransitions = {
      [PROJECT_STATUS.DRAFT]: [PROJECT_STATUS.OPEN, PROJECT_STATUS.CANCELLED],
      [PROJECT_STATUS.OPEN]: [PROJECT_STATUS.IN_PROGRESS, PROJECT_STATUS.CANCELLED],
      [PROJECT_STATUS.IN_PROGRESS]: [PROJECT_STATUS.COMPLETED, PROJECT_STATUS.CANCELLED],
      [PROJECT_STATUS.COMPLETED]: [],
      [PROJECT_STATUS.CANCELLED]: []
    };
    
    if (!allowedTransitions[project.status].includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${project.status} to ${status}` 
      });
    }
    
    const oldStatus = project.status;
    project.status = status;
    
    // Set completion date if project is completed
    if (status === PROJECT_STATUS.COMPLETED && oldStatus !== PROJECT_STATUS.COMPLETED) {
      project.timeline.endDate = new Date();
    }
    
    await project.save();
    await project.populate('clientId', 'name email');
    await project.populate('freelancerId', 'name email');
    
    // Notify relevant users about status change
    const io = req.app.get('io');
    if (io) {
      const notifyUserIds = [project.clientId._id];
      if (project.freelancerId) {
        notifyUserIds.push(project.freelancerId._id);
      }
      
      await notificationService.notifyProjectUpdate(
        {
          projectId: project._id,
          title: project.title,
          status: status
        },
        notifyUserIds.filter(id => id.toString() !== req.user.id),
        io
      );
    }
    
    res.json({
      message: 'Project status updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({
      message: 'Failed to update project status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete project
router.delete('/:id', auth, authorize(USER_ROLES.CLIENT, USER_ROLES.ADMIN), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check permissions
    if (req.user.role !== USER_ROLES.ADMIN && project.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Can only delete draft projects or completed projects
    if (project.status !== PROJECT_STATUS.DRAFT && project.status !== PROJECT_STATUS.COMPLETED) {
      return res.status(400).json({ 
        message: 'Can only delete draft or completed projects' 
      });
    }
    
    await Project.findByIdAndDelete(req.params.id);
    
    res.json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      message: 'Failed to delete project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Debug endpoint for pending proposals
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

// Debug endpoint for all users
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email userType').lean();
    console.log('DEBUG - All users:', users);
    res.json(users);
  } catch (error) {
    console.error('Users debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Report a project
router.post('/:id/report', auth, async (req, res) => {
  try {
    const { reason, description, reportedBy, reporterRole } = req.body;
    const projectId = req.params.id;

    // Validate input
    if (!reason) {
      return res.status(400).json({ message: 'Report reason is required' });
    }

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if already reported
    if (project.isReported) {
      return res.status(400).json({ message: 'Project has already been reported' });
    }

    // Update project with report information
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        isReported: true,
        reportReason: reason,
        reportDescription: description,
        reportedBy: reportedBy || req.user._id,
        reporterRole: reporterRole || req.user.role,
        reportedAt: new Date()
      },
      { new: true }
    );

    // You could also create a separate Report model if you want to track multiple reports
    // or create a notification for admins here

    res.json({ 
      message: 'Project reported successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Error reporting project:', error);
    res.status(500).json({ message: 'Failed to report project' });
  }
});

export default router;
