'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Plus, 
  RefreshCw, 
  FolderOpen, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  Users, 
  Search,
  Filter,
  Calendar,
  DollarSign,
  Settings,
  Eye,
  MessageSquare,
  Star,
  Briefcase,
  Target,
  Zap,
  Globe,
  Smartphone,
  Palette,
  PenTool,
  TrendingUp,
  Database,
  Wrench,
  X,
  MapPin,
  User,
  FileText,
  ExternalLink,
  Video
} from 'lucide-react'
import { api } from '../lib/api'
import { calculateSkillMatch, getSkillMatchDetails } from '../lib/utils'
import VideoCallModal from './VideoCallModal'
import PaymentModal from './PaymentModal'
import SkillSelector from './SkillSelector'

export default function ProjectManagement({ user }) {
  const [projects, setProjects] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showBidForm, setShowBidForm] = useState(false)
  const [showBidsModal, setShowBidsModal] = useState(false)
  const [showVideoCallModal, setShowVideoCallModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [selectedFreelancer, setSelectedFreelancer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [bidMessage, setBidMessage] = useState('')
  const [estimatedDays, setEstimatedDays] = useState('7')
  const [submittingBid, setSubmittingBid] = useState(false)
  const [acceptingBid, setAcceptingBid] = useState(false)
  const [rejectingBid, setRejectingBid] = useState(false)
  const [completingProject, setCompletingProject] = useState(false)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    fetchProjects()
    if (user?.role === 'freelancer') {
      fetchUserProfile()
    }
  }, [activeTab, user])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await api.getProjects()
      setProjects(response)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const profile = await api.getProfile()
      setUserProfile(profile)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  const submitBid = async () => {
    if (!bidAmount || !bidMessage.trim() || !estimatedDays) {
      alert('Please fill in all bid details')
      return
    }

    try {
      setSubmittingBid(true)
      const bidData = {
        bidAmount: parseFloat(bidAmount),
        proposal: bidMessage,
        estimatedDays: parseInt(estimatedDays)
      }

      const response = await api.submitBid(selectedProject._id, bidData)
      console.log('Bid submitted:', response)
      
      // Reset form
      setBidAmount('')
      setBidMessage('')
      setEstimatedDays('7')
      setShowBidForm(false)
      setSelectedProject(null)
      
      alert('Bid submitted successfully!')
      
      // Refresh projects to show updated status
      fetchProjects()
    } catch (error) {
      console.error('Failed to submit bid:', error)
      alert('Failed to submit bid. Please try again.')
    } finally {
      setSubmittingBid(false)
    }
  }

  const acceptBid = async (freelancerId) => {
    if (!confirm('Are you sure you want to accept this bid? This will start the project and close bidding for other freelancers.')) {
      return
    }

    try {
      setAcceptingBid(true)
      const response = await api.acceptBid(selectedProject._id, freelancerId)
      console.log('Bid accepted:', response)
      
      // Show success message with more details
      alert(`Bid accepted successfully! 🎉\n\nProject Status: IN PROGRESS\nThe project has started and bidding is now closed for other freelancers.`)
      
      setShowBidsModal(false)
      setSelectedProject(null)
      
      // Refresh projects to show updated status
      fetchProjects()
    } catch (error) {
      console.error('Failed to accept bid:', error)
      alert('Failed to accept bid. Please try again.')
    } finally {
      setAcceptingBid(false)
    }
  }

  const rejectBid = async (freelancerId) => {
    if (!confirm('Are you sure you want to reject this bid? This action cannot be undone.')) {
      return
    }

    try {
      setRejectingBid(true)
      const response = await api.rejectBid(selectedProject._id, freelancerId)
      console.log('Bid rejected:', response)
      
      alert('Bid rejected successfully.')
      
      // Update the selected project to reflect the changes
      setSelectedProject(response.project)
      
      // Refresh projects to show updated status
      fetchProjects()
    } catch (error) {
      console.error('Failed to reject bid:', error)
      alert('Failed to reject bid. Please try again.')
    } finally {
      setRejectingBid(false)
    }
  }

  const markProjectComplete = async (projectToComplete = null) => {
    const targetProject = projectToComplete || selectedProject
    
    if (!targetProject) {
      alert('No project selected. Please try again.')
      return
    }

    const userRole = user?.role
    const alreadyMarked = userRole === 'client' 
      ? targetProject.completion?.clientMarkedComplete 
      : targetProject.completion?.freelancerMarkedComplete
    
    if (alreadyMarked) {
      alert('You have already marked this project as complete.')
      return
    }

    // If client is marking complete, prompt for payment first
    if (userRole === 'client' && targetProject.freelancerId) {
      const bidAmount = targetProject.acceptedBid?.bidAmount || targetProject.budget?.total || 0
      
      const shouldPay = confirm(
        `Before marking this project as complete, would you like to pay the freelancer?\n\n` +
        `Project: ${targetProject.title}\n` +
        `Freelancer: ${targetProject.freelancerId?.name || 'Freelancer'}\n` +
        `Amount: $${bidAmount}\n\n` +
        `Click OK to pay now, or Cancel to mark complete without payment.`
      )

      if (shouldPay) {
        try {
          // Get user's wallet to check balance
          const walletData = await api.getWallet()
          
          if (walletData.balance < bidAmount) {
            const addFunds = confirm(
              `Insufficient balance. You need $${bidAmount} but only have $${walletData.balance}.\n\n` +
              `Would you like to add funds to your wallet first?`
            )
            
            if (addFunds) {
              const amountToAdd = prompt(`Enter amount to add (minimum $${bidAmount - walletData.balance}):`)
              if (amountToAdd && parseFloat(amountToAdd) > 0) {
                await api.addFunds(parseFloat(amountToAdd), `Added funds for project: ${targetProject.title}`)
                alert(`Successfully added $${amountToAdd} to your wallet!`)
              } else {
                alert('Payment cancelled. You can still mark the project complete without payment.')
              }
            } else {
              alert('Payment cancelled. You can still mark the project complete without payment.')
            }
          } else {
            // Process payment
            await api.transferFunds(
              targetProject.freelancerId?._id || targetProject.freelancerId?.id,
              bidAmount,
              targetProject._id,
              `Payment for completed project: ${targetProject.title}`
            )
            
            alert(`✅ Payment of $${bidAmount} sent successfully to ${targetProject.freelancerId?.name || 'Freelancer'}!`)
          }
        } catch (error) {
          console.error('Payment error:', error)
          alert('Payment failed, but you can still mark the project complete.')
        }
      }
    }
    
    const otherPartyMarked = userRole === 'client' 
      ? targetProject.completion?.freelancerMarkedComplete 
      : targetProject.completion?.clientMarkedComplete
    
    const confirmMessage = otherPartyMarked 
      ? `The ${userRole === 'client' ? 'freelancer' : 'client'} has already marked this project as complete. Your confirmation will finalize the project completion. Are you sure?`
      : `Mark this project as complete? The ${userRole === 'client' ? 'freelancer' : 'client'} will also need to confirm before the project is fully completed.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setCompletingProject(true)
      const response = await api.markProjectComplete(targetProject._id)
      console.log('Project marked complete:', response)
      
      if (response.project?.status === 'completed') {
        alert('🎉 Project Completed Successfully!\n\nBoth parties have confirmed completion. The project is now finalized.')
      } else {
        alert(`✅ Completion Confirmed!\n\nWaiting for ${userRole === 'client' ? 'freelancer' : 'client'} confirmation to finalize the project.`)
      }
      
      setSelectedProject(null)
      
      // Refresh projects to show updated status
      fetchProjects()
    } catch (error) {
      console.error('Failed to mark project complete:', error)
      alert('Failed to mark project complete. Please try again.')
    } finally {
      setCompletingProject(false)
    }
  }

  const reportProject = async () => {
    if (!selectedProject) {
      alert('No project selected')
      return
    }

    if (!reportReason.trim()) {
      alert('Please select a reason for reporting')
      return
    }

    try {
      await api.reportProject(selectedProject._id, {
        reason: reportReason,
        description: reportDescription.trim(),
        reportedBy: user.id,
        reporterRole: user.role
      })
      
      alert('Project reported successfully. Our admin team will review it.')
      setShowReportModal(false)
      setReportReason('')
      setReportDescription('')
      setSelectedProject(null)
      fetchProjects() // Refresh to show updated status
    } catch (error) {
      console.error('Failed to report project:', error)
      alert('Failed to report project. Please try again.')
    }
  }

  const getProjectsByStatus = () => {
    let filteredProjects = projects
    
    // For freelancers, handle special tabs
    if (user?.role === 'freelancer') {
      if (activeTab === 'my_bids') {
        filteredProjects = projects.filter(p => 
          p.applicants && p.applicants.some(applicant => applicant.freelancerId === user.id)
        )
      } else if (activeTab === 'my_projects') {
        filteredProjects = projects.filter(p => p.freelancerId === user.id)
      }
      // For other tabs, use all projects (backend already filters appropriately)
    }
    // For clients, backend already filters to show only their projects

    // Then filter by status if not already handled by special tabs
    if (activeTab !== 'my_bids' && activeTab !== 'my_projects') {
      switch (activeTab) {
        case 'draft':
          filteredProjects = filteredProjects.filter(p => p.status === 'draft')
          break
        case 'open':
          filteredProjects = filteredProjects.filter(p => p.status === 'open')
          break
        case 'in_progress':
          filteredProjects = filteredProjects.filter(p => p.status === 'in_progress')
          break
        case 'completed':
          filteredProjects = filteredProjects.filter(p => p.status === 'completed')
          break
        case 'all':
          // Exclude completed projects from 'all' tab
          filteredProjects = filteredProjects.filter(p => p.status !== 'completed')
          break
        default:
          // Exclude completed projects from default case as well
          filteredProjects = filteredProjects.filter(p => p.status !== 'completed')
          break
      }
    }
    
    return filteredProjects
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Web Development': return Globe
      case 'Mobile Development': return Smartphone
      case 'Design': return Palette
      case 'Writing': return PenTool
      case 'Marketing': return TrendingUp
      case 'Data Science': return Database
      default: return Briefcase
    }
  }

  const tabs = [
    { id: 'all', label: 'All Projects', icon: FolderOpen },
    { id: 'open', label: 'Open', icon: CheckCircle },
    { id: 'in_progress', label: 'In Progress', icon: Clock },
    { id: 'completed', label: 'Completed', icon: Target },
    ...(user?.role === 'freelancer' ? [
      { id: 'my_bids', label: 'My Bids', icon: MessageSquare },
      { id: 'my_projects', label: 'My Projects', icon: Briefcase }
    ] : [])
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Professional Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <BarChart3 className="h-10 w-10 text-blue-600" />
              Project Dashboard
            </h1>
            <p className="text-slate-600 text-lg mt-2">
              {user?.role === 'client' 
                ? 'Manage your projects and find talented freelancers' 
                : 'Browse available projects and submit proposals'}
            </p>
          </div>
          
          {user?.role === 'client' && (
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center gap-3 group"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Create New Project</span>
            </motion.button>
          )}
        </motion.div>

        {/* Professional Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-item whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'nav-item-active'
                      : 'nav-item-inactive'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.label}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {getProjectsByStatus().map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="group card-elevated cursor-pointer"
            >
              {/* Project Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                    {(() => {
                      const CategoryIcon = getCategoryIcon(project.category)
                      return <CategoryIcon className="h-5 w-5 text-blue-600" />
                    })()}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 flex-1">
                    {project.title}
                  </h3>
                </div>
                <span className={`status-${project.status}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              {/* Project Details */}
              <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                {project.description}
              </p>

              {/* Budget and Timeline */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span className="text-lg font-bold text-slate-900">
                    ${project.budget?.total?.toLocaleString() || 'TBD'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {project.timeline?.endDate 
                      ? new Date(project.timeline.endDate).toLocaleDateString()
                      : 'Flexible'}
                  </span>
                </div>
              </div>

              {/* Skills and Match Percentage for Freelancers */}
              {project.skills && project.skills.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">Skills Required:</span>
                    {user?.role === 'freelancer' && userProfile?.skills && (
                      (() => {
                        const matchPercentage = calculateSkillMatch(project.skills, userProfile.skills)
                        return (
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                              matchPercentage >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              matchPercentage >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              matchPercentage >= 40 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {matchPercentage}% Match
                            </span>
                            {matchPercentage >= 70 && (
                              <span className="text-xs text-emerald-600 font-semibold">🎯 Great Fit!</span>
                            )}
                          </div>
                        )
                      })()
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.skills.slice(0, 5).map((skill, index) => {
                      const isMatched = userProfile?.skills?.some(userSkill => 
                        userSkill.toLowerCase().includes(skill.toLowerCase()) || 
                        skill.toLowerCase().includes(userSkill.toLowerCase())
                      )
                      return (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            user?.role === 'freelancer' && isMatched
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {skill}
                        </span>
                      )
                    })}
                    {project.skills.length > 5 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                        +{project.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Status Information */}
              {project.status === 'in_progress' && project.freelancerId ? (
                <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm text-emerald-700 font-semibold">
                        🚀 In Progress
                      </span>
                    </div>
                    <span className="badge-success">
                      Active Project
                    </span>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <User className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700">
                      Assigned to: <strong>{project.freelancerId?.name || 'Freelancer'}</strong>
                    </span>
                  </div>
                  
                  {/* Completion Status */}
                  {project.completion && (project.completion.clientMarkedComplete || project.completion.freelancerMarkedComplete) && (
                    <div className="mt-3 p-2 bg-white rounded border border-emerald-200">
                      <div className="text-xs font-medium text-emerald-700 mb-2">Completion Status:</div>
                      <div className="flex items-center space-x-4 text-xs">
                        <div className={`flex items-center space-x-1 ${project.completion.clientMarkedComplete ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {project.completion.clientMarkedComplete ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          <span>Client {project.completion.clientMarkedComplete ? 'Approved' : 'Pending'}</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${project.completion.freelancerMarkedComplete ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {project.completion.freelancerMarkedComplete ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          <span>Freelancer {project.completion.freelancerMarkedComplete ? 'Completed' : 'Working'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : project.status === 'completed' ? (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700 font-semibold">
                        🎉 Completed
                      </span>
                    </div>
                    <span className="badge-primary">
                      Finished
                    </span>
                  </div>
                  {project.completion?.finalCompletedAt && (
                    <div className="mt-2 text-xs text-blue-300">
                      Completed on {new Date(project.completion.finalCompletedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ) : project.applicants && project.applicants.length > 0 && (
                <div className="mb-4 p-3 bg-purple-500/20 rounded-lg border border-purple-400/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-purple-300 font-semibold">
                        {project.applicants.length} bid{project.applicants.length !== 1 ? 's' : ''} received
                      </span>
                    </div>
                    {project.status === 'open' && (
                      <span className="text-xs bg-green-500/30 text-green-300 px-2 py-1 rounded-full font-medium border border-green-400/30">
                        🔥 Active
                      </span>
                    )}
                  </div>
                  {user?.role === 'freelancer' && (
                    <div className="mt-2">
                      {project.applicants.some(applicant => applicant.freelancerId === user.id) ? (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-green-300 font-medium">✅ You submitted a bid</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedProject(project)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-lg hover:bg-blue-500/30 hover:border-blue-400/50 transition-colors duration-200 font-medium"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </motion.button>

                {/* Client Actions */}
                {user?.role === 'client' && (
                  <>
                    {project.status === 'open' && project.applicants && project.applicants.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedProject(project)
                          setShowBidsModal(true)
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                      >
                        <Users className="h-4 w-4" />
                        <span>Review Bids ({project.applicants.length})</span>
                      </motion.button>
                    )}
                    {project.status === 'in_progress' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedProject(project)
                            setShowVideoCallModal(true)
                          }}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium"
                          title="Start Video Call"
                        >
                          <Video className="h-4 w-4" />
                          <span>Video Call</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedProject(project)
                            setSelectedFreelancer(project.freelancerId)
                            setShowPaymentModal(true)
                          }}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium"
                        >
                          <DollarSign className="h-4 w-4" />
                          <span>Pay Freelancer</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => markProjectComplete(project)}
                          disabled={project.completion?.clientMarkedComplete}
                          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            project.completion?.clientMarkedComplete 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>
                            {project.completion?.clientMarkedComplete 
                              ? 'Already Approved' 
                              : project.completion?.freelancerMarkedComplete 
                                ? 'Approve & Complete' 
                                : 'Mark Complete'}
                          </span>
                        </motion.button>
                      </>
                    )}
                    
                    {/* Report Button for both open and in_progress projects */}
                    {(project.status === 'open' || project.status === 'in_progress') && !project.isReported && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedProject(project)
                          setShowReportModal(true)
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:from-rose-600 hover:to-red-600 transition-all duration-200 font-medium"
                        title="Report this project"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <span>Report</span>
                      </motion.button>
                    )}
                  </>
                )}

                {/* Freelancer Actions */}
                {user?.role === 'freelancer' && (
                  <>
                    {project.status === 'open' && !project.applicants?.some(applicant => applicant.freelancerId === user.id) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedProject(project)
                          setShowBidForm(true)
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium"
                      >
                        <Star className="h-4 w-4" />
                        <span>Bid</span>
                      </motion.button>
                    )}
                    {project.status === 'in_progress' && (
                      project.freelancerId?._id === user.id || 
                      project.freelancerId?.id === user.id ||
                      project.freelancerId === user.id ||
                      project.freelancerId?._id === user.id
                    ) && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedProject(project)
                            setShowVideoCallModal(true)
                          }}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium"
                          title="Start Video Call"
                        >
                          <Video className="h-4 w-4" />
                          <span>Video Call</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => markProjectComplete(project)}
                          disabled={project.completion?.freelancerMarkedComplete}
                          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            project.completion?.freelancerMarkedComplete 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>
                            {project.completion?.freelancerMarkedComplete 
                              ? 'Work Submitted' 
                              : project.completion?.clientMarkedComplete 
                                ? 'Submit Final Work' 
                                : 'Complete Work'}
                          </span>
                        </motion.button>
                      </>
                    )}
                    
                    {/* Report Button for freelancers */}
                    {(project.status === 'open' || project.status === 'in_progress') && !project.isReported && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedProject(project)
                          setShowReportModal(true)
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:from-rose-600 hover:to-red-600 transition-all duration-200 font-medium"
                        title="Report this project"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <span>Report</span>
                      </motion.button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {getProjectsByStatus().length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 max-w-md mx-auto">
              <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
              <p className="text-gray-300 mb-6">
                {user?.role === 'client' 
                  ? 'Create your first project to get started!'
                  : 'No projects available in this category.'}
              </p>
              {user?.role === 'client' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary"
                >
                  Create Your First Project
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Project Details Modal */}
        {selectedProject && !showBidForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    {(() => {
                      const CategoryIcon = getCategoryIcon(selectedProject.category)
                      return <CategoryIcon className="h-6 w-6 text-blue-600" />
                    })()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                      selectedProject.status === 'open' ? 'bg-green-100 text-green-800' :
                      selectedProject.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      selectedProject.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedProject.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedProject(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Project Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedProject.description}</p>
                </div>

                {/* Project Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Budget */}
                  <div className="bg-green-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      Budget
                    </h4>
                    <p className="text-2xl font-bold text-green-600">
                      ${selectedProject.budget?.total?.toLocaleString() || 'TBD'}
                    </p>
                    {selectedProject.budget?.type && (
                      <p className="text-sm text-green-700 mt-1">
                        {selectedProject.budget.type} project
                      </p>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-600" />
                      Timeline
                    </h4>
                    <p className="text-lg font-semibold text-blue-600">
                      {selectedProject.timeline?.duration || 'Flexible'}
                    </p>
                    {selectedProject.timeline?.endDate && (
                      <p className="text-sm text-blue-700 mt-1">
                        Due: {new Date(selectedProject.timeline.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                      Category
                    </h4>
                    <p className="text-lg font-semibold text-purple-600">
                      {selectedProject.category || 'General'}
                    </p>
                  </div>

                  {/* Client Info */}
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <User className="h-5 w-5 mr-2 text-orange-600" />
                      Client
                    </h4>
                    <p className="text-lg font-semibold text-orange-600">
                      {selectedProject.clientId?.name || 'Anonymous Client'}
                    </p>
                    {selectedProject.clientId?.location && (
                      <p className="text-sm text-orange-700 mt-1 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {selectedProject.clientId.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Skills Required */}
                {(selectedProject.skillsRequired || selectedProject.skills) && (selectedProject.skillsRequired?.length > 0 || selectedProject.skills?.length > 0) && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Star className="h-5 w-5 mr-2 text-yellow-600" />
                        Skills Required
                      </h3>
                      {user?.role === 'freelancer' && userProfile?.skills && (
                        (() => {
                          const projectSkills = selectedProject.skills || selectedProject.skillsRequired || []
                          const matchDetails = getSkillMatchDetails(projectSkills, userProfile.skills)
                          return (
                            <div className="text-right">
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                matchDetails.matchPercentage >= 80 ? 'bg-green-100 text-green-800 border border-green-200' :
                                matchDetails.matchPercentage >= 60 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                matchDetails.matchPercentage >= 40 ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                {matchDetails.matchPercentage}% Match
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {matchDetails.matched.length} of {projectSkills.length} skills matched
                              </p>
                            </div>
                          )
                        })()
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(selectedProject.skills || selectedProject.skillsRequired || []).map((skill, index) => {
                        const isMatched = userProfile?.skills?.some(userSkill => 
                          userSkill.toLowerCase().includes(skill.toLowerCase()) || 
                          skill.toLowerCase().includes(userSkill.toLowerCase())
                        )
                        return (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              user?.role === 'freelancer' && isMatched
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {skill}
                            {user?.role === 'freelancer' && isMatched && (
                              <span className="ml-1 text-green-600">✓</span>
                            )}
                          </span>
                        )
                      })}
                    </div>
                    {user?.role === 'freelancer' && userProfile?.skills && (
                      (() => {
                        const projectSkills = selectedProject.skills || selectedProject.skillsRequired || []
                        const matchDetails = getSkillMatchDetails(projectSkills, userProfile.skills)
                        return matchDetails.missing.length > 0 && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm font-medium text-yellow-800 mb-1">Skills you may need to learn:</p>
                            <div className="flex flex-wrap gap-1">
                              {matchDetails.missing.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      })()
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  {/* Freelancer Actions */}
                  {user?.role === 'freelancer' && selectedProject.status === 'open' && !selectedProject.applicants?.some(applicant => applicant.freelancerId === user.id) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowBidForm(true)}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Star className="h-5 w-5" />
                      <span>Submit Proposal</span>
                    </motion.button>
                  )}

                  {/* Client Actions */}
                  {user?.role === 'client' && selectedProject.clientId === user.id && (
                    <>
                      {selectedProject.status === 'open' && selectedProject.applicants && selectedProject.applicants.length > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowBidsModal(true)}
                          className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Users className="h-5 w-5" />
                          <span>View Bids ({selectedProject.applicants.length})</span>
                        </motion.button>
                      )}
                    </>
                  )}

                  {/* Project Completion Actions */}
                  {selectedProject.status === 'in_progress' && (
                    (user?.role === 'client' && selectedProject.clientId === user.id) || 
                    (user?.role === 'freelancer' && selectedProject.freelancerId === user.id)
                  ) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={markProjectComplete}
                      disabled={completingProject}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    >
                      {completingProject ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          <span>Mark Complete</span>
                        </>
                      )}
                    </motion.button>
                  )}
                  
                  {/* Contact/Share Actions */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Add contact functionality here
                      console.log('Contact user:', selectedProject)
                    }}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors duration-200"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Contact</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href + '?project=' + selectedProject._id)
                      alert('Project link copied to clipboard!')
                    }}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>Share</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Bid Form Modal */}
        {selectedProject && showBidForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowBidForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Submit Proposal</h2>
                  <p className="text-gray-600 mt-1">for "{selectedProject.title}"</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowBidForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Bid Form */}
              <div className="p-6 space-y-6">
                {/* Project Summary */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Project Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Budget:</span>
                      <p className="font-semibold text-green-600">
                        ${selectedProject.budget?.total?.toLocaleString() || 'TBD'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Timeline:</span>
                      <p className="font-semibold text-blue-600">
                        {selectedProject.timeline?.duration || 'Flexible'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bid Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Your Bid Amount ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter your bid amount"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a competitive amount based on the project requirements
                  </p>
                </div>

                {/* Proposal Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Proposal Message
                  </label>
                  <textarea
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    placeholder="Describe your approach, experience, and why you're the best fit for this project..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {bidMessage.length}/500 characters
                  </p>
                </div>

                {/* Timeline Estimate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Estimated Days to Complete
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(e.target.value)}
                      placeholder="Enter number of days"
                      min="1"
                      max="365"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Realistic estimate based on project complexity
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowBidForm(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={submitBid}
                    disabled={submittingBid || !bidAmount || !bidMessage.trim() || !estimatedDays}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingBid ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Star className="h-5 w-5" />
                        <span>Submit Proposal</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Bids Management Modal */}
        {selectedProject && showBidsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowBidsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Project Bids</h2>
                  <p className="text-gray-600 mt-1">{selectedProject.title}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowBidsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Bids List */}
              <div className="p-6">
                {selectedProject.applicants && selectedProject.applicants.length > 0 ? (
                  <div className="space-y-4">
                    {selectedProject.applicants.map((bid, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 border rounded-2xl transition-all duration-200 ${
                          bid.status === 'accepted' 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {(bid.freelancerId?.name || bid.freelancer?.name || 'Freelancer').charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {bid.freelancerId?.name || bid.freelancer?.name || 'Freelancer'}
                                </h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span>4.8 rating • 23 reviews</span>
                                </div>
                              </div>
                              {bid.status === 'accepted' && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                  Accepted
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                  <span className="text-sm text-green-700 font-medium">Bid Amount</span>
                                </div>
                                <p className="text-lg font-bold text-green-600">
                                  ${(bid.proposedBudget || bid.bidAmount || bid.amount || 0).toLocaleString()}
                                </p>
                              </div>

                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm text-blue-700 font-medium">Timeline</span>
                                </div>
                                <p className="text-lg font-bold text-blue-600">
                                  {bid.estimatedDays || bid.timeline || bid.deliveryTime || 'N/A'} days
                                </p>
                              </div>

                              <div className="bg-purple-50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-purple-600" />
                                  <span className="text-sm text-purple-700 font-medium">Submitted</span>
                                </div>
                                <p className="text-lg font-bold text-purple-600">
                                  {bid.submittedAt ? new Date(bid.submittedAt).toLocaleDateString() : 
                                   bid.createdAt ? new Date(bid.createdAt).toLocaleDateString() : 'Recently'}
                                </p>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Proposal</h4>
                              <p className="text-gray-700 leading-relaxed">
                                {bid.proposal || bid.coverLetter || bid.description || 'No proposal message provided.'}
                              </p>
                            </div>

                            {bid.status !== 'accepted' && selectedProject.status === 'open' && (
                              <div className="flex space-x-3">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    console.log('Debug - Accepting bid for:', bid.freelancerId)
                                    console.log('Debug - Full bid object:', bid)
                                    const freelancerIdToUse = bid.freelancerId?._id || bid.freelancerId || bid.freelancer?._id || bid.freelancer
                                    console.log('Debug - Using freelancer ID:', freelancerIdToUse)
                                    acceptBid(freelancerIdToUse)
                                  }}
                                  disabled={acceptingBid || rejectingBid}
                                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                                >
                                  {acceptingBid ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      <span>Accepting...</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4" />
                                      <span>Accept</span>
                                    </>
                                  )}
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    const freelancerIdToUse = bid.freelancerId?._id || bid.freelancerId || bid.freelancer?._id || bid.freelancer
                                    rejectBid(freelancerIdToUse)
                                  }}
                                  disabled={acceptingBid || rejectingBid}
                                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                                >
                                  {rejectingBid ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      <span>Rejecting...</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="h-4 w-4" />
                                      <span>Reject</span>
                                    </>
                                  )}
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    // Add message functionality
                                    console.log('Message freelancer:', bid.freelancerId)
                                  }}
                                  className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors duration-200"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  <span>Message</span>
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bids Yet</h3>
                    <p className="text-gray-600">
                      Your project hasn't received any bids yet. Check back later or consider adjusting your project details.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Create Project Form Modal */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CreateProjectForm 
                user={user}
                onClose={() => setShowCreateForm(false)}
                onProjectCreated={fetchProjects}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Video Call Modal */}
        <VideoCallModal 
          isOpen={showVideoCallModal}
          onClose={() => setShowVideoCallModal(false)}
          projectId={selectedProject?._id || 'general'}
          userId={user?._id || user?.id}
          userName={user?.name}
        />

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedProject(null)
            setSelectedFreelancer(null)
          }}
          project={selectedProject}
          freelancer={selectedFreelancer}
          user={user}
          onPaymentComplete={() => {
            fetchProjects()
          }}
        />

        {/* Report Project Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-rose-50 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Report Project</h3>
                    <p className="text-sm text-slate-600">Help us keep the platform safe</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowReportModal(false)
                    setReportReason('')
                    setReportDescription('')
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Project: {selectedProject?.title}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reason for reporting *
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="">Select a reason</option>
                    <option value="spam">Spam or fraudulent content</option>
                    <option value="inappropriate">Inappropriate content</option>
                    <option value="payment_issues">Payment issues</option>
                    <option value="communication_issues">Communication problems</option>
                    <option value="scope_creep">Scope creep or unrealistic demands</option>
                    <option value="quality_issues">Quality concerns</option>
                    <option value="harassment">Harassment or unprofessional behavior</option>
                    <option value="violation">Terms of service violation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Please provide more details about the issue..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Before reporting:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Try communicating directly with the other party</li>
                        <li>Reports are reviewed by our admin team</li>
                        <li>False reports may result in account restrictions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowReportModal(false)
                      setReportReason('')
                      setReportDescription('')
                    }}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={reportProject}
                    disabled={!reportReason.trim()}
                    className="btn-outline-danger flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

// Create Project Form Component
function CreateProjectForm({ user, onClose, onProjectCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: { total: '', currency: 'USD' },
    timeline: { endDate: '', estimatedHours: '' },
    skills: [],
    category: '',
    priority: 'medium'
  })
  const [submitting, setSubmitting] = useState(false)

  const categories = [
    'Web Development',
    'Mobile Development', 
    'Design',
    'Writing',
    'Marketing',
    'Data Science',
    'Consulting',
    'Other'
  ]



  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Enhanced validation with specific error messages
    const errors = []
    
    if (!formData.title.trim()) {
      errors.push('Title is required')
    } else if (formData.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long')
    }
    
    if (!formData.description.trim()) {
      errors.push('Description is required')
    } else if (formData.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long')
    }
    
    if (!formData.budget.total) {
      errors.push('Budget is required')
    } else if (parseFloat(formData.budget.total) < 1) {
      errors.push('Budget must be at least $1')
    }
    
    if (!formData.timeline.endDate) {
      errors.push('End date is required')
    } else {
      const endDate = new Date(formData.timeline.endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (endDate < today) {
        errors.push('End date must be in the future')
      }
    }
    
    if (!formData.category) {
      errors.push('Category is required')
    }
    
    if (formData.skills.length === 0) {
      errors.push('At least one skill is required')
    }
    
    if (errors.length > 0) {
      alert('Please fix the following errors:\n\n• ' + errors.join('\n• '))
      return
    }

    try {
      setSubmitting(true)
      
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        budget: {
          total: parseFloat(formData.budget.total),
          currency: formData.budget.currency
        },
        timeline: {
          endDate: new Date(formData.timeline.endDate),
          estimatedHours: formData.timeline.estimatedHours ? parseInt(formData.timeline.estimatedHours) : undefined
        },
        skills: formData.skills,
        category: formData.category,
        priority: formData.priority,
        status: 'open',
        isPublic: true
      }

      const response = await api.createProject(projectData)
      console.log('Project created:', response)
      
      alert('Project created successfully!')
      onProjectCreated()
      onClose()
    } catch (error) {
      console.error('Failed to create project:', error)
      let errorMessage = 'Failed to create project. Please try again.'
      
      if (error.message.includes('Validation error')) {
        errorMessage = 'Please check your form data and ensure all fields meet the requirements.'
      } else if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      }
      
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
          <p className="text-gray-600 mt-1">Post your project to find talented freelancers</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <X className="h-6 w-6" />
        </motion.button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter a clear, descriptive title for your project"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              formData.title.trim().length > 0 && formData.title.trim().length < 3 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            }`}
            maxLength={200}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Minimum 3 characters required
            </p>
            <p className={`text-xs ${formData.title.length > 180 ? 'text-red-500' : 'text-gray-400'}`}>
              {formData.title.length}/200
            </p>
          </div>
        </div>

        {/* Project Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Project Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your project in detail. Include requirements, objectives, and expectations..."
            rows={6}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
              formData.description.trim().length > 0 && formData.description.trim().length < 10 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            <p className={`text-xs ${
              formData.description.trim().length > 0 && formData.description.trim().length < 10 
                ? 'text-red-500' 
                : 'text-gray-500'
            }`}>
              Minimum 10 characters required
            </p>
            <p className={`text-xs ${
              formData.description.trim().length >= 10 
                ? 'text-green-500' 
                : 'text-gray-400'
            }`}>
              {formData.description.length} characters
            </p>
          </div>
        </div>

        {/* Budget and Timeline Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Project Budget *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={formData.budget.total}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  budget: { ...prev.budget, total: e.target.value }
                }))}
                placeholder="0"
                min="1"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  formData.budget.total && parseFloat(formData.budget.total) < 1 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum budget: $1
            </p>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Project Deadline *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={formData.timeline.endDate}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  timeline: { ...prev.timeline, endDate: e.target.value }
                }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Category and Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Project Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Project Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Skills Required */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Skills Required *
          </label>
          <SkillSelector
            selectedSkills={formData.skills}
            onSkillsChange={(skills) => setFormData(prev => ({ ...prev, skills }))}
            placeholder="Select or type required skills..."
            maxSkills={15}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </motion.button>
          
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={submitting}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span>Create Project</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  )
}