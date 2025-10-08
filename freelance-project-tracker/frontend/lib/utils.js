import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export const formatRelativeTime = (date) => {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now - targetDate) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(date)
}

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const storage = {
  get: (key) => {
    if (typeof window === 'undefined') return null
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  
  set: (key, value) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Handle storage errors silently
    }
  },
  
  remove: (key) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch {
      // Handle storage errors silently
    }
  }
}

// Skill matching utilities
export const calculateSkillMatch = (projectSkills = [], freelancerSkills = []) => {
  if (!projectSkills.length || !freelancerSkills.length) return 0
  
  // Normalize skills for comparison (lowercase, trim)
  const normalizedProjectSkills = projectSkills.map(skill => skill.toLowerCase().trim())
  const normalizedFreelancerSkills = freelancerSkills.map(skill => skill.toLowerCase().trim())
  
  // Find exact matches
  const exactMatches = normalizedProjectSkills.filter(skill => 
    normalizedFreelancerSkills.includes(skill)
  ).length
  
  // Find partial matches (for compound skills like "React.js" vs "React")
  let partialMatches = 0
  normalizedProjectSkills.forEach(projectSkill => {
    if (!normalizedFreelancerSkills.includes(projectSkill)) {
      const hasPartialMatch = normalizedFreelancerSkills.some(freelancerSkill => {
        return projectSkill.includes(freelancerSkill) || 
               freelancerSkill.includes(projectSkill) ||
               getSkillSimilarity(projectSkill, freelancerSkill) > 0.7
      })
      if (hasPartialMatch) partialMatches++
    }
  })
  
  // Calculate match percentage
  const totalMatches = exactMatches + (partialMatches * 0.5) // Partial matches worth 50%
  const matchPercentage = Math.min(100, (totalMatches / normalizedProjectSkills.length) * 100)
  
  return Math.round(matchPercentage)
}

// Calculate similarity between two skills using simple string matching
const getSkillSimilarity = (skill1, skill2) => {
  const s1 = skill1.toLowerCase()
  const s2 = skill2.toLowerCase()
  
  // Check for common abbreviations and variations
  const skillVariations = {
    'javascript': ['js', 'javascript', 'es6', 'es2015', 'ecmascript'],
    'typescript': ['ts', 'typescript'],
    'react': ['react', 'react.js', 'reactjs'],
    'vue': ['vue', 'vue.js', 'vuejs'],
    'angular': ['angular', 'angular.js', 'angularjs', 'ng'],
    'node': ['node', 'node.js', 'nodejs'],
    'express': ['express', 'express.js', 'expressjs'],
    'mongodb': ['mongo', 'mongodb'],
    'postgresql': ['postgres', 'postgresql', 'psql'],
    'mysql': ['mysql', 'my sql'],
    'css3': ['css', 'css3'],
    'html5': ['html', 'html5']
  }
  
  // Check if skills are variations of each other
  for (const [base, variations] of Object.entries(skillVariations)) {
    if (variations.includes(s1) && variations.includes(s2)) {
      return 1.0
    }
  }
  
  // Simple string similarity
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1
  
  if (longer.includes(shorter)) return 0.8
  
  return 0
}

// Get skill match details for display
export const getSkillMatchDetails = (projectSkills = [], freelancerSkills = []) => {
  const normalizedProjectSkills = projectSkills.map(skill => skill.toLowerCase().trim())
  const normalizedFreelancerSkills = freelancerSkills.map(skill => skill.toLowerCase().trim())
  
  const matched = []
  const missing = []
  
  projectSkills.forEach(projectSkill => {
    const normalizedProject = projectSkill.toLowerCase().trim()
    const hasExactMatch = normalizedFreelancerSkills.includes(normalizedProject)
    
    if (hasExactMatch) {
      matched.push(projectSkill)
    } else {
      // Check for partial match
      const hasPartialMatch = normalizedFreelancerSkills.some(freelancerSkill => {
        return getSkillSimilarity(normalizedProject, freelancerSkill) > 0.7
      })
      
      if (hasPartialMatch) {
        matched.push(projectSkill)
      } else {
        missing.push(projectSkill)
      }
    }
  })
  
  return {
    matched,
    missing,
    matchPercentage: calculateSkillMatch(projectSkills, freelancerSkills)
  }
}

// Get recommended projects for a freelancer based on skill matching
export const getRecommendedProjects = (projects = [], freelancerSkills = [], minMatchPercentage = 30) => {
  return projects
    .map(project => ({
      ...project,
      skillMatch: calculateSkillMatch(project.skills || [], freelancerSkills),
      skillMatchDetails: getSkillMatchDetails(project.skills || [], freelancerSkills)
    }))
    .filter(project => project.skillMatch >= minMatchPercentage)
    .sort((a, b) => b.skillMatch - a.skillMatch)
}
