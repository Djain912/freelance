'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Settings, User } from 'lucide-react'
import { api } from '../lib/api'
import SkillSelector from './SkillSelector'

export default function Profile({ user }) {
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    bio: '',
    skills: [],
    hourlyRate: '',
    availability: 'available',
    location: {
      country: '',
      city: '',
      timezone: ''
    },
    socialLinks: {
      website: '',
      github: '',
      linkedin: '',
      twitter: ''
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const profileData = await api.getProfile()
      console.log('Fetched profile data:', profileData) // Debug log
      setProfile(profileData)
      
      // Helper function to extract username from URL
      const extractUsername = (url, platform) => {
        if (!url) return ''
        if (!url.startsWith('http')) return url // Already a username
        
        switch (platform) {
          case 'github':
            return url.replace(/https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '')
          case 'linkedin':
            return url.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '')
          default:
            return url
        }
      }
      
      setFormData({
        bio: profileData.bio || '',
        skills: profileData.skills || [],
        hourlyRate: profileData.hourlyRate || '',
        availability: profileData.availability || 'available',
        location: {
          country: profileData.location?.country || '',
          city: profileData.location?.city || '',
          timezone: profileData.location?.timezone || ''
        },
        socialLinks: {
          website: profileData.socialLinks?.website || '',
          github: extractUsername(profileData.socialLinks?.github, 'github'),
          linkedin: extractUsername(profileData.socialLinks?.linkedin, 'linkedin'),
          twitter: extractUsername(profileData.socialLinks?.twitter, 'twitter')
        }
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      console.log('Saving profile data:', formData) // Debug log
      
      // Prepare the data with proper URL formatting for social links
      const profileData = {
        ...formData,
        // Convert hourlyRate to number if it exists
        hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
        // Ensure social links are proper URLs
        socialLinks: {
          website: formData.socialLinks.website || undefined,
          github: formData.socialLinks.github ? 
            (formData.socialLinks.github.startsWith('http') ? 
              formData.socialLinks.github : 
              `https://github.com/${formData.socialLinks.github}`) : 
            undefined,
          linkedin: formData.socialLinks.linkedin ? 
            (formData.socialLinks.linkedin.startsWith('http') ? 
              formData.socialLinks.linkedin : 
              `https://linkedin.com/in/${formData.socialLinks.linkedin}`) : 
            undefined,
          twitter: formData.socialLinks.twitter ? 
            (formData.socialLinks.twitter.startsWith('http') ? 
              formData.socialLinks.twitter : 
              `https://twitter.com/${formData.socialLinks.twitter}`) : 
            undefined
        }
      }
      
      console.log('Prepared profile data for API:', profileData) // Debug log
      
      // Remove undefined values from socialLinks
      Object.keys(profileData.socialLinks).forEach(key => {
        if (profileData.socialLinks[key] === undefined) {
          delete profileData.socialLinks[key]
        }
      })
      
      // Remove empty location fields
      if (profileData.location) {
        Object.keys(profileData.location).forEach(key => {
          if (!profileData.location[key]) {
            delete profileData.location[key]
          }
        })
        if (Object.keys(profileData.location).length === 0) {
          delete profileData.location
        }
      }
      
      // The backend handles both create and update with the same POST endpoint
      const updatedProfile = await api.updateProfile(profileData)
      console.log('Updated profile response:', updatedProfile) // Debug log
      
      setProfile(updatedProfile)
      setIsEditing(false)
      
      // Show success message (optional)
      console.log('Profile saved successfully!')
    } catch (error) {
      console.error('Failed to save profile:', error)
      // You might want to show an error message to the user here
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Handle nested objects (location.*, socialLinks.*)
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }



  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available': return 'badge-success'
      case 'busy': return 'badge-warning'
      case 'unavailable': return 'badge-danger'
      default: return 'badge-secondary'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Profile Management</h2>
          <p className="text-gray-600 mt-1">Manage your professional profile and showcase your skills</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(!isEditing)}
          className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'} shadow-lg`}
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Basic Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="text-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className={`absolute -bottom-1 right-1/2 transform translate-x-1/2 w-6 h-6 rounded-full border-4 border-white shadow-lg ${
                user.role === 'client' ? 'bg-blue-500' : 'bg-emerald-500'
              }`}></div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
            <p className="text-gray-500 text-sm mb-4">{user.email}</p>
            
            <div className="space-y-3">
              <span className={`badge ${user.role === 'client' ? 'badge-primary' : 'badge-success'} text-sm px-4 py-2`}>
                {user.role === 'client' ? '👤 Client' : '💼 Freelancer'}
              </span>
              
              {profile && (
                <div className="pt-4 border-t border-gray-200">
                  <div className={`badge ${getAvailabilityColor(profile.availability)} mb-3`}>
                    {profile.availability}
                  </div>
                  <div className="text-xs text-gray-500">
                    Member since {new Date(user.createdAt).getFullYear()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 card"
        >
          <div className="card-header">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Profile Details
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isEditing ? 'Update your profile information' : 'Your professional information'}
            </p>
          </div>

          {isEditing ? (
            <div className="space-y-8">
              {/* Bio Section */}
              <div className="form-section">
                <h4 className="form-section-title">About You</h4>
                <div className="form-group">
                  <label className="label">Professional Bio</label>
                  <textarea
                    name="bio"
                    rows={4}
                    className="input"
                    placeholder="Tell us about your experience, skills, and what makes you unique..."
                    value={formData.bio}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Skills Section */}
              <div className="form-section">
                <h4 className="form-section-title">Skills & Expertise</h4>
                <div className="form-group">
                  <label className="label">Skills</label>
                  <SkillSelector
                    selectedSkills={formData.skills}
                    onSkillsChange={(skills) => setFormData(prev => ({ ...prev, skills }))}
                    placeholder="Select your skills and expertise..."
                    maxSkills={25}
                  />
                </div>
              </div>

              {/* Location & Rate Section */}
              <div className="form-section">
                <h4 className="form-section-title">Location & Rates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="label">City</label>
                    <input
                      type="text"
                      name="location.city"
                      className="input"
                      placeholder="e.g., New York"
                      value={formData.location.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Country</label>
                    <input
                      type="text"
                      name="location.country"
                      className="input"
                      placeholder="e.g., United States"
                      value={formData.location.country}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Timezone</label>
                    <input
                      type="text"
                      name="location.timezone"
                      className="input"
                      placeholder="e.g., EST, PST, UTC+5"
                      value={formData.location.timezone}
                      onChange={handleInputChange}
                    />
                  </div>
                  {user.role === 'freelancer' && (
                    <div className="form-group">
                      <label className="label">Hourly Rate (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          name="hourlyRate"
                          className="input pl-8"
                          placeholder="50"
                          value={formData.hourlyRate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Availability Section */}
              <div className="form-section">
                <h4 className="form-section-title">Availability</h4>
                <div className="form-group">
                  <label className="label">Current Status</label>
                  <select
                    name="availability"
                    className="input"
                    value={formData.availability}
                    onChange={handleInputChange}
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="partially-available">Partially Available</option>
                  </select>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="form-section">
                <h4 className="form-section-title">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="label">Website/Portfolio</label>
                    <input
                      type="url"
                      name="socialLinks.website"
                      className="input"
                      placeholder="https://yourportfolio.com"
                      value={formData.socialLinks.website}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">GitHub</label>
                    <input
                      type="text"
                      name="socialLinks.github"
                      className="input"
                      placeholder="username"
                      value={formData.socialLinks.github}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">LinkedIn</label>
                    <input
                      type="text"
                      name="socialLinks.linkedin"
                      className="input"
                      placeholder="username"
                      value={formData.socialLinks.linkedin}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Profile'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {!profile ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-2xl">👤</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Profile</h3>
                  <p className="text-gray-500 mb-4">
                    Add your bio, skills, and other details to get started.
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary"
                  >
                    Create Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Bio */}
                  <div>
                    <label className="label">Bio</label>
                    <textarea
                      rows={4}
                      className="input bg-gray-50 cursor-not-allowed"
                      value={profile.bio || 'No bio added yet'}
                      disabled
                      readOnly
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="label">Skills</label>
                    <div className="min-h-[42px] p-3 border border-gray-300 rounded-lg bg-gray-50 flex flex-wrap gap-2 items-center">
                      {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill) => (
                          <span key={skill} className="badge badge-primary">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No skills added yet</span>
                      )}
                    </div>
                  </div>

                  {/* Location & Rate */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">City</label>
                      <input
                        type="text"
                        className="input bg-gray-50 cursor-not-allowed"
                        value={profile.location?.city || 'Not specified'}
                        disabled
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="label">Country</label>
                      <input
                        type="text"
                        className="input bg-gray-50 cursor-not-allowed"
                        value={profile.location?.country || 'Not specified'}
                        disabled
                        readOnly
                      />
                    </div>
                    {user.role === 'freelancer' && (
                      <div>
                        <label className="label">Hourly Rate (₹)</label>
                        <input
                          type="text"
                          className="input bg-gray-50 cursor-not-allowed"
                          value={profile.hourlyRate ? `₹${profile.hourlyRate}` : 'Not specified'}
                          disabled
                          readOnly
                        />
                      </div>
                    )}
                    <div>
                      <label className="label">Timezone</label>
                      <input
                        type="text"
                        className="input bg-gray-50 cursor-not-allowed"
                        value={profile.location?.timezone || 'Not specified'}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="label">Availability</label>
                    <input
                      type="text"
                      className="input bg-gray-50 cursor-not-allowed capitalize"
                      value={profile.availability || 'available'}
                      disabled
                      readOnly
                    />
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Social Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Website</label>
                        <input
                          type="text"
                          className="input bg-gray-50 cursor-not-allowed"
                          value={profile.socialLinks?.website || 'Not specified'}
                          disabled
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="label">GitHub</label>
                        <input
                          type="text"
                          className="input bg-gray-50 cursor-not-allowed"
                          value={profile.socialLinks?.github ? 
                            (profile.socialLinks.github.startsWith('http') ? 
                              profile.socialLinks.github : 
                              `github.com/${profile.socialLinks.github}`) : 
                            'Not specified'}
                          disabled
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="label">LinkedIn</label>
                        <input
                          type="text"
                          className="input bg-gray-50 cursor-not-allowed"
                          value={profile.socialLinks?.linkedin ? 
                            (profile.socialLinks.linkedin.startsWith('http') ? 
                              profile.socialLinks.linkedin : 
                              `linkedin.com/in/${profile.socialLinks.linkedin}`) : 
                            'Not specified'}
                          disabled
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="label">Twitter</label>
                        <input
                          type="text"
                          className="input bg-gray-50 cursor-not-allowed"
                          value={profile.socialLinks?.twitter ? 
                            (profile.socialLinks.twitter.startsWith('http') ? 
                              profile.socialLinks.twitter : 
                              `twitter.com/${profile.socialLinks.twitter}`) : 
                            'Not specified'}
                          disabled
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
