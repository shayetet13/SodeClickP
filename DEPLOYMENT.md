# 🚀 Railway Deployment Guide

## 📋 Prerequisites

1. **Railway Account**: สมัครที่ [railway.app](https://railway.app)
2. **GitHub Repository**: โปรเจคต้องอยู่ใน GitHub
3. **MongoDB Atlas**: สำหรับฐานข้อมูล

## 🛠️ การติดตั้งแบบ Monorepo (แนะนำ)

### 1. สร้าง Railway Project
```bash
# ไปที่ Railway Dashboard
# สร้าง New Project
# เลือก "Deploy from GitHub repo"
# เลือก root directory ของโปรเจค
```

### 2. ตั้งค่า Environment Variables
ใน Railway Dashboard > Variables:

#### Backend Environment Variables
```env
# Database Configuration
MONGODB_URI=mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=5000
NODE_ENV=production
HOST=0.0.0.0

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters_long
JWT_EXPIRE=24h

# CORS Configuration
CORS_ORIGIN=https://authentic-endurance-production.up.railway.app

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Admin Configuration
ADMIN_USERNAME=Admin
ADMIN_EMAIL=admin@sodeclick.com
ADMIN_PASSWORD=root77

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Payment Configuration (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Health Check Configuration
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_INTERVAL=30000
```

#### Frontend Environment Variables
```env
# API Configuration
VITE_API_URL=https://sodeclick-production.up.railway.app
VITE_SOCKET_URL=https://sodeclick-production.up.railway.app

# App Configuration
VITE_APP_NAME=Love App
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Elite Dating Platform

# Feature Flags
VITE_ENABLE_CHAT=true
VITE_ENABLE_PREMIUM=true
VITE_ENABLE_ADMIN=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=false

# UI Configuration
VITE_THEME_PRIMARY_COLOR=#007bff
VITE_THEME_SECONDARY_COLOR=#6c757d
VITE_DEFAULT_LANGUAGE=th

# Payment Configuration (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Analytics Configuration (Optional)
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_FACEBOOK_PIXEL_ID=your_facebook_pixel_id
```

### 3. Deploy
```bash
# Railway จะ auto-deploy เมื่อ push ไป GitHub
# หรือใช้ Railway CLI:
railway login
railway link
railway up
```

## 🛠️ การติดตั้งแบบแยก Service (Alternative)

## 🎨 การติดตั้ง Frontend

### 1. สร้าง Frontend Service
```bash
# ใน Railway Project เดียวกัน
# สร้าง New Service > GitHub Repo
# เลือก Frontend directory
```

### 2. ตั้งค่า Environment Variables
```env
VITE_API_URL=https://your-backend-domain.railway.app
VITE_SOCKET_URL=https://your-backend-domain.railway.app
VITE_APP_NAME=Love App
VITE_APP_VERSION=1.0.0
VITE_ENABLE_CHAT=true
VITE_ENABLE_PREMIUM=true
VITE_ENABLE_ADMIN=true
```

### 3. Deploy Frontend
```bash
# Railway จะ build และ deploy อัตโนมัติ
# ตรวจสอบ build logs ใน Railway Dashboard
```

## 🔧 การตั้งค่า Domain

### 1. Custom Domain (Optional)
```bash
# ใน Railway Dashboard > Settings > Domains
# เพิ่ม custom domain
```

### 2. Environment Variables Update
หลังจากได้ domain แล้ว ให้อัพเดท:
- `CORS_ORIGIN` ใน Backend
- `VITE_API_URL` และ `VITE_SOCKET_URL` ใน Frontend

## 📊 การตรวจสอบ

### 1. Health Check
- Backend: `https://your-backend-domain.railway.app/health`
- Frontend: `https://your-frontend-domain.railway.app/`

### 2. Logs
```bash
# ดู logs ใน Railway Dashboard
# หรือใช้ Railway CLI:
railway logs
```

## 🚨 Troubleshooting

### Build Issues
1. **npm ci Error**: เปลี่ยนเป็น `npm install` ใน Dockerfile
2. **Missing package-lock.json**: รัน `npm install` ใน local ก่อน push
3. **Node Version**: ตรวจสอบ Node.js version compatibility
4. **Terser Error**: เปลี่ยน minify เป็น 'esbuild' ใน vite.config.js
5. **Build Timeout**: เพิ่ม build timeout ใน railway configuration

### Backend Issues
1. **MongoDB Connection**: ตรวจสอบ `MONGODB_URI`
2. **Port Issues**: ตรวจสอบ `PORT` variable
3. **CORS Errors**: ตรวจสอบ `CORS_ORIGIN`

### Frontend Issues
1. **Build Failures**: ตรวจสอบ `package.json` scripts
2. **API Connection**: ตรวจสอบ `VITE_API_URL`
3. **Environment Variables**: ตรวจสอบ VITE_ prefix
4. **Docker Issues**: ตรวจสอบ Dockerfile และ port configuration
5. **Preview Mode**: ตรวจสอบ vite preview configuration
6. **Service Unavailable**: ตรวจสอบ static file serving
7. **Port Issues**: ตรวจสอบ PORT environment variable

### Railway Specific Issues
1. **Build Timeout**: เพิ่ม build timeout ใน railway.json
2. **Memory Issues**: ตรวจสอบ memory limits
3. **Environment Variables**: ตรวจสอบการตั้งค่าใน Railway Dashboard
4. **Healthcheck Failed**: ตรวจสอบ healthcheckPath และ timeout
5. **Port Issues**: ตรวจสอบ PORT environment variable
6. **MongoDB Connection**: ตรวจสอบ MONGODB_URI

### 🩺 Healthcheck Issues (Fixed)

**ปัญหาที่พบ:**
1. **curl command not found**: Alpine Linux ไม่มี curl ติดตั้งมาโดยปริยาย
2. **Health endpoint ช้า**: รอ MongoDB connection ทำให้ timeout
3. **Start period สั้น**: ไม่เพียงพอสำหรับ MongoDB connection

**การแก้ไข:**
1. **เพิ่ม curl ใน Dockerfile**:
   ```dockerfile
   # Install curl for healthcheck
   RUN apk add --no-cache curl
   ```

2. **ปรับปรุง health endpoint**:
   - ลบการตรวจสอบ MongoDB connection ออกจาก `/health`
   - ให้ตอบสนองทันทีเพื่อผ่าน healthcheck
   - เก็บ MongoDB status ไว้ใน `/api/health` สำหรับ monitoring

3. **ปรับ healthcheck settings**:
   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
     CMD curl -f http://localhost:5000/health || exit 1
   ```

4. **ปรับปรุง railway.toml**:
   ```toml
   [deploy]
   healthcheckPath = "/health"
   healthcheckTimeout = 300
   healthcheckInterval = 30
   ```

5. **ปรับปรุง port binding**:
   ```javascript
   const PORT = process.env.PORT || config.server.port || 5000;
   ```

## 📝 คำสั่งที่มีประโยชน์

```bash
# Railway CLI
railway login
railway link
railway up
railway logs
railway status

# Local Development
npm install
npm run dev

# Build สำหรับ Production
npm run build
npm run build:frontend
npm run build:backend

# Docker Development
docker-compose up --build
```

## 🔐 Security Notes

1. **Environment Variables**: อย่า commit `.env` files
2. **JWT Secret**: ใช้ strong secret key
3. **MongoDB**: ใช้ connection string ที่ปลอดภัย
4. **CORS**: ตั้งค่าเฉพาะ domain ที่อนุญาต

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ Railway logs
2. ตรวจสอบ environment variables
3. ตรวจสอบ MongoDB connection
4. ตรวจสอบ CORS settings 
## 🚀 Production Status

**Current Production URLs:**
- Backend: https://sodeclick-production.up.railway.app
- Frontend: https://authentic-endurance-production.up.railway.app

**Production Health Status:**
- ❌ Backend: 502 Application failed to respond (needs redeploy with fixes)
- ⚠️ Frontend: Status unknown (needs verification)

**Environment Variables for Production:**
```env
# Backend Production
CORS_ORIGIN=https://authentic-endurance-production.up.railway.app

# Frontend Production  
VITE_API_URL=https://sodeclick-production.up.railway.app
VITE_SOCKET_URL=https://sodeclick-production.up.railway.app
```

**Next Steps for Production:**
1. Deploy updated Backend with healthcheck fixes
2. Verify Frontend deployment with correct port configuration
3. Update Environment Variables in Railway Dashboard
4. Test production healthcheck endpoints

**Recent Fixes Applied:**
- ✅ Added curl to Docker images for healthcheck
- ✅ Fixed port configuration (5173 for Frontend)
- ✅ Resolved ES Module conflicts (serve.cjs)
- ✅ Added proper start-period for healthcheck
- ✅ Enhanced Environment Variables configuration
## 🚨 CORS Issue Fix

**ปัญหาที่เกิดขึ้น:**
```
Access to fetch at 'http://localhost:5000/api/users/discover' from origin 'https://authentic-endurance-production.up.railway.app' has been blocked by CORS policy
```

**สาเหตุของปัญหา:**
1. **Frontend production ใช้ localhost Backend** - Frontend บน Railway พยายามเรียก `http://localhost:5000` แทนที่จะเป็น production Backend
2. **Mixed content** - HTTPS site เรียก HTTP API ถูกบล็อกโดย browser
3. **CORS configuration** - Backend ไม่ได้ตั้งค่า CORS สำหรับ production Frontend

**วิธีแก้ไข:**

### 1. อัปเดต Environment Variables ใน Railway Dashboard

**Backend Service:**
```env
CORS_ORIGIN=https://authentic-endurance-production.up.railway.app
```

**Frontend Service:**
```env
VITE_API_URL=https://sodeclick-production.up.railway.app
VITE_SOCKET_URL=https://sodeclick-production.up.railway.app
```

### 2. ขั้นตอนการแก้ไข

1. **ไปที่ Railway Dashboard**
2. **เลือก Backend Service**
   - ไปที่ Variables tab
   - เพิ่ม `CORS_ORIGIN=https://authentic-endurance-production.up.railway.app`
   - Deploy ใหม่

3. **เลือก Frontend Service**
   - ไปที่ Variables tab
   - เพิ่ม `VITE_API_URL=https://sodeclick-production.up.railway.app`
   - เพิ่ม `VITE_SOCKET_URL=https://sodeclick-production.up.railway.app`
   - Deploy ใหม่

### 3. ตรวจสอบการทำงาน

หลังจาก deploy แล้ว ให้ทดสอบ:
- Backend health: `https://sodeclick-production.up.railway.app/health`
- Frontend: `https://authentic-endurance-production.up.railway.app`

**หมายเหตุ:** การเปลี่ยนแปลง Environment Variables จะทำให้ service redeploy อัตโนมัติ