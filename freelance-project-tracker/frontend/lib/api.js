const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_API_URL 
  : 'http://localhost:4000'

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  getToken() {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getToken()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }))
        throw new Error(error.message || `Request failed with status ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Auth methods
  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getMe() {
    return this.request('/api/auth/me')
  }

  // Projects methods
  async getProjects() {
    const response = await this.request('/api/projects')
    return response.projects || []
  }

  async getProject(id) {
    return this.request(`/api/projects/${id}`)
  }

  async createProject(projectData) {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    })
  }

  async updateProject(id, projectData) {
    return this.request(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    })
  }

  async deleteProject(id) {
    return this.request(`/api/projects/${id}`, {
      method: 'DELETE',
    })
  }

  async submitBid(projectId, bidData) {
    return this.request(`/api/projects/${projectId}/bid`, {
      method: 'POST',
      body: JSON.stringify(bidData),
    })
  }

  async acceptBid(projectId, freelancerId) {
    return this.request(`/api/projects/${projectId}/accept-bid`, {
      method: 'POST',
      body: JSON.stringify({ freelancerId }),
    })
  }

  async rejectBid(projectId, freelancerId) {
    return this.request(`/api/projects/${projectId}/reject-bid`, {
      method: 'POST',
      body: JSON.stringify({ freelancerId }),
    })
  }

  async updateProjectStatus(projectId, status) {
    return this.request(`/api/projects/${projectId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async markProjectComplete(projectId) {
    return this.request(`/api/projects/${projectId}/mark-complete`, {
      method: 'POST',
    })
  }

  // Messages methods
  async getConversations() {
    const response = await this.request('/api/messages')
    return response.conversations || []
  }

  async getMessages(withUserId) {
    const response = await this.request(`/api/messages/${withUserId}`)
    return response.messages || []
  }

  async sendMessage(recipientId, text, projectId = null) {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ 
        recipientId, 
        text,
        ...(projectId && { projectId })
      }),
    })
  }

  async getUnreadCount() {
    const response = await this.request('/api/messages/unread/count')
    return response.count || 0
  }

  // Profile methods
  async getProfile() {
    const response = await this.request('/api/profiles/me')
    return response.profile || response
  }

  async updateProfile(profileData) {
    const response = await this.request('/api/profiles/me', {
      method: 'POST',
      body: JSON.stringify(profileData),
    })
    return response.profile || response
  }

  async createProfile(profileData) {
    const response = await this.request('/api/profiles/me', {
      method: 'POST',
      body: JSON.stringify(profileData),
    })
    return response.profile || response
  }

  // Users methods
  async getUsers() {
    const response = await this.request('/api/auth/users')
    return response
  }

  // Notifications methods
  async getNotifications() {
    const response = await this.request('/api/notifications')
    return response.notifications || []
  }

  async markNotificationRead(id) {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    })
  }

  async markAllNotificationsRead() {
    return this.request('/api/notifications/mark-all-read', {
      method: 'PATCH',
    })
  }

  // Payments methods
  async getTransactions() {
    const response = await this.request('/api/payments')
    return response.transactions || []
  }

  async holdPayment(projectId, amount) {
    return this.request('/api/payments/hold', {
      method: 'POST',
      body: JSON.stringify({ projectId, amount }),
    })
  }

  async releasePayment(transactionId) {
    return this.request('/api/payments/release', {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
    })
  }

  async refundPayment(transactionId) {
    return this.request('/api/payments/refund', {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
    })
  }

  // Wallet methods
  async getWallet() {
    const response = await this.request('/api/wallet/me')
    return response.wallet || {}
  }

  async getWalletStats() {
    const response = await this.request('/api/wallet/stats')
    return response.stats || {}
  }

  async getWalletTransactions(limit = 50, offset = 0) {
    const response = await this.request(`/api/wallet/transactions?limit=${limit}&offset=${offset}`)
    return {
      transactions: response.transactions || [],
      total: response.total || 0
    }
  }

  async addFunds(amount, description) {
    return this.request('/api/wallet/add-funds', {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    })
  }

  async transferFunds(freelancerId, amount, projectId, description) {
    return this.request('/api/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify({ freelancerId, amount, projectId, description }),
    })
  }

  async holdFunds(amount, projectId, description) {
    return this.request('/api/wallet/hold', {
      method: 'POST',
      body: JSON.stringify({ amount, projectId, description }),
    })
  }

  async releaseFunds(freelancerId, amount, projectId, description) {
    return this.request('/api/wallet/release', {
      method: 'POST',
      body: JSON.stringify({ freelancerId, amount, projectId, description }),
    })
  }

  async withdrawFunds(amount, description) {
    return this.request('/api/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    })
  }

  // Project reporting methods
  async reportProject(projectId, reportData) {
    return this.request(`/api/projects/${projectId}/report`, {
      method: 'POST',
      body: JSON.stringify(reportData),
    })
  }

  // Admin methods
  async getAdminProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/api/admin/projects${queryString ? '?' + queryString : ''}`)
  }

  async getAllTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/api/admin/transactions${queryString ? '?' + queryString : ''}`)
  }

  async getAdminStats() {
    return this.request('/api/admin/stats')
  }

  async deleteProject(projectId) {
    return this.request(`/api/admin/projects/${projectId}`, {
      method: 'DELETE',
    })
  }

  async resolveProjectReport(projectId, action) {
    return this.request(`/api/admin/projects/${projectId}/resolve-report`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    })
  }
}

export const api = new ApiClient()
export default api
