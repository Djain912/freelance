'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { io } from 'socket.io-client'
import { api } from '../lib/api'

export default function LiveFeed({ user }) {
  const [notifications, setNotifications] = useState([])
  const [socket, setSocket] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeSocket()
    fetchNotifications()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  const initializeSocket = () => {
    const token = localStorage.getItem('token')
    const newSocket = io('http://localhost:4000', {
      auth: { token }
    })

    newSocket.on('connect', () => {
      console.log('Connected to notification feed')
    })

    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev])
    })

    newSocket.on('project_update', (data) => {
      const notification = {
        _id: Date.now().toString(),
        type: 'project_update',
        title: 'Project Updated',
        message: `Project "${data.project.title}" has been updated`,
        createdAt: new Date().toISOString(),
        read: false
      }
      setNotifications(prev => [notification, ...prev])
    })

    newSocket.on('message_received', (data) => {
      const notification = {
        _id: Date.now().toString(),
        type: 'message',
        title: 'New Message',
        message: `New message from ${data.sender.name}`,
        createdAt: new Date().toISOString(),
        read: false
      }
      setNotifications(prev => [notification, ...prev])
    })

    setSocket(newSocket)
  }

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setNotifications([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      )
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'project_update': return '📋'
      case 'message': return '💬'
      case 'payment': return '💰'
      case 'milestone': return '🎯'
      case 'system': return '⚙️'
      default: return '🔔'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'project_update': return 'border-blue-200 bg-blue-50'
      case 'message': return 'border-green-200 bg-green-50'
      case 'payment': return 'border-yellow-200 bg-yellow-50'
      case 'milestone': return 'border-purple-200 bg-purple-50'
      case 'system': return 'border-gray-200 bg-gray-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-20 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Feed</h2>
          <p className="text-gray-600">Real-time updates and notifications</p>
        </div>
        
        {Array.isArray(notifications) && notifications.some(n => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="btn btn-outline text-sm"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Connection Status */}
      <div className="flex items-center space-x-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${
          socket?.connected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-gray-600">
          {socket?.connected ? 'Connected to live feed' : 'Connecting...'}
        </span>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-3xl">🔔</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">
              New notifications will appear here as they come in.
            </p>
          </motion.div>
        ) : (
          notifications.map((notification, index) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-card ${
                notification.read 
                  ? 'bg-white border-gray-200' 
                  : getNotificationColor(notification.type)
              }`}
              onClick={() => !notification.read && markAsRead(notification._id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    notification.read ? 'bg-gray-100' : 'bg-white'
                  }`}>
                    <span className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      notification.read ? 'text-gray-700' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full" />
                      )}
                    </div>
                  </div>
                  <p className={`text-sm mt-1 ${
                    notification.read ? 'text-gray-500' : 'text-gray-700'
                  }`}>
                    {notification.message}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Live Feed Indicator */}
      {socket?.connected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 bg-primary-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium"
        >
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-white rounded-full"
            />
            <span>Live</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
