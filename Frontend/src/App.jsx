import React, { useState, useRef, useEffect } from "react"
import { Button } from "./components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar"
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs"
import { Separator } from "./components/ui/separator"
import { AuthModal } from "./components/auth/AuthModal";
import { FaGoogle, FaFacebook, FaLine } from "react-icons/fa6";
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, SOCKET_URL, API_ENDPOINTS } from './utils/constants';

// แก้ไขการ import เพื่อแก้ error
import { 
  Heart, 
  MessageCircle, 
  Star, 
  MapPin, 
  Users, 
  Crown, 
  Check, 
  CheckCircle2 as BadgeCheck, 
  Calendar, 
  Search, 
  LogIn, 
  UserPlus, 
  Wine, 
  Home,
  X,
  Utensils,
  Building,
  Car,
  Brain, // เพิ่ม Brain icon สำหรับ AI
  Zap,   // เพิ่ม Zap icon สำหรับ Smart Match
  Target, // เพิ่ม Target icon สำหรับ Precision
  ChevronLeft,
  ChevronRight,
  Gift,
  Image,
  Video,
  Timer,
  Coins,
  Medal,
  SquareCheck,
  SquarePen,
  Lock,
  Users2,
  EyeOff,
  Wallet,
  Diamond,
  Paperclip,
  Send,
  ThumbsUp,
  Smile,
  Play
} from "lucide-react";

import io from 'socket.io-client'

// ปรับลดจำนวน membership plans เหลือ 6 แผน
const membershipPlans = [
  {
    id: 1,
    name: "Member",
    icon: Users,
    price: "ฟรี",
    period: "",
    color: "zinc",
    recommended: false,
    benefits: [
      "แชทได้วันละ 10 คน",
      "อัพรูปภาพสำหรับแชท 3 รูป",
      "อัพวิดีโอสำหรับแชทได้ 1 คลิป",
      "หมุนวงล้อของขวัญวันละ 1 ครั้ง",
      "โบนัสรายวัน 500 เหรียญ",
    ],
    iconMap: {
      0: MessageCircle,
      1: Image,
      2: Video,
      3: Gift,
      4: Coins,
    }
  },
  {
    id: 2,
    name: "Silver Member",
    icon: Star,
    price: "฿20",
    period: "7 วัน",
    color: "gray",
    recommended: false,
    benefits: [
      "แชทได้วันละ 30 คน",
      "อัพรูปภาพสำหรับแชท 30 รูป",
      "อัพวิดีโอสำหรับแชทได้ 10 คลิป",
      "หมุนวงล้อของขวัญทุก 2 ชั่วโมง",
      "โบนัสรายวัน 1,000 เหรียญ",
      "คะแนนโหวต 200 แต้ม",
    ],
    iconMap: {
      0: MessageCircle,
      1: Image,
      2: Video,
      3: Gift,
      4: Coins,
      5: Medal,
    }
  },
  {
    id: 3,
    name: "Gold Member",
    icon: Crown,
    price: "฿50",
    period: "15 วัน",
    color: "amber",
    recommended: false,
    benefits: [
      "แชทได้วันละ 60 คน",
      "อัพรูปภาพสำหรับแชท 50 รูป",
      "อัพวิดีโอสำหรับแชทได้ 25 คลิป",
      "หมุนวงล้อของขวัญทุก 90 นาที",
      "โบนัสรายวัน 3,000 เหรียญ",
      "คะแนนโหวต 500 แต้ม",
      "เพิ่มวิดีโอโปรไฟล์ 1 คลิป",
      "ติ๊กยืนยันโปรไฟล์",
      "กรอบโปรไฟล์พิเศษเฉพาะสมาชิก",
    ],
    iconMap: {
      0: MessageCircle,
      1: Image,
      2: Video,
      3: Gift,
      4: Coins,
      5: Medal,
      6: Video,
      7: SquareCheck,
      8: SquarePen,
    }
  },
  {
    id: 4,
    name: "VIP Member",
    icon: Crown,
    price: "฿100",
    period: "เดือน",
    color: "purple",
    recommended: true,
    benefits: [
      "แชทได้วันละ 120 คน",
      "อัพรูปภาพสำหรับแชท 100 รูป",
      "อัพวิดีโอสำหรับแชทได้ 50 คลิป",
      "หมุนวงล้อของขวัญทุก 1 ชั่วโมง",
      "โบนัสรายวัน 8,000 เหรียญ",
      "คะแนนโหวต 1,000 แต้ม",
      "เพิ่มวิดีโอโปรไฟล์ 3 คลิป",
      "ติ๊กยืนยันโปรไฟล์",
      "กรอบโปรไฟล์พิเศษเฉพาะสมาชิก",
      "ปักหมุดโพสต์ 1 โพสต์ หน้าโปรไฟล์",
      "เบลอรูปภาพ ส่วนตัวได้ 3 รูป",
      "สร้างห้องแชท จำนวน 10 คน",
    ],
    iconMap: {
      0: MessageCircle,
      1: Image,
      2: Video,
      3: Gift,
      4: Coins,
      5: Medal,
      6: Video,
      7: SquareCheck,
      8: SquarePen,
      9: SquarePen,
      10: EyeOff,
      11: Users2,
    }
  },
  {
    id: 5,
    name: "VIP 1",
    icon: Crown,
    price: "฿150",
    period: "เดือน",
    color: "pink",
    recommended: false,
    benefits: [
      "แชทได้วันละ 180 คน",
      "อัพรูปภาพสำหรับแชท 150 รูป",
      "อัพวิดีโอสำหรับแชทได้ 75 คลิป",
      "หมุนวงล้อของขวัญทุก 45 นาที",
      "โบนัสรายวัน 15,000 เหรียญ",
      "คะแนนโหวต 1,500 แต้ม",
      "เพิ่มวิดีโอโปรไฟล์ 5 คลิป",
      "ติ๊กยืนยันโปรไฟล์",
      "กรอบโปรไฟล์พิเศษเฉพาะสมาชิก",
      "ปักหมุดโพสต์ 3 โพสต์ หน้าโปรไฟล์",
      "เบลอรูปภาพ ส่วนตัวได้ 5 รูป",
      "สร้างห้องแชท จำนวน 20 คน",
      "ตั้งค่าซ่อนสถานะออนไลน์ได้",
    ],
    iconMap: {
      0: MessageCircle,
      1: Image,
      2: Video,
      3: Gift,
      4: Coins,
      5: Medal,
      6: Video,
      7: SquareCheck,
      8: SquarePen,
      9: SquarePen,
      10: EyeOff,
      11: Users2,
      12: EyeOff,
    }
  },
  {
    id: 6,
    name: "VIP 2",
    icon: Diamond,
    price: "฿300",
    period: "เดือน",
    color: "indigo",
    recommended: false,
    benefits: [
      "แชทได้วันละ 300 คน",
      "อัพรูปภาพสำหรับแชทไม่จำกัด",
      "อัพวิดีโอสำหรับแชทได้ไม่จำกัด",
      "หมุนวงล้อของขวัญทุก 30 นาที",
      "โบนัสรายวัน 30,000 เหรียญ",
      "คะแนนโหวต 3,000 แต้ม",
      "เพิ่มวิดีโอโปรไฟล์ 10 คลิป",
      "ติ๊กยืนยันโปรไฟล์",
      "กรอบโปรไฟล์พิเศษเฉพาะสมาชิก",
      "ปักหมุดโพสต์ 5 โพสต์ หน้าโปรไฟล์",
      "เบลอรูปภาพ ส่วนตัวได้ 10 รูป",
      "สร้างห้องแชท จำนวน 30 คน",
      "ตั้งค่าซ่อนสถานะออนไลน์ได้",
    ],
    iconMap: {
      0: MessageCircle,
      1: Image,
      2: Video,
      3: Gift,
      4: Coins,
      5: Medal,
      6: Video,
      7: SquareCheck,
      8: SquarePen,
      9: SquarePen,
      10: EyeOff,
      11: Users2,
      12: EyeOff,
    }
  },
  {
    id: 7,
    name: "Diamond Member",
    icon: Diamond,
    price: "฿500",
    period: "เดือน",
    color: "sky",
    recommended: false,
    benefits: [
      "แชทได้วันละ 500 คน",
      "อัพรูปภาพสำหรับแชทไม่จำกัด",
      "อัพวิดีโอสำหรับแชทได้ไม่จำกัด",
      "หมุนวงล้อของขวัญทุก 20 นาที",
      "โบนัสรายวัน 50,000 เหรียญ",
      "คะแนนโหวต 5,000 แต้ม",
      "เพิ่มวิดีโอโปรไฟล์ 15 คลิป",
      "ติ๊กยืนยันโปรไฟล์",
      "กรอบโปรไฟล์พิเศษเฉพาะสมาชิก",
      "ปักหมุดโพสต์ 20 โพสต์ หน้าโปรไฟล์",
      "เบลอรูปภาพ ส่วนตัวได้ 15 รูป",
      "สร้างห้องแชท ไม่จำกัดจำนวนคน",
      "ตั้งค่าซ่อนสถานะออนไลน์ได้",
      "โอนเหรียญได้",
      "รับเหรียญเพิ่มทันที 100,000 เหรียญ",
    ],
    iconMap: {
      0: MessageCircle,
      1: Image,
      2: Video,
      3: Gift,
      4: Coins,
      5: Medal,
      6: Video,
      7: SquareCheck,
      8: SquarePen,
      9: SquarePen,
      10: EyeOff,
      11: Users2,
      12: EyeOff,
      13: Wallet,
      14: Coins,
    }
  },
  {
    id: 8,
    name: "Platinum Member",
    icon: Crown,
    price: "฿1,000",
    period: "เดือน",
    color: "cyan",
    recommended: false,
    benefits: [
      "แชทได้ไม่จำกัด",
      "อัพรูปภาพสำหรับแชทไม่จำกัด",
      "อัพวิดีโอสำหรับแชทได้ไม่จำกัด",
      "หมุนวงล้อของขวัญทุก 10 นาที",
      "โบนัสรายวัน 100,000 เหรียญ",
      "คะแนนโหวต 15,000 แต้ม",
      "เพิ่มวิดีโอโปรไฟล์ 15 คลิป",
      "ติ๊กยืนยันโปรไฟล์",
      "กรอบโปรไฟล์พิเศษเฉพาะสมาชิก",
      "ปักหมุดโพสต์ 20 โพสต์ หน้าโปรไฟล์",
      "เบลอรูปภาพ ส่วนตัวได้ 15 รูป",
      "สร้างห้องแชท ไม่จำกัดจำนวนคน",
      "ตั้งค่าซ่อนสถานะออนไลน์ได้",
      "โอนเหรียญได้",
      "รับเหรียญเพิ่มทันที 100,000 เหรียญ",
    ],
    iconMap: {
      0: MessageCircle,
      1: Image,
      2: Video,
      3: Gift,
      4: Coins,
      5: Medal,
      6: Video,
      7: SquareCheck,
      8: SquarePen,
      9: SquarePen,
      10: EyeOff,
      11: Users2,
      12: EyeOff,
      13: Wallet,
      14: Coins,
    }
  }
];

