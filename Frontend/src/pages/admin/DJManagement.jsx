import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { 
  Users, 
  Shield, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Music,
  MessageCircle,
  AlertTriangle,
  UserCheck,
  UserX
} from 'lucide-react';

export default function DJManagement() {
  const [djApplications, setDjApplications] = useState([
    {
      id: 1,
      user: 'ผู้ใช้ A',
      username: 'userA',
      message: 'ผมมีประสบการณ์เป็น DJ มา 3 ปี และต้องการแบ่งปันเพลงดี ๆ ให้ทุกคนฟัง',
      status: 'pending',
      timestamp: new Date('2024-01-15'),
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 2,
      user: 'ผู้ใช้ B',
      username: 'userB',
      message: 'ชอบเพลงมากและอยากเป็น DJ เพื่อสร้างความสนุกให้กับชุมชน',
      status: 'pending',
      timestamp: new Date('2024-01-16'),
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    }
  ]);

  const [activeDJs, setActiveDJs] = useState([
    {
      id: 1,
      user: 'DJ Mike',
      username: 'djmike',
      status: 'active',
      joinDate: new Date('2024-01-01'),
      totalStreams: 45,
      listeners: 120,
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      isBanned: false
    },
    {
      id: 2,
      user: 'DJ Sarah',
      username: 'djsarah',
      status: 'active',
      joinDate: new Date('2024-01-05'),
      totalStreams: 32,
      listeners: 89,
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      isBanned: false
    }
  ]);

  const [bannedDJs, setBannedDJs] = useState([
    {
      id: 3,
      user: 'DJ Bad',
      username: 'djbad',
      status: 'banned',
      banReason: 'เล่นเพลงที่ไม่เหมาะสม',
      banDate: new Date('2024-01-10'),
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg'
    }
  ]);

  // Handle DJ application approval/rejection
  const handleApplication = (applicationId, action) => {
    setDjApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        if (action === 'approve') {
          // Add to active DJs
          setActiveDJs(prevDJs => [...prevDJs, {
            id: Date.now(),
            user: app.user,
            username: app.username,
            status: 'active',
            joinDate: new Date(),
            totalStreams: 0,
            listeners: 0,
            avatar: app.avatar,
            isBanned: false
          }]);
        }
        return { ...app, status: action === 'approve' ? 'approved' : 'rejected' };
      }
      return app;
    }));
  };

  // Handle DJ ban/unban
  const handleDJBan = (djId, action, reason = '') => {
    if (action === 'ban') {
      const djToBan = activeDJs.find(dj => dj.id === djId);
      if (djToBan) {
        setBannedDJs(prev => [...prev, {
          ...djToBan,
          status: 'banned',
          banReason: reason,
          banDate: new Date()
        }]);
        setActiveDJs(prev => prev.filter(dj => dj.id !== djId));
      }
    } else if (action === 'unban') {
      const djToUnban = bannedDJs.find(dj => dj.id === djId);
      if (djToUnban) {
        setActiveDJs(prev => [...prev, {
          ...djToUnban,
          status: 'active',
          isBanned: false
        }]);
        setBannedDJs(prev => prev.filter(dj => dj.id !== djId));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500/20 p-3 rounded-full">
            <Shield size={32} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-400">DJ Management</h1>
            <p className="text-zinc-400">จัดการ DJ และคำขอเป็น DJ</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* DJ Applications */}
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-yellow-500/30">
            <CardHeader>
              <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                <Clock size={20} />
                คำขอเป็น DJ ({djApplications.filter(app => app.status === 'pending').length})
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {djApplications.filter(app => app.status === 'pending').map((application) => (
                  <div key={application.id} className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={application.avatar} />
                        <AvatarFallback>{application.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-white">{application.user}</h3>
                          <span className="text-xs text-zinc-400">@{application.username}</span>
                        </div>
                        <p className="text-sm text-zinc-300 mb-3">{application.message}</p>
                        <div className="text-xs text-zinc-500 mb-3">
                          ส่งคำขอเมื่อ: {application.timestamp.toLocaleDateString('th-TH')}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-400 border-green-400 hover:bg-green-500/20"
                            onClick={() => handleApplication(application.id, 'approve')}
                          >
                            <CheckCircle size={16} className="mr-1" />
                            อนุมัติ
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-400 border-red-400 hover:bg-red-500/20"
                            onClick={() => handleApplication(application.id, 'reject')}
                          >
                            <XCircle size={16} className="mr-1" />
                            ปฏิเสธ
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {djApplications.filter(app => app.status === 'pending').length === 0 && (
                  <div className="text-center py-8 text-zinc-400">
                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                    <p>ไม่มีคำขอเป็น DJ ที่รอดำเนินการ</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Banned DJs */}
          <Card className="bg-zinc-900 border-red-500/30">
            <CardHeader>
              <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <Ban size={20} />
                DJ ที่ถูกระงับ ({bannedDJs.length})
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {bannedDJs.map((dj) => (
                  <div key={dj.id} className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10 opacity-50">
                        <AvatarImage src={dj.avatar} />
                        <AvatarFallback>{dj.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-white">{dj.user}</h3>
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                            ถูกระงับ
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 mb-2">เหตุผล: {dj.banReason}</p>
                        <div className="text-xs text-zinc-500 mb-3">
                          ระงับเมื่อ: {dj.banDate.toLocaleDateString('th-TH')}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-400 border-green-400 hover:bg-green-500/20"
                          onClick={() => handleDJBan(dj.id, 'unban')}
                        >
                          <UserCheck size={16} className="mr-1" />
                          ยกเลิกการระงับ
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {bannedDJs.length === 0 && (
                  <div className="text-center py-8 text-zinc-400">
                    <UserCheck size={48} className="mx-auto mb-4 opacity-50" />
                    <p>ไม่มี DJ ที่ถูกระงับ</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active DJs */}
        <div>
          <Card className="bg-zinc-900 border-green-500/30">
            <CardHeader>
              <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
                <Music size={20} />
                DJ ที่ใช้งานอยู่ ({activeDJs.length})
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {activeDJs.map((dj) => (
                  <div key={dj.id} className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={dj.avatar} />
                        <AvatarFallback>{dj.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-white">{dj.user}</h3>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                            ใช้งานอยู่
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-zinc-400 mb-3">
                          <div>
                            <span className="text-zinc-500">เข้าร่วมเมื่อ:</span><br />
                            {dj.joinDate.toLocaleDateString('th-TH')}
                          </div>
                          <div>
                            <span className="text-zinc-500">จำนวนสตรีม:</span><br />
                            {dj.totalStreams} ครั้ง
                          </div>
                          <div>
                            <span className="text-zinc-500">ผู้ฟังเฉลี่ย:</span><br />
                            {dj.listeners} คน
                          </div>
                          <div>
                            <span className="text-zinc-500">สถานะ:</span><br />
                            <span className="text-green-400">ปกติ</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-400 border-blue-400 hover:bg-blue-500/20"
                          >
                            <MessageCircle size={16} className="mr-1" />
                            ส่งข้อความ
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-400 border-red-400 hover:bg-red-500/20"
                            onClick={() => {
                              const reason = prompt('เหตุผลในการระงับ:');
                              if (reason) {
                                handleDJBan(dj.id, 'ban', reason);
                              }
                            }}
                          >
                            <UserX size={16} className="mr-1" />
                            ระงับ
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {activeDJs.length === 0 && (
                  <div className="text-center py-8 text-zinc-400">
                    <Music size={48} className="mx-auto mb-4 opacity-50" />
                    <p>ไม่มี DJ ที่ใช้งานอยู่</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-full">
                <Users size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">รวม DJ</p>
                <p className="text-xl font-bold text-white">{activeDJs.length + bannedDJs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-full">
                <UserCheck size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">DJ ใช้งานอยู่</p>
                <p className="text-xl font-bold text-white">{activeDJs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/20 p-2 rounded-full">
                <Clock size={20} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">คำขอรอดำเนินการ</p>
                <p className="text-xl font-bold text-white">
                  {djApplications.filter(app => app.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-full">
                <Ban size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">DJ ถูกระงับ</p>
                <p className="text-xl font-bold text-white">{bannedDJs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}