// API Configuration - ใช้ environment variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.MODE === 'production' 
    ? 'https://sodeclickp-production.up.railway.app'
    : '${API_BASE_URL}'
);
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
  import.meta.env.MODE === 'production'
    ? 'https://sodeclickp-production.up.railway.app'
    : '${API_BASE_URL}'
);

// Debug information
console.log('🔧 Environment Configuration:');
console.log(`   Mode: ${import.meta.env.MODE}`);
console.log(`   VITE_API_URL: ${import.meta.env.VITE_API_URL}`);
console.log(`   Final API_BASE_URL: ${API_BASE_URL}`);

// Console log สำหรับ debug
console.log('🔧 Frontend Configuration:');
console.log(`   API_BASE_URL: ${API_BASE_URL}`);
console.log(`   SOCKET_URL: ${SOCKET_URL}`);
console.log(`   Environment: ${import.meta.env.MODE}`);
console.log('Mode:', import.meta.env.MODE);
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

export const ADMIN_CREDENTIALS = {
  EMAIL: 'admin@sodeclick.com',
  PASSWORD: 'root77'
};

export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me'
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  VERIFY_TOKEN: `${API_BASE_URL}/api/auth/verify`,
  
  // Profile
  GET_PROFILE: `${API_BASE_URL}/api/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/profile`,
  GET_PHOTOS: `${API_BASE_URL}/api/profile/photos`,
  DELETE_PHOTO: `${API_BASE_URL}/api/profile/photos`,
  SET_PROFILE_PHOTO: `${API_BASE_URL}/api/profile/photos`,
  REORDER_PHOTOS: `${API_BASE_URL}/api/profile/photos/reorder`,
  
  // Upload
  UPLOAD: `${API_BASE_URL}/api/upload`,
  
  // Users
  GET_USERS: `${API_BASE_URL}/api/users`,
  GET_USER_BY_ID: `${API_BASE_URL}/api/users`,
  
  // Chat
  GET_CONVERSATIONS: `${API_BASE_URL}/api/chat/conversations`,
  GET_MESSAGES: `${API_BASE_URL}/api/chat/messages`,
  SEND_MESSAGE: `${API_BASE_URL}/api/chat/messages`,
  
  // Membership
  GET_PLANS: `${API_BASE_URL}/api/membership/plans`,
  UPGRADE_MEMBERSHIP: `${API_BASE_URL}/api/membership/upgrade`,
  
  // Admin
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_MEMBERSHIPS: `${API_BASE_URL}/api/admin/memberships`,
  ADMIN_PAYMENTS: `${API_BASE_URL}/api/admin/payments`,
  
  // Health
  HEALTH: `${API_BASE_URL}/health`,
  API_HEALTH: `${API_BASE_URL}/api/health`
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ADMIN: '/admin',
  CHAT: '/chat'
};
