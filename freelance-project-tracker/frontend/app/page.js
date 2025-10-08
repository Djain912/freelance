'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Home as HomeIcon,
  BarChart3, 
  Briefcase, 
  Bell, 
  User, 
  MessageSquare, 
  LogOut,
  Zap,
  Menu,
  X,
  DollarSign
} from 'lucide-react'
import Dashboard from '../components/Dashboard'
import LiveFeed from '../components/LiveFeed'
import Profile from '../components/Profile'
import Chat from '../components/Chat'
import HomePage from '../components/HomePage'
import Login from '../components/Login'
import ProjectManagement from '../components/ProjectManagement'
import Wallet from '../components/Wallet'

export default function Home() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('DEBUG - Token from localStorage:', token)
      if (!token) {
        console.log('DEBUG - No token found')
        setLoading(false)
        return
      }

      console.log('DEBUG - Making request to /api/auth/me')
      const response = await fetch('http://localhost:4000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('DEBUG - Auth response status:', response.status)
      if (response.ok) {
        const userData = await response.json()
        console.log('DEBUG - User data from server:', userData)
        setUser(userData)
      } else {
        console.log('DEBUG - Auth response not OK, removing token')
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      
      // Fallback: try to get user data from localStorage
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          console.log('DEBUG - Using fallback user data from localStorage:', userData)
          setUser(userData)
        } catch (parseError) {
          console.error('Failed to parse stored user data:', parseError)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } else {
        localStorage.removeItem('token')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setActiveTab('home')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setActiveTab('home')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  const tabs = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'wallet', label: 'Wallet', icon: DollarSign },
    { id: 'feed', label: 'Live Feed', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ]

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage user={user} />
      case 'dashboard':
        return <Dashboard user={user} />
      case 'projects':
        return <ProjectManagement user={user} />
      case 'wallet':
        return <Wallet user={user} />
      case 'feed':
        return <LiveFeed user={user} />
      case 'profile':
        return <Profile user={user} />
      case 'chat':
        return <Chat user={user} />
      default:
        return <HomePage user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Unified Header and Navigation */}
      <header className="nav-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gradient">
                  Freelance Tracker
                </h1>
              </motion.div>
            </div>

            {/* Center Navigation (Desktop) */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-8">
              <div className="flex items-center space-x-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`nav-item ${
                        activeTab === tab.id ? 'nav-item-active' : 'nav-item-inactive'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* User Info and Logout (Desktop) */}
            <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.name || 'Guest'}
                  </p>
                  <p className="text-xs text-gray-500">Welcome back</p>
                </div>
                {user && (
                  <div className="flex items-center space-x-2">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-3 h-3 rounded-full shadow-lg ${
                        user.role === 'client' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} 
                    />
                    <span className="text-xs font-semibold text-gray-600 capitalize px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full border border-gray-300">
                      {user.role}
                    </span>
                  </div>
                )}
              </div>
              {user && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </motion.button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Enhanced Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden border-t border-gray-200/50 pt-4 pb-4 space-y-2 bg-white/90 backdrop-blur-lg"
            >
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              )}
            </motion.div>
          )}
        </div>
      </header>

      {/* Enhanced Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page Title with Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-gray-600 text-lg">
              {user?.role === 'client' ? 'Manage your projects and find talented freelancers' : 'Discover exciting projects and grow your career'}
            </p>
          </motion.div>

          {/* Enhanced Content Container */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden"
          >
            <div className="p-6 lg:p-8">
              {renderActiveTab()}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
