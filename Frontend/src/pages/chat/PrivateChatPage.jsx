import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  Send,
  Image,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Crown,
  Diamond,
  Star,
  Lock,
  AlertCircle
} from 'lucide-react';

// Mock data สำหรับผู้ใช้
const mockUsers = {
  1: {
    id: 1,
    name: 'นางสาวสุดา',
    age: 28,
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    membershipLevel: 'Platinum Member',
    membershipColor: 'cyan',
    status: 'ออนไลน์',
    lastSeen: 'ออนไลน์',
    verified: true
  },
  2: {
    id: 2,
    name: 'คุณอรุณ',
    age: 32,
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    membershipLevel: 'Diamond Member',
    membershipColor: 'sky',
    status: 'ออนไลน์',
    lastSeen: 'ออนไลน์',
    verified: true
  }
};

// Mock messages
const mockMessages = [
  {
    id: 1,
    senderId: 2,
    text: 'สวัสดีครับ ยินดีที่ได้รู้จัก',
    timestamp: new Date(Date.now() - 3600000),
    status: 'read'
  },
  {
    id: 2,
    senderId: 1,
    text: 'สวัสดีค่ะ ยินดีที่ได้รู้จักเช่นกัน',
    timestamp: new Date(Date.now() - 3000000),
    status: 'read'
  },
  {
    id: 3,
    senderId: 2,
    text: 'วันนี้เป็นอย่างไรบ้างครับ',
    timestamp: new Date(Date.now() - 1800000),
    status: 'read'
  },
  {
    id: 4,
    senderId: 1,
    text: 'ดีค่ะ กำลังทำงานอยู่ คุณล่ะคะ',
    timestamp: new Date(Date.now() - 900000),
    status: 'delivered'
  }
];

export default function PrivateChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [canChat, setCanChat] = useState(false);
  const [membershipError, setMembershipError] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // ฟังก์ชันตรวจสอบระดับสมาชิก
  const checkMembershipCompatibility = (currentUserLevel, otherUserLevel) => {
    const membershipHierarchy = {
      'Member': 0,
      'Silver Member': 1,
      'Gold Member': 2,
      'VIP Member': 3,
      'VIP 1': 4,
      'VIP 2': 5,
      'Diamond Member': 6,
      'Platinum Member': 7
    };

    const currentLevel = membershipHierarchy[currentUserLevel] || 0;
    const otherLevel = membershipHierarchy[otherUserLevel] || 0;

    // สมาชิกฟรีไม่สามารถแชทส่วนตัวได้
    if (currentLevel === 0) {
      return {
        canChat: false,
        error: 'คุณต้องเป็นสมาชิกเพื่อใช้งานแชทส่วนตัว กรุณาอัพเกรดสมาชิกก่อน'
      };
    }

    // สมาชิกระดับเดียวกันหรือใกล้เคียงกันสามารถแชทได้
    const levelDifference = Math.abs(currentLevel - otherLevel);
    if (levelDifference <= 2) {
      return { canChat: true, error: '' };
    }

    return {
      canChat: false,
      error: `ระดับสมาชิกของคุณไม่สามารถแชทกับสมาชิกระดับนี้ได้ กรุณาอัพเกรดสมาชิกเพื่อปลดล็อคการแชท`
    };
  };

  // ฟังก์ชันกำหนดสีตามระดับสมาชิก
  const getMembershipStyle = (level) => {
    const styles = {
      'Platinum Member': 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white',
      'Diamond Member': 'bg-gradient-to-r from-sky-400 via-blue-500 to-teal-500 text-white',
      'VIP 2': 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white',
      'VIP 1': 'bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white',
      'VIP Member': 'bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 text-white',
      'Gold Member': 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black'
    };
    return styles[level] || 'bg-gray-500 text-white';
  };

  useEffect(() => {
    // โหลดข้อมูลผู้ใช้
    const user = mockUsers[userId];
    if (user) {
      setOtherUser(user);
      
      // ตรวจสอบสิทธิ์การแชท
      if (currentUser) {
        const compatibility = checkMembershipCompatibility(
          currentUser.membershipLevel || 'Member',
          user.membershipLevel
        );
        setCanChat(compatibility.canChat);
        setMembershipError(compatibility.error);
      }
    }
  }, [userId, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !canChat) return;

    const message = {
      id: messages.length + 1,
      senderId: currentUser?.id || 'current',
      text: newMessage,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageStatus = (status) => {
    switch (status) {
      case 'sent':
        return <Check size={14} className="text-zinc-400" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-zinc-400" />;
      case 'read':
        return <CheckCheck size={14} className="text-blue-400" />;
      default:
        return null;
    }
  };

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-xl font-bold mb-2">ไม่พบผู้ใช้</div>
          <Button onClick={() => navigate('/superstar')} variant="outline">
            กลับไปหน้าซุปตาร์
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900/90 border-b border-amber-500/30 p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/superstar')}
          className="text-amber-400 hover:bg-amber-500/20"
        >
          <ArrowLeft size={20} />
        </Button>

        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-amber-500/50">
              <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
              <AvatarFallback className="bg-amber-900 text-amber-100">
                {otherUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {otherUser.verified && (
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black rounded-full w-5 h-5 flex items-center justify-center">
                <Check size={12} />
              </div>
            )}
            <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full ${
              otherUser.status === 'ออนไลน์' ? 'bg-green-400' : 'bg-zinc-400'
            }`}></div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold">{otherUser.name}</h1>
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${getMembershipStyle(otherUser.membershipLevel)}`}>
                {otherUser.membershipLevel}
              </div>
            </div>
            <p className="text-zinc-400 text-sm">{otherUser.lastSeen}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-amber-400 hover:bg-amber-500/20">
            <Phone size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="text-amber-400 hover:bg-amber-500/20">
            <Video size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="text-amber-400 hover:bg-amber-500/20">
            <MoreVertical size={18} />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!canChat && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <Lock size={20} />
              <span className="font-bold">การแชทถูกจำกัด</span>
            </div>
            <p className="text-red-300 text-sm">{membershipError}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-red-500/50 text-red-400 hover:bg-red-500/20"
              onClick={() => navigate('/premium')}
            >
              อัพเกรดสมาชิก
            </Button>
          </div>
        )}

        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUser?.id || message.senderId === 'current';
          const sender = isCurrentUser ? currentUser : otherUser;

          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={sender?.avatar} alt={sender?.name} />
                <AvatarFallback className="bg-amber-900 text-amber-100 text-xs">
                  {sender?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'text-right' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isCurrentUser
                      ? 'bg-amber-600 text-white rounded-br-md'
                      : 'bg-zinc-700 text-white rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 text-xs text-zinc-400 ${
                  isCurrentUser ? 'justify-end' : 'justify-start'
                }`}>
                  <span>{formatTime(message.timestamp)}</span>
                  {isCurrentUser && getMessageStatus(message.status)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-zinc-900/90 border-t border-amber-500/30 p-4">
        {canChat ? (
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="text-amber-400 hover:bg-amber-500/20"
            >
              <Image size={20} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-amber-400 hover:bg-amber-500/20"
            >
              <Paperclip size={20} />
            </Button>

            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="พิมพ์ข้อความ..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 focus:border-amber-500 pr-12"
              />
            </div>

            <Button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6"
            >
              <Send size={16} />
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2 text-zinc-400">
            <Lock size={16} />
            <span className="text-sm">การแชทถูกจำกัดเนื่องจากระดับสมาชิก</span>
          </div>
        )}
      </div>
    </div>
  );
}