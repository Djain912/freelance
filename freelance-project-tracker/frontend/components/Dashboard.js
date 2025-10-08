'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  DollarSign, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Briefcase,
  Star,
  Calendar,
  Eye,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { api } from '../lib/api'
import FreelancerDashboard from './FreelancerDashboard'

function ClientDashboard({ user }) {
  const [stats, setStats] = useState({
    projects: { total: 0, active: 0, completed: 0 },
    earnings: { total: 0, pending: 0, released: 0 },
    messages: { unread: 0 }
  })
  const [recentProjects, setRecentProjects] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch projects
      const projects = await api.getProjects()
      const projectsArray = Array.isArray(projects) ? projects : []

      // Fetch transactions
      const transactions = await api.getTransactions()
      const transactionsArray = Array.isArray(transactions) ? transactions : []

      // Fetch messages count
      const messagesData = await api.getUnreadCount()

      // Calculate stats
      const activeProjects = projectsArray.filter(p => p.status === 'active').length
      const completedProjects = projectsArray.filter(p => p.status === 'completed').length
      
      const totalEarnings = transactionsArray
        .filter(t => t.status === 'released')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const pendingEarnings = transactionsArray
        .filter(t => t.status === 'held')
        .reduce((sum, t) => sum + t.amount, 0)

      setStats({
        projects: {
          total: projectsArray.length,
          active: activeProjects,
          completed: completedProjects
        },
        earnings: {
          total: totalEarnings,
          pending: pendingEarnings,
          released: totalEarnings
        },
        messages: {
          unread: messagesData.count || 0
        }
      })

      setRecentProjects(projectsArray.slice(0, 5))
      setRecentTransactions(transactionsArray.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Set default empty states on error
      setStats({
        projects: { total: 0, active: 0, completed: 0 },
        earnings: { total: 0, pending: 0, released: 0 },
        messages: { unread: 0 }
      })
      setRecentProjects([])
      setRecentTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active'
      case 'completed': return 'status-completed'
      case 'draft': return 'status-pending'
      default: return 'status-pending'
    }
  }

  const getTransactionStatusColor = (status) => {
    switch (status) {
      case 'released': return 'status-completed'
      case 'held': return 'status-pending'
      case 'refunded': return 'status-cancelled'
      default: return 'status-pending'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="bg-slate-200 h-24 rounded-2xl"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
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
        >
          <h2 className="text-4xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Dashboard
          </h2>
        </motion.div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-400/30">
                  <Briefcase className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Projects</p>
                <p className="text-3xl font-bold text-white">{stats.projects.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-400/30">
                  <Clock className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Active Projects</p>
                <p className="text-3xl font-bold text-white">{stats.projects.active}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-400/30">
                  <DollarSign className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">
                  {user.role === 'freelancer' ? 'Total Earnings' : 'Total Spent'}
                </p>
                <p className="text-3xl font-bold text-white">
                  ${stats.earnings.total.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-400/30">
                  <MessageSquare className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Unread Messages</p>
                <p className="text-3xl font-bold text-white">{stats.messages.unread}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-400" />
              Recent Projects
            </h3>
          </div>
          
          {recentProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <span className="text-gray-300 text-2xl">📝</span>
              </div>
              <h3 className="text-sm font-medium text-white mb-1">No projects yet</h3>
              <p className="text-sm text-gray-300">Get started by creating your first project.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recentProjects.map((project) => (
                    <motion.tr 
                      key={project._id} 
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      className="transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {project.title}
                          </div>
                          <div className="text-sm text-gray-300 truncate max-w-xs">
                            {project.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-medium">
                        ${project.budget?.total?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          project.status === 'active' || project.status === 'in_progress' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                          project.status === 'completed' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                          'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </td>
                    </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            Recent Transactions
          </h3>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <span className="text-gray-300 text-2xl">💳</span>
            </div>
            <h3 className="text-sm font-medium text-white mb-1">No transactions yet</h3>
            <p className="text-sm text-gray-300">Transactions will appear here once projects are funded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {recentTransactions.map((transaction) => (
                  <motion.tr 
                    key={transaction._id} 
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    className="transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {transaction.project?.title || 'Deleted Project'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-medium">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        transaction.status === 'released' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                        transaction.status === 'held' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                        'bg-red-500/20 text-red-300 border border-red-400/30'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      </div>
    </div>
  )
}

// Main Dashboard wrapper component
export default function Dashboard({ user }) {
  // Show FreelancerDashboard for freelancers
  if (user.role === 'freelancer') {
    return <FreelancerDashboard user={user} />
  }
  
  // Show ClientDashboard for clients
  return <ClientDashboard user={user} />
}
