import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { USER_ROLES } from '../../shared/constants.js';

class RecommendationService {
  // Get recommended freelancers based on skills and other factors
  async getRecommendedFreelancers(requiredSkills = [], options = {}) {
    try {
      const {
        budgetRange = { min: 0, max: Infinity },
        availability = null,
        minRating = 0,
        maxResults = 20,
        excludeUserIds = []
      } = options;
      
      // Get all freelancer profiles
      const freelancerProfiles = await Profile.find({
        userId: { $nin: excludeUserIds }
      })
      .populate({
        path: 'userId',
        match: { 
          role: USER_ROLES.FREELANCER,
          isActive: true
        }
      })
      .exec();
      
      // Filter out null userId (non-freelancers)
      const validProfiles = freelancerProfiles.filter(profile => profile.userId);
      
      // Calculate scores for each freelancer
      const scoredFreelancers = validProfiles.map(profile => {
        const score = this.calculateFreelancerScore(profile, requiredSkills, options);
        return {
          profile,
          score,
          user: profile.userId
        };
      })
      .filter(item => {
        // Apply filters
        if (availability && item.profile.availability !== availability) return false;
        if (item.profile.rating.average < minRating) return false;
        if (item.profile.hourlyRate < budgetRange.min || item.profile.hourlyRate > budgetRange.max) return false;
        return true;
      })
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, maxResults);
      
      return {
        success: true,
        recommendations: scoredFreelancers.map(item => ({
          user: item.user,
          profile: item.profile,
          score: item.score,
          matchReasons: this.getMatchReasons(item.profile, requiredSkills, options)
        }))
      };
    } catch (error) {
      console.error('Get recommended freelancers error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Calculate score for a freelancer
  calculateFreelancerScore(profile, requiredSkills, options) {
    let score = 0;
    
    // Skills match (40% of total score)
    const skillMatchPercentage = profile.calculateSkillMatch(requiredSkills);
    score += (skillMatchPercentage / 100) * 40;
    
    // Rating (25% of total score)
    const ratingScore = (profile.rating.average / 5) * 25;
    score += ratingScore;
    
    // Experience (15% of total score)
    const experienceScore = Math.min(profile.experience / 5, 1) * 15; // Cap at 5 years
    score += experienceScore;
    
    // Completed projects (10% of total score)
    const projectScore = Math.min(profile.completedProjects / 20, 1) * 10; // Cap at 20 projects
    score += projectScore;
    
    // Availability bonus (5% of total score)
    if (profile.availability === 'available') {
      score += 5;
    } else if (profile.availability === 'busy') {
      score += 2;
    }
    
    // Recent activity bonus (5% of total score)
    const daysSinceUpdate = (Date.now() - profile.updatedAt) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate <= 7) {
      score += 5;
    } else if (daysSinceUpdate <= 30) {
      score += 3;
    } else if (daysSinceUpdate <= 90) {
      score += 1;
    }
    
    return Math.round(score * 100) / 100; // Round to 2 decimal places
  }
  
  // Get match reasons for display
  getMatchReasons(profile, requiredSkills, options) {
    const reasons = [];
    
    // Skills match
    const skillMatchPercentage = profile.calculateSkillMatch(requiredSkills);
    if (skillMatchPercentage > 80) {
      reasons.push(`Excellent skill match (${Math.round(skillMatchPercentage)}%)`);
    } else if (skillMatchPercentage > 50) {
      reasons.push(`Good skill match (${Math.round(skillMatchPercentage)}%)`);
    } else if (skillMatchPercentage > 20) {
      reasons.push(`Some skill match (${Math.round(skillMatchPercentage)}%)`);
    }
    
    // High rating
    if (profile.rating.average >= 4.5) {
      reasons.push(`Excellent rating (${profile.rating.average}/5)`);
    } else if (profile.rating.average >= 4.0) {
      reasons.push(`High rating (${profile.rating.average}/5)`);
    }
    
    // Experience
    if (profile.experience >= 5) {
      reasons.push(`Highly experienced (${profile.experience}+ years)`);
    } else if (profile.experience >= 2) {
      reasons.push(`Experienced (${profile.experience} years)`);
    }
    
    // Completed projects
    if (profile.completedProjects >= 20) {
      reasons.push(`Many completed projects (${profile.completedProjects})`);
    } else if (profile.completedProjects >= 10) {
      reasons.push(`Good track record (${profile.completedProjects} projects)`);
    }
    
    // Availability
    if (profile.availability === 'available') {
      reasons.push('Currently available');
    }
    
    // Recent activity
    const daysSinceUpdate = (Date.now() - profile.updatedAt) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate <= 7) {
      reasons.push('Recently active');
    }
    
    return reasons;
  }
  
