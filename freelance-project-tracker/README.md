# Freelance Project Tracker

A complete, production-ready monorepo for managing freelance projects with real-time features, secure payments, and comprehensive project management tools.

## 🚀 Features

### Core Functionality
- **User Authentication** - JWT-based auth with role-based access (Client/Freelancer)
- **Project Management** - Create, track, and manage freelance projects with milestones
- **Real-time Messaging** - Encrypted chat system with Socket.IO
- **Payment System** - Dummy payment processing with hold/release/refund functionality
- **Live Notifications** - Real-time updates for project changes, messages, and payments
- **Profile Management** - Comprehensive user profiles with skills, rates, and availability

### Technical Stack
- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Security**: Helmet, CORS, rate limiting, message encryption (AES)
- **Testing**: Jest test suite for critical flows
- **Security**: bcrypt, helmet, CORS, message encryption

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local installation or MongoDB Atlas)

### Installation & Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository>
   cd freelance-project-tracker
   npm run install-all
   ```

2. **Environment setup**:
   ```bash
   copy .env.example .env
   # Edit .env with your MongoDB connection string if different
   ```

3. **Database setup**:
   - **Local MongoDB**: Start MongoDB service locally
   - **MongoDB Atlas**: Update MONGO_URI in .env with your Atlas connection string
   
4. **Seed the database**:
   ```bash
   npm run seed
   ```
   This creates sample users:
   - Client: `client@example.com` / `password`
   - Freelancer: `freelancer@example.com` / `password`

5. **Start the application**:
   ```bash
   npm run dev
   ```
   This starts both backend (port 4000) and frontend (port 3000) concurrently.

6. **Visit the app**: http://localhost:3000

The app will automatically log you in as the seeded client user.

### Manual Start (Two Terminals)

If you prefer to run backend and frontend separately:

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `PATCH /api/projects/:id/milestone/:idx` - Update milestone status

### Messages
- `GET /api/messages/:withUserId` - Get messages with specific user
- `POST /api/messages` - Send new message

### Profiles
- `GET /api/profiles/me` - Get current user profile
- `POST /api/profiles/me` - Update user profile
- `GET /api/profiles/recommend?skills=a,b` - Get recommended freelancers

### Payments (Dummy)
- `POST /api/payments/hold` - Hold funds for project
- `POST /api/payments/:id/release` - Release held funds
- `POST /api/payments/:id/refund` - Refund held funds

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification

### Health
- `GET /api/health` - API health check

### Sample API Calls

```bash
# Register new user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password","name":"Test User","role":"client"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","password":"password"}'

# Get projects (with JWT token)
curl -X GET http://localhost:4000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing

Run the test suite:
```bash
npm test
```

Tests cover:
- Authentication flows
- Message encryption/decryption
- Payment system operations
- API endpoint functionality

## Dummy Payment System

The payment system is completely dummy - no real transactions occur. It simulates:
- **Hold**: Creates a transaction with HELD status
- **Release**: Changes status from HELD to RELEASED
- **Refund**: Changes status from HELD to REFUNDED

All payment operations are logged and stored in the database for tracking.

## Email System

By default, emails are logged to the console (`EMAIL_TRANSPORT=console`). 

To use real SMTP, update your `.env`:
```
EMAIL_TRANSPORT=smtp
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
```

## Production Deployment

### Security Enhancements
- Enable HTTPS with SSL certificates
- Use a strong JWT secret (32+ characters)
- Enable MongoDB authentication
- Configure proper CORS origins
- Use environment-specific secrets

### Scalability
- **Database**: Use MongoDB Atlas or managed MongoDB
- **Cache**: Add Redis for session storage and Socket.IO adapter
- **Load Balancing**: Use nginx or cloud load balancers
- **WebSockets**: Scale with Redis adapter for Socket.IO

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-32-chars-min
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
REDIS_URL=redis://your-redis-instance
```

### Docker (Optional)
While this codebase runs without Docker, you can containerize for production:

```dockerfile
# Example Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
EXPOSE 4000
CMD ["npm", "start"]
```

### Payment Integration
To replace dummy payments with real payment processing:

1. Install Stripe SDK: `npm install stripe`
2. Replace `services/payment.js` with Stripe integration
3. Add Stripe webhook handlers
4. Update payment endpoints to call Stripe APIs

## Architecture Notes

### Message Encryption
Messages are encrypted using AES-256-GCM before storage and decrypted on retrieval. The encryption key is derived from JWT_SECRET.

### Real-time Features
Socket.IO handles:
- Live chat messaging
- Project update notifications
- System notifications
- User presence indicators

### Recommendation System
Simple heuristic-based matching using:
- Skill overlap scoring
- User ratings
- Availability status

For advanced ML recommendations, consider integrating TensorFlow.js:
```javascript
// Future ML integration example
const tf = require('@tensorflow/tfjs-node');
// Implement collaborative filtering or content-based recommendations
```

## Folder Structure

```
freelance-project-tracker/
├── backend/           # Express API server
│   ├── models/        # Mongoose models
│   ├── routes/        # API route handlers
│   ├── middleware/    # Custom middleware
│   ├── services/      # Business logic
│   ├── scripts/       # Database seeding
│   └── tests/         # Jest tests
├── frontend/          # Next.js application
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   ├── lib/           # Utility functions
│   └── public/        # Static assets
├── shared/            # Shared constants and utilities
└── docs/              # Additional documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
