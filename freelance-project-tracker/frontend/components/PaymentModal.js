'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  Send,
  AlertCircle,
  CheckCircle,
  X,
  Wallet as WalletIcon,
  User,
  Clock,
  CreditCard
} from 'lucide-react'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/utils'

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  project, 
  freelancer, 
  user,
  onPaymentComplete 
}) {
  const [wallet, setWallet] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [description, setDescription] = useState('')
  const [paymentType, setPaymentType] = useState('full') // 'full', 'partial', 'milestone'
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && user) {
      console.log('PaymentModal opened with data:', { project, freelancer, user })
      fetchWallet()
      // Set default description
      setDescription(`Payment for project: ${project?.title || 'Untitled Project'}`)
      // Set default amount to accepted bid amount or project budget
      const bidAmount = project?.acceptedBid?.bidAmount || project?.budget?.total || 0
      if (bidAmount > 0) {
        setPaymentAmount(bidAmount.toString())
      }
    }
  }, [isOpen, user, project])

  const fetchWallet = async () => {
    try {
      setLoading(true)
      const walletData = await api.getWallet()
      setWallet(walletData)
    } catch (error) {
      console.error('Failed to fetch wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount')
      return
    }

    if (!wallet || wallet.balance < parseFloat(paymentAmount)) {
      alert('Insufficient wallet balance. Please add funds to your wallet first.')
      return
    }

    if (!freelancer || (!freelancer.id && !freelancer._id && !freelancer.freelancerId)) {
      console.error('Freelancer data is missing or invalid:', freelancer)
      alert('Unable to process payment: Freelancer information is missing')
      return
    }

    if (!project || (!project.id && !project._id)) {
      console.error('Project data is missing or invalid:', project)
      alert('Unable to process payment: Project information is missing')
      return
    }

    try {
      setProcessing(true)
      
      // Handle different possible structures for freelancer ID
      const freelancerId = freelancer.freelancerId || freelancer.id || freelancer._id
      const projectId = project.id || project._id
      
      console.log('Sending payment:', { freelancerId, projectId, amount: parseFloat(paymentAmount), freelancer, project })
      
      await api.transferFunds(
        freelancerId,
        parseFloat(paymentAmount),
        projectId,
        description
      )

      alert(`Payment of ${formatCurrency(parseFloat(paymentAmount))} sent successfully!`)
      
      // Refresh wallet data
      await fetchWallet()
      
      // Call parent callback if provided
      if (onPaymentComplete) {
        onPaymentComplete()
      }
      
      onClose()
    } catch (error) {
      console.error('Payment error:', error)
      alert(error.message || 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleAddFunds = async () => {
    try {
      const amount = prompt('Enter amount to add to wallet (USD):')
      if (!amount || parseFloat(amount) <= 0) return

      setProcessing(true)
      await api.addFunds(parseFloat(amount), 'Added funds for project payment')
      await fetchWallet()
      alert(`Successfully added ${formatCurrency(parseFloat(amount))} to your wallet!`)
    } catch (error) {
      console.error('Add funds error:', error)
      alert('Failed to add funds. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-lg border border-gray-600 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Send className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Send Payment</h3>
              <p className="text-sm text-gray-400">Pay freelancer for project work</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="ml-3 text-gray-300">Loading wallet...</span>
          </div>
        ) : (
          <>
            {/* Project & Freelancer Info */}
            <div className="mb-6 space-y-4">
              <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                <h4 className="font-semibold text-white mb-2">Project Details</h4>
                <p className="text-gray-300">{project?.title}</p>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Budget: {formatCurrency(project?.budget?.total || 0)}</p>
                  {project?.acceptedBid?.bidAmount && (
                    <p className="text-green-400 font-medium">
                      Accepted Bid: {formatCurrency(project.acceptedBid.bidAmount)}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                <h4 className="font-semibold text-white mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Freelancer
                </h4>
                <p className="text-gray-300">{freelancer?.name}</p>
                <p className="text-sm text-gray-400">{freelancer?.email}</p>
              </div>
            </div>

            {/* Wallet Balance */}
            <div className="mb-6 p-4 bg-blue-500/10 rounded-lg border border-blue-400/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <WalletIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-blue-300 font-medium">Wallet Balance</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    {formatCurrency(wallet?.balance || 0)}
                  </p>
                  {wallet?.heldBalance > 0 && (
                    <p className="text-xs text-yellow-400">
                      +{formatCurrency(wallet.heldBalance)} held
                    </p>
                  )}
                </div>
              </div>
              
              {(!wallet || wallet.balance === 0) && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Insufficient balance</span>
                  </div>
                  <button
                    onClick={handleAddFunds}
                    disabled={processing}
                    className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-400/30 rounded text-sm hover:bg-green-500/30 transition-colors"
                  >
                    Add Funds
                  </button>
                </div>
              )}
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePayment} className="space-y-4">
              {/* Payment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType('full')
                      setPaymentAmount((project?.acceptedBid?.bidAmount || project?.budget?.total || 0).toString())
                    }}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      paymentType === 'full'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    Full Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType('partial')
                      setPaymentAmount('')
                    }}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      paymentType === 'partial'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    Partial
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType('milestone')
                      setPaymentAmount('')
                    }}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      paymentType === 'milestone'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    Milestone
                  </button>
                </div>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Amount (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max={wallet?.balance || 0}
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter amount..."
                    required
                  />
                </div>
                {parseFloat(paymentAmount) > (wallet?.balance || 0) && (
                  <p className="text-xs text-red-400 mt-1">
                    Amount exceeds wallet balance
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Payment description..."
                  required
                />
              </div>

              {/* Payment Summary */}
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-400/30">
                <h4 className="font-medium text-green-300 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Payment Summary
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white font-medium">
                      {paymentAmount ? formatCurrency(parseFloat(paymentAmount)) : '₹0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Remaining Balance:</span>
                    <span className="text-white font-medium">
                      {formatCurrency((wallet?.balance || 0) - (parseFloat(paymentAmount) || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    processing || 
                    !paymentAmount || 
                    parseFloat(paymentAmount) <= 0 ||
                    parseFloat(paymentAmount) > (wallet?.balance || 0)
                  }
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Send className="h-4 w-4" />
                      <span>Send Payment</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
        </div>
      </motion.div>
    </div>
  )
}