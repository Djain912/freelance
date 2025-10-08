import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecretchange');
    
    // Get user from database to ensure user still exists and is active
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token. User not found or inactive.' });
    }
    
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

// Optional auth middleware (allows both authenticated and anonymous requests)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token provided, continue as anonymous
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      return next(); // No token provided, continue as anonymous
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecretchange');
    const user = await User.findById(decoded.userId);
    
    if (user && user.isActive) {
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      };
    }
    
    next();
  } catch (error) {
    // If token is invalid, continue as anonymous
    next();
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. Authentication required.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}` 
      });
    }
    
    next();
  };
};

// Resource ownership middleware
export const checkOwnership = (resourceIdParam = 'id', userIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Access denied. Authentication required.' });
      }
      
      // Admin can access any resource
      if (req.user.role === 'admin') {
        return next();
      }
      
      const resourceId = req.params[resourceIdParam];
      
      if (!resourceId) {
        return res.status(400).json({ message: 'Resource ID not provided.' });
      }
      
      // Store resource info for route handlers
      req.resourceCheck = {
        resourceId,
        userIdField,
        userId: req.user.id
      };
      
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ message: 'Server error during ownership verification.' });
    }
  };
};

// Rate limiting middleware (simple in-memory implementation)
const rateLimitStore = new Map();

export const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [key, data] of rateLimitStore.entries()) {
      if (data.timestamp < windowStart) {
        rateLimitStore.delete(key);
      }
    }
    
    // Get current request count for this client
    const clientRequests = Array.from(rateLimitStore.entries())
      .filter(([key, data]) => key.startsWith(clientId) && data.timestamp >= windowStart)
      .length;
    
    if (clientRequests >= maxRequests) {
      return res.status(429).json({
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Store this request
    rateLimitStore.set(`${clientId}:${now}`, { timestamp: now });
    
    next();
  };
};
