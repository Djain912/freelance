import express from 'express'
import { auth } from '../middleware/auth.js'
import Project from '../models/Project.js'
import Transaction from '../models/Transaction.js'
import User from '../models/User.js'
import Wallet from '../models/Wallet.js'

const router = express.Router()

// Admin middleware (basic mock auth)
const adminAuth = (req, res, next) => {
  // In production, implement proper admin authentication
  // For now, just check if user exists (mock)
  next()
}

// Get admin statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    // Get basic counts
    const [
      totalUsers,
      totalProjects,
      totalTransactions,
      reportedProjects,
      activeProjects,
      completedProjects,
      openProjects
    ] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Transaction.countDocuments(),
      Project.countDocuments({ isReported: true }),
      Project.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      Project.countDocuments({ status: 'completed' }),
      Project.countDocuments({ status: 'open' })
    ])

    // Get user breakdown by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ])

    // Calculate total platform revenue and transaction breakdown
    const [revenueData, transactionBreakdown] = await Promise.all([
      Transaction.aggregate([
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Transaction.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ])
    ])

    // Calculate total revenue (sum of all successful transactions)
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.total, 0)

    // Get project status breakdown
    const projectsByStatus = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [recentProjects, recentUsers, recentTransactions] = await Promise.all([
      Project.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Transaction.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ])

    res.json({
      // Basic stats
      totalUsers,
      totalProjects,
      totalTransactions,
      totalRevenue,
      reportedProjects,
      activeProjects,
      completedProjects,
      openProjects,
      
      // Detailed breakdowns
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      
      projectsByStatus: projectsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      
      transactionBreakdown: {
        byType: revenueData.reduce((acc, item) => {
          acc[item._id] = { count: item.count, total: item.total }
          return acc
        }, {}),
        byStatus: transactionBreakdown.reduce((acc, item) => {
          acc[item._id] = { count: item.count, total: item.totalAmount }
          return acc
        }, {})
      },
      
      // Recent activity (last 30 days)
      recentActivity: {
        projects: recentProjects,
        users: recentUsers,
        transactions: recentTransactions
      }
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    res.status(500).json({ message: 'Failed to fetch admin statistics' })
  }
})

// Get all projects (admin view)
router.get('/projects', adminAuth, async (req, res) => {
  try {
    const { status, reported, page = 1, limit = 50 } = req.query
    const skip = (page - 1) * limit

    // Build query
    let query = {}
    if (status && status !== 'all') {
      if (status === 'active') {
        query.status = { $in: ['open', 'in_progress'] }
      } else {
        query.status = status
      }
    }
    if (reported === 'true') {
      query.isReported = true
    }

    const projects = await Project.find(query)
      .populate('clientId', 'name email role')
      .populate('freelancerId', 'name email role')
      .populate('reportedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)

    const total = await Project.countDocuments(query)

    res.json({
      projects,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({ message: 'Failed to fetch projects' })
  }
})

// Get all transactions (admin view)
router.get('/transactions', adminAuth, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 100 } = req.query
    const skip = (page - 1) * limit

    // Build query
    let query = {}
    if (type && type !== 'all') {
      query.type = type
    }
    if (status && status !== 'all') {
      query.status = status
    }

    const transactions = await Transaction.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)

    const total = await Transaction.countDocuments(query)

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    res.status(500).json({ message: 'Failed to fetch transactions' })
  }
})

// Delete a project (admin action)
router.delete('/projects/:projectId', adminAuth, async (req, res) => {
  try {
    const { projectId } = req.params

    // Find the project
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Delete the project
    await Project.findByIdAndDelete(projectId)

    // You might want to handle cleanup here:
    // - Refund any held funds
    // - Notify involved parties
    // - Clean up related data

    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    res.status(500).json({ message: 'Failed to delete project' })
  }
})

// Resolve project report
router.post('/projects/:projectId/resolve-report', adminAuth, async (req, res) => {
  try {
    const { projectId } = req.params
    const { action } = req.body // 'resolved' or 'dismissed'

    const updateData = {
      isReported: false,
      reportResolution: {
        action,
        resolvedAt: new Date(),
        resolvedBy: 'admin' // In production, use actual admin ID
      }
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true }
    )

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json({ message: `Report ${action} successfully`, project })
  } catch (error) {
    console.error('Error resolving report:', error)
    res.status(500).json({ message: 'Failed to resolve report' })
  }
})

export default router