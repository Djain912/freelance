'use client'

import { useState, useEffect } from 'react'
import AdminLogin from '../../components/AdminLogin'
import AdminDashboard from '../../components/AdminDashboard'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if admin is already logged in
    const storedAdmin = localStorage.getItem('adminUser')
    if (storedAdmin) {
      try {
        const user = JSON.parse(storedAdmin)
        if (user.role === 'admin') {
          setAdminUser(user)
          setIsAuthenticated(true)
        }
      } catch (error) {
        localStorage.removeItem('adminUser')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (user) => {
    setAdminUser(user)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminUser')
    setAdminUser(null)
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return (
    <div>
      {/* Logout button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="btn-outline text-sm"
        >
          Logout
        </button>
      </div>
      <AdminDashboard user={adminUser} />
    </div>
  )
}