  // Get recommended projects for a freelancer
  async getRecommendedProjects(freelancerId, options = {}) {
    try {
      const { maxResults = 20 } = options;
      
      // Get freelancer profile
      const freelancerProfile = await Profile.findOne({ userId: freelancerId });
      
      if (!freelancerProfile) {
        return {
          success: false,
          message: 'Freelancer profile not found'
        };
      }
      
      // Import Project model dynamically to avoid circular dependency
      const { default: Project } = await import('../models/Project.js');
      
      // Get open projects
      const openProjects = await Project.find({
        status: 'open',
        freelancerId: { $exists: false } // Not yet assigned
      })
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100); // Get more to filter and score
      
      // Score projects for this freelancer
      const scoredProjects = openProjects.map(project => {
        const score = this.calculateProjectScore(freelancerProfile, project);
        return {
          project,
          score,
          matchReasons: this.getProjectMatchReasons(freelancerProfile, project)
        };
      })
      .filter(item => item.score > 20) // Only include projects with decent match
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
      
      return {
        success: true,
        recommendations: scoredProjects
      };
    } catch (error) {
      console.error('Get recommended projects error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Calculate project score for a freelancer
  calculateProjectScore(freelancerProfile, project) {
    let score = 0;
    
    // Skills match (50% of total score)
    const skillMatchPercentage = freelancerProfile.calculateSkillMatch(project.skills);
    score += (skillMatchPercentage / 100) * 50;
    
    // Budget match (30% of total score)
    if (freelancerProfile.hourlyRate && project.budget.total) {
      const estimatedHours = project.timeline.estimatedHours || 40; // Default 40 hours
      const projectHourlyRate = project.budget.total / estimatedHours;
      
      const rateDifference = Math.abs(projectHourlyRate - freelancerProfile.hourlyRate);
      const rateMatchScore = Math.max(0, 1 - (rateDifference / freelancerProfile.hourlyRate));
      score += rateMatchScore * 30;
    }
    
    // Project type preference (10% of total score)
    if (freelancerProfile.preferences?.projectTypes?.includes(project.category)) {
      score += 10;
    }
    
    // Timeline feasibility (10% of total score)
    const projectDuration = (new Date(project.timeline.endDate) - new Date()) / (1000 * 60 * 60 * 24);
    if (projectDuration > 7 && projectDuration < 180) { // Between 1 week and 6 months
      score += 10;
    } else if (projectDuration >= 180) {
      score += 5;
    }
    
    return Math.round(score * 100) / 100;
  }
  
  // Get project match reasons
  getProjectMatchReasons(freelancerProfile, project) {
    const reasons = [];
    
    // Skills match
    const skillMatchPercentage = freelancerProfile.calculateSkillMatch(project.skills);
    if (skillMatchPercentage > 80) {
      reasons.push(`Excellent skill match (${Math.round(skillMatchPercentage)}%)`);
    } else if (skillMatchPercentage > 50) {
      reasons.push(`Good skill match (${Math.round(skillMatchPercentage)}%)`);
    }
    
    // Budget match
    if (freelancerProfile.hourlyRate && project.budget.total) {
      const estimatedHours = project.timeline.estimatedHours || 40;
      const projectHourlyRate = project.budget.total / estimatedHours;
      
      if (Math.abs(projectHourlyRate - freelancerProfile.hourlyRate) / freelancerProfile.hourlyRate < 0.2) {
        reasons.push('Budget matches your rate');
      }
    }
    
    // Project type preference
    if (freelancerProfile.preferences?.projectTypes?.includes(project.category)) {
      reasons.push('Matches your preferred project type');
    }
    
    // Timeline
    const projectDuration = (new Date(project.timeline.endDate) - new Date()) / (1000 * 60 * 60 * 24);
    if (projectDuration > 7 && projectDuration < 30) {
      reasons.push('Short-term project');
    } else if (projectDuration >= 30 && projectDuration < 90) {
      reasons.push('Medium-term project');
    } else if (projectDuration >= 90) {
      reasons.push('Long-term project');
    }
    
    return reasons;
  }
  
  // Get similar freelancers (for networking/collaboration suggestions)
  async getSimilarFreelancers(freelancerId, options = {}) {
    try {
      const { maxResults = 10 } = options;
      
      const freelancerProfile = await Profile.findOne({ userId: freelancerId });
      
      if (!freelancerProfile) {
        return {
          success: false,
          message: 'Freelancer profile not found'
        };
      }
      
      return this.getRecommendedFreelancers(freelancerProfile.skills, {
        ...options,
        maxResults,
        excludeUserIds: [freelancerId]
      });
    } catch (error) {
      console.error('Get similar freelancers error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;
