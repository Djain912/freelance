'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, UserCheck, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react'
import { api } from '../lib/api'

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: 'client@example.com', // Auto-fill with seeded data
    password: 'password',
    name: '',
    role: 'client'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let data
      if (isLogin) {
        data = await api.login(formData.email, formData.password)
      } else {
        data = await api.register(formData)
      }

      if (data.token) {
        localStorage.setItem('token', data.token)
        onLogin(data.user)
      } else {
        setError(data.message || 'Authentication failed')
      }
    } catch (error) {
      setError(error.message || 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const switchToDemo = (role) => {
    const demoCredentials = {
      client: { email: 'client@example.com', password: 'password', role: 'client' },
      freelancer: { email: 'freelancer@example.com', password: 'password', role: 'freelancer' }
    }
    
    setFormData({
      ...formData,
      ...demoCredentials[role]
    })
    setIsLogin(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-lg shadow-card-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gradient">
              Freelance Tracker
            </h1>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </p>
          </div>

          {/* Demo Buttons */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3 text-center">
              Quick Demo Access:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => switchToDemo('client')}
                className="btn btn-outline text-sm"
              >
                👔 Client Demo
              </button>
              <button
                type="button"
                onClick={() => switchToDemo('freelancer')}
                className="btn btn-outline text-sm"
              >
                💼 Freelancer Demo
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded"
                >
                  {error}
                </motion.div>
              )}

              {!isLogin && (
                <div>
                  <label htmlFor="name" className="label">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    className="input"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="role" className="label">
                    Account Type
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="input"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="client">Client</option>
                    <option value="freelancer">Freelancer</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border border-white border-t-transparent rounded-full"
                  />
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'
                }
              </button>
            </div>
          </div>
        </div>

        {/* Demo Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center"
        >
          <h3 className="font-medium text-gray-900 mb-2">Demo Information</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Client:</strong> client@example.com / password</p>
            <p><strong>Freelancer:</strong> freelancer@example.com / password</p>
            <p className="text-xs text-gray-500 mt-2">
              Demo includes sample projects, messages, and transactions
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
