// User roles
export const USER_ROLES = {
  CLIENT: 'client',
  FREELANCER: 'freelancer',
  ADMIN: 'admin'
};

// Project statuses
export const PROJECT_STATUS = {
  DRAFT: 'draft',
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Milestone statuses
export const MILESTONE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  APPROVED: 'approved'
};

// Transaction statuses
export const TRANSACTION_STATUS = {
  HELD: 'held',
  RELEASED: 'released',
  REFUNDED: 'refunded'
};

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  FILE: 'file',
  SYSTEM: 'system'
};

// Notification types
export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  PROJECT_UPDATE: 'project_update',
  PAYMENT: 'payment',
  MILESTONE: 'milestone',
  SYSTEM: 'system'
};

// Socket events
export const SOCKET_EVENTS = {
  MESSAGE_RECEIVE: 'message:receive',
  PROJECT_UPDATE: 'project:update',
  NOTIFICATION: 'notification',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline'
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login'
  },
  PROJECTS: {
    LIST: '/api/projects',
    CREATE: '/api/projects',
    UPDATE_MILESTONE: '/api/projects/:id/milestone/:idx'
  },
  MESSAGES: {
    GET: '/api/messages/:withUserId',
    SEND: '/api/messages'
  },
  PROFILES: {
    ME: '/api/profiles/me',
    RECOMMEND: '/api/profiles/recommend'
  },
  PAYMENTS: {
    HOLD: '/api/payments/hold',
    RELEASE: '/api/payments/:id/release',
    REFUND: '/api/payments/:id/refund'
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    CREATE: '/api/notifications'
  },
  HEALTH: '/api/health'
};

// Common validation patterns
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  SKILLS_MAX_COUNT: 20
};

// Predefined skills for projects and profiles
export const PREDEFINED_SKILLS = {
  // Programming Languages
  PROGRAMMING: [
    'JavaScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
    'Kotlin', 'TypeScript', 'Scala', 'R', 'MATLAB', 'Perl', 'Lua', 'Dart', 'Elixir'
  ],
  
  // Web Development
  WEB_FRONTEND: [
    'React', 'Vue.js', 'Angular', 'HTML5', 'CSS3', 'SASS', 'LESS', 'Bootstrap', 'Tailwind CSS',
    'jQuery', 'Webpack', 'Vite', 'Next.js', 'Nuxt.js', 'Svelte', 'Alpine.js'
  ],
  
  WEB_BACKEND: [
    'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET',
    'Laravel', 'CodeIgniter', 'Ruby on Rails', 'Gin', 'Echo', 'Fiber'
  ],
  
  // Mobile Development
  MOBILE: [
    'React Native', 'Flutter', 'iOS Development', 'Android Development', 'Xamarin',
    'Ionic', 'Cordova', 'SwiftUI', 'Jetpack Compose', 'Unity Mobile'
  ],
  
  // Databases
  DATABASES: [
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server',
    'Cassandra', 'DynamoDB', 'Firebase', 'Supabase', 'CouchDB', 'Neo4j'
  ],
  
  // Cloud & DevOps
  CLOUD_DEVOPS: [
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI',
    'GitHub Actions', 'Terraform', 'Ansible', 'Nginx', 'Apache', 'Linux', 'Ubuntu'
  ],
  
  // Design & UI/UX
  DESIGN: [
    'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
    'InDesign', 'After Effects', 'Premiere Pro', 'Canva', 'Wireframing', 'Prototyping'
  ],
  
  // Data Science & AI
  DATA_AI: [
    'Machine Learning', 'Deep Learning', 'Data Analysis', 'Data Visualization',
    'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Tableau', 'Power BI'
  ],
  
  // Marketing & Business
  MARKETING: [
    'Digital Marketing', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing',
    'Email Marketing', 'Google Analytics', 'Facebook Ads', 'Google Ads', 'Copywriting'
  ],
  
  // Other Technical Skills
  OTHER_TECH: [
    'API Development', 'RESTful APIs', 'GraphQL', 'Microservices', 'Blockchain',
    'Cybersecurity', 'Testing', 'Quality Assurance', 'Technical Writing', 'Version Control (Git)'
  ],
  
  // Soft Skills
  SOFT_SKILLS: [
    'Project Management', 'Communication', 'Leadership', 'Problem Solving',
    'Time Management', 'Team Collaboration', 'Client Relations', 'Agile/Scrum'
  ]
};

// Flatten all skills into a single array for easy access
export const ALL_SKILLS = Object.values(PREDEFINED_SKILLS).flat().sort();

// UI constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
};

export default {
  USER_ROLES,
  PROJECT_STATUS,
  MILESTONE_STATUS,
  TRANSACTION_STATUS,
  MESSAGE_TYPES,
  NOTIFICATION_TYPES,
  SOCKET_EVENTS,
  API_ENDPOINTS,
  VALIDATION,
  UI_CONSTANTS,
  PREDEFINED_SKILLS,
  ALL_SKILLS
};
