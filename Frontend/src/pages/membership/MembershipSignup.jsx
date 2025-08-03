import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { 
  ArrowLeft, 
  CreditCard, 
  Check, 
  Crown, 
  Star, 
  Diamond, 
  Shield, 
  Users, 
  Gift,
  Image,
  Video,
  Timer,
  Coins,
  Medal,
  SquareCheck,
  Lock,
  EyeOff,
  Users2,
  Wallet,
  CheckCircle,
  ChevronRight,
  BanknoteIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Mock data - ในอนาคตควรดึงจาก API
const membershipPlans = [
  {
    id: 1,
    type: "member",
    name: "Member",
    icon: Users,
    price: 0,
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
      0: Users, 1: Image, 2: Video, 3: Gift, 4: Coins,
    }
  },
  {
    id: 2,
    type: "silver",
    name: "Silver Member",
    icon: Star,
    price: 20,
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
      0: Users, 1: Image, 2: Video, 3: Gift, 4: Coins, 5: Medal,
    }
  },
  {
    id: 3,
    type: "gold",
    name: "Gold Member",
    icon: Crown,
    price: 50,
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
      0: Users, 1: Image, 2: Video, 3: Gift, 4: Coins, 5: Medal, 6: Video, 7: SquareCheck, 8: SquareCheck
    }
  },
  {
    id: 4,
    type: "vip",
    name: "VIP Member",
    icon: Crown,
    price: 100,
    period: "30 วัน",
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
      0: Users, 1: Image, 2: Video, 3: Gift, 4: Coins, 5: Medal, 6: Video, 7: SquareCheck, 8: SquareCheck, 9: SquareCheck, 10: EyeOff, 11: Users2
    }
  },
  {
    id: 5,
    type: "vip1",
    name: "VIP 1",
    icon: Crown,
    price: 150,
    period: "30 วัน",
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
      0: Users, 1: Image, 2: Video, 3: Gift, 4: Coins, 5: Medal, 6: Video, 7: SquareCheck, 8: SquareCheck, 9: SquareCheck, 10: EyeOff, 11: Users2, 12: EyeOff
    }
  },
  {
    id: 6,
    type: "vip2",
    name: "VIP 2",
    icon: Diamond,
    price: 300,
    period: "30 วัน",
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
      0: Users, 1: Image, 2: Video, 3: Gift, 4: Coins, 5: Medal, 6: Video, 7: SquareCheck, 8: SquareCheck, 9: SquareCheck, 10: EyeOff, 11: Users2, 12: EyeOff
    }
  },
  {
    id: 7,
    type: "diamond",
    name: "Diamond Member",
    icon: Diamond,
    price: 500,
    period: "30 วัน",
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
      0: Users, 1: Image, 2: Video, 3: Gift, 4: Coins, 5: Medal, 6: Video, 7: SquareCheck, 8: SquareCheck, 9: SquareCheck, 10: EyeOff, 11: Users2, 12: EyeOff, 13: Wallet, 14: Coins
    }
  },
  {
    id: 8,
    type: "platinum",
    name: "Platinum Member",
    icon: Crown,
    price: 1000,
    period: "30 วัน",
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
      0: Users, 1: Image, 2: Video, 3: Gift, 4: Coins, 5: Medal, 6: Video, 7: SquareCheck, 8: SquareCheck, 9: SquareCheck, 10: EyeOff, 11: Users2, 12: EyeOff, 13: Wallet, 14: Coins
    }
  }
];

// วิธีการชำระเงิน
const paymentMethods = [
  { id: 'credit_card', name: 'บัตรเครดิต/เดบิต', icon: CreditCard },
  { id: 'bank_transfer', name: 'โอนเงินผ่านธนาคาร', icon: BanknoteIcon },
  { id: 'promptpay', name: 'พร้อมเพย์', icon: Shield },
  { id: 'true_money', name: 'ทรูมันนี่วอลเล็ท', icon: Wallet },
  { id: 'rabbit_line_pay', name: 'LINE Pay', icon: CreditCard }
];

