'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../lib/api'

export default function FreelancerDashboard({ user }) {
  const [bidProjects, setBidProjects] = useState([])
  const [assignedProjects, setAssignedProjects] = useState([])
  const [availableProjects, setAvailableProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('bids')

  useEffect(() => {
    fetchFreelancerData()
  }, [])

  const fetchFreelancerData = async () => {
    try {
      setLoading(true)
      
      // Fetch all projects
      const allProjects = await api.getProjects()
      const projectsArray = Array.isArray(allProjects) ? allProjects : []

      // Categorize projects
      const bidProjectsList = []
      const assignedProjectsList = []
      const availableProjectsList = []

      projectsArray.forEach(project => {
        // Check if user has bid on this project
        const userBid = project.applicants?.find(
          app => app.freelancerId._id === user.id || app.freelancerId === user.id
        )

        if (project.freelancerId === user.id) {
          // Projects assigned to this freelancer
          assignedProjectsList.push(project)
        } else if (userBid) {
          // Projects user has bid on
          bidProjectsList.push({ ...project, userBid })
        } else if (project.status === 'open' && !project.freelancerId) {
          // Available projects to bid on
          availableProjectsList.push(project)
        }
      })

      setBidProjects(bidProjectsList)
      setAssignedProjects(assignedProjectsList)
      setAvailableProjects(availableProjectsList)
    } catch (error) {
      console.error('Failed to fetch freelancer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBidStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100'
      case 'in_progress': return 'text-orange-600 bg-orange-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Bids</p>
              <p className="text-2xl font-bold text-gray-900">{bidProjects.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{assignedProjects.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">🔍</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available</p>
              <p className="text-2xl font-bold text-gray-900">{availableProjects.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {bidProjects.length > 0 
                  ? Math.round((bidProjects.filter(p => p.userBid.status === 'accepted').length / bidProjects.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'bids', label: 'My Bids', count: bidProjects.length },
              { id: 'assigned', label: 'Assigned Projects', count: assignedProjects.length },
              { id: 'available', label: 'Available Projects', count: availableProjects.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* My Bids Tab */}
          {activeTab === 'bids' && (
            <div className="space-y-4">
              {bidProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">You haven't submitted any bids yet.</p>
              ) : (
                bidProjects.map((project) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{project.title}</h3>
                        <p className="text-gray-600">{project.description.substring(0, 150)}...</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBidStatusColor(project.userBid.status)}`}>
                        {project.userBid.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Your Bid:</span>
                        <p>${project.userBid.proposedBudget}</p>
                      </div>
                      <div>
                        <span className="font-medium">Timeline:</span>
                        <p>{project.userBid.proposedTimeline} days</p>
                      </div>
                      <div>
                        <span className="font-medium">Project Budget:</span>
                        <p>${project.budget?.total}</p>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>
                        <p>{new Date(project.userBid.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {project.userBid.coverLetter && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <span className="font-medium text-sm text-gray-700">Your Proposal:</span>
                        <p className="text-sm text-gray-600 mt-1">{project.userBid.coverLetter}</p>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Assigned Projects Tab */}
          {activeTab === 'assigned' && (
            <div className="space-y-4">
              {assignedProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No projects assigned to you yet.</p>
              ) : (
                assignedProjects.map((project) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{project.title}</h3>
                        <p className="text-gray-600">{project.description.substring(0, 150)}...</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProjectStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Budget:</span>
                        <p>${project.budget?.agreed || project.budget?.total}</p>
                      </div>
                      <div>
                        <span className="font-medium">Deadline:</span>
                        <p>{new Date(project.timeline?.endDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Client:</span>
                        <p>{project.clientId?.name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Started:</span>
                        <p>{project.timeline?.startDate ? new Date(project.timeline.startDate).toLocaleDateString() : 'Not started'}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Available Projects Tab */}
          {activeTab === 'available' && (
            <div className="space-y-4">
              {availableProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No projects available for bidding.</p>
              ) : (
                availableProjects.map((project) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{project.title}</h3>
                        <p className="text-gray-600">{project.description.substring(0, 150)}...</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProjectStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Budget:</span>
                        <p>${project.budget?.total}</p>
                      </div>
                      <div>
                        <span className="font-medium">Deadline:</span>
                        <p>{new Date(project.timeline?.endDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Skills:</span>
                        <p>{project.skills?.slice(0, 2).join(', ')}{project.skills?.length > 2 ? '...' : ''}</p>
                      </div>
                      <div>
                        <span className="font-medium">Bids:</span>
                        <p>{project.applicants?.length || 0} received</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          // This would open the bid modal or navigate to project details
                          console.log('Bid on project:', project._id)
                        }}
                        className="btn btn-primary"
                      >
                        Submit Bid
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
