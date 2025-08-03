import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import DJDashboard from './pages/dj/DJDashboard';
import DJManagement from './pages/admin/DJManagement';
import AdminDashboard from './pages/admin/AdminDashboard';
import SuperstarPage from './pages/superstar/SuperstarPage';
import PrivateChatPage from './pages/chat/PrivateChatPage';
import ChatPage from './pages/chat/ChatPage';
import UserProfile from './pages/profile/UserProfile';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Routes - ต้องเข้าสู่ระบบ */}
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/chat/:userId"
        element={
          <ProtectedRoute>
            <PrivateChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      
      {/* Admin Routes - ต้องเป็น admin */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/dj-management" 
        element={
          <ProtectedRoute requiredRole="admin">
            <DJManagement />
          </ProtectedRoute>
        }
      />
      
      {/* DJ Routes - ต้องเป็น admin หรือ DJ ที่ได้รับการอนุมัติ */}
      <Route 
        path="/dj-dashboard" 
        element={
          <ProtectedRoute>
            <DJDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Public Routes */}
      <Route
        path="/superstar"
        element={<SuperstarPage />}
      />
    </Routes>
  );
}