// Minimalist, modern, chat-focused landing page inspired by soichat.com

export default function App() {
  // ตรวจสอบ URL parameter เพื่อกำหนด activeTab เริ่มต้น
  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    return tab && ['discover', 'chat', 'meetup', 'premium'].includes(tab) ? tab : 'discover';
  };

  // ตรวจสอบ URL parameter สำหรับ profile modal
  const getInitialProfileState = () => {
    const params = new URLSearchParams(window.location.search);
    const showProfile = params.get('profile') === 'true';
    const userId = params.get('userId');
    return { showProfile, userId };
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab())
  const { showProfile: initialShowProfile, userId: initialUserId } = getInitialProfileState();
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserProfile, setShowUserProfile] = useState(initialShowProfile)
  const [users, setUsers] = useState([])
  const [likedUsers, setLikedUsers] = useState([])
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [aiMatches, setAiMatches] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [currentPlanFilter, setCurrentPlanFilter] = useState('all');
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [showComparisonTable, setShowComparisonTable] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState("login");
  const [onlineUsers, setOnlineUsers] = useState(123);
  const [attachedImage, setAttachedImage] = useState(null);
  const [showDJModal, setShowDJModal] = useState(false);
  const [showSuperstarModal, setShowSuperstarModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDJDashboard, setShowDJDashboard] = useState(false);
  const [djRequests, setDjRequests] = useState([
    { id: 1, user: 'ผู้ใช้ A', song: 'เพลงที่ขอ 1', status: 'pending' },
    { id: 2, user: 'ผู้ใช้ B', song: 'เพลงที่ขอ 2', status: 'pending' }
  ]);
  const [playlist, setPlaylist] = useState([
    { id: 1, title: 'เพลงตัวอย่าง 1', artist: 'ศิลปิน A', duration: '3:45' },
    { id: 2, title: 'เพลงตัวอย่าง 2', artist: 'ศิลปิน B', duration: '4:20' }
  ]);
  const [djApplications, setDjApplications] = useState([]);
  const [userDjStatus, setUserDjStatus] = useState('none'); // none, pending, approved, banned
  const [djMessage, setDjMessage] = useState('');

  // ฟังก์ชันสำหรับกำหนดสีและสไตล์ของบทบาท VIP
  const getRoleDisplayStyle = (role) => {
    const styles = {
      'Platinum': 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg border border-purple-300',
      'Diamond': 'bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-500 text-white shadow-lg border border-cyan-300',
      'VIP2': 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black shadow-lg border border-yellow-300',
      'VIP1': 'bg-gradient-to-r from-gray-400 via-slate-500 to-zinc-600 text-white shadow-lg border border-gray-300',
      'VIP': 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 text-white shadow-lg border border-orange-300',
      'Gold': 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-black shadow-lg border border-yellow-400',
      'Silver': 'bg-gradient-to-r from-gray-300 via-slate-400 to-gray-500 text-black shadow-lg border border-gray-400'
    };
    return styles[role] || 'bg-gradient-to-r from-amber-500 to-amber-600 text-black';
  };

  // ฟังก์ชันสำหรับกำหนดสไตล์ของตัวเลขอันดับ 1-3
  const getRankBadgeStyle = (rank) => {
    const styles = {
      1: 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 text-black shadow-2xl border-2 border-yellow-200 animate-pulse',
      2: 'bg-gradient-to-br from-gray-300 via-slate-400 to-gray-500 text-white shadow-xl border-2 border-gray-200',
      3: 'bg-gradient-to-br from-orange-300 via-amber-600 to-yellow-700 text-white shadow-xl border-2 border-orange-200'
    };
    return styles[rank] || 'bg-gradient-to-br from-zinc-400 to-zinc-600 text-white';
  };
  const [replyingTo, setReplyingTo] = useState(null); // ข้อความที่กำลังตอบกลับ
  const [messageLikes, setMessageLikes] = useState({}); // เก็บจำนวนไลค์ของแต่ละข้อความ
  const [showEmojiPicker, setShowEmojiPicker] = useState(null); // แสดง emoji picker
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState("");
  const { user, isAuthenticated, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const carouselRef = useRef(null)
  const chatEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Initialize Socket.IO connection
  useEffect(() => {
    // ตรวจสอบว่า backend server ทำงานอยู่หรือไม่ก่อน
    const connectSocket = async () => {
      try {
        // ตรวจสอบ backend server ก่อน
        const healthCheck = await fetch(API_ENDPOINTS.HEALTH, {
          method: 'GET',
          timeout: 5000
        }).catch(() => null);

        if (!healthCheck || !healthCheck.ok) {
          console.warn('Backend server is not available. Socket connection disabled.');
          setIsConnected(false);
          return;
        }

        // สร้าง Socket.IO connection หาก backend พร้อม
        const newSocket = io(SOCKET_URL, {
          transports: ['polling', 'websocket'], // ใช้ polling ก่อนเพื่อความเสถียร
          reconnectionAttempts: 3,
          reconnectionDelay: 2000,
          timeout: 5000,
          withCredentials: true,
          autoConnect: true
        });
        
        // Event handlers
        newSocket.on('connect', () => {
          console.log('Connected to server');
          setIsConnected(true);
          newSocket.emit('load_messages');
        });

        newSocket.on('connect_error', (err) => {
          console.warn('Socket connection error (this is normal if backend is not running):', err.message);
          setIsConnected(false);
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from server');
          setIsConnected(false);
        });

        newSocket.on('messages_loaded', (messages) => {
          setChatMessages(messages);
        });

        newSocket.on('new_message', (message) => {
          setChatMessages(prev => [...prev, message]);
        });

        setSocket(newSocket);
        
        // Cleanup function
        return () => {
          if (newSocket) {
            newSocket.disconnect();
          }
        };
      } catch (error) {
        console.warn('Socket connection failed (backend may not be running):', error.message);
        setIsConnected(false);
      }
    };

    connectSocket();
  }, []);

  // ดึงข้อมูลผู้ใช้เมื่อเริ่มต้นแอป
  useEffect(() => {
    fetchUsers();
  }, [isAuthenticated]);

  // โหลด user profile จาก URL parameter
  useEffect(() => {
    if (initialUserId && initialShowProfile && users.length > 0) {
      const foundUser = users.find(user => user.id === initialUserId);
      if (foundUser) {
        setSelectedUser(foundUser);
        setShowUserProfile(true);
      }
    }
  }, [users, initialUserId, initialShowProfile]);

  // จัดการ browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || 'discover';
      const showProfile = params.get('profile') === 'true';
      const userId = params.get('userId');
      
      setActiveTab(tab);
      
      if (showProfile && userId && users.length > 0) {
        const foundUser = users.find(user => user.id === userId);
        if (foundUser) {
          setSelectedUser(foundUser);
          setShowUserProfile(true);
        }
      } else {
        setShowUserProfile(false);
        setSelectedUser(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [users]);

  // อัพเดท URL เมื่อเปลี่ยนแท็บ
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', activeTab);
    
    // จัดการ profile modal state
    if (showUserProfile && selectedUser) {
      params.set('profile', 'true');
      params.set('userId', selectedUser.id);
    } else {
      params.delete('profile');
      params.delete('userId');
    }
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [activeTab, showUserProfile, selectedUser]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // ฟังก์ชันดึงข้อมูลผู้ใช้จาก API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.USERS_DISCOVER, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Temporary debug logs
      console.log('=== API Response Debug ===');
      console.log('Full API Response:', data);
      if (data.success && data.data && data.data.length > 0) {
        console.log('First user example:');
        console.log('Name:', data.data[0].name);
        console.log('Occupation:', data.data[0].occupation);
        console.log('Address:', data.data[0].address);
        console.log('Location:', data.data[0].location);
      }
      console.log('========================');
      
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
        if (data.data.length > 0 && !selectedUser) {
          setSelectedUser(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // ฟังก์ชันสำหรับจัดการไฟล์รูปภาพ - แก้ไขให้อัพโหลดไปยัง backend
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const formData = new FormData();
        formData.append('image', file);

              const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData
      });

        if (response.ok) {
          const result = await response.json();
          setAttachedImage(result.imageUrl); // ใช้ URL ที่ส่งกลับมาจาก server
        } else {
          console.error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  // ฟังก์ชันตรวจสอบ YouTube URL
  const isYouTubeUrl = (url) => {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    return youtubeRegex.test(url);
  };

  // ฟังก์ชันแปลง YouTube URL เป็น embed - ปรับปรุงเพื่อหลีก ads
  const getYouTubeVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // ฟังก์ชันรายการ message content - แก้ไขการแสดงรูปภาพและ YouTube
  const renderMessageContent = (msg) => {
    const hasYouTubeLink = msg.text && isYouTubeUrl(msg.text);
    const hasRegularLink = msg.text && !hasYouTubeLink && isValidUrl(msg.text);

    return (
      <div className="space-y-2">
        {/* แสดงข้อความที่ตอบกลับ */}
        {msg.replyTo && (
          <div className="bg-zinc-700/50 rounded-lg p-2 border-l-4 border-amber-500 text-sm">
            <div className="text-amber-400 font-medium mb-1">
              ตอบกลับ {msg.replyTo.user?.name || 'ผู้ใช้'}
            </div>
            <div className="text-zinc-300 opacity-75 line-clamp-2">
              {msg.replyTo.text || 'รูปภาพ/วิดีโอ'}
            </div>
          </div>
        )}
        
        {/* รูปภาพ - ปรับขนาดให้เล็กลง */}
        {msg.image && (
          <div className="inline-block max-w-xs">
            <img 
              src={msg.image.startsWith('http') ? msg.image : `${API_BASE_URL}${msg.image}`}
              alt="Attached image" 
              className="w-full h-auto max-w-48 max-h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity border border-amber-500/20 rounded-lg shadow-md"
              onClick={() => {
                const fullImageUrl = msg.image.startsWith('http') ? msg.image : `${API_BASE_URL}${msg.image}`;
                openImageModal(fullImageUrl);
              }}
            />
            <div className="text-xs text-zinc-400 mt-1 text-center">คลิกเพื่อดูรูปขนาดเต็ม</div>
          </div>
        )}
        
        {/* YouTube Video - ปรับปรุงเพื่อหลีก ads และ tracking */}
        {hasYouTubeLink && (
          <div className="rounded-lg overflow-hidden max-w-sm">
            <div className="relative aspect-video bg-zinc-800">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(msg.text)}?modestbranding=1&rel=0&iv_load_policy=3&controls=1&disablekb=1&fs=1&autoplay=0`}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                title="YouTube video"
                loading="lazy"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            </div>
          </div>
        )}
        
        {/* Link Preview */}
        {hasRegularLink && (
          <div className="border border-zinc-700 rounded-lg p-3 bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors">
            <a 
              href={msg.text} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm break-all"
            >
              {msg.text}
            </a>
          </div>
        )}
        
        {/* ข้อความธรรมดา */}
        {msg.text && !hasYouTubeLink && !hasRegularLink && (
          <div className="leading-relaxed">{msg.text}</div>
        )}
      </div>
    );
  };

  // ฟังก์ชันตรวจสอบ URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // ฟังก์ชันเปิด Modal ดูรูป
  const openImageModal = (imageSrc) => {
    setModalImageSrc(imageSrc);
    setShowImageModal(true);
  };

  // ฟังก์ชันปิด Modal ดูรูป
  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImageSrc("");
  };

  // ฟังก์ชันตอบกลับข้อความ
  const handleReply = (message) => {
    setReplyingTo(message);
    // Focus ไปที่ input box
    setTimeout(() => {
      document.querySelector('textarea')?.focus();
    }, 100);
  };

  // ฟังก์ชันยกเลิกการตอบกลับ
  const cancelReply = () => {
    setReplyingTo(null);
  };

  // ฟังก์ชันกดถูกใจ
  const handleLikeMessage = (messageIndex) => {
    setMessageLikes(prev => ({
      ...prev,
      [messageIndex]: (prev[messageIndex] || 0) + 1
    }));
  };

  // ฟังก์ชันเพิ่มอีโมจิ
  const handleEmojiReaction = (messageIndex, emoji) => {
    // ในที่นี้จะเพิ่มอีโมจิเป็น "like" แบบง่าย ๆ
    setMessageLikes(prev => ({
      ...prev,
      [`${messageIndex}_${emoji}`]: (prev[`${messageIndex}_${emoji}`] || 0) + 1
    }));
    setShowEmojiPicker(null);
  };

  // รายการอีโมจิ
  const emojis = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥'];

  function handleSendChat(e) {
    e.preventDefault()
    if ((!chatInput.trim() && !attachedImage) || !socket) return
    
    const messageData = {
      from: "me",
      text: chatInput,
      image: attachedImage,
      user: selectedUser,
      timestamp: new Date(),
      replyTo: replyingTo // เพิ่มข้อมูลการตอบกลับ
    };

    socket.emit('send_message', messageData);
    setChatInput("");
    setAttachedImage(null);
    setReplyingTo(null); // รีเซ็ตการตอบกลับ
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleLikeUser(userId) {
    setLikedUsers(prev => [...prev, userId])
  }

// ฟังก์ชัน AI Matching
  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('กรุณาเข้าสู่ระบบก่อนใช้งาน AI Matching');
        setIsAnalyzing(false);
        return;
      }
      
      // เรียกข้อมูลโปรไฟล์ของผู้ใช้
              const profileResponse = await fetch(`${API_BASE_URL}/api/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      
      if (!profileResponse.ok) {
        throw new Error(`HTTP error! status: ${profileResponse.status}`);
      }
      
      const profileData = await profileResponse.json();
      
      if (!profileData.success || !profileData.data) {
        throw new Error('ไม่สามารถดึงข้อมูลโปรไฟล์ได้');
      }
      
      // เรียก API AI Matching
      const response = await fetch(`${API_BASE_URL}/api/ai/recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: profileData.data._id || profileData.data.id
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.recommendations && Array.isArray(data.recommendations)) {
        setAiMatches(data.recommendations);
      } else {
        setAiMatches([]);
      }
    } catch (error) {
      console.error('Error in AI analysis:', error);
      showError('เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล');
      setAiMatches([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ฟังก์ชันสำหรับเปิด Modal ล็อกอิน
  const openLoginModal = () => {
    setAuthModalView("login");
    setIsAuthModalOpen(true);
  };

  // ฟังก์ชันสำหรับเปิด Modal สมัครผู้ใช้ใหม่
  const openSignupModal = () => {
    if (isAuthenticated) {
      // ถ้าล็อกอินแล้ว ไปที่แท็บ Premium
      setActiveTab("premium");
    } else {
      // ถ้ายังไม่ล็อกอิน ให้สมัครผู้ใช้ก่อน
      setAuthModalView("signup");
      setIsAuthModalOpen(true);
    }
  };
  
  // ฟังก์ชันสำหรับเปิดหน้าสมัครสมาชิก Premium
  const openPremiumSignup = () => {
    if (isAuthenticated) {
      // ถ้าล็อกอินแล้ว ไปที่แท็บ Premium
      setActiveTab("premium");
    } else {
      // ถ้ายังไม่ล็อกอิน ให้สมัครผู้ใช้ก่อน
      setAuthModalView("signup");
      setIsAuthModalOpen(true);
    }
  };

  // Fix for membership buttons in Premium tab
  const handleMembershipSignup = (planId) => {
    if (isAuthenticated) {
      // ถ้าล็อกอินแล้ว ใช้ navigate แทน window.location.href เพื่อไม่ให้หน้าโหลดใหม่
      const planType = planId === 1 ? 'member' : 
                      planId === 2 ? 'silver' : 
                      planId === 3 ? 'gold' : 
                      planId === 4 ? 'vip' : 
                      planId === 5 ? 'vip1' : 
                      planId === 6 ? 'vip2' : 
                      planId === 7 ? 'diamond' : 'platinum';
      navigate(`/membership/${planType}`);
    } else {
      // ถ้ายังไม่ล็อกอิน ให้เปิด Modal ล็อกอิน
      openLoginModal();
    }
  };
  
  return (
          <div 
        className="min-h-screen flex flex-col text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #d63384 0%, #be185d 30%, #a21caf 60%, #7c3aed 100%)',
          position: 'relative'
        }}
      >
      {/* Sparkles overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.8), transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.8), transparent),
            radial-gradient(2px 2px at 160px 30px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 200px 60px, rgba(255,255,255,0.7), transparent),
            radial-gradient(2px 2px at 240px 40px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 280px 70px, rgba(255,255,255,0.9), transparent),
            radial-gradient(2px 2px at 320px 30px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 360px 80px, rgba(255,255,255,0.8), transparent),
            radial-gradient(2px 2px at 400px 50px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 440px 30px, rgba(255,255,255,0.7), transparent),
            radial-gradient(2px 2px at 480px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 520px 40px, rgba(255,255,255,0.9), transparent),
            radial-gradient(2px 2px at 560px 80px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 600px 30px, rgba(255,255,255,0.8), transparent),
            radial-gradient(2px 2px at 640px 60px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 680px 40px, rgba(255,255,255,0.7), transparent),
            radial-gradient(2px 2px at 720px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 760px 30px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 800px 50px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 840px 20px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 880px 90px, rgba(255,255,255,0.7), transparent),
            radial-gradient(2px 2px at 920px 40px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 960px 70px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 1000px 30px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 1040px 80px, rgba(255,255,255,0.7), transparent),
            radial-gradient(2px 2px at 1080px 50px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 1120px 20px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 1160px 90px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 1200px 40px, rgba(255,255,255,0.7), transparent),
            radial-gradient(2px 2px at 1240px 70px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 1280px 30px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 1320px 80px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 1360px 50px, rgba(255,255,255,0.7), transparent),
            radial-gradient(2px 2px at 1400px 20px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 1440px 90px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 1480px 40px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 1520px 70px, rgba(255,255,255,0.7), transparent),
            radial-gradient(2px 2px at 1560px 30px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 1600px 80px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 1650px 25px, rgba(255,255,255,0.5), transparent),
            radial-gradient(2px 2px at 1700px 65px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 1750px 45px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 1800px 85px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 1850px 35px, rgba(255,255,255,0.5), transparent),
            radial-gradient(2px 2px at 1900px 75px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 1950px 55px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 2000px 95px, rgba(255,255,255,0.8), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '2000px 100px',
          animation: 'sparkle-slow 30s linear infinite',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.6,
          filter: 'blur(0.5px)'
        }}
      />
      {/* Additional sparkles layer */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            radial-gradient(1px 1px at 50px 20px, rgba(255,255,255,0.5), transparent),
            radial-gradient(2px 2px at 150px 60px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 250px 40px, rgba(255,255,255,0.4), transparent),
            radial-gradient(2px 2px at 350px 80px, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 450px 30px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 550px 70px, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 650px 50px, rgba(255,255,255,0.5), transparent),
            radial-gradient(2px 2px at 750px 90px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 850px 20px, rgba(255,255,255,0.4), transparent),
            radial-gradient(2px 2px at 950px 60px, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 1050px 40px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 1150px 80px, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 1250px 30px, rgba(255,255,255,0.5), transparent),
            radial-gradient(2px 2px at 1350px 70px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 1450px 50px, rgba(255,255,255,0.4), transparent),
            radial-gradient(2px 2px at 1550px 90px, rgba(255,255,255,0.5), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '2000px 100px',
          animation: 'sparkle 25s linear infinite reverse',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.4,
          filter: 'blur(0.3px)'
        }}
      />
      {/* CSS Animation Keyframes */}
      <style>
        {`
          @keyframes sparkle {
            0% { transform: translateY(0px); }
            100% { transform: translateY(-100px); }
          }
          @keyframes sparkle-slow {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-50px) rotate(180deg); }
            100% { transform: translateY(-100px) rotate(360deg); }
          }
        `}
      </style>
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white/90 shadow-lg fixed w-full z-20 backdrop-blur border-b border-pink-500/30">
                        <span className="text-2xl font-extrabold tracking-tight flex items-center gap-2 fade-in-up" style={{
                  background: 'linear-gradient(135deg, #d63384 0%, #be185d 30%, #a21caf 60%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  <span className="text-3xl shimmer-text">✦</span>
                  <span className="font-serif shimmer-text">SodeClick</span>
                </span>
                <div className="flex justify-center fade-in-up">
              <div className="flex bg-pink-100/50 rounded-full p-1 gap-1">
        <Button 
          onClick={() => setActiveTab("discover")}
          variant={activeTab === "discover" ? "premium" : "ghost"}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${activeTab === "discover" ? "shimmer-gold" : ""}`}
        >
          <Search size={16} /> ค้นหาผู้คนใหม่ ๆ
        </Button>
        <Button 
          onClick={() => setActiveTab("chat")}
          variant={activeTab === "chat" ? "premium" : "ghost"}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${activeTab === "chat" ? "shimmer-gold" : ""}`}
        >
          <MessageCircle size={16} /> แชท
        </Button>
        <Button 
          onClick={() => setActiveTab("meetup")}
          variant={activeTab === "meetup" ? "premium" : "ghost"}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${activeTab === "meetup" ? "shimmer-gold" : ""}`}
        >
          <MapPin size={16} /> นัดเจอ
        </Button>
        <Button 
          onClick={() => setActiveTab("premium")}
          variant={activeTab === "premium" ? "premium" : "ghost"}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${activeTab === "premium" ? "shimmer-gold" : ""}`}
        >
          <Crown size={16} /> VIP
        </Button>
      </div>
    </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 hover:bg-pink-100/50 rounded-lg p-2 transition-colors group"
              >
                {/* ข้อ 4: Avatar & Hero Image - รูปผู้ใช้มีแหวนทองล้อม */}
                <Avatar className="w-9 h-9 border-2 border-amber-400 group-hover:border-amber-300" style={{
                  boxShadow: '0 0 15px rgba(251, 191, 36, 0.6), inset 0 0 10px rgba(251, 191, 36, 0.2)'
                }}>
                  <AvatarImage 
                    src={user.avatar ? `${API_BASE_URL}${user.avatar}` : `${API_BASE_URL}/uploads/avatar/default.png`} 
                    alt={user.username}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM5MjQwMGUiLz4KPHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNCIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNMjQgMjZjMC00LjQtMy42LTgtOC04cy04IDMuNi04IDh2MmgxNnYtMnoiIGZpbGw9IiNmZmYiLz4KPC9zdmc+';
                    }}
                  />
                  <AvatarFallback className="bg-pink-600 text-white">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-pink-600 font-medium hidden md:block hover:text-pink-500 transition-colors">
                  {user.username || 'ผู้ใช้'}
                </span>
                {user?.role === 'admin' && (
                  <Crown size={16} className="text-pink-600 ml-1" title="Admin" />
                )}
              </button>
              {user?.role === 'admin' && (
                <Button 
                  variant="premium" 
                  size="default" 
                  className="gap-2 bg-pink-500 hover:bg-pink-600 text-white"
                  onClick={() => window.location.href = '/admin'}
                >
                  <Crown size={16} /> Admin
                </Button>
              )}
              <Button 
                variant="outline" 
                size="default" 
                className="gap-2 border-pink-500 text-pink-600 hover:bg-pink-50" 
                onClick={authLogout}
              >
                <LogIn size={16} className="rotate-180" /> ออกจากระบบ
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="gap-2 border-pink-500 text-pink-600 hover:bg-pink-50" onClick={openLoginModal}>
                <LogIn size={16} /> เข้าสู่ระบบ
              </Button>
              <Button variant="premium" size="sm" className="gap-2 bg-pink-500 hover:bg-pink-600 text-white" onClick={openSignupModal}>
                <Crown size={16} /> สมัครสมาชิก
              </Button>
            </>
          )}
        </div>
      </nav>

     

      {/* ข้อ 9: ระบบแอนิเมชันเล็กน้อย - @keyframes shimmer และ fadeIn ใช้กับ UI บางจุดให้ดูมีการเคลื่อนไหวหรูหรา */}
      {/* Hero section - ปรับ padding-top เพื่อหลีกเลี่ยง fixed navigation */}
      <section className="flex flex-col md:flex-row items-center justify-center text-center md:text-left pt-44 pb-16 px-4 max-w-6xl mx-auto gap-12">
        <div className="flex-1 fade-in-up">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-2 leading-tight">
            Exclusive <span className="shimmer-text font-extrabold drop-shadow-lg">Matches</span><br />for Extraordinary People
          </h1>
          <p className="text-xl text-pink-100 mb-8 max-w-xl font-light fade-in-up" style={{animationDelay: '0.2s'}}>
            ค้นพบความสัมพันธ์ระดับพรีเมียม สำหรับคนพิเศษเช่นคุณ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 fade-in-up" style={{animationDelay: '0.4s'}}>
            <Button variant="premium" size="lg" className="gap-2 bg-pink-500 hover:bg-pink-600 text-white shimmer-gold" onClick={openSignupModal}>
              <Crown size={18} /> สมัคร VIP วันนี้
            </Button>
            <Button variant="outline" size="lg" className="gap-2 border-pink-500 text-pink-700 hover:bg-pink-50 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
              <Users size={18} /> ดูสมาชิก
            </Button>
          </div>
        </div>
        <div className="flex-1 flex justify-center fade-in-scale" style={{animationDelay: '0.6s'}}>
          <div className="relative">
            {/* ข้อ 4: Avatar & Hero Image - รูปหลัก (hero) มีกรอบขาว-มนแบบหรู ๆ */}
            <Avatar className="w-80 h-96 rounded-xl border-8 border-white shadow-2xl shimmer-border" style={{
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(255, 255, 255, 0.1)'
            }}>
              <AvatarImage 
                src="https://www.thebangkokinsight.com/wp-content/uploads/2019/09/batch_2-7.jpg" 
                alt="Elite Member"
                className="object-cover" 
              />
              <AvatarFallback className="bg-pink-600 text-white text-2xl font-serif">EM</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-4 -right-4 bg-white border border-pink-500/30 rounded-xl p-2 shadow-xl fade-in-up" style={{animationDelay: '0.8s'}}>
              <div className="text-pink-600 font-bold flex items-center gap-1">
                <BadgeCheck size={16} /> VERIFIED ELITE
              </div>
              <div className="text-xs text-gray-600">ผ่านการคัดกรองแล้ว</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area - ปรับ padding-top */}
      <main className="pt-4">
        {/* Discover Tab */}
        {activeTab === "discover" && (
          <section className="max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-serif font-bold text-pink-100 mb-8 text-center fade-in-up">EXCLUSIVE MEMBERS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {users.map((user, index) => (
                                      <Card 
                        key={user.id} 
                        className="hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col h-[400px] relative shadow-lg hover:shadow-2xl border border-pink-200/50 hover:border-pink-300/70 bg-gradient-to-br from-pink-300/70 to-purple-400/70 backdrop-blur-sm"
                        onClick={() => {
                          setSelectedUser(user);
                    setShowUserProfile(true);
                    // อัพเดท URL ทันทีเมื่อเปิด profile
                    const params = new URLSearchParams(window.location.search);
                    params.set('profile', 'true');
                    params.set('userId', user.id);
                    const newUrl = `${window.location.pathname}?${params.toString()}`;
                    window.history.pushState(null, '', newUrl);
                  }}
                >
                  {/* ตัวเลขอันดับ 1-3 */}
                  {index < 3 && (
                    <div className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeStyle(index + 1)}`}>
                      {index + 1}
                    </div>
                  )}
                  
                  <CardHeader className="flex flex-col items-center pb-2">
                    <div className="relative">
                      {/* ข้อ 4: Avatar & Hero Image - รูปผู้ใช้มีแหวนทองล้อม */}
                      <Avatar className="w-24 h-24 border-2 border-amber-400 p-0.5 group-hover:border-amber-300" style={{
                        boxShadow: '0 0 20px rgba(251, 191, 36, 0.7), inset 0 0 15px rgba(251, 191, 36, 0.3)'
                      }}>
                        <AvatarImage 
                          src={user.avatar} 
                          alt={user.name} 
                          className="object-cover"
                          onError={(e) => {
                            e.target.src = 'http://localhost:5000/uploads/avatar/default.png';
                          }}
                        />
                        <AvatarFallback className="bg-pink-600 text-white font-bold text-lg">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {user.verified && (
                        <div className="absolute -top-1 -right-1 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          <Check size={14} />
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${user.status === "ออนไลน์" ? "bg-green-400" : "bg-zinc-400"}`}></div>
                    </div>
                    <CardTitle className="mt-2">{user.name}, {user.age}</CardTitle>
                    <div className="text-xs text-pink-600 mb-1 font-serif uppercase tracking-wider flex items-center gap-1">
                      <MapPin size={12} /> {user.location}
                    </div>
                    {user.roleName && (
                      <div className={`text-xs font-semibold mb-1 px-2 py-1 rounded-full ${getRoleDisplayStyle(user.role)}`}>
                        {user.roleName}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-1 justify-center pt-2 flex-1 items-start">
                    {user.interests.slice(0, 2).map((interest, idx) => (
                      <span key={idx} className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs">
                        {interest}
                      </span>
                    ))}
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-3 pb-4 px-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation(); // ป้องกันไม่ให้ trigger card click
                        handleLikeUser(user.id);
                      }}
                      variant={likedUsers.includes(user.id) ? "default" : "outline"}
                                                                  className={`flex-1 text-xs flex gap-1 items-center justify-center min-w-0 px-2 font-semibold ${
                                              likedUsers.includes(user.id) 
                                                ? 'bg-pink-500 hover:bg-pink-600 text-white border-pink-500' 
                                                : 'border-pink-700 text-pink-700 hover:bg-pink-50 hover:border-pink-800'
                                            }`}
                    >
                      <Heart size={14} fill={likedUsers.includes(user.id) ? "white" : "none"} className="flex-shrink-0" />
                      <span className="truncate font-bold">{likedUsers.includes(user.id) ? "MATCHED" : "LIKE"}</span>
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation(); // ป้องกันไม่ให้ trigger card click
                        setSelectedUser(user);
                        setActiveTab("chat");
                      }}
                      variant="default"
                      className="flex-1 text-xs flex gap-1 items-center justify-center min-w-0 px-2 bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      <MessageCircle size={12} className="flex-shrink-0" />
                      <span className="truncate">MESSAGE</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <section className="w-full px-4 py-8">
            <div className="w-full max-w-4xl mx-auto">
              {/* Chat Menu Bar */}
              <div className="bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-500/30 rounded-xl mb-6 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-pink-500/20 p-2 rounded-full">
                        <MessageCircle size={24} className="text-pink-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-pink-600 font-serif">ELITE CHAT</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <span>{isConnected ? 'เชื่อมต่อแล้ว' : 'กำลังเชื่อมต่อ...'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-pink-500/10 px-4 py-2 rounded-full">
                      <Users size={16} className="text-pink-600" />
                      <span className="text-pink-600 font-medium">{onlineUsers} คนออนไลน์</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* DJ Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-400 hover:bg-purple-500/20 flex items-center gap-2"
                      onClick={() => setShowDJModal(true)}
                    >
                      <Play size={16} />
                      <span className="hidden md:inline">ดีเจ</span>
                    </Button>
                    
                    {/* Superstar Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-yellow-400 hover:bg-yellow-500/20 flex items-center gap-2"
                      onClick={() => window.open('/superstar', '_blank')}
                    >
                      <Star size={16} />
                      <span className="hidden md:inline">ซุปตาร์</span>
                    </Button>
                    
                    {/* Game Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-400 hover:bg-green-500/20 flex items-center gap-2"
                      onClick={() => setShowGameModal(true)}
                    >
                      <Target size={16} />
                      <span className="hidden md:inline">เกม</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="text-pink-600 hover:bg-pink-500/20">
                      <ThumbsUp size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-pink-600 hover:bg-pink-500/20">
                      <Smile size={16} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <Card className="min-h-[800px] max-h-[1000px] flex flex-col bg-gradient-to-b from-white to-pink-50 border-pink-500/30">
                <CardHeader className="px-8 py-4 border-b border-pink-500/20 bg-pink-50/50 rounded-t-xl">
                  <div className="flex justify-center items-center">
                    <div className="text-center text-base text-pink-600/70 bg-pink-500/10 py-2 px-4 rounded-full">
                      💎 ห้องแชทสำหรับสมาชิกเอลิท • เชื่อมต่อแบบเรียลไทม์
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-gradient-to-b from-white/50 to-pink-50/50">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="flex flex-col items-center min-w-[5rem] flex-shrink-0">
                        <div className="relative">
                          <img
                            src={msg.user ? msg.user.avatar : selectedUser.avatar}
                            alt={msg.user ? msg.user.name : selectedUser.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-pink-500/50"
                          />
                          {(msg.user?.verified !== false) && (
                            <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                              <Check size={12} />
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-pink-600 mt-2 text-center break-words font-medium">
                          {msg.user ? msg.user.name : selectedUser.name}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-base font-medium text-pink-600">
                            {msg.user ? msg.user.name : selectedUser.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {msg.timestamp 
                              ? new Date(msg.timestamp).toLocaleTimeString('th-TH', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })
                              : new Date().toLocaleTimeString('th-TH', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })
                          }
                          </span>
                          {msg.from === "me" && (
                            <span className="text-sm text-pink-600 bg-pink-500/20 px-3 py-1 rounded-full">
                              คุณ
                            </span>
                          )}
                        </div>
                        <div className="bg-white/80 backdrop-blur rounded-2xl rounded-tl-md px-5 py-4 text-gray-800 border border-pink-200/50 text-base leading-relaxed">
                          {renderMessageContent(msg)}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-3 relative">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-sm text-gray-500 hover:text-pink-600 h-8 px-3 gap-2"
                            onClick={() => handleLikeMessage(idx)}
                          >
                            <ThumbsUp size={14} />
                            <span>{messageLikes[idx] || 0}</span>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-sm text-gray-500 hover:text-pink-600 h-8 px-3"
                            onClick={() => handleReply(msg)}
                          >
                            ตอบกลับ
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-sm text-gray-500 hover:text-pink-600 h-8 px-3"
                            onClick={() => setShowEmojiPicker(showEmojiPicker === idx ? null : idx)}
                          >
                            <Smile size={14} />
                          </Button>
                          
                          {showEmojiPicker === idx && (
                            <div className="absolute top-10 left-0 bg-white border border-pink-200 rounded-lg p-2 shadow-lg z-10">
                              <div className="flex gap-2">
                                {emojis.map((emoji, emojiIdx) => (
                                  <button
                                    key={emojiIdx}
                                    className="text-lg hover:bg-pink-100 rounded p-1 transition-colors"
                                    onClick={() => handleEmojiReaction(idx, emoji)}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            {emojis.map((emoji, emojiIdx) => {
                              const count = messageLikes[`${idx}_${emoji}`];
                              if (count) {
                                return (
                                  <span 
                                    key={emojiIdx}
                                    className="text-sm bg-pink-500/20 text-pink-600 px-2 py-1 rounded-full flex items-center gap-1"
                                  >
                                    {emoji} {count}
                                  </span>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </CardContent>
                
                <CardFooter className="border-t border-pink-500/20 bg-pink-50/50 rounded-b-xl p-6">
                  {replyingTo && (
                    <div className="mb-4 bg-pink-100/50 rounded-lg p-3 border-l-4 border-pink-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-pink-600 font-medium text-sm mb-1">
                            ตอบกลับ {replyingTo.user?.name || 'ผู้ใช้'}
                          </div>
                          <div className="text-gray-700 text-sm opacity-75 line-clamp-2">
                            {replyingTo.text || 'รูปภาพ/วิดีโอ'}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 text-gray-500 hover:text-pink-600"
                          onClick={cancelReply}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {attachedImage && (
                    <div className="mb-4 relative inline-block">
                      <img 
                        src={attachedImage.startsWith('http') ? attachedImage : `${API_BASE_URL}${attachedImage}`}
                        alt="Attached" 
                        className="max-w-20 max-h-16 rounded-lg border border-pink-500/30 cursor-pointer object-cover shadow-sm"
                        onClick={() => {
                          const fullImageUrl = attachedImage.startsWith('http') ? attachedImage : `${API_BASE_URL}${attachedImage}`;
                          openImageModal(fullImageUrl);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs"
                        onClick={() => setAttachedImage(null)}
                      >
                        <X size={10} />
                      </Button>
                      <div className="text-xs text-gray-500 mt-1 text-center">พร้อมส่ง</div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSendChat} className="flex items-center gap-3 w-full">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-pink-600 hover:text-pink-500 hover:bg-pink-500/20 w-10 h-10 flex-shrink-0"
                      >
                        <Image size={18} />
                      </Button>
                    </div>
                    
                    <div className="flex-1 relative">
                      <textarea
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendChat(e);
                          }
                        }}
                        placeholder={replyingTo ? `ตอบกลับ ${replyingTo.user?.name || 'ผู้ใช้'}...` : "พิมพ์ข้อความ, แนบรูปภาพ, หรือแชร์ลิงก์ YouTube..."}
                        className="w-full px-4 py-3 rounded-xl border border-pink-500/30 bg-white/80 backdrop-blur text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm resize-none min-h-[3rem] max-h-[6rem] placeholder-gray-500"
                        rows="1"
                        style={{ 
                          overflow: 'hidden',
                          resize: 'none'
                        }}
                        onInput={e => {
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
                        }}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={!isConnected || (!chatInput.trim() && !attachedImage)}
                      className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold px-5 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm flex-shrink-0"
                    >
                      <Send size={16} />
                      ส่ง
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            </div>
          </section>
        )}

        {/* Meet Up Tab */}
        {activeTab === "meetup" && (
          <section className="max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-serif font-bold text-pink-100 mb-8 text-center">AI SMART MATCHING</h2>
            
            {/* AI Matching Section */}
            <div className="mb-12">
              <Card className="p-8 border-pink-500/40 bg-gradient-to-r from-pink-50/50 to-white/50">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-pink-500/20 p-4 rounded-full">
                      <Brain size={32} className="text-pink-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-pink-600 mb-2 font-serif">AI-Powered Matching Technology</h3>
                  <p className="text-gray-700 mb-6 max-w-4xl mx-auto text-lg leading-relaxed">
                    เพราะความสัมพันธ์ดี ๆ ไม่ใช่เรื่องบังเอิญ — เรามี AI เป็นแม่สื่อ
                  </p>
                  <Button 
                    onClick={handleAiAnalysis}
                    variant="premium"
                    size="lg"
                    disabled={isAnalyzing}
                    className="gap-2 bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        กำลังดำเนินการวิเคราะห์ข้อมูลด้วย AI...
                      </>
                    ) : (
                      <>
                        <Zap size={18} /> เริ่มต้นการวิเคราะห์ด้วยระบบ AI
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* AI Recommendations */}
            <div className="mb-12 fade-in-up" style={{animationDelay: '0.3s'}}>
              <h3 className="text-xl font-serif font-bold text-pink-600 mb-6 flex items-center gap-2 shimmer-text">
                <Target size={20} /> คู่ที่แนะนำสำหรับคุณ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiMatches.map((match, index) => (
                  <Card key={match.id} className="hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl border border-pink-200/50 hover:border-pink-300/70 bg-gradient-to-br from-pink-300/70 to-purple-400/70 backdrop-blur-sm">
                    <CardHeader className="flex flex-col items-center pb-2">
                      <div className="relative">
                        {/* ข้อ 4: Avatar & Hero Image - รูปผู้ใช้มีแหวนทองล้อม */}
                        <Avatar className="w-24 h-24 border-2 border-amber-400 p-0.5 group-hover:border-amber-300" style={{
                          boxShadow: '0 0 20px rgba(251, 191, 36, 0.7), inset 0 0 15px rgba(251, 191, 36, 0.3)'
                        }}>
                          <AvatarImage 
                            src={match.avatar} 
                            alt={match.name} 
                            className="object-cover"
                            onError={(e) => {
                              e.target.src = 'http://localhost:5000/uploads/avatar/default.png';
                            }}
                          />
                          <AvatarFallback className="bg-pink-600 text-white font-bold">
                            {match.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {match.verified && (
                          <div className="absolute -top-1 -right-1 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            <Check size={14} />
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${match.status === "ออนไลน์" ? "bg-green-400" : "bg-zinc-400"}`}></div>
                      </div>
                      <CardTitle className="mt-2">{match.name}, {match.age}</CardTitle>
                      <div className="text-xs text-amber-500 mb-1 font-serif uppercase tracking-wider flex items-center gap-1">
                        <MapPin size={12} /> {match.location}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-1 justify-center pt-2">
                      {match.interests.slice(0, 2).map((interest, idx) => (
                        <span key={idx} className="bg-zinc-800 text-amber-400 px-2 py-1 rounded-full text-xs">
                          {interest}
                        </span>
                      ))}
                    </CardContent>
                    
                    <CardFooter className="flex gap-2">
                                                                <Button 
                                            variant="outline" 
                                            className="flex-1 text-xs gap-1 border-pink-700 text-pink-700 hover:bg-pink-50 hover:border-pink-800 font-semibold"
                                            onClick={() => handleLikeUser(match.id)}
                                          >
                        <Heart size={14} /> LIKE
                      </Button>
                      <Button 
                        variant="default" 
                        className="flex-1 text-xs gap-1"
                        onClick={() => setSelectedUser(match)}
                      >
                        <MessageCircle size={12} /> CHAT
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            {/* Exclusive Venues Section */}
            <h3 className="text-2xl font-serif font-bold text-amber-500 mb-6 text-center fade-in-up shimmer-text">EXCLUSIVE VENUES</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl border border-pink-200/50 hover:border-pink-300/70 bg-gradient-to-br from-pink-300/70 to-purple-400/70 backdrop-blur-sm">
                <CardHeader className="p-0 overflow-hidden rounded-t-xl">
                  {/* ข้อ 7: ภาพและ Container - ปรับให้ภาพสวยขึ้นแบบ responsive */}
                  <div className="w-full h-48 overflow-hidden image-container">
                    <img 
                      src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80" 
                      alt="Luxury Restaurant" 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-1.05" 
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <CardTitle className="flex items-center gap-2">
                    <Utensils size={18} /> FINE DINING
                  </CardTitle>
                  <CardDescription className="mt-2">
                    ร้านอาหารระดับมิชลิน สำหรับค่ำคืนแห่งความประทับใจ
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2" variant="default">
                    <Search size={16} /> ดูรายชื่อร้าน
                  </Button>
                </CardFooter>
              </Card>

              <Card className="hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl border border-pink-200/50 hover:border-pink-300/70 bg-gradient-to-br from-pink-300/70 to-purple-400/70 backdrop-blur-sm">
                <CardHeader className="p-0 overflow-hidden rounded-t-xl">
                  {/* ข้อ 7: ภาพและ Container - ปรับให้ภาพสวยขึ้นแบบ responsive */}
                  <div className="w-full h-48 overflow-hidden image-container">
                    <img 
                      src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=600&q=80" 
                      alt="Rooftop Bar" 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-1.05" 
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <CardTitle className="flex items-center gap-2">
                    <Wine size={18} /> LUXURY LOUNGES
                  </CardTitle>
                  <CardDescription className="mt-2">
                    เลานจ์และบาร์หรูชั้นนำ พร้อมวิวทิวทัศน์ที่สวยงาม
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2" variant="default">
                    <Search size={16} /> ดูสถานที่
                  </Button>
                </CardFooter>
              </Card>

              <Card className="hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl border border-pink-200/50 hover:border-pink-300/70 bg-gradient-to-br from-pink-300/70 to-purple-400/70 backdrop-blur-sm">
                <CardHeader className="p-0 overflow-hidden rounded-t-xl">
                  {/* ข้อ 7: ภาพและ Container - ปรับให้ภาพสวยขึ้นแบบ responsive */}
                  <div className="w-full h-48 overflow-hidden image-container">
                    <img 
                      src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80" 
                      alt="Luxury Hotel" 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-1.05" 
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <CardTitle className="flex items-center gap-2">
                    <Building size={18} /> PRIVATE SUITES
                  </CardTitle>
                  <CardDescription className="mt-2">
                    ห้องส่วนตัวในโรงแรมห้าดาว สำหรับการพูดคุยเป็นส่วนตัว
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2" variant="default">
                    <Calendar size={16} /> จองห้อง
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Concierge section */}
            <Card className="mt-12 hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl border border-pink-200/50 hover:border-pink-300/70 bg-gradient-to-br from-pink-300/70 to-purple-400/70 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-serif font-bold text-amber-400 mb-2 flex items-center gap-2">
                      <Crown size={20} /> PERSONAL CONCIERGE
                    </h3>
                    <p className="text-zinc-300 mb-4">ทีมผู้ช่วยส่วนตัวของเราพร้อมจัดการทุกรายละเอียดเพื่อการนัดพบที่สมบูรณ์แบบ</p>
                    <ul className="text-sm text-zinc-400 space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <Check size={16} className="text-amber-500" /> <span>จองร้านอาหารและโรงแรม</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={16} className="text-amber-500" /> <span>จัดเตรียมของขวัญพิเศษ</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={16} className="text-amber-500" /> <span>บริการรถส่วนตัว</span>
                      </li>
                    </ul>
                    <Button variant="premium" className="gap-2">
                      <MessageCircle size={16} /> ติดต่อ Concierge
                    </Button>
                  </div>
                  <div className="flex-1">
                    {/* ข้อ 7: ภาพและ Container - ปรับให้ภาพสวยขึ้นแบบ responsive */}
                    <div className="w-full h-64 overflow-hidden rounded-lg border border-amber-500/30 image-container">
                      <img 
                        src="https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/7bd04f5a-1000-4084-9b0c-a55cd78efb3f/original=true,quality=90/83670807.jpeg" 
                        alt="Concierge"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-1.05"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Premium Tab */}
        {activeTab === "premium" && (
          <section className="max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-serif font-bold text-pink-600 mb-8 text-center fade-in-up shimmer-text">แพคเกจสมาชิก</h2>
            
            {/* Filter/Category Buttons */}
            <div className="flex justify-center gap-4 mb-8 fade-in-up" style={{animationDelay: '0.2s'}}>
              <Button 
                variant={currentPlanFilter === 'all' ? "default" : "outline"}
                onClick={() => setCurrentPlanFilter('all')}
                className={`rounded-full ${currentPlanFilter === 'all' ? 'bg-pink-500 hover:bg-pink-600 text-white shimmer-gold' : 'border-pink-500 text-pink-600 hover:bg-pink-50'}`}
              >
                แพคเกจทั้งหมด
              </Button>
              <Button 
                variant={currentPlanFilter === 'basic' ? "default" : "outline"}
                onClick={() => setCurrentPlanFilter('basic')}
                className={`rounded-full ${currentPlanFilter === 'basic' ? 'bg-pink-500 hover:bg-pink-600 text-white shimmer-gold' : 'border-pink-500 text-pink-600 hover:bg-pink-50'}`}
              >
                แพคเกจพื้นฐาน
              </Button>
              <Button 
                variant={currentPlanFilter === 'premium' ? "default" : "outline"}
                onClick={() => setCurrentPlanFilter('premium')}
                className={`rounded-full ${currentPlanFilter === 'premium' ? 'bg-pink-500 hover:bg-pink-600 text-white shimmer-gold' : 'border-pink-500 text-pink-600 hover:bg-pink-50'}`}
              >
                แพคเกจพรีเมียม
              </Button>
            </div>
            
            {/* Grid Layout for Membership Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 fade-in-scale" style={{animationDelay: '0.4s'}}>
              {membershipPlans
                .filter(plan => {
                  if (currentPlanFilter === 'all') return true;
                  if (currentPlanFilter === 'basic') return plan.id <= 3;
                  if (currentPlanFilter === 'premium') return plan.id > 3;
                  return true;
                })
                .map((plan) => {
                  // Determine the background and border color based on the plan level
                  const bgGradient = 
                    plan.color === 'amber' ? 'from-amber-950 to-black border-amber-500/30' : 
                    plan.color === 'purple' ? 'from-purple-950 to-black border-purple-500/30' : 
                    plan.color === 'pink' ? 'from-pink-950 to-black border-pink-500/30' : 
                    plan.color === 'indigo' ? 'from-indigo-950 to-black border-indigo-500/30' : 
                    plan.color === 'sky' ? 'from-sky-950 to-black border-sky-500/30' : 
                    plan.color === 'cyan' ? 'from-cyan-950 to-black border-cyan-500/30' : 
                    plan.color === 'gray' ? 'from-gray-800 to-black border-gray-500/30' : 
                    'from-zinc-900 to-black border-zinc-700/30';
                    
                  // Determine the text color
                  const textColor = 
                    plan.color === 'amber' ? 'text-amber-400' : 
                    plan.color === 'purple' ? 'text-purple-400' : 
                    plan.color === 'pink' ? 'text-pink-400' : 
                    plan.color === 'indigo' ? 'text-indigo-400' : 
                    plan.color === 'sky' ? 'text-sky-400' : 
                    plan.color === 'cyan' ? 'text-cyan-400' : 
                    plan.color === 'gray' ? 'text-gray-400' : 
                    'text-zinc-400';
                    
                  // Determine the button style
                  const buttonStyle = 
                    plan.color === 'amber' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 
                    plan.color === 'purple' ? 'bg-purple-600 hover:bg-purple-500 text-white' : 
                    plan.color === 'pink' ? 'bg-pink-600 hover:bg-pink-500 text-white' : 
                    plan.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 
                    plan.color === 'sky' ? 'bg-sky-600 hover:bg-sky-500 text-white' : 
                    plan.color === 'cyan' ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 
                    plan.color === 'gray' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 
                    'bg-zinc-700 hover:bg-zinc-600 text-white';
        
                return (
                  <div 
                    key={plan.id}
                    className={`bg-gradient-to-b ${bgGradient} border rounded-xl overflow-hidden flex flex-col h-full transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl ${plan.recommended ? 'ring-2 ring-pink-500 scale-105 z-10' : ''}`}
                  >
                    {/* Plan Header */}
                    <div className={`p-4 ${plan.recommended ? 'bg-gradient-to-r from-pink-900 to-pink-950' : ''} relative`}>
                      {plan.recommended && (
                        <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          RECOMMENDED
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <plan.icon className={textColor} size={22} />
                        <h3 className={`text-xl font-bold font-serif ${textColor}`}>{plan.name}</h3>
                      </div>
                      <div className="text-center mb-2">
                        <span className="text-2xl font-bold text-white">{plan.price}</span>
                        {plan.period && <span className="text-sm text-zinc-400">/{plan.period}</span>}
                      </div>
                    </div>
                    
                    {/* Plan Benefits - สรุปจำนวนสิทธิประโยชน์ เมื่อคลิกจะแสดงรายละเอียด */}
                    <div className="p-4 flex-1">
                      <div className="text-center text-sm text-gray-600 mb-3">
                        {plan.benefits.length} สิทธิประโยชน์
                      </div>
                      <div className="space-y-2">
                        {plan.benefits.slice(0, 4).map((benefit, idx) => {
                          const IconComponent = plan.iconMap[idx] || Check;
                          return (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <IconComponent size={14} className={textColor} />
                              <span className="text-gray-700">{benefit}</span>
                            </div>
                          );
                        })}
                        {plan.benefits.length > 4 && (
                          <div className="text-center mt-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`${textColor} text-xs`}
                              onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                            >
                              {expandedPlan === plan.id ? "ดูน้อยลง" : `+ อีก ${plan.benefits.length - 4} รายการ`}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Plan Footer - แก้ไขปุ่มเพื่อเชื่อมโยงไปยังหน้าสมัครสมาชิก */}
                    <div className="p-4 border-t border-pink-200">
                      <Button 
                        className={`w-full ${buttonStyle}`}
                        onClick={() => handleMembershipSignup(plan.id)}
                      >
                        {plan.price === "ฟรี" ? "ใช้งานอยู่" : `สมัคร ${plan.name}`}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Modal for showing full plan details */}
            {expandedPlan && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl border border-pink-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-pink-500/20 p-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-pink-600 font-serif">
                      {membershipPlans.find(p => p.id === expandedPlan)?.name} - รายละเอียดแพคเกจ
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => setExpandedPlan(null)}>
                      <X size={20} />
                    </Button>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3">
                      {membershipPlans.find(p => p.id === expandedPlan)?.benefits.map((benefit, idx) => {
                        const plan = membershipPlans.find(p => p.id === expandedPlan);
                        const IconComponent = plan?.iconMap[idx] || Check;
                        return (
                          <li key={idx} className="flex items-start gap-3 text-sm">
                            <IconComponent size={18} className="text-pink-600 mt-0.5" />
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-8 text-center">
                      <Button 
                        variant="default"
                        size="lg"
                        className="w-full md:w-auto bg-pink-500 hover:bg-pink-600 text-white"
                      >
                        สมัครสมาชิก {membershipPlans.find(p => p.id === expandedPlan)?.name}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Table Comparison View Toggle */}
            <div className="text-center mb-8">
              <Button 
                variant="outline" 
                className="gap-2 border-pink-500 text-pink-600 hover:bg-pink-50"
                onClick={() => setShowComparisonTable(!showComparisonTable)}
              >
                {showComparisonTable ? "ซ่อนตารางเปรียบเทียบ" : "แสดงตารางเปรียบเทียบแพคเกจ"}
              </Button>
            </div>
            
            {/* Table Comparison View */}
            {showComparisonTable && (
              <div className="overflow-x-auto mb-12">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-pink-500/30">
                      <th className="p-3 text-left text-pink-600">คุณสมบัติ</th>
                      {membershipPlans.map(plan => (
                        <th 
                          key={plan.id} 
                          className={`p-3 text-center ${plan.recommended ? 'bg-amber-900/20' : ''}`}
                        >
                          <div className="flex flex-col items-center">
                            <plan.icon size={18} className="mb-1" />
                            <span className="text-sm font-bold">{plan.name}</span>
                            <span className="text-xs text-zinc-400">{plan.price}/{plan.period || 'เดือน'}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Generate rows for common benefits */}
                    {['แชทได้', 'อัพรูปภาพ', 'อัพวิดีโอ', 'หมุนวงล้อของขวัญ', 'โบนัสรายวัน'].map((feature, index) => (
                      <tr key={index} className="border-b border-zinc-800">
                        <td className="p-3 text-left text-zinc-300">{feature}</td>
                        {membershipPlans.map(plan => (
                          <td 
                            key={plan.id} 
                            className={`p-3 text-center text-xs ${plan.recommended ? 'bg-amber-900/20' : ''}`}
                          >
                            {plan.benefits[index]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Testimonials Section */}
            <div className="mt-16">
              <h3 className="text-xl font-serif font-bold text-amber-400 mb-6 text-center">คำรับรองจากสมาชิกผู้ประสบความสำเร็จ</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-b from-zinc-900 to-black rounded-xl p-6 border border-amber-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src="https://randomuser.me/api/portraits/women/79.jpg" 
                      alt="Testimonial" 
                      className="w-12 h-12 rounded-full object-cover border border-amber-500/30" 
                    />
                    <div>
                      <div className="font-medium text-amber-400">ดร. อรุณี</div>
                      <div className="text-xs text-zinc-400">CEO, บริษัทการเงิน</div>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 italic">
                    "SodeClick เข้าใจความต้องการของคนที่มีไลฟ์สไตล์พิเศษและเวลาจำกัด บริการ concierge ทำให้การนัดพบเป็นเรื่องง่าย"
                  </p>
                </div>

                <div className="bg-gradient-to-b from-zinc-900 to-black rounded-xl p-6 border border-amber-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src="https://randomuser.me/api/portraits/men/68.jpg" 
                      alt="Testimonial" 
                      className="w-12 h-12 rounded-full object-cover border border-amber-500/30" 
                    />
                    <div>
                      <div className="font-medium text-amber-400">คุณธนา</div>
                      <div className="text-xs text-zinc-400">นักลงทุนอสังหาริมทรัพย์</div>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 italic">
                    "ผมประทับใจกับความเป็นส่วนตัวและการคัดกรองสมาชิกอย่างเข้มงวด ทำให้มั่นใจได้ว่าจะได้พบกับคนที่มีคุณภาพจริงๆ"
                  </p>
                </div>

                <div className="bg-gradient-to-b from-zinc-900 to-black rounded-xl p-6 border border-amber-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src="https://randomuser.me/api/portraits/women/54.jpg" 
                      alt="Testimonial" 
                      className="w-12 h-12 rounded-full object-cover border border-amber-500/30" 
                    />
                    <div>
                                               <div className="font-medium text-amber-400">คุณนภา</div>
                        <div className="text-xs text-zinc-400">ผู้จัดการกองทุน</div>
                      </div>
                  </div>
                  <p className="text-sm text-zinc-300 italic">
                    "งานสังคมที่จัดขึ้นสำหรับสมาชิก Elite เป็นโอกาสที่ดีในการสร้างคอนเนคชั่นกับคนที่มีความสนใจคล้ายกัน ไม่ผิดหวังเลย"
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-zinc-400 py-12 mt-12 border-t border-amber-500/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-amber-400 font-bold mb-4 font-serif">โสดคลิก</h3>
              <p className="text-sm">บริการจัดหาคู่ระดับพรีเมียมสำหรับผู้ประสบความสำเร็จ</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 font-serif">สมาชิก</h4>
              <ul className="text-sm space-y-2">
                <li>พรีเมียม</li>
                               <li>โสดคลิก</li>
                <li>บริษัท</li>
              </ul>
            </div>
                        <div>
                          <h4 className="text-white font-semibold mb-3 font-serif">ความเป็นส่วนตัว</h4>
                          <ul className="text-sm space-y-2">
                            <li>นโยบายความเป็นส่วนตัว</li>
                            <li>การยืนยันตัวตน</li>
                            <li>ความปลอดภัย</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-3 font-serif">ติดต่อเรา</h4>
                          <ul className="text-sm space-y-2">
                            <li>support@sodeclick.com</li>
                            <li>02-123-4567</li>
                            <li>แจ้งปัญหา</li>
                          </ul>
                        </div>
                      </div>
                      <div className="text-center text-sm">
                        <p>&copy; 2024 SodeClick. All rights reserved.</p>
                      </div>
                    </div>
                  </footer>
            
                  {/* Image Modal */}
                  {showImageModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={closeImageModal}>
                      <div className="relative max-w-4xl max-h-full">
                        <img 
                          src={modalImageSrc} 
                          alt="Full size" 
                          className="max-w-full max-h-full object-contain rounded-lg"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {/* ข้อ 8: ปุ่มที่มืดและเด่นชัด - ปุ่มดำที่ยังอ่านง่าย, มีขอบทอง */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-black text-white border border-amber-500/50 hover:border-amber-500/70 hover:bg-black/80"
                          onClick={closeImageModal}
                        >
                          <X size={20} />
                        </Button>
                      </div>
                    </div>
                  )}
            
                  {/* Auth Modal */}
                  <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setIsAuthModalOpen(false)}
                    initialView={authModalView}
                    onViewChange={setAuthModalView}
                  />

                  {/* User Profile Modal */}
                  {showUserProfile && selectedUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-zinc-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="relative">
                          {/* Header */}
                          <div className="flex justify-between items-center p-6 border-b border-zinc-700">
                            <h2 className="text-2xl font-bold text-white">โปรไฟล์</h2>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setShowUserProfile(false);
                                // อัพเดท URL เมื่อปิด profile
                                const params = new URLSearchParams(window.location.search);
                                params.delete('profile');
                                params.delete('userId');
                                const newUrl = `${window.location.pathname}?${params.toString()}`;
                                window.history.pushState(null, '', newUrl);
                              }}
                              className="text-gray-400 hover:text-white"
                            >
                              <X size={20} />
                            </Button>
                          </div>

                          {/* Profile Content */}
                          <div className="p-6">
                            <div className="flex flex-col items-center mb-6">
                              <Avatar className="w-32 h-32 border-4 border-amber-500 mb-4">
                                <AvatarImage 
                                  src={selectedUser.avatar} 
                                  alt={selectedUser.name} 
                                  className="object-cover"
                                  onError={(e) => {
                                    e.target.src = 'http://localhost:5000/uploads/avatar/default.png';
                                  }}
                                />
                                <AvatarFallback className="bg-amber-900 text-amber-100 text-2xl font-bold">
                                  {selectedUser.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-center">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                  {selectedUser.name}, {selectedUser.age}
                                  {selectedUser.verified && (
                                    <div className="bg-amber-500 text-black rounded-full w-6 h-6 flex items-center justify-center">
                                      <Check size={14} />
                                    </div>
                                  )}
                                </h3>
                                <p className="text-amber-500 flex items-center gap-1 justify-center mt-2">
                                  <MapPin size={16} /> {selectedUser.location || 'ไม่ระบุ'}
                                </p>
                                {/* แสดงอาชีพถ้ามีข้อมูล */}
                                {selectedUser.occupation && (
                                  <p className="text-blue-400 flex items-center gap-1 justify-center mt-1">
                                    <Building size={16} /> อาชีพ: {selectedUser.occupation}
                                  </p>
                                )}
                                {/* แสดงที่อยู่ถ้ามีข้อมูล */}
                                {selectedUser.address && (
                                  <p className="text-green-400 flex items-center gap-1 justify-center mt-1">
                                    <Home size={16} /> ที่อยู่: {selectedUser.address}
                                  </p>
                                )}
                                <div className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm ${
                                  selectedUser.status === "ออนไลน์" ? "bg-green-900 text-green-400" : "bg-gray-900 text-gray-400"
                                }`}>
                                  <div className={`w-2 h-2 rounded-full ${selectedUser.status === "ออนไลน์" ? "bg-green-400" : "bg-gray-400"}`}></div>
                                  {selectedUser.status}
                                </div>
                              </div>
                            </div>

                            {/* Interests */}
                            {selectedUser.interests && selectedUser.interests.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-lg font-semibold text-white mb-3">ความสนใจ</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedUser.interests.map((interest, idx) => (
                                    <span key={idx} className="bg-zinc-800 text-amber-400 px-3 py-1 rounded-full text-sm">
                                      {interest}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6">
                              <Button
                                onClick={() => {
                                  handleLikeUser(selectedUser.id);
                                }}
                                variant={likedUsers.includes(selectedUser.id) ? "default" : "outline"}
                                                                  className={`flex-1 flex gap-2 items-center justify-center min-w-0 px-3 font-semibold ${
                                    likedUsers.includes(selectedUser.id) 
                                      ? 'bg-pink-500 hover:bg-pink-600 text-white border-pink-500' 
                                      : 'border-pink-700 text-pink-700 hover:bg-pink-50 hover:border-pink-800'
                                  }`}
                              >
                                <Heart size={18} fill={likedUsers.includes(selectedUser.id) ? "white" : "none"} className="flex-shrink-0" />
                                <span className="truncate font-bold">{likedUsers.includes(selectedUser.id) ? "MATCHED" : "ให้ไลค์"}</span>
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowUserProfile(false);
                                  setActiveTab("chat");
                                  // อัพเดท URL เมื่อปิด profile และไปหน้าแชท
                                  const params = new URLSearchParams(window.location.search);
                                  params.delete('profile');
                                  params.delete('userId');
                                  params.set('tab', 'chat');
                                  const newUrl = `${window.location.pathname}?${params.toString()}`;
                                  window.history.pushState(null, '', newUrl);
                                }}
                                variant="default"
                                className="flex-1 flex gap-2 items-center justify-center min-w-0 px-3 bg-amber-600 hover:bg-amber-700"
                              >
                                <MessageCircle size={16} className="flex-shrink-0" />
                                <span className="truncate">ส่งข้อความ</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DJ Modal */}
                  {showDJModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-zinc-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="relative">
                          <div className="flex justify-between items-center p-6 border-b border-zinc-700">
                            <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                              <Play size={24} /> DJ Station
                            </h2>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowDJModal(false)}
                              className="text-gray-400 hover:text-white"
                            >
                              <X size={20} />
                            </Button>
                          </div>
                          
                          <div className="p-6">
                            <div className="text-center mb-6">
                              <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Play size={32} className="text-purple-400" />
                              </div>
                              <h3 className="text-xl font-bold text-white mb-2">DJ Music Station</h3>
                              <p className="text-zinc-400">ฟังเพลงที่ DJ เปิดให้ฟังแบบเรียลไทม์</p>
                            </div>
                            
                            {currentSong ? (
                              <div className="bg-zinc-800 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-4">
                                  <div className="bg-purple-500/20 p-3 rounded-full">
                                    <Play size={20} className="text-purple-400" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-white">{currentSong.title}</h4>
                                    <p className="text-zinc-400">{currentSong.artist}</p>
                                  </div>
                                  <Button
                                    variant={isPlaying ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                  >
                                    {isPlaying ? 'หยุด' : 'เล่น'}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center text-zinc-400 py-8">
                                <p>ไม่มีเพลงที่กำลังเล่นในขณะนี้</p>
                                <p className="text-sm mt-2">รอ DJ เปิดเพลงให้ฟัง...</p>
                              </div>
                            )}
                            
                            {user?.role === 'admin' ? (
                              <div className="border-t border-zinc-700 pt-4">
                                <Button
                                  variant="premium"
                                  className="w-full"
                                  onClick={() => {
                                    window.open('/dj-dashboard', '_blank');
                                  }}
                                >
                                  เปิด DJ Dashboard
                                </Button>
                              </div>
                            ) : (
                              <div className="border-t border-zinc-700 pt-4">
                                {userDjStatus === 'none' && (
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        เหตุผลที่ต้องการเป็น DJ
                                      </label>
                                      <textarea
                                        value={djMessage}
                                        onChange={(e) => setDjMessage(e.target.value)}
                                        placeholder="บอกเหตุผลที่คุณต้องการเป็น DJ..."
                                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                        rows="3"
                                      />
                                    </div>
                                    <Button
                                      variant="premium"
                                      className="w-full"
                                      onClick={() => {
                                        if (djMessage.trim()) {
                                          setDjApplications(prev => [...prev, {
                                            id: Date.now(),
                                            user: user.username,
                                            message: djMessage,
                                            status: 'pending',
                                            timestamp: new Date()
                                          }]);
                                          setUserDjStatus('pending');
                                          setDjMessage('');
                                        }
                                      }}
                                      disabled={!djMessage.trim()}
                                    >
                                      ส่งคำขอเป็น DJ
                                    </Button>
                                  </div>
                                )}
                                
                                {userDjStatus === 'pending' && (
                                  <div className="text-center py-4">
                                    <div className="bg-yellow-500/20 p-4 rounded-lg">
                                      <p className="text-yellow-400 font-medium">⏳ คำขอของคุณอยู่ระหว่างการพิจารณา</p>
                                      <p className="text-zinc-400 text-sm mt-2">Admin จะตรวจสอบและแจ้งผลให้ทราบ</p>
                                    </div>
                                  </div>
                                )}
                                
                                {userDjStatus === 'approved' && (
                                  <div className="text-center py-4">
                                    <div className="bg-green-500/20 p-4 rounded-lg mb-4">
                                      <p className="text-green-400 font-medium">✅ คุณได้รับอนุมัติให้เป็น DJ แล้ว!</p>
                                    </div>
                                    <Button
                                      variant="premium"
                                      className="w-full"
                                      onClick={() => {
                                        window.open('/dj-dashboard', '_blank');
                                      }}
                                    >
                                      เข้าสู่ DJ Dashboard
                                    </Button>
                                  </div>
                                )}
                                
                                {userDjStatus === 'banned' && (
                                  <div className="text-center py-4">
                                    <div className="bg-red-500/20 p-4 rounded-lg">
                                      <p className="text-red-400 font-medium">🚫 คุณถูกระงับสิทธิ์การเป็น DJ</p>
                                      <p className="text-zinc-400 text-sm mt-2">ติดต่อ Admin หากต้องการอุทธรณ์</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Superstar Modal */}
                  {showSuperstarModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-zinc-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="relative">
                          <div className="flex justify-between items-center p-6 border-b border-zinc-700">
                            <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                              <Star size={24} /> ซุปตาร์
                            </h2>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowSuperstarModal(false)}
                              className="text-gray-400 hover:text-white"
                            >
                              <X size={20} />
                            </Button>
                          </div>
                          
                          <div className="p-6">
                            <div className="text-center mb-6">
                              <div className="bg-yellow-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Star size={32} className="text-yellow-400" />
                              </div>
                              <h3 className="text-xl font-bold text-white mb-2">ซุปตาร์ของเดือน</h3>
                              <p className="text-zinc-400">สมาชิกที่ได้รับโวตและดาวมากที่สุด</p>
                            </div>
                            
                            <div className="space-y-4">
                              {/* Top 3 Superstars */}
                              {[1, 2, 3].map((rank) => (
                                <div key={rank} className="bg-zinc-800 rounded-lg p-4 flex items-center gap-4">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                    rank === 1 ? 'bg-yellow-500 text-black' :
                                    rank === 2 ? 'bg-gray-400 text-white' :
                                    'bg-orange-600 text-white'
                                  }`}>
                                    {rank}
                                  </div>
                                  <Avatar className="w-12 h-12">
                                    <AvatarImage src={`https://randomuser.me/api/portraits/women/${rank + 20}.jpg`} />
                                    <AvatarFallback>U{rank}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-white">ผู้ใช้ {rank}</h4>
                                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                                      <span className="flex items-center gap-1">
                                        <ThumbsUp size={12} /> {100 - rank * 10} โวต
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Star size={12} /> {50 - rank * 5} ดาว
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Game Modal */}
                  {showGameModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="relative">
                          <div className="flex justify-between items-center p-6 border-b border-pink-200">
                            <h2 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
                              <Target size={24} /> เกมส์
                            </h2>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowGameModal(false)}
                              className="text-gray-500 hover:text-pink-600"
                            >
                              <X size={20} />
                            </Button>
                          </div>
                          
                          <div className="p-6">
                            <div className="text-center mb-6">
                              <div className="bg-pink-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Target size={32} className="text-pink-600" />
                              </div>
                              <h3 className="text-xl font-bold text-gray-800 mb-2">เกมส์และกิจกรรม</h3>
                              <p className="text-gray-600">เกมส์สนุก ๆ สำหรับสมาชิก</p>
                            </div>
                            
                            <div className="text-center text-gray-500 py-8">
                              <p>🎮 เกมส์กำลังพัฒนา</p>
                              <p className="text-sm mt-2">เร็ว ๆ นี้จะมีเกมส์สนุก ๆ ให้เล่น!</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DJ Dashboard Modal */}
                  {showDJDashboard && user?.role === 'admin' && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="relative">
                          <div className="flex justify-between items-center p-6 border-b border-pink-200">
                            <h2 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
                              <Play size={24} /> DJ Dashboard
                            </h2>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowDJDashboard(false)}
                              className="text-gray-500 hover:text-pink-600"
                            >
                              <X size={20} />
                            </Button>
                          </div>
                          
                          <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Current Playing */}
                              <div className="bg-pink-50 rounded-lg p-4">
                                <h3 className="text-lg font-bold text-pink-600 mb-4 flex items-center gap-2">
                                  <Play size={20} /> กำลังเล่น
                                </h3>
                                {currentSong ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                      <div className="bg-pink-500/20 p-3 rounded-full">
                                        <Play size={20} className="text-pink-600" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-bold text-gray-800">{currentSong.title}</h4>
                                        <p className="text-gray-600">{currentSong.artist}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant={isPlaying ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setIsPlaying(!isPlaying)}
                                      >
                                        {isPlaying ? 'หยุด' : 'เล่น'}
                                      </Button>
                                      <Button variant="outline" size="sm">
                                        ข้าม
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center text-gray-500 py-8">
                                    <p>ไม่มีเพลงที่กำลังเล่น</p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-2 border-pink-500 text-pink-600 hover:bg-pink-50"
                                      onClick={() => {
                                        if (playlist.length > 0) {
                                          setCurrentSong(playlist[0]);
                                          setIsPlaying(true);
                                        }
                                      }}
                                    >
                                      เล่นเพลงแรกใน Playlist
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {/* DJ Requests */}
                              <div className="bg-pink-50 rounded-lg p-4">
                                <h3 className="text-lg font-bold text-pink-600 mb-4 flex items-center gap-2">
                                  <Users size={20} /> คำขอจาก User
                                </h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                  {djRequests.map((request) => (
                                    <div key={request.id} className="bg-white rounded-lg p-3">
                                      <div className="flex justify-between items-start mb-2">
                                        <div>
                                          <p className="font-medium text-gray-800">{request.user}</p>
                                          <p className="text-sm text-gray-600">{request.song}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                          request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                          'bg-red-500/20 text-red-400'
                                        }`}>
                                          {request.status === 'pending' ? 'รอดำเนินการ' :
                                           request.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}
                                        </span>
                                      </div>
                                      {request.status === 'pending' && (
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-green-400 border-green-400 hover:bg-green-500/20"
                                            onClick={() => {
                                              setDjRequests(prev => prev.map(r =>
                                                r.id === request.id ? {...r, status: 'approved'} : r
                                              ));
                                            }}
                                          >
                                            อนุมัติ
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-400 border-red-400 hover:bg-red-500/20"
                                            onClick={() => {
                                              setDjRequests(prev => prev.map(r =>
                                                r.id === request.id ? {...r, status: 'rejected'} : r
                                              ));
                                            }}
                                          >
                                            ปฏิเสธ
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Playlist */}
                              <div className="bg-pink-50 rounded-lg p-4 lg:col-span-2">
                                <h3 className="text-lg font-bold text-pink-600 mb-4 flex items-center gap-2">
                                  <Star size={20} /> Playlist
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {playlist.map((song, index) => (
                                    <div key={song.id} className="bg-white rounded-lg p-3 flex items-center gap-4">
                                      <span className="text-gray-500 w-6">{index + 1}</span>
                                      <div className="flex-1">
                                        <h4 className="font-medium text-gray-800">{song.title}</h4>
                                        <p className="text-sm text-gray-600">{song.artist} • {song.duration}</p>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setCurrentSong(song);
                                            setIsPlaying(true);
                                          }}
                                        >
                                          <Play size={16} />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-400 hover:bg-red-500/20"
                                          onClick={() => {
                                            setPlaylist(prev => prev.filter(s => s.id !== song.id));
                                          }}
                                        >
                                          <X size={16} />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-pink-200">
                                  <Button variant="outline" className="w-full border-pink-500 text-pink-600 hover:bg-pink-50">
                                    + เพิ่มเพลงใหม่
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            }