const MembershipSignup = () => {
  const { planType } = useParams(); // รับพารามิเตอร์จาก URL
  const navigate = useNavigate();
  const { user, isAuthenticated, setAuthModalView, setIsAuthModalOpen } = useAuth();
  const [currentStep, setCurrentStep] = useState(1); // 1: เลือกแพคเกจ, 2: ชำระเงิน, 3: ยืนยัน
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // เมื่อโหลดหน้า ถ้ามี planType ให้เลือกแพคเกจนั้นๆ
  useEffect(() => {
    if (planType) {
      const plan = membershipPlans.find(p => p.type === planType);
      if (plan) {
        setSelectedPlan(plan);
        if (plan.price > 0) {
          setCurrentStep(2); // ถ้าเป็นแพคเกจแบบเสียเงิน ไปที่ขั้นตอนการชำระเงิน
        } else {
          setCurrentStep(3); // ถ้าเป็นแพคเกจฟรี ไปที่ขั้นตอนการยืนยัน
        }
      }
    }
  }, [planType]);

  // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
  useEffect(() => {
    if (!isAuthenticated) {
      // เก็บ URL ปัจจุบันเพื่อให้กลับมาหลังจาก login
      const currentUrl = window.location.pathname;
      localStorage.setItem('redirectAfterLogin', currentUrl);
      
      // ใช้ Modal login แทนการ redirect เพื่อให้ประสบการณ์ผู้ใช้ดีขึ้น
      setAuthModalView("login");
      setIsAuthModalOpen(true);
    } else {
      // ถ้า login แล้ว แต่ไม่มี selectedPlan ให้เลือกแพคเกจจาก URL
      if (!selectedPlan && planType) {
        const plan = membershipPlans.find(p => p.type === planType);
        if (plan) {
          setSelectedPlan(plan);
          if (plan.price > 0) {
            setCurrentStep(2); // ไปที่ขั้นตอนการชำระเงิน
          } else {
            setCurrentStep(3); // ไปที่ขั้นตอนการยืนยัน
          }
        }
      }
    }
  }, [isAuthenticated, planType, selectedPlan, navigate, setAuthModalView, setIsAuthModalOpen]);

  // ฟังก์ชันเลือกแพคเกจ
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    if (plan.price > 0) {
      setCurrentStep(2); // ถ้าเป็นแพคเกจแบบเสียเงิน ไปที่ขั้นตอนการชำระเงิน
    } else {
      setCurrentStep(3); // ถ้าเป็นแพคเกจฟรี ไปที่ขั้นตอนการยืนยัน
    }
  };

  // ฟังก์ชันเลือกวิธีการชำระเงิน
  const handleSelectPaymentMethod = (method) => {
    setSelectedPaymentMethod(method);
    setCurrentStep(3);
  };

  // ฟังก์ชันยืนยันการสมัครสมาชิก
  const handleConfirmSubscription = async () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      // สร้างข้อมูลการชำระเงิน (mock)
      const transactionId = `TXN${Date.now()}`;
      
      // เรียก API เพื่อสมัครสมาชิก
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/membership/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planType: selectedPlan.type,
          paymentMethod: selectedPaymentMethod?.id || 'free',
          transactionId: transactionId
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // แสดงข้อความสำเร็จ
        setSuccessMessage(`คุณได้สมัครสมาชิกแพคเกจ ${selectedPlan.name} เรียบร้อยแล้ว!`);
        
        // รอสักครู่แล้ว redirect ไปหน้าหลัก
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setErrorMessage(data.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      console.error('Error upgrading membership:', error);
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessing(false);
    }
  };

  // ฟังก์ชันกลับไปขั้นตอนก่อนหน้า
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/'); // กลับไปหน้าหลัก
    }
  };

  // ฟังก์ชันแสดงสีตามแพคเกจ
  const getPlanColor = (planColor) => {
    switch (planColor) {
      case 'amber': return 'text-amber-400 bg-amber-900/20';
      case 'purple': return 'text-purple-400 bg-purple-900/20';
      case 'pink': return 'text-pink-400 bg-pink-900/20';
      case 'indigo': return 'text-indigo-400 bg-indigo-900/20';
      case 'sky': return 'text-sky-400 bg-sky-900/20';
      case 'cyan': return 'text-cyan-400 bg-cyan-900/20';
      case 'gray': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-zinc-400 bg-zinc-800/20';
    }
  };

  // ฟังก์ชันอัพเดทเพื่อใช้ API จริง
  useEffect(() => {
    const fetchMembershipPlans = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/membership/plans');
        if (response.ok) {
          const data = await response.json();
          // ปรับฟอร์แมทข้อมูลให้ตรงกับที่คอมโพเนนต์ต้องการ
          const formattedPlans = Object.entries(data.data).map(([type, plan], index) => ({
            id: index + 1,
            type: type,
            name: plan.name,
            price: plan.price,
            period: `${plan.duration} วัน`,
            color: getMembershipColor(type),
            recommended: type === 'vip',
            benefits: formatBenefits(plan.features),
            // สร้าง iconMap จาก features
            iconMap: createIconMapFromFeatures(plan.features)
          }));
          
          setMembershipPlans(formattedPlans);
        }
      } catch (error) {
        console.error('Error fetching membership plans:', error);
      }
    };
    
    fetchMembershipPlans();
  }, []);

  // ฟังก์ชั่นช่วยเหลือสำหรับการฟอร์แมทข้อมูล
  const formatBenefits = (features) => {
    const benefitsList = [];
    
    if (features.dailyChats) {
      benefitsList.push(`แชทได้วันละ ${features.dailyChats === 999 ? 'ไม่จำกัด' : features.dailyChats} คน`);
    }
    
    if (features.maxPhotos) {
      benefitsList.push(`อัพรูปภาพสำหรับแชท ${features.maxPhotos === 999 ? 'ไม่จำกัด' : features.maxPhotos} รูป`);
    }
    
    if (features.maxVideos) {
      benefitsList.push(`อัพวิดีโอสำหรับแชทได้ ${features.maxVideos === 999 ? 'ไม่จำกัด' : features.maxVideos} คลิป`);
    }
    
    if (features.spinWheelInterval) {
      const hours = features.spinWheelInterval / 60;
      benefitsList.push(`หมุนวงล้อของขวัญทุก ${hours >= 1 ? `${hours} ชั่วโมง` : `${features.spinWheelInterval} นาที`}`);
    }
    
    if (features.dailyBonus) {
      benefitsList.push(`โบนัสรายวัน ${features.dailyBonus.toLocaleString()} เหรียญ`);
    }
    
    // เพิ่ม benefits อื่นๆ
    if (features.votePoints) {
      benefitsList.push(`คะแนนโหวต ${features.votePoints.toLocaleString()} แต้ม`);
    }
    
    if (features.profileVideos) {
      benefitsList.push(`เพิ่มวิดีโอโปรไฟล์ ${features.profileVideos} คลิป`);
    }
    
    if (features.verified) {
      benefitsList.push(`ติ๊กยืนยันโปรไฟล์`);
    }
    
    if (features.premiumFrame) {
      benefitsList.push(`กรอบโปรไฟล์พิเศษเฉพาะสมาชิก`);
    }
    
    if (features.pinnedPosts) {
      benefitsList.push(`ปักหมุดโพสต์ ${features.pinnedPosts} โพสต์ หน้าโปรไฟล์`);
    }
    
    if (features.blurPhotos) {
      benefitsList.push(`เบลอรูปภาพ ส่วนตัวได้ ${features.blurPhotos} รูป`);
    }
    
    if (features.chatRooms) {
      benefitsList.push(`สร้างห้องแชท ${features.chatRooms === 999 ? 'ไม่จำกัด' : features.chatRooms} คน`);
    }
    
    if (features.hideOnlineStatus) {
      benefitsList.push(`ตั้งค่าซ่อนสถานะออนไลน์ได้`);
    }
    
    if (features.transferCoins) {
      benefitsList.push(`โอนเหรียญได้`);
    }
    
    if (features.bonusCoins) {
      benefitsList.push(`รับเหรียญเพิ่มทันที ${features.bonusCoins.toLocaleString()} เหรียญ`);
    }
    
    return benefitsList;
  };

  const getMembershipColor = (type) => {
    switch (type) {
      case 'silver': return 'gray';
      case 'gold': return 'amber';
      case 'vip': return 'purple';
      case 'vip1': return 'pink';
      case 'vip2': return 'indigo';
      case 'diamond': return 'sky';
      case 'platinum': return 'cyan';
      default: return 'zinc';
    }
  };

  const createIconMapFromFeatures = (features) => {
    const iconMap = {};
    let index = 0;
    
    if (features.dailyChats) iconMap[index++] = MessageCircle;
    if (features.maxPhotos) iconMap[index++] = Image;
    if (features.maxVideos) iconMap[index++] = Video;
    if (features.spinWheelInterval) iconMap[index++] = Gift;
    if (features.dailyBonus) iconMap[index++] = Coins;
    if (features.votePoints) iconMap[index++] = Medal;
    if (features.profileVideos) iconMap[index++] = Video;
    if (features.verified) iconMap[index++] = SquareCheck;
    if (features.premiumFrame) iconMap[index++] = SquarePen;
    if (features.pinnedPosts) iconMap[index++] = SquarePen;
    if (features.blurPhotos) iconMap[index++] = EyeOff;
    if (features.chatRooms) iconMap[index++] = Users2;
    if (features.hideOnlineStatus) iconMap[index++] = EyeOff;
    if (features.transferCoins) iconMap[index++] = Wallet;
    if (features.bonusCoins) iconMap[index++] = Coins;
    
    return iconMap;
  };

  // แสดงขั้นตอนการสมัครสมาชิกตาม currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-bold text-amber-400 mb-2">เลือกแพคเกจสมาชิก</h1>
              <p className="text-zinc-400">เลือกแพคเกจที่เหมาะกับคุณเพื่อเพิ่มประสบการณ์การใช้งานที่ดีที่สุด</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {membershipPlans.map((plan) => {
                const planColorClass = getPlanColor(plan.color);
                
                return (
                  <Card 
                    key={plan.id}
                    className={`bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 hover:border-amber-500/30 transition-all ${plan.recommended ? 'ring-2 ring-amber-500' : ''}`}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <plan.icon className={planColorClass.split(' ')[0]} size={18} />
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                        </div>
                        {plan.recommended && (
                          <span className="px-2 py-1 bg-amber-800/50 text-amber-300 text-xs rounded-full">แนะนำ</span>
                        )}
                      </div>
                      <div className="mt-1">
                        <span className="text-xl font-bold text-white">฿{plan.price}</span>
                        {plan.period && <span className="text-sm text-zinc-400">/{plan.period}</span>}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-2">
                      <div className="space-y-2">
                        {plan.benefits.slice(0, 4).map((benefit, idx) => {
                          const IconComponent = plan.iconMap[idx] || Check;
                          return (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <IconComponent size={14} className={planColorClass.split(' ')[0]} />
                              <span className="text-zinc-300">{benefit}</span>
                            </div>
                          );
                        })}
                        {plan.benefits.length > 4 && (
                          <div className="text-xs text-amber-400">
                            + อีก {plan.benefits.length - 4} รายการ
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-2">
                      <Button 
                        className="w-full" 
                        variant={plan.type === "member" ? "outline" : "default"}
                      >
                        {plan.type === "member" ? "สมัครฟรี" : "เลือกแพคเกจนี้"}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-bold text-amber-400 mb-2">เลือกวิธีการชำระเงิน</h1>
              <p className="text-zinc-400">เลือกวิธีการชำระเงินที่สะดวกสำหรับคุณ</p>
            </div>
            
            <div className="flex items-center justify-between bg-gradient-to-r from-amber-900/20 to-black p-4 rounded-lg mb-6">
              <div className="flex items-center gap-3">
                <selectedPlan.icon size={24} className="text-amber-400" />
                <div>
                  <h3 className="font-bold text-amber-400">{selectedPlan.name}</h3>
                  <p className="text-sm text-zinc-400">{selectedPlan.period}</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">฿{selectedPlan.price}</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <div 
                  key={method.id}
                  className={`p-4 border rounded-lg flex items-center gap-4 cursor-pointer transition-all ${
                    selectedPaymentMethod?.id === method.id 
                      ? 'border-amber-500 bg-amber-900/20' 
                      : 'border-zinc-800 hover:border-amber-500/30'
                  }`}
                  onClick={() => setSelectedPaymentMethod(method)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedPaymentMethod?.id === method.id 
                      ? 'bg-amber-500 text-black' 
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    <method.icon size={20} />
                  </div>
                  <div>
                    <h3 className={selectedPaymentMethod?.id === method.id ? 'text-amber-400' : 'text-white'}>
                      {method.name}
                    </h3>
                  </div>
                  {selectedPaymentMethod?.id === method.id && (
                    <CheckCircle className="ml-auto text-amber-500" size={20} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ArrowLeft size={16} /> กลับ
              </Button>
              <Button 
                onClick={() => handleSelectPaymentMethod(selectedPaymentMethod)} 
                disabled={!selectedPaymentMethod}
                className="gap-2"
              >
                ดำเนินการต่อ <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-bold text-amber-400 mb-2">ยืนยันการสมัครสมาชิก</h1>
              <p className="text-zinc-400">ตรวจสอบรายละเอียดและยืนยันการสมัครสมาชิก</p>
            </div>
            
            {successMessage ? (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center">
                <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">การสมัครสมาชิกสำเร็จ!</h3>
                <p className="text-zinc-300 mb-4">{successMessage}</p>
                <p className="text-zinc-400 text-sm">กำลังกลับไปหน้าหลัก...</p>
              </div>
            ) : (
              <>
                <Card className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-amber-400">รายละเอียดการสมัคร</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">แพคเกจ</span>
                      <span className="font-medium text-white">{selectedPlan?.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">ระยะเวลา</span>
                      <span className="font-medium text-white">{selectedPlan?.period || "ไม่มีกำหนด"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">ราคา</span>
                      <span className="font-medium text-white">฿{selectedPlan?.price}</span>
                    </div>
                    {selectedPlan?.price > 0 && (
                      <div className="flex justify-between py-2 border-b border-zinc-800">
                        <span className="text-zinc-400">วิธีการชำระเงิน</span>
                        <span className="font-medium text-white">{selectedPaymentMethod?.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 font-bold">
                      <span className="text-zinc-300">ยอดรวม</span>
                      <span className="text-amber-400">฿{selectedPlan?.price}</span>
                    </div>
                  </CardContent>
                </Card>
                
                {errorMessage && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400">
                    {errorMessage}
                  </div>
                )}
                
                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={handleBack} className="gap-2">
                    <ArrowLeft size={16} /> กลับ
                  </Button>
                  <Button 
                    onClick={handleConfirmSubscription} 
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> 
                        กำลังดำเนินการ...
                      </>
                    ) : (
                      'ยืนยันการสมัครสมาชิก'
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-8">
          <ArrowLeft size={18} /> กลับหน้าหลัก
        </Link>
        
        {/* แสดงขั้นตอนการสมัครสมาชิก */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-amber-500' : 'bg-zinc-800'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-amber-500' : 'bg-zinc-800'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 3 ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
            }`}>
              3
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="w-10 text-center text-xs text-zinc-400">เลือกแพคเกจ</div>
            <div className="w-16"></div>
            <div className="w-10 text-center text-xs text-zinc-400">ชำระเงิน</div>
            <div className="w-16"></div>
            <div className="w-10 text-center text-xs text-zinc-400">ยืนยัน</div>
          </div>
        </div>
        
        {/* เนื้อหาตามขั้นตอน */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default MembershipSignup;
