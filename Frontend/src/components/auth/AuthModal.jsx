import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { X, Mail, Lock, Eye, EyeOff, UserPlus, LogIn, Phone } from "lucide-react";
import { FaGoogle, FaFacebook, FaLine } from "react-icons/fa6";
import { useNotification } from '../ui/notification';
import { API_BASE_URL } from '../../utils/constants';

export function AuthModal({ isOpen, onClose, initialView = "login", onViewChange }) {
  const [view, setView] = useState(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",  // เปลี่ยนจาก email เป็น identifier สำหรับหน้า login
    email: "",       // ยังคงใช้ email สำหรับหน้าสมัครสมาชิก
    password: "",
    confirmPassword: "",
    fullName: "",
    agreeTerms: false
  });

  const { showSuccess, showError } = useNotification();

  // Update view when initialView changes
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Switch between login and signup views
  const toggleView = () => {
    setView(view === "login" ? "signup" : "login");
  };

  // Handle form submission - แก้ไขให้ใช้ Notification
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (view === "login") {
      try {
        console.log('Attempting login with:', formData.identifier);
        
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            identifier: formData.identifier,
            password: formData.password
          }),
          credentials: 'include'
        });
        
        const data = await response.json();
        console.log('Login response:', data);
        
        if (response.ok) {
          console.log('Login successful:', data);
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          showSuccess(`ยินดีต้อนรับกลับ, ${data.user.username}!`, 'เข้าสู่ระบบสำเร็จ');
          
          onClose();
          
          // Check if there's a redirect URL stored
          const redirectUrl = localStorage.getItem('redirectAfterLogin');
          if (redirectUrl) {
            localStorage.removeItem('redirectAfterLogin');
            setTimeout(() => {
              window.location.href = redirectUrl;
            }, 100);
          } else {
            window.location.reload();
          }
        } else {
          console.error('Login failed:', data.message);
          showError(data.message || 'เข้าสู่ระบบไม่สำเร็จ', 'ข้อผิดพลาดการเข้าสู่ระบบ');
        }
      } catch (error) {
        console.error('Login error:', error);
        showError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์', 'ข้อผิดพลาดการเชื่อมต่อ');
      }
    } else {
      // สมัครสมาชิก
      if (formData.password !== formData.confirmPassword) {
        showError('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง', 'ข้อมูลไม่ถูกต้อง');
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: formData.fullName.split(' ')[0],
            email: formData.email,
            password: formData.password,
            firstName: formData.fullName.split(' ')[0],
            lastName: formData.fullName.split(' ').slice(1).join(' ')
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log('Registration successful:', data);
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          showSuccess(`ยินดีต้อนรับ, ${data.user.username}! บัญชีของคุณถูกสร้างเรียบร้อยแล้ว`, 'สมัครสมาชิกสำเร็จ');
          
          onClose();
          window.location.reload();
        } else {
          console.error('Registration failed:', data.message);
          showError(data.message || 'สมัครสมาชิกไม่สำเร็จ', 'ข้อผิดพลาดการสมัครสมาชิก');
        }
      } catch (error) {
        console.error('Registration error:', error);
        showError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์', 'ข้อผิดพลาดการเชื่อมต่อ');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-zinc-900 to-black border border-amber-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-amber-400 text-center">
            {view === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            {view === "login" 
              ? "เข้าสู่ระบบเพื่อค้นหาคู่ที่ใช่สำหรับคุณ" 
              : "สร้างบัญชีเพื่อเริ่มต้นการค้นหาคู่ที่พิเศษ"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Login Form Fields */}
          {view === "login" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-zinc-300">อีเมลหรือชื่อผู้ใช้</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <Input 
                    id="identifier" 
                    name="identifier" 
                    type="text" 
                    placeholder="อีเมลหรือชื่อผู้ใช้" 
                    value={formData.identifier}
                    onChange={handleInputChange}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-zinc-300">รหัสผ่าน</Label>
                  <a href="#" className="text-xs text-amber-400 hover:underline">ลืมรหัสผ่าน?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" variant="premium">
                <LogIn size={18} className="mr-2" /> เข้าสู่ระบบ
              </Button>
            </div>
          )}

          {/* Signup Form Fields */}
          {view === "signup" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-zinc-300">ชื่อ-นามสกุล</Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  type="text" 
                  placeholder="ชื่อจริง นามสกุล" 
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-zinc-300">อีเมล</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <Input 
                    id="signup-email" 
                    name="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-zinc-300">รหัสผ่าน</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <Input 
                    id="signup-password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-zinc-300">ยืนยันรหัสผ่าน</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="rounded bg-zinc-800 border-amber-500 text-amber-500 focus:ring-amber-500"
                  required
                />
                <label htmlFor="agreeTerms" className="text-xs text-zinc-400">
                  ฉันยอมรับ <a href="#" className="text-amber-400 hover:underline">เงื่อนไขการใช้งาน</a> และ <a href="#" className="text-amber-400 hover:underline">นโยบายความเป็นส่วนตัว</a>
                </label>
              </div>

              <Button type="submit" className="w-full" variant="premium">
                <UserPlus size={18} className="mr-2" /> สมัครสมาชิก
              </Button>
            </div>
          )}
        </form>

        <Separator className="my-4" />

        {/* Social Login Options */}
        <div className="space-y-4">
          <p className="text-center text-sm text-zinc-400">หรือเข้าสู่ระบบด้วย</p>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white">
              <FaGoogle className="mr-2 text-red-500" /> กูเกิล
            </Button>
            <Button variant="outline" className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white">
              <FaFacebook className="mr-2 text-blue-500" /> เฟซบุ๊ก
            </Button>
            <Button variant="outline" className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white">
              <FaLine className="mr-2 text-green-500" /> ไลน์
            </Button>
            <Button variant="outline" className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white">
              <Phone className="mr-2 text-blue-400" size={16} /> เบอร์โทร
            </Button>
          </div>
        </div>

        <DialogFooter className="flex flex-col items-center">
          <p className="text-sm text-zinc-400">
            {view === "login" ? "ยังไม่มีบัญชี?" : "มีบัญชีอยู่แล้ว?"}
            <button 
              type="button" 
              className="ml-1 text-amber-400 hover:underline"
              onClick={toggleView}
            >
              {view === "login" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
            </button>
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
