// API Configuration - ใช้ environment variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.MODE === 'production' 
    ? 'https://sodeclickp-production.up.railway.app'
    : 'http://localhost:5000'
);
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
  import.meta.env.MODE === 'production'
    ? 'https://sodeclickp-production.up.railway.app'
    : 'http://localhost:5000'
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
  // Auth endpoints
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  AUTH_ME: `${API_BASE_URL}/api/auth/me`,
  
  // User endpoints
  USERS_DISCOVER: `${API_BASE_URL}/api/users/discover`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/api/health`,
  
  // Upload
  UPLOAD: `${API_BASE_URL}/api/upload`
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ADMIN: '/admin',
  CHAT: '/chat'
};
