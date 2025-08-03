# Railway Deployment Guide - ขั้นตอนทั้งหมด 🚀

## 📋 สิ่งที่ต้องเตรียม

1. **GitHub Repository**: push โค้ดขึ้น GitHub
2. **Railway Account**: สมัครที่ https://railway.app
3. **MongoDB Atlas**: ใช้ connection string ที่มีอยู่แล้ว

## 🔧 ขั้นตอนที่ 1: Deploy Backend

### 1.1 สร้าง Backend Project
```bash
# ใน Railway Dashboard
1. New Project → Deploy from GitHub repo
2. เลือก repository ของคุณ
3. ตั้งชื่อ project: "love-backend"
4. เลือก Branch: main
5. Root Directory: Backend
```

### 1.2 ตั้งค่า Environment Variables
```bash
# ไปที่ Variables tab และเพิ่ม:
MONGODB_URI=mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
PORT=5000
JWT_SECRET=love_app_super_secure_jwt_secret_key_production_2024_very_long_string
JWT_EXPIRE=24h
ADMIN_USERNAME=Admin
ADMIN_EMAIL=admin@sodeclick.com
ADMIN_PASSWORD=root77
BCRYPT_ROUNDS=12
SESSION_SECRET=love_app_session_secret_production_2024
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# ปล่อยไว้ก่อน จะมาแก้ทีหลัง
CORS_ORIGIN=http://localhost:5173
```

### 1.3 Deploy และทดสอบ
```bash
# Deploy จะเริ่มอัตโนมัติ
# ตรวจสอบ logs ใน Deployments tab
# รอจนกว่าจะแสดง: ✅ MongoDB Atlas Connected Successfully!

# ทดสอบ health check:
curl https://your-backend-url.up.railway.app/health
```

---

## 🖥️ ขั้นตอนที่ 2: Deploy Frontend

### 2.1 สร้าง Frontend Project
```bash
# สร้าง project ใหม่ใน Railway
1. New Project → Deploy from GitHub repo
2. เลือก repository เดียวกัน
3. ตั้งชื่อ project: "love-frontend"
4. เลือก Branch: main
5. Root Directory: Frontend
```

### 2.2 ตั้งค่า Environment Variables สำหรับ Frontend
```bash
# แทนที่ your-backend-url ด้วย URL จริงจากขั้นตอนที่ 1
VITE_API_URL=https://sodeclick-production.up.railway.app
VITE_SOCKET_URL=https://sodeclick-production.up.railway.app
VITE_APP_NAME=Love App
VITE_ENABLE_CHAT=true
VITE_ENABLE_PREMIUM=true
```

### 2.3 Deploy Frontend
```bash
# Deploy จะเริ่มอัตโนมัติ
# รอจนกว่าจะเสร็จสิ้น
```

---

## 🔄 ขั้นตอนที่ 3: อัพเดท CORS

### 3.1 อัพเดท Backend Variables
```bash
# กลับไปที่ Backend project
# อัพเดท CORS_ORIGIN ใน Variables:
CORS_ORIGIN=https://your-frontend-url.up.railway.app

# Redeploy Backend
```

---

## 🧪 ขั้นตอนที่ 4: ทดสอบการเชื่อมต่อ

### 4.1 ทดสอบ Backend
```bash
# Health Check
curl https://sodeclick-production.up.railway.app/health

# API Test
curl https://sodeclick-production.up.railway.app/api/health

# User Discovery Test
curl https://sodeclick-production.up.railway.app/api/users/discover
```

### 4.2 ทดสอบ Frontend
```bash
# เปิด browser ไปที่:
https://your-frontend-url.up.railway.app

# ตรวจสอบ Console (F12):
- ไม่มี CORS errors
- API calls สำเร็จ
- WebSocket connection สำเร็จ
```

---

## 🐛 การแก้ไขปัญหาที่พบบ่อย

### ❌ MongoDB Connection Failed
```bash
# ตรวจสอบ:
1. MONGODB_URI ถูกต้องใน Variables
2. IP Whitelist ใน MongoDB Atlas (ตั้งเป็น 0.0.0.0/0)
3. Database user มี permission
4. ดู logs ใน Railway: "Connection URI: mongodb+srv://***:***@cluster0..."
```

### ❌ CORS Errors
```bash
# ตรวจสอบ:
1. CORS_ORIGIN ใน Backend ตรงกับ domain จริงของ Frontend
2. ไม่มี trailing slash
3. Protocol (https://) ถูกต้อง
4. Redeploy Backend หลังแก้ CORS_ORIGIN
```

### ❌ CSP Blocking
```bash
# อาการ: แอป load ไม่ได้ ใน console มี CSP errors
# แก้ไข: โค้ดได้อัพเดท CSP headers ให้รองรับ Railway domains แล้ว
```

### ❌ Static Files ไม่ load
```bash
# ตรวจสอบ:
1. uploads folder สร้างอัตโนมัติ
2. /uploads route ทำงาน
3. File permissions
```

---

## 📊 ตรวจสอบสถานะ

### Backend Health Check Response:
```json
{
  "status": "OK",
  "service": "backend",
  "environment": "production",  
  "mongodb": {
    "status": "connected",
    "readyState": 1,
    "uri": "Atlas Cloud"
  },
  "cors": {
    "origins": ["https://your-frontend-url.up.railway.app"]
  }
}
```

### Frontend Console (ไม่มี errors):
```javascript
🔧 Frontend Configuration:
   API_BASE_URL: https://your-backend-url.up.railway.app
   SOCKET_URL: https://your-backend-url.up.railway.app
   Environment: production
```

---

## 🚀 Production Checklist

- [ ] Backend deployed และ health check ผ่าน
- [ ] Frontend deployed และ load ได้
- [ ] MongoDB connection สำเร็จ
- [ ] CORS configuration ถูกต้อง
- [ ] API endpoints ทำงาน
- [ ] WebSocket connection สำเร็จ
- [ ] File upload ทำงาน
- [ ] Admin login ได้
- [ ] User registration ทำงาน

---

## 💡 Tips

1. **Always check logs**: Railway Dashboard > Deployments > View Logs
2. **Use health checks**: `/health` endpoint shows full system status
3. **Environment-specific configs**: ใช้ environment variables สำหรับแต่ละ environment
4. **Database backup**: ควร backup ก่อน deploy production
5. **Staging environment**: ทดสอบใน staging ก่อน production

หากยังมีปัญหา ให้ดู Railway logs และ browser console เพื่อหา error messages ที่เจาะจง ๆ!