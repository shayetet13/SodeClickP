const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const config = require('./config');

const app = express();
const server = http.createServer(app);

// Health check route - ตอบสนองทันทีไม่รอ MongoDB
app.get('/health', (req, res) => {
  console.log(`🏥 Health check request from ${req.ip || req.connection.remoteAddress}`);
  
  const mongoStatus = mongoose.connection.readyState;
  const mongoStatusText = {
    0: 'disconnected',
    1: 'connected', 
    2: 'connecting',
    3: 'disconnecting'
  };

  const healthData = {
    status: 'OK',
    service: 'backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.server.nodeEnv,
    version: '1.0.0',
    port: process.env.PORT || config.server.port,
    host: process.env.HOST || '0.0.0.0',
    mongodb: {
      status: mongoStatusText[mongoStatus] || 'unknown',
      readyState: mongoStatus,
      uri: config.mongodb.uri.includes('mongodb+srv') ? 'Atlas Cloud' : 'Local'
    },
    cors: {
      origins: config.cors.origin
    },
    railway: {
      deployment: process.env.RAILWAY_DEPLOYMENT_ID || 'local',
      service: process.env.RAILWAY_SERVICE_NAME || 'local'
    }
  };

  console.log('✅ Health check response:', JSON.stringify(healthData, null, 2));
  res.status(200).json(healthData);
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'SodeClick API Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
    database: 'love'
  });
});

// เชื่อมต่อ MongoDB Atlas
console.log('🔗 Connecting to MongoDB Atlas...');
console.log(`📂 Database: love`);
console.log(`🌐 Cluster: cluster0.2g7xxjp.mongodb.net`);
console.log(`🔑 Connection URI: ${config.mongodb.uri.replace(/\/\/.*:.*@/, '//***:***@')}`);

mongoose.connect(config.mongodb.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // ขยายเวลา timeout
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  retryReads: true
})
.then(() => {
  console.log('✅ MongoDB Atlas Connected Successfully!');
  console.log('📂 Database: love');
  console.log('🌐 Cluster: cluster0.2g7xxjp.mongodb.net');
  
  // เพิ่ม Admin User เมื่อเชื่อมต่อกับ MongoDB สำเร็จ
  addAdminUser();
})
.catch((err) => {
  console.error('❌ MongoDB Atlas Connection Failed:', err.message);
  console.log('🔄 Retrying connection in 5 seconds...');
  setTimeout(() => {
    mongoose.connect(config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true
    })
      .then(() => console.log('✅ MongoDB Atlas Reconnected Successfully!'))
      .catch(() => console.error('❌ MongoDB Atlas Reconnection Failed'));
  }, 5000);
});

// ฟังก์ชันเพิ่ม Admin User
async function addAdminUser() {
  try {
    // ตรวจสอบว่ามี Admin User อยู่แล้วหรือไม่
    const adminExists = await User.findOne({ username: config.admin.username }).select('+password');
    
    if (!adminExists) {
      console.log('Creating admin user...');
      
      // สร้าง Admin User โดยใช้ bcrypt โดยตรง
      const salt = await bcrypt.genSalt(config.security.bcryptRounds);
      const hashedPassword = await bcrypt.hash(config.admin.password, salt);
      
      // สร้างผู้ใช้ใหม่โดยตรงใน collection
      await User.collection.insertOne({
        username: config.admin.username,
        email: config.admin.email,
        password: hashedPassword,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'System',
        verified: true,
        createdAt: new Date(),
        lastLogin: null
      });
      
      console.log('👑 Admin user created successfully!');
      console.log(`Username: ${config.admin.username}`);
      console.log(`Email: ${config.admin.email}`);
      console.log(`Password: ${config.admin.password}`);
    } else {
      console.log('👑 Admin user already exists:', adminExists.username);
      
      // ตรวจสอบว่ามี password ใน field หรือไม่
      if (!adminExists.password) {
        console.log('⚠️ Admin user has no password, fixing...');
        const salt = await bcrypt.genSalt(config.security.bcryptRounds);
        const hashedPassword = await bcrypt.hash(config.admin.password, salt);
        
        await User.updateOne(
          { _id: adminExists._id },
          { $set: { password: hashedPassword } }
        );
        console.log('✅ Admin password set!');
      } else {
        // ทดสอบรหัสผ่านปัจจุบัน - ตรวจสอบก่อนว่า password เป็น string
        if (typeof adminExists.password === 'string' && adminExists.password.length > 0) {
          try {
            const testMatch = await bcrypt.compare(config.admin.password, adminExists.password);
            console.log('Current password test:', testMatch);
            
            if (!testMatch) {
              console.log('Password mismatch, fixing...');
              const salt = await bcrypt.genSalt(config.security.bcryptRounds);
              const hashedPassword = await bcrypt.hash(config.admin.password, salt);
              
              await User.updateOne(
                { _id: adminExists._id },
                { $set: { password: hashedPassword } }
              );
              console.log('✅ Admin password fixed!');
            }
          } catch (compareError) {
            console.log('❌ Error comparing password, resetting...');
            const salt = await bcrypt.genSalt(config.security.bcryptRounds);
            const hashedPassword = await bcrypt.hash(config.admin.password, salt);
            
            await User.updateOne(
              { _id: adminExists._id },
              { $set: { password: hashedPassword } }
            );
            console.log('✅ Admin password reset!');
          }
        } else {
          console.log('⚠️ Invalid password format, fixing...');
          const salt = await bcrypt.genSalt(config.security.bcryptRounds);
          const hashedPassword = await bcrypt.hash(config.admin.password, salt);
          
          await User.updateOne(
            { _id: adminExists._id },
            { $set: { password: hashedPassword } }
          );
          console.log('✅ Admin password fixed!');
        }
      }
    }
  } catch (error) {
    console.error('❌ Error with admin user:', error);
    
    // ถ้าเกิด error ให้ลบ Admin user เก่าและสร้างใหม่
    try {
      console.log('🔄 Recreating admin user...');
      await User.deleteMany({ username: config.admin.username });
      
      const salt = await bcrypt.genSalt(config.security.bcryptRounds);
      const hashedPassword = await bcrypt.hash(config.admin.password, salt);
      
      await User.collection.insertOne({
        username: config.admin.username,
        email: config.admin.email,
        password: hashedPassword,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'System',
        verified: true,
        createdAt: new Date(),
        lastLogin: null
      });
      
      console.log('✅ Admin user recreated successfully!');
    } catch (recreateError) {
      console.error('❌ Failed to recreate admin user:', recreateError);
    }
  }
}

