const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(
  'mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0',
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log('MongoDB connected'))
 .catch(err => console.error('MongoDB connection error:', err));

// Chat message schema
const MessageSchema = new mongoose.Schema({
  from: String,
  text: String,
  user: {
    id: Number,
    name: String,
    avatar: String
  },
  timestamp: { type: Date, default: Date.now }
}, { collection: 'messages' });

const Message = mongoose.model('Message', MessageSchema);

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Load recent messages when user connects
  socket.on('load_messages', async () => {
    try {
      const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
      socket.emit('messages_loaded', messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  });

  // Handle new message
  socket.on('send_message', async (messageData) => {
    try {
      const newMessage = new Message(messageData);
      await newMessage.save();
      
      // Broadcast to all connected clients
      io.emit('new_message', messageData);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Upload routes
const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);

// AI Matching routes
const aiMatchingRoutes = require('./routes/aiMatching');
app.use('/api/ai', aiMatchingRoutes);

// Example route
app.get('/', (req, res) => {
  res.send('Love Finder Backend Running with Socket.IO and File Upload');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

server.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});
