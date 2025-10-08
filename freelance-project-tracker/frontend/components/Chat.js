'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip,
  Smile,
  ArrowLeft,
  Users,
  Clock,
  CheckCheck,
  Check
} from 'lucide-react'
import { api } from '../lib/api'
import VideoCallModal from './VideoCallModal'

export default function Chat({ user }) {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState([])
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [showVideoCallModal, setShowVideoCallModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    fetchUsers()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (activeConversation) {
      // Use the otherUser._id for fetching messages
      const otherUserId = activeConversation.otherUser?._id || 
                         activeConversation.participants?.find(p => p._id !== user._id)?._id
      if (otherUserId) {
        fetchMessages(otherUserId)
      }
    }
  }, [activeConversation])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await api.getConversations()
      console.log('Conversations response:', response)
      
      // Transform backend response to match our component expectations
      const transformedConversations = response.map(conv => ({
        id: conv.otherUser._id,
        otherUser: conv.otherUser,
        participants: [user, conv.otherUser],
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount
      }))
      
      setConversations(transformedConversations)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (otherUserId) => {
    try {
      const response = await api.getMessages(otherUserId)
      console.log('Messages response:', response)
      setMessages(response)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      setMessages([])
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.getUsers()
      // Filter out current user and users already in conversations
      const availableUsers = response.filter(u => {
        if (u._id === user._id) return false
        return !conversations.some(conv => 
          conv.participants.some(p => p._id === u._id)
        )
      })
      setUsers(availableUsers)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation || sending) return

    setSending(true)
    try {
      const recipientId = activeConversation.otherUser?._id || 
                         activeConversation.participants?.find(p => p._id !== user._id)?._id
      
      if (!recipientId) {
        throw new Error('No recipient found')
      }

      await api.sendMessage(recipientId, newMessage.trim())
      setNewMessage('')
      
      // Refresh messages
      await fetchMessages(recipientId)
      
      // Refresh conversations to update last message
      await fetchConversations()
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const startNewConversation = async (recipientId) => {
    try {
      // Send a placeholder message to start the conversation
      await api.sendMessage(recipientId, 'Hello!')
      
      // Refresh conversations
      await fetchConversations()
      
      // Close modal
      setShowNewChatModal(false)
      
      // Find and select the new conversation
      const updatedConversations = await api.getConversations()
      const newConv = updatedConversations.find(conv => 
        conv.otherUser._id === recipientId
      )
      if (newConv) {
        // Create a compatible conversation object for activeConversation
        const compatibleConv = {
          id: newConv.otherUser._id,
          otherUser: newConv.otherUser,
          participants: [user, newConv.otherUser],
          lastMessage: newConv.lastMessage,
          unreadCount: newConv.unreadCount
        }
        setActiveConversation(compatibleConv)
      }
    } catch (error) {
      console.error('Failed to start conversation:', error)
      alert('Failed to start conversation. Please try again.')
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString()
  }

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-200px)] bg-white rounded-2xl shadow-lg border border-gray-200 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              Messages
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewChatModal(true)}
              className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
            </motion.button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-2">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No conversations yet</p>
              <p className="text-sm text-gray-400 mt-1">Start a new chat to get started!</p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = conversation.otherUser || 
                             conversation.participants?.find(p => p._id !== user._id)
              const isActive = activeConversation?.id === conversation.id

              return (
                <motion.div
                  key={conversation.id}
                  whileHover={{ backgroundColor: '#f8fafc' }}
                  onClick={() => setActiveConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                    isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                        {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {otherUser?.name || 'Unknown User'}
                        </h3>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {conversation.lastMessage?.createdAt && formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {conversation.lastMessage?.text || 'No messages yet'}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 capitalize px-2 py-1 bg-gray-100 rounded-full">
                          {otherUser?.role || 'User'}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {(activeConversation.otherUser?.name || 
                      activeConversation.participants?.find(p => p._id !== user._id)?.name)?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {activeConversation.otherUser?.name || 
                       activeConversation.participants?.find(p => p._id !== user._id)?.name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Online • {activeConversation.otherUser?.role || 
                               activeConversation.participants?.find(p => p._id !== user._id)?.role || 'User'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <Phone className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowVideoCallModal(true)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    title="Start Video Call"
                  >
                    <Video className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Start the conversation!</p>
                  <p className="text-sm text-gray-400 mt-1">Send a message to get things rolling</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.senderId._id === user._id || message.senderId === user._id
                  
                  return (
                    <motion.div
                      key={message._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        isOwn 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <div className={`flex items-center justify-between mt-2 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                          <p className="text-xs">
                            {formatTime(message.createdAt)}
                          </p>
                          {isOwn && (
                            <CheckCheck className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <Paperclip className="h-5 w-5" />
                </motion.button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                    disabled={sending}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900"
                  >
                    <Smile className="h-5 w-5" />
                  </motion.button>
                </div>
                
                <motion.button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </motion.button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Messages</h3>
              <p className="text-gray-500 mb-4">Choose a conversation from the sidebar to start messaging</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewChatModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                Start New Chat
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-6 w-6 text-blue-600" />
                Start New Chat
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No users available</p>
                  <p className="text-sm text-gray-400 mt-1">All users are already in your conversations</p>
                </div>
              ) : (
                users.map((availableUser) => (
                  <motion.div
                    key={availableUser._id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => startNewConversation(availableUser._id)}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                      {availableUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{availableUser.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{availableUser.role}</p>
                    </div>
                    <ArrowLeft className="h-5 w-5 text-gray-400 rotate-180" />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Video Call Modal */}
      <VideoCallModal 
        isOpen={showVideoCallModal}
        onClose={() => setShowVideoCallModal(false)}
        projectId={activeConversation?.projectId || 'general'}
        userId={user?._id}
        userName={user?.name}
      />
    </div>
  )
}
