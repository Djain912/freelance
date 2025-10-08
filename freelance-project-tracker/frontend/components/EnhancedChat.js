'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { io } from 'socket.io-client'
import { api } from '../lib/api'

export default function Chat({ user }) {
  const [allUsers, setAllUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState('users') // 'users' or 'conversations'
  const messagesEndRef = useRef(null)

  useEffect(() => {
    initializeSocket()
    fetchAllUsers()
    fetchConversations()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation)
    }
  }, [activeConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchAllUsers = async () => {
    try {
      const users = await api.getUsers()
      console.log('Fetched users:', users)
      
      // Add avatars based on role
      const usersWithAvatars = users.map(user => ({
        ...user,
        avatar: user.role === 'client' ? '👨‍💼' : user.role === 'freelancer' ? '👩‍💻' : '�'
      }))
      
      setAllUsers(usersWithAvatars)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setAllUsers([])
    } finally {
      setLoading(false)
    }
  }

  const initializeSocket = () => {
    const token = localStorage.getItem('token')
    const newSocket = io('http://localhost:4000', {
      auth: { token }
    })

    newSocket.on('connect', () => {
      console.log('Connected to chat')
    })

    newSocket.on('message_received', (data) => {
      if (data.conversation === activeConversation) {
        setMessages(prev => [...prev, data.message])
      }
      
      // Update conversation list with latest message
      setConversations(prev =>
        prev.map(conv =>
          conv._id === data.conversation
            ? { ...conv, lastMessage: data.message }
            : conv
        )
      )
    })

    setSocket(newSocket)
  }

  const startConversationWithUser = async (targetUser) => {
    try {
      setSelectedUser(targetUser)
      // Create a mock conversation ID
      const conversationId = `${user.id}-${targetUser._id}`
      setActiveConversation(conversationId)
      
      // Mock messages for demo
      const mockMessages = [
        {
          _id: '1',
          content: `Hi ${targetUser.name}! I'd like to discuss a project with you.`,
          senderId: user.id,
          conversationId: conversationId,
          sentAt: new Date(Date.now() - 3600000) // 1 hour ago
        },
        {
          _id: '2',
          content: `Hello ${user.name}! I'd be happy to discuss your project. What kind of work are you looking for?`,
          senderId: targetUser._id,
          conversationId: conversationId,
          sentAt: new Date(Date.now() - 1800000) // 30 minutes ago
        }
      ]
      
      setMessages(mockMessages)
      setActiveTab('conversations')
    } catch (error) {
      console.error('Failed to start conversation:', error)
    }
  }

  const fetchConversations = async () => {
    try {
      // Mock conversations for demo
      const mockConversations = []
      setConversations(mockConversations)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      setConversations([])
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      // Mock messages based on conversation ID
      if (selectedUser) {
        const mockMessages = [
          {
            _id: '1',
            content: `Hi ${selectedUser.name}! I'd like to discuss a project with you.`,
            senderId: user.id,
            conversationId: conversationId,
            sentAt: new Date(Date.now() - 3600000)
          },
          {
            _id: '2',
            content: `Hello ${user.name}! I'd be happy to discuss your project. What kind of work are you looking for?`,
            senderId: selectedUser._id,
            conversationId: conversationId,
            sentAt: new Date(Date.now() - 1800000)
          }
        ]
        setMessages(mockMessages)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation || sending) return

    setSending(true)
    try {
      // Mock sending message
      const mockMessage = {
        _id: Date.now().toString(),
        content: newMessage,
        senderId: user.id,
        conversationId: activeConversation,
        sentAt: new Date()
      }
      
      setMessages(prev => [...prev, mockMessage])
      setNewMessage('')
      
      // Mock response after 1 second
      setTimeout(() => {
        if (selectedUser) {
          const responseMessage = {
            _id: (Date.now() + 1).toString(),
            content: "Thanks for your message! I'll get back to you soon.",
            senderId: selectedUser._id,
            conversationId: activeConversation,
            sentAt: new Date()
          }
          setMessages(prev => [...prev, responseMessage])
        }
      }, 1000)
      
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-96">
            <div className="bg-gray-200 rounded"></div>
            <div className="md:col-span-2 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Users ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('conversations')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'conversations'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Conversations ({conversations.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-96">
        {/* Left Panel - Users or Conversations List */}
        <div className="bg-white rounded-lg shadow p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">
              {activeTab === 'users' ? 'All Users' : 'Conversations'}
            </h3>
          </div>
          
          <div className="overflow-y-auto h-full">
            {activeTab === 'users' ? (
              // Users List
              allUsers.length === 0 ? (
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-gray-400 text-2xl">👥</span>
                  </div>
                  <p className="text-sm text-gray-500">No users available</p>
                </div>
              ) : (
                allUsers.map((targetUser) => (
                  <motion.div
                    key={targetUser._id}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                      selectedUser?._id === targetUser._id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => startConversationWithUser(targetUser)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-lg">{targetUser.avatar || '👤'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {targetUser.name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {targetUser.role}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Online
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )
            ) : (
              // Conversations List
              conversations.length === 0 ? (
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-gray-400 text-2xl">💬</span>
                  </div>
                  <p className="text-sm text-gray-500">No conversations yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start chatting with users to see conversations here</p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const recipient = conversation.participants.find(p => p._id !== user._id)
                  const isActive = activeConversation === conversation._id
                  
                  return (
                    <motion.div
                      key={conversation._id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                        isActive ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setActiveConversation(conversation._id)}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-lg">{recipient?.avatar || '👤'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {recipient?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-xs text-gray-400">
                          {conversation.lastMessage && new Date(conversation.lastMessage.sentAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 bg-white rounded-lg shadow flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm">{selectedUser?.avatar || '👤'}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedUser?.name || 'Chat'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedUser?.role && `${selectedUser.role} • `}Online
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.senderId === user.id
                  return (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.sentAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? '...' : 'Send'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">💬</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start a conversation
                </h3>
                <p className="text-gray-500">
                  Select a user from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
