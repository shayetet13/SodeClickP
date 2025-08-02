require('dotenv').config();

const config = {
  // Database - ใช้ MongoDB Atlas URI ที่ให้มา
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0'
  },

  // Server
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here_minimum_32_characters_long_for_love_app_2024',
    expiresIn: process.env.JWT_EXPIRE || '24h'
  },

  // CORS - แยกการจัดการระหว่าง development และ production
  cors: {
    origin: (() => {
      if (process.env.CORS_ORIGIN) {
        return process.env.CORS_ORIGIN.split(',').map(url => url.trim());
      }
      
      // Default origins based on environment
      if (process.env.NODE_ENV === 'production') {
        return [
          'https://sodeclick-production.up.railway.app',
          'https://grateful-nourishment-production-68a2.up.railway.app'
        ];
      } else {
        return [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          
        ];
      }
    })(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },

  // Admin
  admin: {
    username: process.env.ADMIN_USERNAME || 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@sodeclick.com',
    password: process.env.ADMIN_PASSWORD || 'root77'
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET || 'your_session_secret_key_here_for_love_app_2024'
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Email Configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    },
    from: process.env.EMAIL_FROM || 'noreply@yourdomain.com'
  },

  // Payment Configuration
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
    }
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log'
  },

  // Health Check
  healthCheck: {
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000,
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000
  }
};

// Log configuration on startup
console.log('🔧 Configuration loaded:');
console.log(`   Environment: ${config.server.nodeEnv}`);
console.log(`   Port: ${config.server.port}`);
console.log(`   CORS Origins: ${JSON.stringify(config.cors.origin)}`);
console.log(`   MongoDB: ${config.mongodb.uri.includes('mongodb+srv') ? 'Atlas Cloud' : 'Local'}`);
console.log(`   Database: love`);

module.exports = config;