const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 5173;
console.log(`🚀 Frontend server will run on port: ${PORT}`);

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint - ต้องมาก่อน catch-all route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'frontend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    port: PORT
  });
});

// Handle client-side routing - ต้องมาหลัง health check
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frontend server running on http://0.0.0.0:${PORT}`);
  console.log('📁 Serving static files from ./dist');
  console.log('🏥 Health check: /health');
});