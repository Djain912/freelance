import express from 'express';
import Joi from 'joi';
import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { USER_ROLES } from '../../shared/constants.js';
import { recommendationService } from '../services/recommendation.js';

const router = express.Router();

// Validation schemas
const updateProfileSchema = Joi.object({
  bio: Joi.string().max(1000).optional(),
  skills: Joi.array().items(Joi.string().trim()).max(20).optional(),
  experience: Joi.number().min(0).max(50).optional(),
  hourlyRate: Joi.number().min(0).max(10000).optional(),
  portfolio: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      description: Joi.string().optional(),
      url: Joi.string().uri().optional(),
      imageUrl: Joi.string().uri().optional()
    })
  ).max(10).optional(),
  availability: Joi.string().valid('available', 'busy', 'unavailable').optional(),
  location: Joi.object({
    country: Joi.string().optional(),
    city: Joi.string().optional(),
    timezone: Joi.string().optional()
  }).optional(),
  languages: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      proficiency: Joi.string().valid('basic', 'conversational', 'fluent', 'native').required()
    })
  ).max(10).optional(),
  socialLinks: Joi.object({
    linkedin: Joi.string().uri().optional(),
    github: Joi.string().uri().optional(),
    website: Joi.string().uri().optional(),
    twitter: Joi.string().uri().optional()
  }).optional(),
  preferences: Joi.object({
    projectTypes: Joi.array().items(Joi.string()).optional(),
    budgetRange: Joi.object({
      min: Joi.number().min(0).optional(),
      max: Joi.number().min(0).optional()
    }).optional(),
    communicationStyle: Joi.string().optional()
  }).optional()
});

// Get current user's profile
router.get('/me', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.id });
    
    // Create profile if it doesn't exist
    if (!profile) {
      profile = new Profile({
        userId: req.user.id,
        bio: '',
        skills: [],
        experience: 0
      });
      await profile.save();
    }
    
    // Populate user info
    await profile.populate('userId', 'name email role createdAt');
    
    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update current user's profile
