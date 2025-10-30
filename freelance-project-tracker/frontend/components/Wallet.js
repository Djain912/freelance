'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet as WalletIcon,
  Plus,
  Minus,
  Send,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  CreditCard,
  ArrowUp,
  ArrowDown,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Briefcase
} from 'lucide-react'
import { api } from '../lib/api'
import { formatCurrency, formatRelativeTime } from '../lib/utils'

const getTransactionIcon = (type) => {
  switch (type) {
    case 'credit': return <ArrowDown className="h-4 w-4 text-emerald-600" />
    case 'debit': return <ArrowUp className="h-4 w-4 text-rose-600" />
    case 'hold': return <Clock className="h-4 w-4 text-amber-600" />
    case 'release': return <CheckCircle className="h-4 w-4 text-emerald-600" />
    default: return <DollarSign className="h-4 w-4 text-slate-600" />
  }
}

const getTransactionColor = (type) => {
  switch (type) {
    case 'credit': return 'text-emerald-600'
    case 'debit': return 'text-rose-600' 
    case 'hold': return 'text-amber-600'
    case 'release': return 'text-emerald-600'
    default: return 'text-slate-600'
  }
}

export default function Wallet({ user }) {
  const [wallet, setWallet] = useState(null)
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [activeProjects, setActiveProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Modal states
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  
  // Form states
  const [addAmount, setAddAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferRecipient, setTransferRecipient] = useState('')
  const [transferProjectId, setTransferProjectId] = useState('')
  const [description, setDescription] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      const [walletData, statsData, transactionsData, projectsData] = await Promise.all([
        api.getWallet(),
        api.getWalletStats(),
        api.getWalletTransactions(20, 0),
        api.getProjects()
      ])
      
      setWallet(walletData)
      setStats(statsData)
      setTransactions(transactionsData.transactions)
      
      // Filter active projects where user is client
      const clientActiveProjects = projectsData.filter(project => 
        project.status === 'in_progress' && 
        (project.clientId === user.id || project.clientId === user._id) &&
        project.freelancerId
      )
      setActiveProjects(clientActiveProjects)
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFunds = async (e) => {
    e.preventDefault()
    if (!addAmount || parseFloat(addAmount) <= 0) return

    try {
      setProcessing(true)
      await api.addFunds(parseFloat(addAmount), description || `Added ₹${addAmount} to wallet`)
      
      setAddAmount('')
      setDescription('')
      setShowAddFunds(false)
      await fetchWalletData()
      
      alert(`Successfully added ${formatCurrency(parseFloat(addAmount))} to your wallet!`)
    } catch (error) {
      console.error('Add funds error:', error)
      alert('Failed to add funds. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return

    try {
      setProcessing(true)
      await api.withdrawFunds(parseFloat(withdrawAmount), description || `Withdrew ₹${withdrawAmount} from wallet`)
      
      setWithdrawAmount('')
      setDescription('')
      setShowWithdraw(false)
      await fetchWalletData()
      
      alert(`Successfully withdrew ${formatCurrency(parseFloat(withdrawAmount))} from your wallet!`)
    } catch (error) {
      console.error('Withdraw error:', error)
      alert(error.message || 'Failed to withdraw funds. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handlePayFreelancer = async (project) => {
    try {
      const bidAmount = project.acceptedBid?.bidAmount || project.budget?.total || 0
      
      if (wallet.balance < bidAmount) {
        alert(`Insufficient balance. You need ₹${bidAmount} but only have ₹${wallet.balance}. Please add funds first.`)
        return
      }

      const confirmPayment = confirm(
        `Pay ₹${bidAmount} to ${project.freelancerId?.name || 'Freelancer'} for project "${project.title}"?`
      )
      
      if (!confirmPayment) return

      setProcessing(true)
      await api.transferFunds(
        project.freelancerId?._id || project.freelancerId?.id,
        bidAmount,
        project._id,
        `Payment for project: ${project.title}`
      )
      
      await fetchWalletData()
      alert(`Payment of ₹${bidAmount} sent successfully to ${project.freelancerId?.name || 'Freelancer'}!`)
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-slate-600">Loading wallet...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Professional Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <WalletIcon className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Wallet</h1>
            <p className="text-slate-600">Manage your funds and transactions</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchWalletData}
          className="btn-outline flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </motion.button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Balance */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <WalletIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-slate-900">
              {showBalance ? formatCurrency(wallet?.balance || 0) : '••••••'}
            </p>
          </div>
        </motion.div>

        {/* Held Balance */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Held Balance</p>
            <p className="text-2xl font-bold text-slate-900">
              {showBalance ? formatCurrency(wallet?.heldBalance || 0) : '••••••'}
            </p>
          </div>
        </motion.div>

        {/* Total Earned */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Total Earned</p>
            <p className="text-2xl font-bold text-slate-900">
              {showBalance ? formatCurrency(stats?.totalEarned || 0) : '••••••'}
            </p>
          </div>
        </motion.div>

        {/* Total Spent */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-rose-50 rounded-lg border border-rose-200">
              <TrendingDown className="h-5 w-5 text-rose-600" />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-slate-900">
              {showBalance ? formatCurrency(stats?.totalSpent || 0) : '••••••'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Professional Tab Navigation */}
      <div className="card p-4">
        <div className="flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: WalletIcon },
            { id: 'pay', label: 'Pay Freelancers', icon: Send },
            { id: 'transactions', label: 'Transactions', icon: DollarSign }
          ].map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item ${
                  activeTab === tab.id
                    ? 'nav-item-active'
                    : 'nav-item-inactive'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddFunds(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Add Funds</span>
            </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowWithdraw(true)}
          disabled={!wallet?.balance || wallet.balance <= 0}
          className="btn-outline-danger flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="h-5 w-5" />
          <span>Withdraw</span>
        </motion.button>

        {user?.role === 'client' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTransfer(true)}
            disabled={!wallet?.balance || wallet.balance <= 0}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
            <span>Pay Freelancer</span>
          </motion.button>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
          <span className="text-sm text-slate-600">
            {transactions.length} transactions
          </span>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{transaction.description}</p>
                    <p className="text-sm text-slate-600">
                      {formatRelativeTime(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {transaction.status}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <WalletIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No transactions yet</p>
            <p className="text-sm text-slate-500">Your transaction history will appear here</p>
          </div>
        )}
      </div>
        </>
      )}

      {/* Pay Freelancers Tab */}
      {activeTab === 'pay' && user?.role === 'client' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Pay Freelancers</h2>
            <span className="text-sm text-slate-600">
              {activeProjects.length} active projects
            </span>
          </div>

          {activeProjects.length > 0 ? (
            <div className="space-y-4">
              {activeProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-6 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{project.title}</h3>
                        <p className="text-sm text-slate-600 mb-2">
                          Freelancer: <span className="text-slate-900 font-medium">{project.freelancerId?.name || 'Freelancer'}</span>
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-emerald-600 font-medium">
                            Amount: {formatCurrency(project.acceptedBid?.bidAmount || project.budget?.total || 0)}
                          </span>
                          <span className="text-blue-600">
                            Status: In Progress
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right mr-4">
                      <p className="text-sm text-slate-600">Available Balance</p>
                      <p className="font-bold text-slate-900">{formatCurrency(wallet?.balance || 0)}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePayFreelancer(project)}
                      disabled={processing || (wallet?.balance || 0) < (project.acceptedBid?.bidAmount || project.budget?.total || 0)}
                      className="btn-success flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4" />
                          <span>Pay Now</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No active projects</p>
              <p className="text-sm text-slate-500">Projects with assigned freelancers will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Transaction History</h2>
            <span className="text-sm text-slate-600">
              {transactions.length} transactions
            </span>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{transaction.description}</p>
                      <p className="text-sm text-slate-600">
                        {formatRelativeTime(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {transaction.status}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <WalletIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No transactions yet</p>
              <p className="text-sm text-slate-500">Your transaction history will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl border border-slate-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Add Funds</h3>
              <button
                onClick={() => setShowAddFunds(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  step="0.01"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a note..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddFunds(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || !addAmount}
                  className="btn-success flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Add Funds'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl border border-slate-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Withdraw Funds</h3>
              <button
                onClick={() => setShowWithdraw(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                Available Balance: <span className="font-bold">{formatCurrency(wallet?.balance || 0)}</span>
              </p>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Withdrawal Amount (USD)
                </label>
                <input
                  type="number"
                  min="1"
                  max={wallet?.balance || 0}
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Enter amount..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Add a note..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || !withdrawAmount}
                  className="btn-outline-danger flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}