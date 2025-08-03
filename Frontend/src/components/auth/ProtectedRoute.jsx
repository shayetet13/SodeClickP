import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Lock, LogIn } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // แสดง loading ขณะตรวจสอบ authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  // หากยังไม่เข้าสู่ระบบ
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900/90 border-amber-500/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <CardTitle className="text-white text-xl">ต้องเข้าสู่ระบบ</CardTitle>
            <p className="text-zinc-400 text-sm mt-2">
              คุณต้องเข้าสู่ระบบเพื่อเข้าถึงหน้านี้
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => window.location.href = '/login'}
            >
              <LogIn className="w-4 h-4 mr-2" />
              เข้าสู่ระบบ
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-800"
              onClick={() => window.location.href = '/register'}
            >
              สมัครสมาชิกใหม่
            </Button>
            <div className="text-center">
              <Button 
                variant="ghost" 
                className="text-zinc-500 hover:text-zinc-300"
                onClick={() => window.history.back()}
              >
                กลับไปหน้าก่อนหน้า
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // หากต้องการ role เฉพาะ
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900/90 border-red-500/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-white text-xl">ไม่มีสิทธิ์เข้าถึง</CardTitle>
            <p className="text-zinc-400 text-sm mt-2">
              คุณไม่มีสิทธิ์เข้าถึงหน้านี้
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-800"
              onClick={() => window.location.href = '/'}
            >
              กลับหน้าหลัก
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // หากผ่านการตรวจสอบแล้ว
  return children;
};

export default ProtectedRoute; 