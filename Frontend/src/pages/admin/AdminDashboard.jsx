import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { 
  Users, 
  MessageCircle, 
  Crown, 
  Activity, 
  Settings,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Database,
  Shield
} from 'lucide-react';
import UserManagement from './UserManagement';
import PremiumManagement from './PremiumManagement';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    onlineUsers: 0,
    premiumUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); // เพิ่ม state สำหรับจัดการ view
  const [recentActivities, setRecentActivities] = useState([]); // เพิ่ม state สำหรับกิจกรรมล่าสุด

  // --- Remember last admin path ---
  useEffect(() => {
    // Save current admin path to localStorage
    if (location.pathname.startsWith('/admin')) {
      localStorage.setItem('lastAdminPath', location.pathname);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Restore last admin path after refresh
    const lastPath = localStorage.getItem('lastAdminPath');
    if (lastPath && lastPath !== location.pathname && lastPath.startsWith('/admin')) {
      navigate(lastPath, { replace: true });
      return;
    }

    // เพิ่มความหน่วงเล็กน้อยเพื่อให้ auth context โหลดเสร็จ
    const checkAuth = setTimeout(() => {
      console.log('AdminDashboard - Checking auth:', { isAuthenticated, user, role: user?.role });
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to home');
        window.location.href = '/';
        return;
      }
      if (user?.role !== 'admin') {
        console.log('Not admin role, redirecting to home');
        window.location.href = '/';
        return;
      }
      console.log('Admin access granted');
      setIsLoading(false);
      fetchDashboardData();
    }, 100);
    return () => clearTimeout(checkAuth);
  }, [isAuthenticated, user, location.pathname, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch all users stats
      const res = await fetch('http://localhost:5000/api/admin/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      let premiumUsers = 0;
      // Fetch VIP stats for premiumUsers sum
      const vipRes = await fetch('http://localhost:5000/api/admin/users/vip/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const vipData = await vipRes.json();
      if (vipData.success) {
        premiumUsers = vipData.data.total;
      }
      if (data.success) {
        setStats(prev => ({
          ...prev,
          totalUsers: data.data.total,
          premiumUsers: premiumUsers
        }));
      }
      // โหลดกิจกรรมล่าสุด
      await fetchRecentActivities();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // ฟังก์ชันดึงข้อมูลกิจกรรมล่าสุด
  const fetchRecentActivities = async () => {
    // ใช้ข้อมูลจำลองสำหรับตอนนี้
    setRecentActivities(generateMockActivities());
  };

  // ฟังก์ชันสร้างข้อมูลกิจกรรมจำลอง
  const generateMockActivities = () => {
    const activities = [
      {
        id: 1,
        type: 'account_created',
        message: 'ผู้ใช้ใหม่สมัครสมาชิก: นิดา สุขใส',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'success'
      },
      {
        id: 2,
        type: 'membership_upgrade',
        message: 'อัพเกรดเป็น Premium: อรรถพล จินดา',
        timestamp: new Date(Date.now() - 12 * 60 * 1000),
        status: 'premium'
      },
      {
        id: 3,
        type: 'chat_message',
        message: 'ข้อความใหม่ในแชทหลัก',
        timestamp: new Date(Date.now() - 18 * 60 * 1000),
        status: 'info'
      },
      {
        id: 4,
        type: 'user_login',
        message: 'ผู้ใช้เข้าสู่ระบบ: สมชาย ใจดี',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        status: 'success'
      },
      {
        id: 5,
        type: 'payment_deposit',
        message: 'เติมเงินเข้าบัญชี: ฿500 - กานดา รุ่งโรจน์',
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        status: 'premium'
      },
      {
        id: 6,
        type: 'account_banned',
        message: 'แบนบัญชี: วิชัย หยาบคาย (เหตุผล: พฤติกรรมไม่เหมาะสม)',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        status: 'warning'
      },
      {
        id: 7,
        type: 'user_logout',
        message: 'ผู้ใช้ออกจากระบบ: มนัส สมบูรณ์',
        timestamp: new Date(Date.now() - 55 * 60 * 1000),
        status: 'info'
      },
      {
        id: 8,
        type: 'chat_message',
        message: 'ข้อความใหม่จาก Premium user',
        timestamp: new Date(Date.now() - 65 * 60 * 1000),
        status: 'premium'
      },
      {
        id: 9,
        type: 'account_created',
        message: 'ผู้ใช้ใหม่สมัครสมาชิก: ปณิดา งามสง่า',
        timestamp: new Date(Date.now() - 75 * 60 * 1000),
        status: 'success'
      },
      {
        id: 10,
        type: 'user_login',
        message: 'ผู้ใช้เข้าสู่ระบบ: ธนาคาร เงินทอง',
        timestamp: new Date(Date.now() - 85 * 60 * 1000),
        status: 'success'
      }
    ];
    return activities;
  };

  // ฟังก์ชันแปลงเวลาเป็นรูปแบบที่อ่านง่าย
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} นาทีที่แล้ว`;
    } else if (hours < 24) {
      return `${hours} ชั่วโมงที่แล้ว`;
    } else {
      return `${days} วันที่แล้ว`;
    }
  };

  // ฟังก์ชันกำหนดสีตามสถานะ
  const getActivityColor = (status) => {
    const colors = {
      success: 'bg-green-400',
      premium: 'bg-amber-400',
      warning: 'bg-red-400',
      info: 'bg-blue-400'
    };
    return colors[status] || 'bg-gray-400';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-amber-400">กำลังโหลด Admin Dashboard...</h1>
        </div>
      </div>
    );
  }

  // Authorization check
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-zinc-400 mb-4">คุณไม่มีสิทธิ์เข้าถึงหน้า Admin Dashboard</p>
          <Button 
            variant="premium" 
            onClick={() => window.location.href = '/'}
          >
            กลับหน้าหลัก
          </Button>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'users':
        return <UserManagement onBack={() => setCurrentView('dashboard')} />;
      case 'premium':
        return <PremiumManagement onBack={() => setCurrentView('dashboard')} />;
      case 'banned':
        return <UserManagement onBack={() => setCurrentView('dashboard')} filter="banned" />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-b from-blue-950 to-black border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">ผู้ใช้ทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-blue-300 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-green-950 to-black border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-400">ข้อความทั้งหมด</CardTitle>
            <MessageCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-green-300 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8% จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-amber-950 to-black border-amber-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-400">ผู้ใช้ออนไลน์</CardTitle>
            <Activity className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.onlineUsers}</div>
            <p className="text-xs text-amber-300 mt-1">
              ณ ขณะนี้
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-purple-950 to-black border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-400">สมาชิก Premium</CardTitle>
            <Crown className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.premiumUsers}</div>
            <p className="text-xs text-purple-300 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +25% จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <Users size={20} />
              จัดการผู้ใช้
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setCurrentView('users')}
            >
              <UserCheck size={16} className="mr-2" />
              ดูรายชื่อผู้ใช้ทั้งหมด
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setCurrentView('premium')}
            >
              <Crown size={16} className="mr-2" />
              จัดการสมาชิก Premium
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setCurrentView('banned')}
            >
              <Shield size={16} className="mr-2" />
              ผู้ใช้ที่ถูกแบน
            </Button>
          </CardContent>
        </Card>

        {/* System Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <Database size={20} />
              จัดการระบบ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle size={16} className="mr-2" />
              ดูข้อความแชททั้งหมด
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Activity size={16} className="mr-2" />
              สถิติการใช้งาน
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings size={16} className="mr-2" />
              ตั้งค่าระบบ
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-amber-400 flex items-center gap-2">
            <Activity size={20} />
            กิจกรรมล่าสุด
            <span className="text-sm text-zinc-400 ml-2">({recentActivities.length} รายการ)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-zinc-800">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className={`flex items-center gap-3 p-3 bg-zinc-800 rounded-lg transition-all duration-200 hover:bg-zinc-700 ${
                    index >= 5 ? 'opacity-80' : ''
                  }`}
                >
                  <div className={`w-2 h-2 ${getActivityColor(activity.status)} rounded-full flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm leading-relaxed">{activity.message}</p>
                    <p className="text-xs text-zinc-400 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'success' ? 'bg-green-900 text-green-300' :
                    activity.status === 'premium' ? 'bg-amber-900 text-amber-300' :
                    activity.status === 'warning' ? 'bg-red-900 text-red-300' :
                    'bg-blue-900 text-blue-300'
                  }`}>
                    {activity.type.replace('_', ' ')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-400">
                <Activity size={48} className="mx-auto mb-2 opacity-50" />
                <p>ไม่มีกิจกรรมล่าสุด</p>
              </div>
            )}
          </div>
          {recentActivities.length > 5 && (
            <div className="mt-3 text-center">
              <p className="text-xs text-zinc-500">เลื่อนลงเพื่อดูกิจกรรมเพิ่มเติม</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card>
        <CardContent className="p-8 text-center">
          <Shield size={64} className="mx-auto mb-4 text-amber-400" />
          <h2 className="text-2xl font-bold text-amber-400 mb-2">ยินดีต้อนรับสู่ Admin Dashboard</h2>
          <p className="text-zinc-300">คุณสามารถจัดการระบบและดูสถิติการใช้งานได้ที่นี่</p>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white">
      {/* Admin Header */}
      <div className="bg-black/90 border-b border-amber-500/30 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-amber-400 flex items-center gap-3">
              <Shield size={32} />
              Admin Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">ยินดีต้อนรับ, {user?.username}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              กลับหน้าหลัก
            </Button>
            <Button variant="premium">
              <Settings size={16} className="mr-2" />
              ตั้งค่า
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default AdminDashboard;
