'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Users,
  Briefcase,
  DollarSign,
  AlertTriangle,
  Trash2,
  Eye,
  Filter,
  Search,
  Download,
  RefreshCw,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar
} from 'lucide-react'
import { api } from '../lib/api'
import { formatCurrency, formatRelativeTime } from '../lib/utils'

export default function AdminDashboard() {
  // State management
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  // Data states
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    reportedProjects: 0,
    activeProjects: 0
  })
  const [projects, setProjects] = useState([])
  const [transactions, setTransactions] = useState([])
  const [reportedProjects, setReportedProjects] = useState([])
  
  // Filter states
  const [projectFilter, setProjectFilter] = useState('all') // all, active, completed, reported
  const [transactionFilter, setTransactionFilter] = useState('all') // all, credit, debit, pending
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('all') // all, today, week, month

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      // Fetch admin statistics first
      const statsData = await api.getAdminStats()
      setStats(statsData)
      
      // Fetch projects with admin endpoint
      const projectsResponse = await api.getAdminProjects({ limit: 100 })
      const projectsData = projectsResponse.projects || projectsResponse
      setProjects(projectsData)
      
      // Fetch transactions with admin endpoint
      const transactionsResponse = await api.getAllTransactions({ limit: 100 })
      const transactionsData = transactionsResponse.transactions || transactionsResponse
      setTransactions(transactionsData)
      
      // Filter reported projects
      const reported = projectsData.filter(project => project.isReported)
      setReportedProjects(reported)
      
      console.log('Admin data loaded:', {
        stats: statsData,
        projects: projectsData.length,
        transactions: transactionsData.length,
        reported: reported.length
      })
      
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      // Fallback to regular endpoints if admin endpoints fail
      try {
        const [projectsData, transactionsData] = await Promise.all([
          api.getProjects(),
          api.getWalletTransactions(100, 0)
        ])
        
        setProjects(projectsData)
        setTransactions(transactionsData.transactions || transactionsData)
        
        const reported = projectsData.filter(project => project.isReported)
        setReportedProjects(reported)
      } catch (fallbackError) {
        console.error('Fallback data fetch also failed:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      setProcessing(true)
      await api.deleteProject(projectId)
      await fetchAdminData() // Refresh data
      alert('Project deleted successfully')
    } catch (error) {
      console.error('Failed to delete project:', error)
      alert('Failed to delete project')
    } finally {
      setProcessing(false)
    }
  }

  const handleResolveReport = async (projectId, action) => {
    try {
      setProcessing(true)
      await api.resolveProjectReport(projectId, action)
      await fetchAdminData() // Refresh data
      alert(`Report ${action} successfully`)
    } catch (error) {
      console.error('Failed to resolve report:', error)
      alert('Failed to resolve report')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'open': 'badge-warning',
      'in-progress': 'badge-info',
      'completed': 'badge-success',
      'cancelled': 'badge-danger'
    }
    return badges[status] || 'badge-secondary'
  }

  const getTransactionStatusBadge = (status) => {
    const badges = {
      'completed': 'badge-success',
      'pending': 'badge-warning',
      'failed': 'badge-danger'
    }
    return badges[status] || 'badge-secondary'
  }

  const filteredProjects = projects.filter(project => {
    // Filter by type
    if (projectFilter === 'active' && !['open', 'in-progress'].includes(project.status)) return false
    if (projectFilter === 'completed' && project.status !== 'completed') return false
    if (projectFilter === 'reported' && !project.isReported) return false
    
    // Filter by search term
    if (searchTerm && !project.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !project.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    
    return true
  })

  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (transactionFilter !== 'all' && transaction.type !== transactionFilter) return false
    
    // Filter by search term
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                  <p className="text-slate-600">Manage platform operations and monitor activities</p>
                </div>
              </div>
              <button
                onClick={() => fetchAdminData()}
                disabled={loading}
                className="btn-outline flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalUsers || 0}</p>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                  <span>Clients: {stats.usersByRole?.client || 0}</span>
                  <span>•</span>
                  <span>Freelancers: {stats.usersByRole?.freelancer || 0}</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Projects</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalProjects || 0}</p>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                  <span>Active: {stats.activeProjects || 0}</span>
                  <span>•</span>
                  <span>Completed: {stats.completedProjects || 0}</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <Briefcase className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Platform Revenue</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue || 0)}</p>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                  <span>Transactions: {stats.totalTransactions || 0}</span>
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Reported Projects</p>
                <p className="text-2xl font-bold text-rose-600">{stats.reportedProjects || 0}</p>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                  <span>Need Review</span>
                </div>
              </div>
              <div className="p-3 bg-rose-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Recent Activity (30 days)</p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">New Projects</span>
                    <span className="font-semibold text-slate-900">{stats.recentActivity?.projects || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">New Users</span>
                    <span className="font-semibold text-slate-900">{stats.recentActivity?.users || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Transactions</span>
                    <span className="font-semibold text-slate-900">{stats.recentActivity?.transactions || 0}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Project Status</p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Open</span>
                    <span className="font-semibold text-blue-600">{stats.projectsByStatus?.open || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">In Progress</span>
                    <span className="font-semibold text-amber-600">{stats.projectsByStatus?.in_progress || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Completed</span>
                    <span className="font-semibold text-emerald-600">{stats.projectsByStatus?.completed || 0}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Transaction Stats</p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Credits</span>
                    <div className="text-right">
                      <div className="font-semibold text-emerald-600">
                        {formatCurrency(stats.transactionBreakdown?.byType?.credit?.total || 0)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {stats.transactionBreakdown?.byType?.credit?.count || 0} txns
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Debits</span>
                    <div className="text-right">
                      <div className="font-semibold text-rose-600">
                        {formatCurrency(stats.transactionBreakdown?.byType?.debit?.total || 0)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {stats.transactionBreakdown?.byType?.debit?.count || 0} txns
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingDown className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'projects', label: 'Projects', icon: Briefcase },
            { id: 'transactions', label: 'Transactions', icon: DollarSign },
            { id: 'reports', label: 'Reports', icon: AlertTriangle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item ${activeTab === tab.id ? 'nav-item-active' : ''}`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Projects */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Projects</h3>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {projects.slice(0, 5).map(project => (
                    <div key={project._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{project.title}</p>
                        <p className="text-sm text-slate-600">by {project.clientId?.name}</p>
                      </div>
                      <span className={`badge ${getStatusBadge(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(transaction => (
                    <div key={transaction._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{transaction.description}</p>
                        <p className="text-sm text-slate-600">{formatRelativeTime(transaction.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatCurrency(transaction.amount)}</p>
                        <span className={`badge ${getTransactionStatusBadge(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="card">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Projects</option>
                  <option value="active">Active Projects</option>
                  <option value="completed">Completed Projects</option>
                  <option value="reported">Reported Projects</option>
                </select>
              </div>
            </div>

            {/* Projects List */}
            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Project</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Client</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Freelancer</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Budget</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Created</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map(project => (
                      <tr key={project._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-slate-900">{project.title}</p>
                            <p className="text-sm text-slate-600 truncate max-w-xs">{project.description}</p>
                            {project.isReported && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 mt-1">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Reported
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-slate-900">{project.clientId?.name || 'N/A'}</p>
                          <p className="text-sm text-slate-600">{project.clientId?.email}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-slate-900">{project.freelancerId?.name || 'Not assigned'}</p>
                          {project.freelancerId?.email && (
                            <p className="text-sm text-slate-600">{project.freelancerId.email}</p>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-slate-900">
                            {formatCurrency(project.budget?.total || 0)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`badge ${getStatusBadge(project.status)}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-slate-600">
                            {formatRelativeTime(project.createdAt)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => window.open(`/projects/${project._id}`, '_blank')}
                              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                              title="View Project"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {project.isReported && (
                              <>
                                <button
                                  onClick={() => handleResolveReport(project._id, 'resolved')}
                                  disabled={processing}
                                  className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                                  title="Resolve Report"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleResolveReport(project._id, 'dismissed')}
                                  disabled={processing}
                                  className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                                  title="Dismiss Report"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteProject(project._id)}
                              disabled={processing}
                              className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="card">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={transactionFilter}
                  onChange={(e) => setTransactionFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Transactions</option>
                  <option value="credit">Credits</option>
                  <option value="debit">Debits</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Transactions List */}
            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Description</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(transaction => (
                      <tr key={transaction._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4">
                          <p className="font-medium text-slate-900">{transaction.description}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-slate-900">{transaction.userId?.name || 'N/A'}</p>
                          <p className="text-sm text-slate-600">{transaction.userId?.email}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`badge ${transaction.type === 'credit' ? 'badge-success' : 'badge-danger'}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className={`font-bold ${transaction.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`badge ${getTransactionStatusBadge(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-slate-600">
                            {formatRelativeTime(transaction.createdAt)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Reported Projects</h3>
              {reportedProjects.length > 0 ? (
                <div className="space-y-4">
                  {reportedProjects.map(project => (
                    <div key={project._id} className="border border-rose-200 rounded-lg p-4 bg-rose-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-rose-600" />
                            <h4 className="font-semibold text-slate-900">{project.title}</h4>
                            <span className={`badge ${getStatusBadge(project.status)}`}>
                              {project.status}
                            </span>
                          </div>
                          <p className="text-slate-700 mb-2">{project.description}</p>
                          <div className="text-sm text-slate-600 space-y-1">
                            <p><strong>Client:</strong> {project.clientId?.name} ({project.clientId?.email})</p>
                            <p><strong>Freelancer:</strong> {project.freelancerId?.name || 'Not assigned'}</p>
                            <p><strong>Budget:</strong> {formatCurrency(project.budget?.total || 0)}</p>
                            <p><strong>Reported:</strong> {formatRelativeTime(project.reportedAt)}</p>
                            {project.reportReason && (
                              <p><strong>Reason:</strong> {project.reportReason}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => window.open(`/projects/${project._id}`, '_blank')}
                            className="btn-outline-sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleResolveReport(project._id, 'resolved')}
                            disabled={processing}
                            className="btn-success-sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </button>
                          <button
                            onClick={() => handleResolveReport(project._id, 'dismissed')}
                            disabled={processing}
                            className="btn-outline-sm"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            disabled={processing}
                            className="btn-outline-danger-sm"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                  <p className="text-slate-600">No reported projects</p>
                  <p className="text-sm text-slate-500">All projects are in good standing</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}