// ติดตาม MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📴 Mongoose disconnected from MongoDB Atlas');
});

// Schema สำหรับข้อความแชท
const MessageSchema = new mongoose.Schema({
  from: String,
  text: String,
  image: String,
  user: {
    id: Number,
    name: String,
    avatar: String,
    verified: Boolean
  },
  replyTo: {
    text: String,
    user: {
      name: String
    }
  },
  timestamp: { type: Date, default: Date.now }
}, { collection: 'messages' });

const Message = mongoose.model('Message', MessageSchema);

// สร้างโฟลเดอร์ uploads/img ถ้ายังไม่มี
const uploadDir = path.join(__dirname, config.upload.uploadPath, 'img');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created uploads/img directory');
}

// สร้างโฟลเดอร์ uploads/avatar ถ้ายังไม่มี
const avatarDir = path.join(__dirname, config.upload.uploadPath, 'avatar');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
  console.log('📁 Created uploads/avatar directory');
  
  // สร้าง default avatar SVG
  const defaultAvatarSVG = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#92400e"/>
    <circle cx="50" cy="35" r="15" fill="#fff"/>
    <path d="M25 85c0-13.8 11.2-25 25-25s25 11.2 25 25v10H25v-10z" fill="#fff"/>
  </svg>`;
  
  const defaultAvatarPath = path.join(avatarDir, 'default.svg');
  fs.writeFileSync(defaultAvatarPath, defaultAvatarSVG);
  console.log('✅ Created default avatar SVG');
  
  // สร้าง default.png แบบ minimal
  const defaultAvatarBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const defaultPngPath = path.join(avatarDir, 'default.png');
  fs.writeFileSync(defaultPngPath, Buffer.from(defaultAvatarBase64, 'base64'));
  console.log('✅ Created default avatar PNG');
}

// ตั้งค่า multer สำหรับการอัพโหลดไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: config.upload.maxFileSize
  },
  fileFilter: function (req, file, cb) {
    // ตรวจสอบว่าเป็นไฟล์รูปภาพ
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ตั้งค่า CORS middleware
console.log('🔒 Setting up CORS for origins:', config.cors.origin);
app.use(cors(config.cors));

// เพิ่ม middleware สำหรับรองรับ credentials และ headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (config.cors.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', config.cors.methods.join(','));
  res.header('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(','));
  
  // Security Headers
  res.header('X-Frame-Options', 'DENY');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // CSP Header - อนุญาตให้ frontend domain เชื่อมต่อ
  const cspDirectives = [
    "default-src 'self'",
    `connect-src 'self' ${config.cors.origin.join(' ')} wss: https:`,
    "img-src 'self' data: https: blob:",
    "media-src 'self' https: blob:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https:",
    "font-src 'self' https: data:",
    "frame-ancestors 'none'"
  ].join('; ');
  
  res.header('Content-Security-Policy', cspDirectives);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// API health endpoint สำหรับ internal monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    database: 'love'
  });
});

// ปรับค่า config สำหรับ Socket.IO
const io = socketIo(server, {
  cors: config.cors,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'] // เพิ่ม polling เพื่อเป็น fallback
});

app.use(express.json());
app.use(cookieParser());

// เสิร์ฟไฟล์ static จากโฟลเดอร์ uploads
app.use('/uploads', express.static(path.join(__dirname, config.upload.uploadPath)));

// Route สำหรับอัพโหลดรูปภาพ
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // ส่งกลับ URL ของรูปภาพ
    const imageUrl = `/uploads/img/${req.file.filename}`;
    console.log(`📷 Image uploaded: ${req.file.filename}`);
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: 'Only image files are allowed!' });
  }
  next(error);
});

// เพิ่ม routes - ย้ายมาหลัง middleware
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// เพิ่ม admin routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// เพิ่ม membership routes
const membershipRoutes = require('./routes/membership');
app.use('/api/membership', membershipRoutes);

// เพิ่ม payment routes
const paymentRoutes = require('./routes/payment');
app.use('/api/payments', paymentRoutes);

// เพิ่ม admin membership routes
const adminMembershipRoutes = require('./routes/adminMembership');
app.use('/api/admin/memberships', adminMembershipRoutes);

// เรียกใช้ routes upload
const uploadRoutes = require('./routes/upload');
app.use('/api', uploadRoutes);

// เรียกใช้ routes aiMatching
const aiMatchingRoutes = require('./routes/aiMatching');
app.use('/api/ai', aiMatchingRoutes);

// เพิ่ม admin user routes
const adminUserRoutes = require('./routes/adminUsers');
app.use('/api/admin/users', adminUserRoutes);

// เพิ่ม profile routes
const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

// เพิ่ม users routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// Import new profile routes
const newProfileRoutes = require('./routes/newProfile');

// Routes
app.use('/api/new-profile', newProfileRoutes);

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Load recent messages when user connects
  socket.on('load_messages', async () => {
    try {
      const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
      socket.emit('messages_loaded', messages);
      console.log(`📨 Loaded ${messages.length} messages for user ${socket.id}`);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      // Fallback to in-memory storage if MongoDB is not available
      socket.emit('messages_loaded', []);
    }
  });

  // Handle new message
  socket.on('send_message', async (messageData) => {
    try {
      // Add timestamp if not present
      if (!messageData.timestamp) {
        messageData.timestamp = new Date();
      }
      
      // Save to MongoDB if connected
      if (mongoose.connection.readyState === 1) {
        const newMessage = new Message(messageData);
        await newMessage.save();
        console.log(`💬 Message saved to MongoDB from ${messageData.user?.name || 'Unknown'}`);
      } else {
        console.log('⚠️ MongoDB not connected, message not saved');
      }
      
      // Broadcast to all connected clients
      io.emit('new_message', messageData);
    } catch (error) {
      console.error('❌ Error saving message:', error);
      // Still broadcast even if save fails
      io.emit('new_message', messageData);
    }
  });

  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

// ดักจับ error ของ Socket.IO server
io.engine.on("connection_error", (err) => {
  console.log("Connection error:", err.req);      // the request object
  console.log("Connection error:", err.code);     // the error code, for example 1
  console.log("Connection error:", err.message);  // the error message, for example "Session ID unknown"
  console.log("Connection error:", err.context);  // some additional error context
});

// รองรับทั้งการเชื่อมต่อ HTTPS และ HTTP
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else if (e.code === 'EACCES') {
    console.error(`❌ Permission denied to bind to port ${PORT}`);
  } else {
    console.error('❌ Server error:', e);
  }
  process.exit(1);
});

server.on('listening', () => {
  const addr = server.address();
  console.log(`✅ Server successfully bound to ${addr.address}:${addr.port}`);
});

const PORT = process.env.PORT || config.server.port;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log('🚀 SodeClick Server Started!');
  console.log(`📡 Server running on: http://${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${config.server.nodeEnv}`);
  console.log(`🔧 Railway PORT: ${process.env.PORT || 'Not set'}`);
  console.log(`🔧 Railway HOST: ${process.env.HOST || 'Not set'}`);
  console.log('🔗 Socket.IO enabled for real-time chat');
  console.log('📤 File upload endpoint: /api/upload');
  console.log('👤 User authentication routes: /api/auth'); 
  console.log('💾 MongoDB Atlas status: Connecting...');
  console.log('🏥 Health check: /health');
  console.log('🏥 API Health check: /api/health');
  console.log('==========================================');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  console.log('📴 MongoDB Atlas connection closed');
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});

// สร้างโฟลเดอร์ models ถ้ายังไม่มี
const modelsDir = path.join(__dirname, 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
  console.log('📁 Created models directory');
}
