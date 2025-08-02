#!/usr/bin/env node

/**
 * Health Check Script for Railway Deployment
 * Usage: node healthCheck.js [URL]
 */

const https = require('https');
const http = require('http');

const DEFAULT_URL = process.env.RAILWAY_STATIC_URL || 'http://localhost:5000';
const url = process.argv[2] || DEFAULT_URL;

function checkHealth(targetUrl) {
  const healthUrl = `${targetUrl}/health`;
  const protocol = targetUrl.startsWith('https') ? https : http;
  
  console.log(`🔍 Checking health at: ${healthUrl}`);
  console.log('⏳ Please wait...\n');

  const req = protocol.get(healthUrl, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 Status Code: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        try {
          const healthData = JSON.parse(data);
          console.log('✅ Backend is healthy!');
          console.log('📋 Health Report:');
          console.log(`   - Service: ${healthData.service}`);
          console.log(`   - Status: ${healthData.status}`);
          console.log(`   - Environment: ${healthData.environment}`);
          console.log(`   - Port: ${healthData.port}`);
          console.log(`   - Uptime: ${Math.round(healthData.uptime)}s`);
          console.log(`   - MongoDB: ${healthData.mongodb?.status || 'unknown'}`);
          console.log(`   - Timestamp: ${healthData.timestamp}`);
        } catch (error) {
          console.log('⚠️  Response is not valid JSON:', data);
        }
      } else {
        console.log(`❌ Health check failed with status: ${res.statusCode}`);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Health check failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Suggestion: Server might not be running or wrong URL');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   💡 Suggestion: Check the domain name');
    }
  });

  req.setTimeout(10000, () => {
    console.log('❌ Health check timed out (10s)');
    req.destroy();
  });
}

// API endpoints test
function testApiEndpoints(targetUrl) {
  const endpoints = [
    '/api/users/discover',
    '/api/auth/me'
  ];

  console.log('\n🧪 Testing API endpoints...\n');

  endpoints.forEach(endpoint => {
    const apiUrl = `${targetUrl}${endpoint}`;
    const protocol = targetUrl.startsWith('https') ? https : http;
    
    const req = protocol.get(apiUrl, (res) => {
      console.log(`📡 ${endpoint}: ${res.statusCode === 200 ? '✅' : '❌'} (${res.statusCode})`);
    });

    req.on('error', (error) => {
      console.log(`📡 ${endpoint}: ❌ (${error.code})`);
    });

    req.setTimeout(5000, () => {
      console.log(`📡 ${endpoint}: ❌ (TIMEOUT)`);
      req.destroy();
    });
  });
}

// Main execution
console.log('🚀 Railway Deployment Health Check');
console.log('=====================================\n');

checkHealth(url);

// Test API endpoints after 2 seconds
setTimeout(() => testApiEndpoints(url), 2000);

// Exit after 15 seconds
setTimeout(() => {
  console.log('\n✨ Health check completed!');
  process.exit(0);
}, 15000);
