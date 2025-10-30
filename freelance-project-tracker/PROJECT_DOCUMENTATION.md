# 📋 Freelance Project Tracker - Complete Project Documentation

> **Last Updated:** October 9, 2025  
> **Version:** 1.0.0  
> **Purpose:** This document provides comprehensive technical documentation for creating software diagrams, reports, and understanding the complete system architecture.

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Authentication & Authorization](#authentication--authorization)
7. [Features & Modules](#features--modules)
8. [User Roles & Permissions](#user-roles--permissions)
9. [Data Flow Diagrams](#data-flow-diagrams)
10. [Business Logic](#business-logic)
11. [File Structure](#file-structure)
12. [Dependencies](#dependencies)
13. [Demo Data](#demo-data)
14. [Deployment Information](#deployment-information)

---

## 1. Project Overview

### 1.1 Project Name
**Freelance Project Tracker (FPT)**

### 1.2 Description
A comprehensive web-based platform that connects clients with freelancers, enabling project management, milestone tracking, secure payments, real-time messaging, and administrative oversight. The platform facilitates the entire freelance workflow from project posting to completion and payment.

### 1.3 Core Objectives
- **Client Management:** Enable clients to post projects, hire freelancers, and manage payments
- **Freelancer Management:** Allow freelancers to bid on projects, track work, and receive payments
- **Payment Security:** Implement escrow-style payment system with held and released funds
- **Communication:** Real-time messaging between clients and freelancers
- **Admin Oversight:** Platform administration with reporting and user management capabilities

### 1.4 Target Users
1. **Clients** - Individuals or businesses looking to hire freelancers
2. **Freelancers** - Service providers offering their skills
3. **Administrators** - Platform managers overseeing operations

---

## 2. System Architecture

### 2.1 Architecture Pattern
**Three-Tier Architecture (Client-Server Model)**

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│                    (Frontend - Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │ Projects │  │ Messages │  │  Wallet  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│                   (Backend - Node.js/Express)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │ Projects │  │ Messages │  │ Payments │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Middleware (Auth, Validation)              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      Services (Notifications, Payments, Wallet)      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│                      (MongoDB Database)                      │
│  ┌────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────────┐  │
│  │ Users  │ │Projects │ │Transactions│ │  Notifications  │  │
│  └────────┘ └─────────┘ └──────────┘ └─────────────────┘  │
│  ┌────────┐ ┌─────────┐ ┌──────────┐                       │
│  │Profiles│ │Messages │ │ Wallets  │                       │
│  └────────┘ └─────────┘ └──────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 System Components

#### Frontend (Presentation Layer)
- **Framework:** Next.js 14 (React-based)
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **API Communication:** Fetch API / Axios
- **Real-time:** Socket.io Client (for live updates)

#### Backend (Application Layer)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** Express-validator
- **Real-time:** Socket.io Server

#### Database (Data Layer)
- **Database:** MongoDB (NoSQL)
- **ODM:** Mongoose
- **Connection:** MongoDB Driver

---

## 3. Technology Stack

### 3.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.x | React framework with SSR/SSG capabilities |
| **React** | 18.x | UI component library |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Socket.io-client** | 4.x | Real-time bidirectional communication |
| **Lucide React** | - | Icon library |

### 3.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18.x+ | JavaScript runtime |
| **Express.js** | 4.x | Web application framework |
| **MongoDB** | 6.x | NoSQL database |
| **Mongoose** | 8.x | MongoDB object modeling |
| **bcryptjs** | 2.x | Password hashing |
| **jsonwebtoken** | 9.x | JWT authentication |
| **Socket.io** | 4.x | Real-time communication |
| **dotenv** | 16.x | Environment variable management |
| **cors** | 2.x | Cross-origin resource sharing |

### 3.3 Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Nodemon** | Auto-restart during development |
| **Git** | Version control |

---

## 4. Database Schema

### 4.1 Collections Overview

The system uses **7 main collections** in MongoDB:

1. **Users** - User authentication and basic info
2. **Profiles** - Detailed user profiles
3. **Projects** - Project listings and management
4. **Transactions** - Payment transactions
5. **Wallets** - User wallet balances
6. **Messages** - Chat messages
7. **Notifications** - User notifications

### 4.2 Detailed Schema Definitions

#### 4.2.1 Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (enum: ['client', 'freelancer', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- One-to-One with Profiles (userId)
- One-to-One with Wallets (userId)
- One-to-Many with Projects (as client or freelancer)
- One-to-Many with Messages (as sender or recipient)
- One-to-Many with Notifications

**Indexes:**
- email (unique)
- role

---

#### 4.2.2 Profiles Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', unique, required),
  bio: String,
  skills: [String],
  experience: Number (years),
  hourlyRate: Number,
  availability: String (enum: ['available', 'busy', 'unavailable']),
  portfolio: [{
    title: String,
    description: String,
    url: String,
    imageUrl: String
  }],
  rating: {
    average: Number (0-5),
    count: Number
  },
  completedProjects: Number,
  location: {
    country: String,
    city: String,
    timezone: String
  },
  languages: [{
    name: String,
    proficiency: String (enum: ['basic', 'conversational', 'fluent', 'native'])
  }],
  socialLinks: {
    github: String,
    linkedin: String,
    website: String,
    twitter: String
  },
  preferences: {
    projectTypes: [String],
    budgetRange: {
      min: Number,
      max: Number
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- One-to-One with Users (userId)

**Indexes:**
- userId (unique)
- skills (for search)

---

#### 4.2.3 Projects Collection

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  clientId: ObjectId (ref: 'User', required),
  freelancerId: ObjectId (ref: 'User'),
  budget: {
    total: Number (required),
    currency: String (default: 'USD')
  },
  skills: [String],
  category: String,
  priority: String (enum: ['low', 'medium', 'high']),
  status: String (enum: ['draft', 'open', 'in_progress', 'completed', 'cancelled']),
  milestones: [{
    _id: ObjectId,
    title: String,
    description: String,
    amount: Number,
    dueDate: Date,
    status: String (enum: ['pending', 'in_progress', 'completed', 'approved']),
    completedAt: Date
  }],
  timeline: {
    startDate: Date,
    endDate: Date,
    estimatedHours: Number
  },
  proposals: [{
    freelancerId: ObjectId (ref: 'User'),
    coverLetter: String,
    proposedBudget: Number,
    estimatedDuration: Number,
    status: String (enum: ['pending', 'accepted', 'rejected']),
    submittedAt: Date
  }],
  bids: [{
    freelancerId: ObjectId (ref: 'User'),
    amount: Number,
    proposedTimeline: Number,
    coverLetter: String,
    status: String (enum: ['pending', 'accepted', 'rejected']),
    createdAt: Date
  }],
  adminFlags: {
    isReported: Boolean,
    reportReason: String,
    reportedAt: Date,
    reportedBy: ObjectId (ref: 'User'),
    adminNotes: String
  },
  healthScore: Number (0-100),
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- Many-to-One with Users (clientId, freelancerId)
- One-to-Many with Transactions (projectId)
- One-to-Many with Messages (projectId)

**Indexes:**
- clientId
- freelancerId
- status
- skills (for search)
- category

---

#### 4.2.4 Transactions Collection

```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: 'Project', required),
  clientId: ObjectId (ref: 'User', required),
  freelancerId: ObjectId (ref: 'User', required),
  milestoneId: ObjectId,
  amount: Number (required),
  status: String (enum: ['held', 'released', 'refunded']),
  description: String,
  paymentMethod: String,
  externalTransactionId: String,
  fees: {
    platform: Number,
    payment: Number
  },
  metadata: {
    holdReason: String,
    releaseReason: String,
    refundReason: String,
    holdAt: Date,
    releaseAt: Date,
    refundAt: Date
  },
  events: [{
    type: String (enum: ['held', 'released', 'refunded']),
    timestamp: Date,
    details: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- Many-to-One with Projects (projectId)
- Many-to-One with Users (clientId, freelancerId)

**Indexes:**
- projectId
- clientId
- freelancerId
- status

---

#### 4.2.5 Wallets Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', unique, required),
  balance: Number (default: 0, min: 0),
  heldBalance: Number (default: 0, min: 0),
  currency: String (default: 'USD'),
  totalEarned: Number (default: 0),
  totalSpent: Number (default: 0),
  transactionHistory: [{
    type: String (enum: ['credit', 'debit', 'hold', 'release', 'refund']),
    amount: Number,
    description: String,
    projectId: ObjectId (ref: 'Project'),
    transactionId: ObjectId (ref: 'Transaction'),
    fromUserId: ObjectId (ref: 'User'),
    toUserId: ObjectId (ref: 'User'),
    status: String (enum: ['pending', 'completed', 'failed', 'cancelled']),
    createdAt: Date
  }],
  lastUpdated: Date,
  createdAt: Date
}
```

**Relationships:**
- One-to-One with Users (userId)

**Indexes:**
- userId (unique)

---

#### 4.2.6 Messages Collection

```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: 'User', required),
  recipientId: ObjectId (ref: 'User', required),
  projectId: ObjectId (ref: 'Project'),
  text: String (required),
  attachments: [{
    filename: String,
    url: String,
    type: String
  }],
  read: Boolean (default: false),
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- Many-to-One with Users (senderId, recipientId)
- Many-to-One with Projects (projectId)

**Indexes:**
- senderId
- recipientId
- projectId
- createdAt

---

#### 4.2.7 Notifications Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  type: String (enum: ['message', 'project_update', 'payment', 'milestone', 'system']),
  title: String (required),
  message: String (required),
  data: {
    projectId: ObjectId,
    fromUserId: ObjectId,
    transactionId: ObjectId,
    amount: Number,
    actionUrl: String
  },
  priority: String (enum: ['low', 'medium', 'high']),
  read: Boolean (default: false),
  readAt: Date,
  createdAt: Date
}
```

**Relationships:**
- Many-to-One with Users (userId)

**Indexes:**
- userId
- read
- createdAt

---

### 4.3 Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌──────────────┐
│    Users    │────1:1──│   Profiles   │
└─────────────┘         └──────────────┘
      │ 1                      
      │                        
      │ *                      
┌─────────────┐         ┌──────────────┐
│  Projects   │────*:1──│    Wallets   │
└─────────────┘         └──────────────┘
      │ *                      │ 1
      │                        │
      │ *                      │ *
┌─────────────┐         ┌──────────────┐
│Transactions │         │   Messages   │
└─────────────┘         └──────────────┘
                              │ *
                              │
                              │ 1
                        ┌──────────────┐
                        │Notifications │
                        └──────────────┘
```

**Key Relationships:**
- User → Profile (1:1)
- User → Wallet (1:1)
- User → Projects (1:Many as client)
- User → Projects (1:Many as freelancer)
- Project → Transactions (1:Many)
- Project → Messages (1:Many)
- User → Messages (1:Many as sender/recipient)
- User → Notifications (1:Many)

---

## 5. API Endpoints

### 5.1 Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|---------------|--------------|----------|
| POST | `/api/auth/register` | Register new user | No | `{email, password, name, role}` | `{token, user}` |
| POST | `/api/auth/login` | User login | No | `{email, password}` | `{token, user}` |
| GET | `/api/auth/me` | Get current user | Yes | - | `{user}` |

---

### 5.2 Profile Routes (`/api/profiles`)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|---------------|--------------|----------|
| GET | `/api/profiles/me` | Get my profile | Yes | - | `{profile}` |
| PUT | `/api/profiles/me` | Update my profile | Yes | `{bio, skills, ...}` | `{profile}` |
| GET | `/api/profiles/:userId` | Get user profile | Yes | - | `{profile}` |
| GET | `/api/profiles/recommend` | Get recommended profiles | Yes | - | `{profiles[]}` |

---

### 5.3 Project Routes (`/api/projects`)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|---------------|--------------|----------|
| GET | `/api/projects` | List all projects | Yes | Query params | `{projects[]}` |
| POST | `/api/projects` | Create new project | Yes (Client) | `{title, description, ...}` | `{project}` |
| GET | `/api/projects/:id` | Get project details | Yes | - | `{project}` |
| PUT | `/api/projects/:id` | Update project | Yes (Owner) | `{title, status, ...}` | `{project}` |
| DELETE | `/api/projects/:id` | Delete project | Yes (Owner) | - | `{message}` |
| POST | `/api/projects/:id/proposals` | Submit proposal | Yes (Freelancer) | `{coverLetter, budget, ...}` | `{proposal}` |
| PUT | `/api/projects/:id/proposals/:proposalId` | Accept/Reject proposal | Yes (Client) | `{status}` | `{proposal}` |
| PUT | `/api/projects/:id/milestone/:idx` | Update milestone | Yes | `{status}` | `{milestone}` |
| POST | `/api/projects/:id/bids` | Submit bid | Yes (Freelancer) | `{amount, timeline, ...}` | `{bid}` |

---

### 5.4 Payment Routes (`/api/payments`)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|---------------|--------------|----------|
| POST | `/api/payments/hold` | Hold payment | Yes (Client) | `{projectId, amount, ...}` | `{transaction}` |
| POST | `/api/payments/:id/release` | Release payment | Yes (Client) | `{reason}` | `{transaction}` |
| POST | `/api/payments/:id/refund` | Refund payment | Yes (Admin/Client) | `{reason}` | `{transaction}` |
| GET | `/api/payments/transactions` | Get transactions | Yes | Query params | `{transactions[]}` |

---

### 5.5 Wallet Routes (`/api/wallet`)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|---------------|--------------|----------|
| GET | `/api/wallet` | Get wallet info | Yes | - | `{wallet}` |
| POST | `/api/wallet/deposit` | Deposit funds | Yes | `{amount}` | `{wallet}` |
| POST | `/api/wallet/withdraw` | Withdraw funds | Yes | `{amount}` | `{wallet}` |
| GET | `/api/wallet/history` | Get transaction history | Yes | Query params | `{transactions[]}` |

---

### 5.6 Message Routes (`/api/messages`)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|---------------|--------------|----------|
| GET | `/api/messages/:withUserId` | Get messages with user | Yes | Query params | `{messages[]}` |
| POST | `/api/messages` | Send message | Yes | `{recipientId, text, ...}` | `{message}` |
| PUT | `/api/messages/:id/read` | Mark as read | Yes | - | `{message}` |
| GET | `/api/messages/conversations` | Get all conversations | Yes | - | `{conversations[]}` |

---

### 5.7 Notification Routes (`/api/notifications`)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|---------------|--------------|----------|
| GET | `/api/notifications` | Get notifications | Yes | Query params | `{notifications[]}` |
| POST | `/api/notifications` | Create notification | Yes | `{userId, type, ...}` | `{notification}` |
| PUT | `/api/notifications/:id/read` | Mark as read | Yes | - | `{notification}` |
| PUT | `/api/notifications/read-all` | Mark all as read | Yes | - | `{message}` |
| DELETE | `/api/notifications/:id` | Delete notification | Yes | - | `{message}` |

---

### 5.8 Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|---------------|--------------|----------|
| GET | `/api/admin/users` | List all users | Yes (Admin) | Query params | `{users[]}` |
| GET | `/api/admin/projects` | List all projects | Yes (Admin) | Query params | `{projects[]}` |
| GET | `/api/admin/stats` | Get platform stats | Yes (Admin) | - | `{stats}` |
| PUT | `/api/admin/projects/:id/flag` | Flag/unflag project | Yes (Admin) | `{reason}` | `{project}` |
| DELETE | `/api/admin/users/:id` | Delete user | Yes (Admin) | - | `{message}` |

---

### 5.9 API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": { /* error details */ }
}
```

---

## 6. Authentication & Authorization

### 6.1 Authentication Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │ Server  │                │ Database │
└─────────┘                └─────────┘                └──────────┘
     │                          │                           │
     │  1. POST /auth/register  │                           │
     │─────────────────────────>│                           │
     │                          │  2. Hash password         │
     │                          │                           │
     │                          │  3. Save user             │
     │                          │──────────────────────────>│
     │                          │                           │
     │                          │  4. User created          │
     │                          │<──────────────────────────│
     │                          │                           │
     │                          │  5. Generate JWT token    │
     │                          │                           │
     │  6. Return token & user  │                           │
     │<─────────────────────────│                           │
     │                          │                           │
     │  7. Store token (localStorage/cookies)              │
     │                          │                           │
     │  8. Subsequent requests with token                   │
     │  Header: Authorization: Bearer <token>              │
     │─────────────────────────>│                           │
     │                          │  9. Verify JWT            │
     │                          │                           │
     │                          │ 10. Process request       │
     │                          │──────────────────────────>│
     │                          │<──────────────────────────│
     │ 11. Return response      │                           │
     │<─────────────────────────│                           │
```

### 6.2 JWT Token Structure

```javascript
// Token Payload
{
  userId: "ObjectId",
  email: "user@example.com",
  role: "client|freelancer|admin",
  iat: 1234567890,  // Issued at
  exp: 1234567890   // Expiration time
}
```

### 6.3 Authorization Matrix

| Role | View Projects | Create Project | Edit Own Project | Delete Project | Submit Bid | Accept Bid | Hold Payment | Release Payment | View All Users | Admin Panel |
|------|--------------|----------------|------------------|----------------|-----------|------------|--------------|-----------------|----------------|-------------|
| **Client** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Freelancer** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 6.4 Middleware Stack

```javascript
// Request Flow
Request → CORS → Body Parser → Auth Middleware → Role Check → Route Handler
```

---

## 7. Features & Modules

### 7.1 Core Features

#### Feature 1: User Management
**Description:** Complete user lifecycle management with role-based access

**Components:**
- User registration and login
- Profile creation and editing
- Role assignment (Client/Freelancer/Admin)
- Password hashing and security
- JWT-based authentication

**User Stories:**
- As a user, I can register with email and password
- As a user, I can login and receive a secure token
- As a user, I can view and edit my profile
- As a user, my password is securely hashed

---

#### Feature 2: Project Management
**Description:** Full project lifecycle from posting to completion

**Components:**
- Project creation with milestones
- Project status tracking (draft, open, in_progress, completed, cancelled)
- Milestone management
- Project health score calculation
- Project search and filtering

**User Stories:**
- As a client, I can create projects with detailed requirements
- As a client, I can define milestones with amounts and due dates
- As a freelancer, I can view available projects
- As a user, I can search projects by skills and category
- As a client, I can track project progress with health scores

---

#### Feature 3: Bidding & Proposals
**Description:** Enable freelancers to bid on projects and clients to accept

**Components:**
- Bid submission with cover letter
- Proposal management
- Bid acceptance/rejection
- Freelancer assignment to project

**User Stories:**
- As a freelancer, I can submit bids on open projects
- As a client, I can review proposals from freelancers
- As a client, I can accept or reject proposals
- As a freelancer, I get notified when my bid is accepted

---

#### Feature 4: Payment System
**Description:** Secure escrow-style payment management

**Components:**
- Payment holding (escrow)
- Payment release after milestone completion
- Refund processing
- Platform fee calculation
- Transaction history tracking

**User Stories:**
- As a client, I can hold payment for a milestone
- As a client, I can release payment when work is completed
- As a freelancer, I receive payment when milestone is approved
- As a user, I can view all transaction history
- As admin, I can process refunds

**Payment Flow:**
```
1. Client holds payment → Status: HELD
2. Freelancer completes work
3. Client approves milestone
4. Payment released → Status: RELEASED
5. Funds transferred to freelancer's wallet
```

---

#### Feature 5: Wallet Management
**Description:** Digital wallet for managing funds

**Components:**
- Wallet balance tracking
- Held balance (escrow)
- Total earned/spent tracking
- Transaction history
- Deposit and withdrawal

**User Stories:**
- As a user, I can view my wallet balance
- As a freelancer, I can see my total earnings
- As a client, I can see my total spending
- As a user, I can view detailed transaction history
- As a user, I can deposit funds to my wallet

---

#### Feature 6: Real-time Messaging
**Description:** Chat system for client-freelancer communication

**Components:**
- One-to-one messaging
- Project-specific conversations
- Message read status
- Real-time message delivery (Socket.io)
- Conversation list

**User Stories:**
- As a user, I can send messages to other users
- As a user, I can see when messages are read
- As a user, I receive real-time message notifications
- As a user, I can view all my conversations
- As a user, I can see project-related messages

---

#### Feature 7: Notification System
**Description:** Real-time notifications for important events

**Components:**
- Multiple notification types (message, project_update, payment, milestone, system)
- Read/unread status
- Priority levels
- In-app notifications
- Notification history

**User Stories:**
- As a user, I receive notifications for important events
- As a user, I can mark notifications as read
- As a user, I can see notification history
- As a user, I can filter notifications by type
- As a user, I receive high-priority alerts immediately

**Notification Types:**
- `message` - New message received
- `project_update` - Project status changed
- `payment` - Payment held/released/refunded
- `milestone` - Milestone completed/approved
- `system` - Platform announcements

---

#### Feature 8: Admin Dashboard
**Description:** Platform administration and oversight

**Components:**
- User management
- Project oversight
- Transaction monitoring
- Report handling
- Platform statistics

**User Stories:**
- As admin, I can view all users
- As admin, I can view all projects
- As admin, I can handle reported projects
- As admin, I can view platform statistics
- As admin, I can manage disputes

---

### 7.2 Additional Features

#### Advanced Features Planned (from ADVANCED_FEATURES_ROADMAP.md)
1. **Video Conferencing Integration**
2. **Advanced Analytics Dashboard**
3. **Multi-language Support**
4. **Mobile App**
5. **AI-powered Matching**
6. **Blockchain Integration for Payments**
7. **Smart Contracts**

---

## 8. User Roles & Permissions

### 8.1 Client Role

**Capabilities:**
- ✅ Create and manage projects
- ✅ Post project listings
- ✅ Review and accept freelancer proposals
- ✅ Define project milestones
- ✅ Hold payments in escrow
- ✅ Release payments after milestone completion
- ✅ Chat with assigned freelancers
- ✅ View and manage wallet
- ✅ Receive notifications
- ✅ Rate and review freelancers

**Cannot:**
- ❌ Submit bids on projects
- ❌ Access admin panel
- ❌ View other users' private data

---

### 8.2 Freelancer Role

**Capabilities:**
- ✅ Browse available projects
- ✅ Submit proposals and bids
- ✅ View assigned projects
- ✅ Update milestone status
- ✅ Chat with clients
- ✅ Receive payments
- ✅ View and manage wallet
- ✅ Receive notifications
- ✅ Build portfolio

**Cannot:**
- ❌ Create projects
- ❌ Hold or release payments
- ❌ Accept other freelancers' bids
- ❌ Access admin panel

---

### 8.3 Admin Role

**Capabilities:**
- ✅ All client capabilities
- ✅ All freelancer capabilities
- ✅ View all users
- ✅ View all projects
- ✅ Manage reported projects
- ✅ View platform statistics
- ✅ Process refunds
- ✅ Ban/suspend users
- ✅ Resolve disputes

**Full Access:** Complete platform oversight

---

## 9. Data Flow Diagrams

### 9.1 Project Creation Flow

```
┌────────┐                ┌─────────┐                ┌──────────┐
│ Client │                │  API    │                │ Database │
└────────┘                └─────────┘                └──────────┘
    │                          │                          │
    │  1. Fill project form    │                          │
    │                          │                          │
    │  2. POST /api/projects   │                          │
    │─────────────────────────>│                          │
    │  {title, description,    │                          │
    │   budget, milestones}    │                          │
    │                          │  3. Validate data        │
    │                          │                          │
    │                          │  4. Check auth           │
    │                          │                          │
    │                          │  5. Create project       │
    │                          │─────────────────────────>│
    │                          │                          │
    │                          │  6. Project saved        │
    │                          │<─────────────────────────│
    │                          │                          │
    │                          │  7. Create notifications │
    │                          │─────────────────────────>│
    │                          │                          │
    │  8. Return project       │                          │
    │<─────────────────────────│                          │
    │                          │                          │
    │  9. Redirect to project  │                          │
```

---

### 9.2 Payment Flow

```
┌────────┐    ┌───────────┐    ┌─────────┐    ┌──────────┐
│ Client │    │Freelancer │    │  API    │    │ Database │
└────────┘    └───────────┘    └─────────┘    └──────────┘
    │              │                │               │
    │ 1. Hold payment for milestone │               │
    │─────────────────────────────────────────────> │
    │              │                │               │
    │              │                │  2. Create    │
    │              │                │  transaction  │
    │              │                │  (HELD)       │
    │              │                │──────────────>│
    │              │                │               │
    │              │                │  3. Deduct    │
    │              │                │  from client  │
    │              │                │  balance      │
    │              │                │──────────────>│
    │              │                │               │
    │              │  4. Notify: Payment held       │
    │              │<──────────────────────────────>│
    │              │                │               │
    │              │ 5. Complete    │               │
    │              │    milestone   │               │
    │              │───────────────>│               │
    │              │                │               │
    │ 6. Review & approve milestone │               │
    │─────────────────────────────────────────────> │
    │              │                │               │
    │              │                │  7. Release   │
    │              │                │  payment      │
    │              │                │  (RELEASED)   │
    │              │                │──────────────>│
    │              │                │               │
    │              │                │  8. Add to    │
    │              │                │  freelancer   │
    │              │                │  balance      │
    │              │                │──────────────>│
    │              │                │               │
    │              │  9. Notify: Payment released   │
    │              │<──────────────────────────────>│
```

---

### 9.3 Messaging Flow

```
┌────────┐    ┌───────────┐    ┌─────────┐    ┌──────────┐
│ Sender │    │ Recipient │    │  API    │    │ Database │
└────────┘    └───────────┘    └─────────┘    └──────────┘
    │              │                │               │
    │ 1. Type and send message      │               │
    │──────────────────────────────>│               │
    │              │                │               │
    │              │                │  2. Save      │
    │              │                │  message      │
    │              │                │──────────────>│
    │              │                │               │
    │              │                │  3. Create    │
    │              │                │  notification │
    │              │                │──────────────>│
    │              │                │               │
    │              │  4. Socket.io: │               │
    │              │  Real-time     │               │
    │              │  message       │               │
    │              │<───────────────│               │
    │              │                │               │
    │              │  5. Display    │               │
    │              │  message       │               │
    │              │                │               │
    │  6. Confirmation              │               │
    │<──────────────────────────────│               │
```

---

## 10. Business Logic

### 10.1 Project Health Score Calculation

**Algorithm:**
```javascript
calculateHealthScore() {
  let score = 100;
  
  // Deduct points for overdue milestones
  const overdueMilestones = this.milestones.filter(m => 
    m.dueDate < new Date() && m.status !== 'completed'
  );
  score -= overdueMilestones.length * 15;
  
  // Deduct points for long time without updates
  const daysSinceUpdate = (Date.now() - this.updatedAt) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate > 7) score -= 10;
  if (daysSinceUpdate > 14) score -= 10;
  
  // Bonus for completed milestones
  const completedCount = this.milestones.filter(m => 
    m.status === 'completed'
  ).length;
  score += completedCount * 5;
  
  // Ensure score is between 0-100
  this.healthScore = Math.max(0, Math.min(100, score));
}
```

**Health Score Ranges:**
- 80-100: Healthy (green)
- 50-79: At Risk (yellow)
- 0-49: Critical (red)

---

### 10.2 Payment Fee Structure

```javascript
// Platform fees
const PLATFORM_FEE_PERCENTAGE = 5; // 5% platform fee

// Fee calculation
platformFee = transactionAmount * (PLATFORM_FEE_PERCENTAGE / 100);
freelancerReceives = transactionAmount - platformFee;
```

**Example:**
- Transaction: $1,000
- Platform Fee: $50 (5%)
- Freelancer Receives: $950

---

### 10.3 Milestone Status Transitions

```
PENDING → IN_PROGRESS → COMPLETED → APPROVED
   ↓           ↓            ↓
CANCELLED   CANCELLED   CANCELLED
```

**Business Rules:**
1. Only assigned freelancer can mark milestone as IN_PROGRESS
2. Only assigned freelancer can mark as COMPLETED
3. Only client can APPROVE completed milestone
4. Payment released only after APPROVED status
5. Client or admin can CANCEL at any time

---

### 10.4 Proposal Acceptance Logic

```javascript
// When client accepts a proposal:
1. Set proposal status to 'accepted'
2. Reject all other proposals
3. Assign freelancer to project
4. Change project status from 'open' to 'in_progress'
5. Create notification for freelancer
6. Create notification for rejected freelancers
7. Set project start date
```

---

## 11. File Structure

### 11.1 Complete Directory Structure

```
freelance-project-tracker/
│
├── frontend/                        # Next.js Frontend
│   ├── app/                        # App Router (Next.js 14)
│   │   ├── layout.js               # Root layout
│   │   ├── page.js                 # Homepage
│   │   ├── globals.css             # Global styles
│   │   ├── error.js                # Error handling
│   │   ├── loading.js              # Loading states
│   │   ├── not-found.js            # 404 page
│   │   ├── template.js             # Template wrapper
│   │   ├── admin/                  # Admin routes
│   │   │   └── page.js
│   │   └── vcroom/                 # Video conference routes
│   │       ├── page.js
│   │       └── [roomId]/
│   │           └── page.js
│   │
│   ├── components/                 # React Components
│   │   ├── AdminDashboard.js       # Admin panel
│   │   ├── AdminLogin.js           # Admin login
│   │   ├── Chat.js                 # Chat interface
│   │   ├── Dashboard.js            # Main dashboard
│   │   ├── EnhancedChat.js         # Enhanced chat with Socket.io
│   │   ├── FreelancerDashboard.js  # Freelancer-specific dashboard
│   │   ├── HomePage.js             # Landing page
│   │   ├── LiveFeed.js             # Real-time activity feed
│   │   ├── Login.js                # Login component
│   │   ├── PaymentIntegration.js   # Payment gateway
│   │   ├── PaymentModal.js         # Payment modal
│   │   ├── Profile.js              # User profile
│   │   ├── ProjectManagement.js    # Project CRUD
│   │   ├── SkillSelector.js        # Skill selection UI
│   │   ├── VcHome.js               # Video conference home
│   │   ├── Vcroom.js               # Video conference room
│   │   ├── VideoCallModal.js       # Video call modal
│   │   └── Wallet.js               # Wallet interface
│   │
│   ├── lib/                        # Utility libraries
│   │   ├── api.js                  # API client functions
│   │   └── utils.js                # Helper functions
│   │
│   ├── public/                     # Static assets
│   │   └── video-conference.html   # Video conference page
│   │
│   ├── next.config.js              # Next.js configuration
│   ├── tailwind.config.js          # Tailwind CSS config
│   ├── postcss.config.js           # PostCSS config
│   └── package.json                # Frontend dependencies
│
├── backend/                         # Node.js Backend
│   ├── models/                     # Mongoose Models
│   │   ├── User.js                 # User model
│   │   ├── Profile.js              # Profile model
│   │   ├── Project.js              # Project model
│   │   ├── Transaction.js          # Transaction model
│   │   ├── Wallet.js               # Wallet model
│   │   ├── Message.js              # Message model
│   │   └── Notification.js         # Notification model
│   │
│   ├── routes/                     # Express Routes
│   │   ├── auth.js                 # Authentication routes
│   │   ├── profiles.js             # Profile routes
│   │   ├── projects.js             # Project routes
│   │   ├── payments.js             # Payment routes
│   │   ├── wallet.js               # Wallet routes
│   │   ├── messages.js             # Message routes
│   │   ├── notifications.js        # Notification routes
│   │   └── admin.js                # Admin routes
│   │
│   ├── middleware/                 # Express Middleware
│   │   └── auth.js                 # JWT authentication middleware
│   │
│   ├── services/                   # Business Logic Services
│   │   ├── notification.js         # Notification service
│   │   ├── payment.js              # Payment service
│   │   ├── recommendation.js       # Recommendation engine
│   │   └── walletService.js        # Wallet operations
│   │
│   ├── scripts/                    # Database Scripts
│   │   ├── seed.js                 # Basic seed script
│   │   ├── comprehensive-seed.js   # Full seed with mock data
│   │   ├── add-test-bids.js        # Add test bids
│   │   ├── add-test-proposals.js   # Add test proposals
│   │   └── create-mock-data.js     # Mock data generator
│   │
│   ├── tests/                      # Test Files
│   │   ├── auth.test.js            # Auth tests
│   │   ├── messages.test.js        # Message tests
│   │   └── payments.test.js        # Payment tests
│   │
│   ├── server.js                   # Main server file
│   ├── debug-endpoint.js           # Debug utilities
│   └── package.json                # Backend dependencies
│
├── shared/                          # Shared Code
│   ├── constants.js                # Shared constants
│   ├── index.js                    # Shared exports
│   └── package.json                # Shared package
│
├── DEMO_CREDENTIALS.md             # Demo login credentials
├── PROJECT_DOCUMENTATION.md        # This file
├── README.md                       # Project README
├── ADVANCED_FEATURES_ROADMAP.md    # Future features
└── package.json                    # Root package.json
```

---

## 12. Dependencies

### 12.1 Frontend Dependencies

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "socket.io-client": "^4.x",
    "lucide-react": "latest",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

### 12.2 Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.x",
    "mongoose": "^8.x",
    "bcryptjs": "^2.x",
    "jsonwebtoken": "^9.x",
    "dotenv": "^16.x",
    "cors": "^2.x",
    "socket.io": "^4.x",
    "express-validator": "^7.x"
  },
  "devDependencies": {
    "nodemon": "^3.x",
    "jest": "^29.x"
  }
}
```

---

## 13. Demo Data

### 13.1 Pre-seeded Users

| Role | Email | Password | Name |
|------|-------|----------|------|
| Client | client@demo.com | client123 | Alex Johnson |
| Freelancer | freelancer@demo.com | freelancer123 | Sarah Martinez |
| Admin | admin@demo.com | admin123 | Admin User |

### 13.2 Demo Data Summary

**Created by comprehensive-seed.js:**

- **Users:** 3 (1 Client, 1 Freelancer, 1 Admin)
- **Profiles:** 3 complete profiles with skills, portfolio, ratings
- **Projects:** 5 projects in various statuses
  - 1 In Progress (E-commerce Platform - $8,000)
  - 1 Open (Mobile Fitness App - $12,000)
  - 1 Completed (Website Redesign - $3,500)
  - 1 Draft (Social Media Dashboard - $6,000)
  - 1 Cancelled (Blog Platform - $2,500, reported)
- **Transactions:** 6 transactions
  - 4 Released ($5,000 total)
  - 1 Held ($2,000)
  - 1 Refunded ($1,000)
- **Wallets:** 2 wallets with balances and histories
  - Client: $5,000 balance ($2,000 held)
  - Freelancer: $3,500 balance ($8,500 earned)
- **Messages:** 15 messages across multiple conversations
- **Notifications:** 16 notifications (all types, read/unread)

### 13.3 Running Seed Script

```bash
cd backend
node scripts/comprehensive-seed.js
```

This will:
1. Clean all existing data
2. Create demo users
3. Populate database with realistic data
4. Print login credentials

---

## 14. Deployment Information

### 14.1 Environment Variables

**Backend (.env):**
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=mongodb://localhost:27017/fpt
# or MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fpt

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS
CLIENT_URL=http://localhost:3000

# Payment Gateway (if using real payments)
PAYMENT_API_KEY=your_payment_api_key
PAYMENT_SECRET=your_payment_secret

# Email Service (optional)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@example.com
EMAIL_PASS=your_email_password

# Socket.io
SOCKET_PORT=5000
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 14.2 Build Commands

**Backend:**
```bash
npm install
npm start  # Production
npm run dev  # Development with nodemon
```

**Frontend:**
```bash
npm install
npm run build  # Build for production
npm run dev    # Development server
npm run start  # Start production build
```

### 14.3 Deployment Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure production MongoDB URI
- [ ] Enable CORS for production domain
- [ ] Set up SSL certificates (HTTPS)
- [ ] Configure environment variables
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy
- [ ] Test all API endpoints
- [ ] Run security audit
- [ ] Set up CI/CD pipeline
- [ ] Configure rate limiting
- [ ] Set up error tracking (e.g., Sentry)

---

## 15. System Diagrams Reference

### 15.1 Diagram Types to Create

For your teammate to create software diagrams and reports, include:

#### **1. Use Case Diagram**
- Actors: Client, Freelancer, Admin
- Use cases: Register, Login, Create Project, Submit Bid, Manage Payments, etc.

#### **2. Sequence Diagrams**
- User Registration Flow
- Project Creation Flow
- Bidding Process Flow
- Payment Transaction Flow
- Message Sending Flow

#### **3. Class Diagram**
- All models with attributes and methods
- Relationships between models
- Inheritance and composition

#### **4. Component Diagram**
- Frontend components
- Backend services
- External integrations

#### **5. Deployment Diagram**
- Frontend server
- Backend server
- Database server
- Load balancer (if applicable)

#### **6. Activity Diagrams**
- Project lifecycle
- Payment processing
- User onboarding

#### **7. State Diagrams**
- Project states
- Transaction states
- Milestone states

#### **8. Data Flow Diagram (DFD)**
- Level 0 (Context diagram)
- Level 1 (Major processes)
- Level 2 (Detailed processes)

---

## 16. Testing Strategy

### 16.1 Test Types

**Unit Tests:**
- Model methods
- Service functions
- Utility functions

**Integration Tests:**
- API endpoints
- Database operations
- Authentication flow

**End-to-End Tests:**
- Complete user flows
- Payment processing
- Project lifecycle

### 16.2 Test Coverage Areas

- ✅ User authentication and authorization
- ✅ Project CRUD operations
- ✅ Payment transactions
- ✅ Wallet operations
- ✅ Messaging functionality
- ✅ Notification system
- ✅ Admin capabilities

---

## 17. Performance Considerations

### 17.1 Database Optimization

- **Indexes:** Created on frequently queried fields
- **Pagination:** Implemented for large datasets
- **Query Optimization:** Use of lean() and select()
- **Connection Pooling:** MongoDB connection pool

### 17.2 API Optimization

- **Caching:** Response caching for static data
- **Rate Limiting:** Prevent abuse
- **Compression:** Gzip compression for responses
- **Lazy Loading:** Load data on demand

### 17.3 Frontend Optimization

- **Code Splitting:** Next.js automatic code splitting
- **Image Optimization:** Next.js image optimization
- **Lazy Loading:** Dynamic imports for components
- **Memoization:** React.memo for expensive components

---

## 18. Security Measures

### 18.1 Implemented Security

- ✅ Password hashing (bcryptjs)
- ✅ JWT authentication
- ✅ CORS configuration
- ✅ Input validation
- ✅ XSS prevention
- ✅ SQL injection prevention (using Mongoose)
- ✅ Rate limiting (recommended)
- ✅ HTTPS (production)

### 18.2 Security Best Practices

- Keep dependencies updated
- Use environment variables for secrets
- Implement role-based access control
- Validate all user inputs
- Sanitize database queries
- Use secure headers
- Implement CSRF protection
- Regular security audits

---

## 19. API Documentation Tools

### 19.1 Recommended Tools for Documentation

- **Swagger/OpenAPI:** API documentation
- **Postman:** API testing and documentation
- **Insomnia:** Alternative API client

### 19.2 Example Swagger Configuration

```javascript
// Install: npm install swagger-jsdoc swagger-ui-express

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Freelance Project Tracker API',
      version: '1.0.0',
      description: 'API documentation for FPT'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ]
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

---

## 20. Future Enhancements

### 20.1 Planned Features

1. **Video Conferencing:** WebRTC integration for client-freelancer calls
2. **Advanced Search:** Elasticsearch for better project/freelancer search
3. **Analytics Dashboard:** Data visualization for insights
4. **Mobile App:** React Native or Flutter app
5. **AI Matching:** ML-based freelancer-project matching
6. **Blockchain Payments:** Cryptocurrency payment option
7. **Multi-language:** i18n support for global users
8. **File Sharing:** Upload and share project files
9. **Time Tracking:** Built-in time tracking for hourly projects
10. **Contract Management:** Digital contracts and e-signatures

### 20.2 Scalability Considerations

- **Microservices:** Split into smaller services
- **Load Balancing:** Distribute traffic across servers
- **CDN:** Content delivery network for static assets
- **Caching:** Redis for session and data caching
- **Message Queue:** RabbitMQ or Kafka for async tasks
- **Database Sharding:** Horizontal scaling of database

---

## 21. Contact & Support

### 21.1 Development Team

- **Project Lead:** [Your Name]
- **Backend Developer:** [Developer Name]
- **Frontend Developer:** [Developer Name]
- **Database Administrator:** [DBA Name]

### 21.2 Resources

- **Repository:** [Git Repository URL]
- **Documentation:** This file
- **Demo Site:** [Demo URL]
- **API Docs:** [Swagger URL]

---

## 22. Glossary

| Term | Definition |
|------|------------|
| **Escrow** | Secure holding of payment until work completion |
| **Milestone** | Defined stage in project with specific deliverable |
| **Bid** | Freelancer's offer to complete a project |
| **Proposal** | Detailed bid with cover letter |
| **Wallet** | Digital account holding user funds |
| **JWT** | JSON Web Token for authentication |
| **ODM** | Object Document Mapper (Mongoose) |
| **CRUD** | Create, Read, Update, Delete operations |
| **Socket.io** | Real-time bidirectional communication library |
| **Mongoose** | MongoDB object modeling for Node.js |

---

## 23. Appendix

### 23.1 Sample API Requests

**Register User:**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "freelancer"
}
```

**Create Project:**
```bash
POST http://localhost:5000/api/projects
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Build a Website",
  "description": "Need a modern website",
  "budget": {
    "total": 5000,
    "currency": "USD"
  },
  "skills": ["React", "Node.js"],
  "category": "Web Development",
  "priority": "high",
  "milestones": [
    {
      "title": "Design",
      "description": "Create mockups",
      "amount": 1000,
      "dueDate": "2025-11-01"
    }
  ]
}
```

**Send Message:**
```bash
POST http://localhost:5000/api/messages
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "recipientId": "user_id_here",
  "projectId": "project_id_here",
  "text": "Hello! Let's discuss the project."
}
```

---

## 24. Quick Reference

### 24.1 Important Commands

```bash
# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm run dev

# Seed database
cd backend && node scripts/comprehensive-seed.js

# Run tests
cd backend && npm test

# Build frontend
cd frontend && npm run build

# View logs
tail -f backend/logs/app.log
```

### 24.2 Default Ports

- **Frontend:** 3000
- **Backend:** 5000
- **MongoDB:** 27017
- **Socket.io:** 5000 (same as backend)

---

## 📝 Document Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | Oct 9, 2025 | Initial comprehensive documentation | Development Team |

---

**END OF DOCUMENT**

---

> 💡 **Note for Teammate:** This document contains everything needed to understand the system architecture, create software diagrams, and write technical reports. Use this as a reference for creating UML diagrams, system design documents, and technical specifications.

> 📧 **Questions?** Contact the development team for clarification on any section.
