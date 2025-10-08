import mongoose from 'mongoose';
import { USER_ROLES } from '../../shared/constants.js';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number,
    min: 0,
    default: 0
  },
  hourlyRate: {
    type: Number,
    min: 0
  },
  portfolio: [{
    title: String,
    description: String,
    url: String,
    imageUrl: String
  }],
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  completedProjects: {
    type: Number,
    min: 0,
    default: 0
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  },
  location: {
    country: String,
    city: String,
    timezone: String
  },
  languages: [{
    name: String,
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'fluent', 'native']
    }
  }],
  socialLinks: {
    linkedin: String,
    github: String,
    website: String,
    twitter: String
  },
  preferences: {
    projectTypes: [String],
    budgetRange: {
      min: Number,
      max: Number
    },
    communicationStyle: String
  },
  verification: {
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    isIdentityVerified: {
      type: Boolean,
      default: false
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
profileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate skill match percentage
profileSchema.methods.calculateSkillMatch = function(requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 0;
  if (!this.skills || this.skills.length === 0) return 0;
  
  const normalizedUserSkills = this.skills.map(skill => skill.toLowerCase());
  const normalizedRequiredSkills = requiredSkills.map(skill => skill.toLowerCase());
  
  const matchingSkills = normalizedRequiredSkills.filter(skill => 
    normalizedUserSkills.includes(skill)
  );
  
  return (matchingSkills.length / normalizedRequiredSkills.length) * 100;
};

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