router.post('/me', auth, async (req, res) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    
    let profile = await Profile.findOne({ userId: req.user.id });
    
    // Create profile if it doesn't exist
    if (!profile) {
      profile = new Profile({
        userId: req.user.id,
        ...value
      });
    } else {
      // Update existing profile
      Object.assign(profile, value);
    }
    
    await profile.save();
    await profile.populate('userId', 'name email role createdAt');
    
    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get profile by user ID
router.get('/:userId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId })
      .populate('userId', 'name email role createdAt');
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Return public profile information only
    const publicProfile = {
      ...profile.toObject(),
      userId: {
        _id: profile.userId._id,
        name: profile.userId.name,
        role: profile.userId.role,
        createdAt: profile.userId.createdAt
      }
    };
    
    // Remove sensitive information for non-owners
    if (req.user.id !== profile.userId._id.toString() && req.user.role !== USER_ROLES.ADMIN) {
      delete publicProfile.verification;
      delete publicProfile.preferences;
    }
    
    res.json({ profile: publicProfile });
  } catch (error) {
    console.error('Get profile by ID error:', error);
    res.status(500).json({
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get recommended freelancers
router.get('/recommend', auth, async (req, res) => {
  try {
    const { skills, budget_min, budget_max, availability, min_rating, limit = 20 } = req.query;
    
    // Parse skills from comma-separated string
    const requiredSkills = skills ? skills.split(',').map(skill => skill.trim()) : [];
    
    const options = {
      budgetRange: {
        min: budget_min ? parseFloat(budget_min) : 0,
        max: budget_max ? parseFloat(budget_max) : Infinity
      },
      availability: availability || null,
      minRating: min_rating ? parseFloat(min_rating) : 0,
      maxResults: parseInt(limit),
      excludeUserIds: [req.user.id] // Don't recommend the user to themselves
    };
    
    const result = await recommendationService.getRecommendedFreelancers(requiredSkills, options);
    
    if (!result.success) {
      return res.status(500).json({
        message: result.error || 'Failed to get recommendations'
      });
    }
    
    res.json({
      recommendations: result.recommendations,
      criteria: {
        skills: requiredSkills,
        budgetRange: options.budgetRange,
        availability: options.availability,
        minRating: options.minRating
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      message: 'Failed to get recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get recommended projects (for freelancers)
router.get('/recommend/projects', auth, async (req, res) => {
  try {
    if (req.user.role !== USER_ROLES.FREELANCER) {
      return res.status(403).json({
        message: 'Only freelancers can get project recommendations'
      });
    }
    
    const { limit = 20 } = req.query;
    
    const result = await recommendationService.getRecommendedProjects(req.user.id, {
      maxResults: parseInt(limit)
    });
    
    if (!result.success) {
      return res.status(500).json({
        message: result.error || 'Failed to get project recommendations'
      });
    }
    
    res.json({
      recommendations: result.recommendations
    });
  } catch (error) {
    console.error('Get project recommendations error:', error);
    res.status(500).json({
      message: 'Failed to get project recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get similar freelancers
router.get('/similar/:freelancerId', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await recommendationService.getSimilarFreelancers(req.params.freelancerId, {
      maxResults: parseInt(limit)
    });
    
    if (!result.success) {
      return res.status(500).json({
        message: result.error || 'Failed to get similar freelancers'
      });
    }
    
    res.json({
      recommendations: result.recommendations
    });
  } catch (error) {
    console.error('Get similar freelancers error:', error);
    res.status(500).json({
      message: 'Failed to get similar freelancers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Search profiles
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const { role, skills, location, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ 
        message: 'Search query must be at least 2 characters' 
      });
    }
    
    // Build search criteria
    const searchCriteria = {
      $or: [
        { bio: { $regex: query, $options: 'i' } },
        { skills: { $in: [new RegExp(query, 'i')] } },
        { 'portfolio.title': { $regex: query, $options: 'i' } },
        { 'portfolio.description': { $regex: query, $options: 'i' } }
      ]
    };
    
    // Add role filter if specified
    if (role && Object.values(USER_ROLES).includes(role)) {
      // We need to match this with the populated user data
      // This will be handled in the populate match
    }
    
    // Add skills filter if specified
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      searchCriteria.skills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }
    
    // Add location filter if specified
    if (location) {
      searchCriteria.$or.push(
        { 'location.country': { $regex: location, $options: 'i' } },
        { 'location.city': { $regex: location, $options: 'i' } }
      );
    }
    
    const profiles = await Profile.find(searchCriteria)
      .populate({
        path: 'userId',
        select: 'name email role createdAt isActive',
        match: role ? { role, isActive: true } : { isActive: true }
      })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    // Filter out profiles where user didn't match the populate criteria
    const validProfiles = profiles.filter(profile => profile.userId);
    
    // Remove sensitive information
    const publicProfiles = validProfiles.map(profile => {
      const publicProfile = profile.toObject();
      delete publicProfile.verification;
      delete publicProfile.preferences;
      
      return {
        ...publicProfile,
        userId: {
          _id: profile.userId._id,
          name: profile.userId.name,
          role: profile.userId.role,
          createdAt: profile.userId.createdAt
        }
      };
    });
    
    const total = await Profile.countDocuments(searchCriteria);
    
    res.json({
      profiles: publicProfiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      query,
      filters: { role, skills, location }
    });
  } catch (error) {
    console.error('Search profiles error:', error);
    res.status(500).json({
      message: 'Failed to search profiles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get profile stats
router.get('/stats/:userId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Get additional stats (you might want to implement these in separate models/services)
    const stats = {
      profileCompletion: calculateProfileCompletion(profile),
      rating: profile.rating,
      completedProjects: profile.completedProjects,
      experience: profile.experience,
      skills: profile.skills.length,
      portfolioItems: profile.portfolio.length,
      availability: profile.availability,
      lastActive: profile.updatedAt
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get profile stats error:', error);
    res.status(500).json({
      message: 'Failed to get profile stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(profile) {
  let completedFields = 0;
  const totalFields = 10; // Adjust based on important fields
  
  if (profile.bio && profile.bio.length > 20) completedFields++;
  if (profile.skills && profile.skills.length > 0) completedFields++;
  if (profile.experience !== undefined && profile.experience > 0) completedFields++;
  if (profile.hourlyRate && profile.hourlyRate > 0) completedFields++;
  if (profile.portfolio && profile.portfolio.length > 0) completedFields++;
  if (profile.location && (profile.location.country || profile.location.city)) completedFields++;
  if (profile.languages && profile.languages.length > 0) completedFields++;
  if (profile.socialLinks && Object.keys(profile.socialLinks).some(key => profile.socialLinks[key])) completedFields++;
  if (profile.preferences && profile.preferences.projectTypes && profile.preferences.projectTypes.length > 0) completedFields++;
  if (profile.availability) completedFields++;
  
  return Math.round((completedFields / totalFields) * 100);
}

export default router;
