# 🚀 Freelance Project Tracker Platform# Freelance Project Tracker



A comprehensive full-stack freelance marketplace platform built with Next.js, Express, MongoDB, and Socket.IO. This platform connects clients with freelancers, enabling project management, real-time communication, secure payments, and administrative oversight.A complete, production-ready monorepo for managing freelance projects with real-time features, secure payments, and comprehensive project management tools.



![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)## 🚀 Features

![License](https://img.shields.io/badge/license-MIT-green.svg)

![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)### Core Functionality

- **User Authentication** - JWT-based auth with role-based access (Client/Freelancer)

---- **Project Management** - Create, track, and manage freelance projects with milestones

- **Real-time Messaging** - Encrypted chat system with Socket.IO

## 📋 Table of Contents- **Payment System** - Dummy payment processing with hold/release/refund functionality

- **Live Notifications** - Real-time updates for project changes, messages, and payments

- [Features](#-features)- **Profile Management** - Comprehensive user profiles with skills, rates, and availability

- [Technology Stack](#-technology-stack)

- [Architecture](#-architecture)### Technical Stack

- [Installation](#-installation)- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS, Framer Motion

- [Configuration](#-configuration)- **Backend**: Node.js, Express.js, Socket.IO

- [Usage](#-usage)- **Database**: MongoDB with Mongoose ODM

- [API Documentation](#-api-documentation)- **Authentication**: JWT tokens with bcrypt password hashing

- [Database Schema](#-database-schema)- **Security**: Helmet, CORS, rate limiting, message encryption (AES)

- [Security](#-security)- **Testing**: Jest test suite for critical flows

- [Demo Credentials](#-demo-credentials)- **Security**: bcrypt, helmet, CORS, message encryption

- [Contributing](#-contributing)

- [License](#-license)## Quick Start



---### Prerequisites



## ✨ Features- Node.js 18+ and npm

- MongoDB (local installation or MongoDB Atlas)

### 🔐 User Management

- **Dual Role System**: Separate interfaces for Clients and Freelancers### Installation & Setup

- **Secure Authentication**: JWT-based authentication with bcrypt password hashing

- **User Profiles**: Comprehensive profile management with skills, bio, social links, and availability1. **Clone and install dependencies**:

- **Profile Customization**: Avatar upload, hourly rates, timezone settings, and portfolio links   ```bash

   git clone <repository>

### 📊 Project Management   cd freelance-project-tracker

- **Project Lifecycle**: Complete project workflow from creation to completion   npm run install-all

- **Smart Bidding System**: Freelancers can submit bids with proposed budgets and timelines   ```

- **Bid Management**: Clients can accept/reject bids with instant notifications

- **Project Status Tracking**: Real-time status updates (Open, In Progress, Completed, Cancelled)2. **Environment setup**:

- **Dual Completion Confirmation**: Both client and freelancer must confirm project completion   ```bash

- **Project Reporting**: Users can report inappropriate projects with reason tracking   copy .env.example .env

- **Advanced Filtering**: Filter projects by status, budget, skills, and timeline   # Edit .env with your MongoDB connection string if different

   ```

### 💰 Payment & Wallet System

- **Integrated Wallet**: Secure wallet system for all users3. **Database setup**:

- **Fund Management**: Add funds, withdraw, and transfer capabilities   - **Local MongoDB**: Start MongoDB service locally

- **Transaction History**: Complete transaction logs with filtering   - **MongoDB Atlas**: Update MONGO_URI in .env with your Atlas connection string

- **Automatic Payment Processing**: Payments released upon project completion confirmation   

- **Escrow System**: Funds held securely until project milestones are met4. **Seed the database**:

- **Payment Verification**: Balance checks before bid placement   ```bash

- **Transaction Tracking**: Detailed transaction records with descriptions and timestamps   npm run seed

- **Currency Support**: All transactions in Indian Rupees (₹)   ```

   This creates sample users:

### 💬 Real-Time Communication   - Client: `client@example.com` / `password`

- **Live Chat System**: Real-time messaging between clients and freelancers   - Freelancer: `freelancer@example.com` / `password`

- **Socket.IO Integration**: Instant message delivery and read receipts

- **Message History**: Persistent chat history with timestamps5. **Start the application**:

- **User Online Status**: Real-time online/offline indicators   ```bash

- **Conversation Management**: Organized conversation threads   npm run dev

- **File Sharing**: Support for sharing project files and documents   ```

   This starts both backend (port 4000) and frontend (port 3000) concurrently.

### 🔔 Notification System

- **Real-Time Notifications**: Instant notifications for all important events6. **Visit the app**: http://localhost:3000

- **Notification Types**:

  - New project postingsThe app will automatically log you in as the seeded client user.

  - Bid submissions and updates

  - Bid acceptance/rejection### Manual Start (Two Terminals)

  - Payment received

  - Project status changesIf you prefer to run backend and frontend separately:

  - New messages

  - Project completion confirmations**Terminal 1 - Backend**:

- **Notification Center**: Centralized notification management```bash

- **Mark as Read**: Individual and bulk notification managementcd backend

- **Push Notifications**: Browser push notification supportnpm run dev

```

### 📱 Live Activity Feed

- **Real-Time Updates**: Live feed of platform activities**Terminal 2 - Frontend**:

- **Activity Types**:```bash

  - New projects postedcd frontend

  - Bids submittednpm run dev

  - Projects awarded```

  - Projects completed

  - User registrations## API Endpoints

- **Activity Filtering**: Filter by activity type

- **Timestamp Display**: Relative time display (e.g., "5m ago")### Authentication

- `POST /api/auth/register` - Register new user

### 🎥 Video Conferencing- `POST /api/auth/login` - Login user

- **Built-in Video Calls**: Integrated video conferencing for project discussions

- **ZegoCloud Integration**: High-quality video/audio communication### Projects

- **Room Management**: Create and join video rooms with unique IDs- `GET /api/projects` - Get user's projects

- **Screen Sharing**: Share screen for presentations and demonstrations- `POST /api/projects` - Create new project

- **Recording Support**: Record important meetings (if enabled)- `PATCH /api/projects/:id/milestone/:idx` - Update milestone status



### 👨‍💼 Admin Dashboard### Messages

- **Comprehensive Statistics**:- `GET /api/messages/:withUserId` - Get messages with specific user

  - Total users (with role breakdown)- `POST /api/messages` - Send new message

  - Total projects (with status breakdown)

  - Platform revenue tracking### Profiles

  - Recent activity metrics (30-day)- `GET /api/profiles/me` - Get current user profile

  - Transaction analytics (credits/debits)- `POST /api/profiles/me` - Update user profile

- **User Management**: View and manage all registered users- `GET /api/profiles/recommend?skills=a,b` - Get recommended freelancers

- **Project Oversight**: 

  - View all projects with filtering### Payments (Dummy)

  - Monitor project status and budgets- `POST /api/payments/hold` - Hold funds for project

  - Delete inappropriate projects- `POST /api/payments/:id/release` - Release held funds

- **Transaction Monitoring**: - `POST /api/payments/:id/refund` - Refund held funds

  - View all platform transactions

  - Filter by transaction type### Notifications

  - Search transactions- `GET /api/notifications` - Get user notifications

- **Report Management**:- `POST /api/notifications` - Create notification

  - View reported projects

  - Review report reasons### Health

  - Resolve or dismiss reports- `GET /api/health` - API health check

- **Data Visualization**: Professional charts and metrics display

- **Secure Access**: Protected admin area with mock authentication### Sample API Calls



### 🎨 User Interface```bash

- **Professional Design System**:# Register new user

  - Slate-based color palettecurl -X POST http://localhost:4000/api/auth/register \

  - Semantic color coding  -H "Content-Type: application/json" \

  - Consistent component styling  -d '{"email":"test@example.com","password":"password","name":"Test User","role":"client"}'

  - Responsive grid layouts

- **Modern UI Components**:# Login

  - Animated cards and modalscurl -X POST http://localhost:4000/api/auth/login \

  - Smooth transitions (Framer Motion)  -H "Content-Type: application/json" \

  - Loading states and skeletons  -d '{"email":"client@example.com","password":"password"}'

  - Error boundary handling

- **Responsive Design**: Mobile-first approach, works on all devices# Get projects (with JWT token)

- **Accessibility**: ARIA labels, keyboard navigation, screen reader supportcurl -X GET http://localhost:4000/api/projects \

- **Dark Mode Elements**: Professional contrast and readability  -H "Authorization: Bearer YOUR_JWT_TOKEN"

- **Interactive Elements**: Hover effects, animations, and micro-interactions```



### 🔍 Search & Discovery## Testing

- **Project Search**: Search projects by title, description, and skills

- **Skill-Based Filtering**: Find projects matching specific skillsRun the test suite:

- **Budget Range Filtering**: Filter projects by budget constraints```bash

- **Timeline Filtering**: Find projects by deadline requirementsnpm test

- **User Search**: Search for freelancers by skills and expertise```



---Tests cover:

- Authentication flows

## 🛠 Technology Stack- Message encryption/decryption

- Payment system operations

### Frontend- API endpoint functionality

- **Framework**: Next.js 14.0.0 (React 18.2.0)

- **Styling**: Tailwind CSS 3.3.5## Dummy Payment System

- **Animations**: Framer Motion 10.16.0

- **Icons**: Lucide React 0.292.0The payment system is completely dummy - no real transactions occur. It simulates:

- **Real-time**: Socket.IO Client 4.7.2- **Hold**: Creates a transaction with HELD status

- **Video**: ZegoCloud UIKit 2.15.2- **Release**: Changes status from HELD to RELEASED

- **Utilities**: clsx, tailwind-merge- **Refund**: Changes status from HELD to REFUNDED



### BackendAll payment operations are logged and stored in the database for tracking.

- **Runtime**: Node.js (ES Modules)

- **Framework**: Express.js 4.18.2## Email System

- **Database**: MongoDB with Mongoose 7.5.0

- **Real-time**: Socket.IO 4.7.2By default, emails are logged to the console (`EMAIL_TRANSPORT=console`). 

- **Authentication**: JWT (jsonwebtoken 9.0.2)

- **Password Hashing**: bcryptjs 2.4.3To use real SMTP, update your `.env`:

- **Security**: Helmet 7.0.0, CORS 2.8.5```

- **Logging**: Morgan 1.10.0EMAIL_TRANSPORT=smtp

- **Validation**: Joi 17.9.2SMTP_HOST=your-smtp-host.com

- **Environment**: dotenv 16.3.1SMTP_PORT=587

SMTP_USER=your-email@domain.com

### Database SchemaSMTP_PASS=your-password

- **Users**: Authentication and profile data```

- **Profiles**: Extended user information

- **Projects**: Project details and lifecycle## Production Deployment

- **Wallets**: Financial transactions and balances

- **Transactions**: Payment history### Security Enhancements

- **Messages**: Chat communications- Enable HTTPS with SSL certificates

- **Notifications**: User notifications- Use a strong JWT secret (32+ characters)

- Enable MongoDB authentication

---- Configure proper CORS origins

- Use environment-specific secrets

## 🏗 Architecture

### Scalability

```- **Database**: Use MongoDB Atlas or managed MongoDB

freelance-project-tracker/- **Cache**: Add Redis for session storage and Socket.IO adapter

├── backend/- **Load Balancing**: Use nginx or cloud load balancers

│   ├── middleware/- **WebSockets**: Scale with Redis adapter for Socket.IO

│   │   └── auth.js                 # JWT authentication middleware

│   ├── models/### Environment Setup

│   │   ├── User.js                 # User schema```bash

│   │   ├── Profile.js              # Profile schema# Production environment variables

│   │   ├── Project.js              # Project schema with biddingNODE_ENV=production

│   │   ├── Wallet.js               # Wallet schemaJWT_SECRET=your-super-secure-jwt-secret-32-chars-min

│   │   ├── Transaction.js          # Transaction historyMONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

│   │   ├── Message.js              # Chat messagesREDIS_URL=redis://your-redis-instance

│   │   └── Notification.js         # Notification schema```

│   ├── routes/

│   │   ├── auth.js                 # Authentication endpoints### Docker (Optional)

│   │   ├── projects.js             # Project CRUD and biddingWhile this codebase runs without Docker, you can containerize for production:

│   │   ├── profiles.js             # Profile management

│   │   ├── wallet.js               # Wallet operations```dockerfile

│   │   ├── payments.js             # Payment processing# Example Dockerfile for backend

│   │   ├── messages.js             # Chat endpointsFROM node:18-alpine

│   │   ├── notifications.js        # Notification managementWORKDIR /app

│   │   └── admin.js                # Admin dashboard APIsCOPY backend/package*.json ./

│   ├── services/RUN npm ci --only=production

│   │   ├── notification.js         # Notification serviceCOPY backend/ .

│   │   ├── payment.js              # Payment serviceEXPOSE 4000

│   │   ├── recommendation.js       # Project recommendationsCMD ["npm", "start"]

│   │   └── walletService.js        # Wallet operations```

│   ├── scripts/

│   │   ├── seed.js                 # Database seeding### Payment Integration

│   │   └── comprehensive-seed.js   # Full data seedingTo replace dummy payments with real payment processing:

│   ├── tests/

│   │   ├── auth.test.js            # Auth tests1. Install Stripe SDK: `npm install stripe`

│   │   ├── messages.test.js        # Message tests2. Replace `services/payment.js` with Stripe integration

│   │   └── payments.test.js        # Payment tests3. Add Stripe webhook handlers

│   ├── server.js                   # Express server setup4. Update payment endpoints to call Stripe APIs

│   └── package.json

│## Architecture Notes

├── frontend/

│   ├── app/### Message Encryption

│   │   ├── layout.js               # Root layoutMessages are encrypted using AES-256-GCM before storage and decrypted on retrieval. The encryption key is derived from JWT_SECRET.

│   │   ├── page.js                 # Landing/Auth page

│   │   ├── globals.css             # Global styles### Real-time Features

│   │   ├── admin/Socket.IO handles:

│   │   │   └── page.js             # Admin dashboard page- Live chat messaging

│   │   └── vcroom/- Project update notifications

│   │       └── [roomId]/- System notifications

│   │           └── page.js         # Video conference room- User presence indicators

│   ├── components/

│   │   ├── HomePage.js             # Landing page### Recommendation System

│   │   ├── Login.js                # Login/Register componentSimple heuristic-based matching using:

│   │   ├── Dashboard.js            # Main user dashboard- Skill overlap scoring

│   │   ├── FreelancerDashboard.js  # Freelancer-specific view- User ratings

│   │   ├── ProjectManagement.js    # Project CRUD & bidding- Availability status

│   │   ├── Profile.js              # User profile management

│   │   ├── Wallet.js               # Wallet interfaceFor advanced ML recommendations, consider integrating TensorFlow.js:

│   │   ├── Chat.js                 # Basic chat component```javascript

│   │   ├── EnhancedChat.js         # Advanced chat features// Future ML integration example

│   │   ├── LiveFeed.js             # Activity feedconst tf = require('@tensorflow/tfjs-node');

│   │   ├── PaymentModal.js         # Payment interface// Implement collaborative filtering or content-based recommendations

│   │   ├── PaymentIntegration.js   # Payment system```

│   │   ├── AdminDashboard.js       # Admin control panel

│   │   ├── AdminLogin.js           # Admin authentication## Folder Structure

│   │   ├── VcHome.js               # Video call lobby

│   │   ├── Vcroom.js               # Video call room```

│   │   └── VideoCallModal.js       # Video call modalfreelance-project-tracker/

│   ├── lib/├── backend/           # Express API server

│   │   ├── api.js                  # API client with all endpoints│   ├── models/        # Mongoose models

│   │   └── utils.js                # Utility functions│   ├── routes/        # API route handlers

│   └── package.json│   ├── middleware/    # Custom middleware

││   ├── services/      # Business logic

└── shared/│   ├── scripts/       # Database seeding

    ├── constants.js                # Shared constants│   └── tests/         # Jest tests

    └── index.js├── frontend/          # Next.js application

```│   ├── app/           # App Router pages

│   ├── components/    # React components

---│   ├── lib/           # Utility functions

│   └── public/        # Static assets

## 📦 Installation├── shared/            # Shared constants and utilities

└── docs/              # Additional documentation

### Prerequisites```

- Node.js >= 18.0.0

- MongoDB >= 5.0## Contributing

- npm or yarn

- Git1. Fork the repository

2. Create a feature branch

### Step 1: Clone the Repository3. Make your changes

```bash4. Add tests for new functionality

git clone https://github.com/yourusername/freelance-project-tracker.git5. Ensure all tests pass

cd freelance-project-tracker6. Submit a pull request

```

## License

### Step 2: Install Backend Dependencies

```bashMIT License - see LICENSE file for details.

cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 4: Set Up Environment Variables

#### Backend (.env)
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/freelance-tracker
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/freelance-tracker

# JWT Secret (Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Frontend URL
WS_ORIGIN=http://localhost:3000

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin Credentials (for demo)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

#### Frontend (.env.local)
Create a `.env.local` file in the `frontend` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000

# ZegoCloud Video Configuration
NEXT_PUBLIC_ZEGO_APP_ID=your-zego-app-id
NEXT_PUBLIC_ZEGO_SERVER_SECRET=your-zego-server-secret
```

### Step 5: Seed the Database (Optional)
```bash
cd backend
npm run seed
```

This will create sample users, projects, and test data.

---

## 🚀 Usage

### Development Mode

#### Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:4000

#### Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

### Production Mode

#### Build Frontend
```bash
cd frontend
npm run build
npm start
```

#### Run Backend
```bash
cd backend
npm start
```

---

## 🎯 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "client" // or "freelancer"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Project Endpoints

#### Get All Projects
```http
GET /api/projects
Authorization: Bearer {token}
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "E-commerce Website Development",
  "description": "Need a full-featured e-commerce platform",
  "budget": {
    "total": 50000,
    "currency": "INR"
  },
  "timeline": {
    "startDate": "2024-01-01",
    "endDate": "2024-03-31"
  },
  "requiredSkills": ["React", "Node.js", "MongoDB"]
}
```

#### Submit Bid
```http
POST /api/projects/:projectId/bid
Authorization: Bearer {token}
Content-Type: application/json

{
  "bidAmount": 45000,
  "deliveryTime": "60 days",
  "proposal": "I have 5 years experience in e-commerce development..."
}
```

#### Accept Bid
```http
POST /api/projects/:projectId/accept-bid
Authorization: Bearer {token}
Content-Type: application/json

{
  "bidId": "bid-id-here"
}
```

#### Mark Project Complete
```http
POST /api/projects/:projectId/mark-complete
Authorization: Bearer {token}
```

#### Report Project
```http
POST /api/projects/:projectId/report
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Spam content",
  "details": "This project contains inappropriate content"
}
```

### Wallet Endpoints

#### Get Wallet Balance
```http
GET /api/wallet
Authorization: Bearer {token}
```

#### Add Funds
```http
POST /api/wallet/add-funds
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 10000,
  "description": "Adding funds via credit card"
}
```

#### Withdraw Funds
```http
POST /api/wallet/withdraw
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 5000,
  "description": "Withdrawal to bank account"
}
```

#### Transfer Funds
```http
POST /api/wallet/transfer
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipientId": "user-id-here",
  "amount": 45000,
  "projectId": "project-id-here",
  "description": "Payment for project completion"
}
```

#### Get Transaction History
```http
GET /api/wallet/transactions?limit=20&offset=0
Authorization: Bearer {token}
```

### Message Endpoints

#### Get Messages with User
```http
GET /api/messages/:userId
Authorization: Bearer {token}
```

#### Send Message
```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipientId": "user-id-here",
  "content": "Hello! I'm interested in your project.",
  "projectId": "project-id-here" // optional
}
```

### Notification Endpoints

#### Get User Notifications
```http
GET /api/notifications
Authorization: Bearer {token}
```

#### Mark Notification as Read
```http
PUT /api/notifications/:notificationId/read
Authorization: Bearer {token}
```

#### Mark All as Read
```http
PUT /api/notifications/mark-all-read
Authorization: Bearer {token}
```

### Admin Endpoints

#### Get Admin Statistics
```http
GET /api/admin/stats
Authorization: Bearer {admin-token}
```

#### Get All Projects (Admin)
```http
GET /api/admin/projects?status=all&reported=false&page=1&limit=20
Authorization: Bearer {admin-token}
```

#### Get All Transactions (Admin)
```http
GET /api/admin/transactions?type=all&page=1&limit=20
Authorization: Bearer {admin-token}
```

#### Delete Project (Admin)
```http
DELETE /api/admin/projects/:projectId
Authorization: Bearer {admin-token}
```

---

## 🗄 Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['client', 'freelancer']),
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Profile Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  bio: String,
  skills: [String],
  hourlyRate: Number,
  avatar: String,
  location: {
    country: String,
    city: String,
    timezone: String
  },
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    portfolio: String
  },
  availability: String (enum: ['available', 'busy', 'unavailable']),
  rating: Number,
  completedProjects: Number
}
```

### Project Model
```javascript
{
  title: String (required),
  description: String (required),
  clientId: ObjectId (ref: 'User'),
  freelancerId: ObjectId (ref: 'User'),
  budget: {
    total: Number,
    currency: String,
    agreed: Number
  },
  timeline: {
    startDate: Date,
    endDate: Date,
    estimatedDuration: String
  },
  requiredSkills: [String],
  status: String (enum: ['open', 'in_progress', 'completed', 'cancelled']),
  bids: [{
    freelancerId: ObjectId,
    bidAmount: Number,
    deliveryTime: String,
    proposal: String,
    status: String,
    createdAt: Date
  }],
  acceptedBid: {
    bidId: ObjectId,
    freelancerId: ObjectId,
    bidAmount: Number
  },
  completion: {
    clientMarkedComplete: Boolean,
    freelancerMarkedComplete: Boolean,
    completedAt: Date
  },
  isReported: Boolean,
  reportReason: String,
  reportedBy: ObjectId,
  reportedAt: Date,
  reportResolution: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Wallet Model
```javascript
{
  userId: ObjectId (ref: 'User', unique),
  balance: Number (default: 0),
  currency: String (default: 'INR'),
  transactions: [ObjectId] (ref: 'Transaction'),
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```javascript
{
  walletId: ObjectId (ref: 'Wallet'),
  type: String (enum: ['credit', 'debit']),
  amount: Number,
  description: String,
  relatedProject: ObjectId (ref: 'Project'),
  relatedUser: ObjectId (ref: 'User'),
  status: String (enum: ['pending', 'completed', 'failed']),
  createdAt: Date
}
```

### Message Model
```javascript
{
  senderId: ObjectId (ref: 'User'),
  recipientId: ObjectId (ref: 'User'),
  content: String,
  projectId: ObjectId (ref: 'Project'),
  read: Boolean,
  readAt: Date,
  createdAt: Date
}
```

### Notification Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  type: String,
  title: String,
  message: String,
  relatedProject: ObjectId (ref: 'Project'),
  relatedUser: ObjectId (ref: 'User'),
  read: Boolean,
  readAt: Date,
  createdAt: Date
}
```

---

## 🔒 Security

### Implemented Security Measures

1. **Authentication**
   - JWT tokens with secure secret keys
   - Password hashing with bcrypt (10 rounds)
   - Token expiration and refresh

2. **Authorization**
   - Role-based access control (RBAC)
   - Protected routes with middleware
   - User-specific data access

3. **API Security**
   - Helmet.js for HTTP headers
   - CORS configuration
   - Rate limiting (recommended for production)
   - Input validation with Joi
   - SQL injection prevention (MongoDB)

4. **Data Protection**
   - Environment variables for secrets
   - Password strength requirements
   - Secure session management
   - XSS protection

5. **Database Security**
   - Mongoose schema validation
   - Query sanitization
   - Index optimization

### Security Best Practices for Production

```javascript
// Recommended additions for production:
- Implement rate limiting (express-rate-limit)
- Add request size limits
- Enable HTTPS/TLS
- Use secure cookies
- Implement CSRF protection
- Add API versioning
- Set up monitoring and logging
- Regular security audits
- Dependency vulnerability scanning
```

---

## 🎭 Demo Credentials

### Test Users

#### Client Account
```
Email: client@example.com
Password: password123
Role: Client
```

#### Freelancer Account
```
Email: freelancer@example.com
Password: password123
Role: Freelancer
```

### Admin Access
```
Username: admin
Password: admin123
URL: http://localhost:3000/admin
```

### Test Features
- Pre-seeded projects with various statuses
- Sample bids and transactions
- Mock wallet balances
- Test notifications

---

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--slate-50: #f8fafc;
--slate-100: #f1f5f9;
--slate-200: #e2e8f0;
--slate-600: #475569;
--slate-900: #0f172a;

/* Semantic Colors */
--blue-600: #2563eb;    /* Primary actions */
--emerald-600: #059669; /* Success */
--amber-600: #d97706;   /* Warning */
--rose-600: #dc2626;    /* Danger */
--purple-600: #9333ea;  /* Info */
```

### Component Classes
- `.card`: Standard card container
- `.btn-primary`: Primary action button
- `.btn-secondary`: Secondary action button
- `.btn-danger`: Destructive action button
- `.badge`: Status indicator
- `.status-{status}`: Status-specific styling

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Desktops */
xl: 1280px  /* Large desktops */
2xl: 1536px /* Extra large screens */
```

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm run lint
```

### Test Coverage
- Authentication flows
- Payment processing
- Message delivery
- Project lifecycle
- Wallet operations

---

## 🚀 Deployment

### Backend Deployment (Heroku Example)
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel
vercel login

# Deploy
cd frontend
vercel
```

### Environment Variables for Production
- Update all URLs to production domains
- Use strong JWT secrets
- Configure MongoDB Atlas with IP whitelist
- Enable MongoDB Atlas backup
- Set up monitoring and alerts

---

## 📊 Performance Optimization

### Implemented Optimizations
- Lazy loading components
- Image optimization (Next.js)
- Code splitting
- MongoDB indexing
- Caching strategies
- Debounced search
- Pagination for large datasets
- WebSocket connection pooling

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow ESLint rules
- Write descriptive commit messages
- Add tests for new features
- Update documentation
- Use meaningful variable names

---

## 📝 Roadmap

### Upcoming Features
- [ ] Advanced search with Elasticsearch
- [ ] Email notifications
- [ ] SMS verification
- [ ] Multi-currency support
- [ ] Payment gateway integration (Stripe, Razorpay)
- [ ] Project milestones and phases
- [ ] Time tracking for freelancers
- [ ] Invoice generation
- [ ] Contract templates
- [ ] Dispute resolution system
- [ ] Rating and review system
- [ ] Portfolio showcase
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] AI-powered project recommendations
- [ ] Automated skill matching
- [ ] Video portfolio uploads
- [ ] WebRTC direct P2P calls
- [ ] Team collaboration features
- [ ] Project templates
- [ ] API marketplace

---

## 🐛 Known Issues

- Video conferencing requires ZegoCloud API keys
- Email notifications not yet implemented
- Mobile optimization in progress
- File upload size limited to 10MB

---

## 📞 Support

For support and queries:
- Email: support@freelancetracker.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/freelance-tracker/issues)
- Documentation: [Wiki](https://github.com/yourusername/freelance-tracker/wiki)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

```
MIT License

Copyright (c) 2024 Freelance Project Tracker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Express](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Socket.IO](https://socket.io/) - Real-time engine
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide](https://lucide.dev/) - Icon library
- [ZegoCloud](https://www.zegocloud.com/) - Video SDK

---

## 🔧 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB status
mongosh
# Or for MongoDB Atlas, verify:
# - IP whitelist
# - Database user credentials
# - Connection string format
```

### Port Already in Use
```bash
# Kill process on port 4000
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Or use different port in .env
PORT=5000
```

### Socket.IO Connection Failed
- Verify CORS settings match frontend URL
- Check firewall settings
- Ensure WebSocket support is enabled

---

## 📈 Analytics & Monitoring

### Recommended Tools
- **Error Tracking**: Sentry
- **Performance**: New Relic / Datadog
- **Logging**: Winston / Morgan
- **Analytics**: Google Analytics / Mixpanel
- **Uptime**: UptimeRobot / Pingdom

---

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 💻 System Requirements

### Development
- RAM: 4GB minimum, 8GB recommended
- Storage: 2GB free space
- OS: Windows 10+, macOS 10.15+, Linux

### Production
- RAM: 2GB minimum
- CPU: 2 cores minimum
- Storage: 10GB minimum
- Bandwidth: 100 Mbps recommended

---

**Built with ❤️ by the Freelance Tracker Team**

---

*Last Updated: October 2024*
*Version: 1.0.0*
