import mongoose from 'mongoose';
import { PROJECT_STATUS, MILESTONE_STATUS } from '../../shared/constants.js';

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(MILESTONE_STATUS),
    default: MILESTONE_STATUS.PENDING
  },
  completedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  }
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: Object.values(PROJECT_STATUS),
    default: PROJECT_STATUS.OPEN
  },
  budget: {
    total: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  timeline: {
    startDate: {
      type: Date
    },
    endDate: {
      type: Date,
      required: true
    },
    estimatedHours: {
      type: Number,
      min: 0
    }
  },
  skills: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  milestones: [milestoneSchema],
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  feedback: {
    clientRating: {
      type: Number,
      min: 1,
      max: 5
    },
    freelancerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    clientComment: String,
    freelancerComment: String
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  },
  applicants: [{
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    proposedBudget: Number,
    proposedTimeline: Number,
    coverLetter: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: {
      type: Date
    }
  }],
  completion: {
    clientMarkedComplete: {
      type: Boolean,
      default: false
    },
    freelancerMarkedComplete: {
      type: Boolean,
      default: false
    },
    clientCompletedAt: {
      type: Date
    },
    freelancerCompletedAt: {
      type: Date
    },
    finalCompletedAt: {
      type: Date
    }
  },
  // Report fields
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: {
    type: String
  },
  reportDescription: {
    type: String
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reporterRole: {
    type: String,
    enum: ['client', 'freelancer']
  },
  reportedAt: {
    type: Date
  },
  reportResolution: {
    action: {
      type: String,
      enum: ['resolved', 'dismissed']
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate project health score
projectSchema.methods.calculateHealthScore = function() {
  let score = 100;
  const now = new Date();
  
  // Deduct points for overdue milestones
  const overdueMilestones = this.milestones.filter(milestone => 
    milestone.dueDate < now && 
    milestone.status !== MILESTONE_STATUS.COMPLETED && 
    milestone.status !== MILESTONE_STATUS.APPROVED
  );
  score -= overdueMilestones.length * 20;
  
  // Deduct points for project being overdue
  if (this.timeline.endDate < now && this.status !== PROJECT_STATUS.COMPLETED) {
    const daysOverdue = Math.ceil((now - this.timeline.endDate) / (1000 * 60 * 60 * 24));
    score -= Math.min(daysOverdue * 5, 30);
  }
  
  // Deduct points for lack of progress
  const completedMilestones = this.milestones.filter(milestone => 
    milestone.status === MILESTONE_STATUS.COMPLETED || 
    milestone.status === MILESTONE_STATUS.APPROVED
  ).length;
  const totalMilestones = this.milestones.length;
  
  if (totalMilestones > 0) {
    const progressPercentage = (completedMilestones / totalMilestones) * 100;
    const expectedProgress = this.calculateExpectedProgress();
    
    if (progressPercentage < expectedProgress - 20) {
      score -= 15;
    }
  }
  
  this.healthScore = Math.max(0, Math.min(100, score));
  return this.healthScore;
};

// Calculate expected progress based on timeline
projectSchema.methods.calculateExpectedProgress = function() {
  if (!this.timeline.startDate || !this.timeline.endDate) return 0;
  
  const now = new Date();
  const start = new Date(this.timeline.startDate);
  const end = new Date(this.timeline.endDate);
  
  if (now <= start) return 0;
  if (now >= end) return 100;
  
  const totalDuration = end - start;
  const elapsed = now - start;
  
  return (elapsed / totalDuration) * 100;
};

// Get project progress percentage
projectSchema.methods.getProgressPercentage = function() {
  if (this.milestones.length === 0) return 0;
  
  const completedMilestones = this.milestones.filter(milestone => 
    milestone.status === MILESTONE_STATUS.COMPLETED || 
    milestone.status === MILESTONE_STATUS.APPROVED
  ).length;
  
  return (completedMilestones / this.milestones.length) * 100;
};

const Project = mongoose.model('Project', projectSchema);

export default Project;
