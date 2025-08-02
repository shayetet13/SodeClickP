import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import DJDashboard from './pages/dj/DJDashboard';
import DJManagement from './pages/admin/DJManagement';
import AdminDashboard from './pages/admin/AdminDashboard';
import SuperstarPage from './pages/superstar/SuperstarPage';
import PrivateChatPage from './pages/chat/PrivateChatPage';
import UserProfile from './pages/profile/UserProfile';
import { useAuth } from './contexts/AuthContext';

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route 
        path="/admin" 
        element={
          user?.role === 'admin' ? 
          <AdminDashboard /> : 
          <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-400 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
              <p className="text-zinc-400">เฉพาะ Admin เท่านั้นที่สามารถเข้าถึงหน้านี้ได้</p>
            </div>
          </div>
        } 
      />
      <Route 
        path="/dj-dashboard" 
        element={
          user?.role === 'admin' || user?.djStatus === 'approved' ? 
          <DJDashboard /> : 
          <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-400 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
              <p className="text-zinc-400">คุณต้องได้รับอนุมัติให้เป็น DJ ก่อน</p>
            </div>
          </div>
        } 
      />
      <Route 
        path="/admin/dj-management" 
        element={
          user?.role === 'admin' ? 
          <DJManagement /> : 
          <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-400 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
              <p className="text-zinc-400">เฉพาะ Admin เท่านั้นที่สามารถเข้าถึงหน้านี้ได้</p>
            </div>
          </div>
        }
      />
      <Route
        path="/superstar"
        element={<SuperstarPage />}
      />
      <Route
        path="/chat/:userId"
        element={<PrivateChatPage />}
      />
      <Route
        path="/profile"
        element={<UserProfile />}
      />
      <Route
        path="/profile/:username"
        element={<UserProfile />}
      />
    </Routes>
  );
}
