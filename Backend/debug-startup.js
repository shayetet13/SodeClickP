#!/usr/bin/env node

// Debug script สำหรับตรวจสอบการ start ของ Railway
console.log('🚀 Starting Railway Debug Script...');
console.log('==========================================');

// ตรวจสอบ Environment Variables
console.log('📋 Environment Variables:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
console.log(`PORT: ${process.env.PORT || 'NOT SET'}`);
console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? 'SET ✅' : 'NOT SET ❌'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'SET ✅' : 'NOT SET ❌'}`);
console.log(`CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'NOT SET'}`);
console.log(`ADMIN_USERNAME: ${process.env.ADMIN_USERNAME || 'NOT SET'}`);
console.log('==========================================');

// ตรวจสอบ MongoDB Connection
const mongoose = require('mongoose');

console.log('🔗 Testing MongoDB Connection...');

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

const mongoUri = process.env.MONGODB_URI;
console.log(`🔑 Connecting to: ${mongoUri.replace(/\/\/.*:.*@/, '//***:***@')}`);

// Test MongoDB connection
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 second timeout
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  retryReads: true
}).then(() => {
  console.log('✅ MongoDB Connection: SUCCESS');
  console.log(`📂 Database: ${mongoose.connection.db.databaseName}`);
  console.log(`🌐 Host: ${mongoose.connection.host}`);
  
  // Test basic operations
  console.log('🧪 Testing basic operations...');
  
  // Start the actual server
  console.log('🚀 Starting main server...');
  require('./server.js');
  
}).catch((error) => {
  console.error('❌ MongoDB Connection: FAILED');
  console.error('Error:', error.message);
  console.error('==========================================');
  console.error('🔧 Possible solutions:');
  console.error('1. Check MONGODB_URI in Railway Variables');
  console.error('2. Verify MongoDB Atlas IP whitelist (0.0.0.0/0)');
  console.error('3. Check database user permissions');
  console.error('4. Verify cluster is active');
  process.exit(1);
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled Rejection:', error);
  process.exit(1);
});

console.log('🎯 Debug script loaded successfully');