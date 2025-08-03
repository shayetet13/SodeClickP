const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;

// ตั้งค่า CORS อย่างเข้มงวด
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Fallback server is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({
    message: 'Test endpoint working'
  });
});

app.listen(PORT, () => {
  console.log(`Fallback server running on http://localhost:${PORT}`);
});
