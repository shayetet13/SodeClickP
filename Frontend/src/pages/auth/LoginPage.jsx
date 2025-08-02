import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, Phone } from "lucide-react";
import { FaGoogle, FaFacebook, FaLine } from "react-icons/fa6";
import { API_BASE_URL } from "../../utils/constants";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",  // เปลี่ยนจาก email เป็น identifier เพื่อรองรับทั้ง email และ username
    password: "",
    rememberMe: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("clicked");

    console.log("before fetch");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
      console.log("after fetch", res);
      const data = await res.json();
      console.log("data", data);
      
      if (res.ok) {
        console.log('Login successful:', data);
        // เก็บข้อมูล user และ token ใน localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to home page
        window.location.href = '/';
      } else {
        console.error('Login failed:', data.message);
        alert(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (err) {
      console.error("fetch error", err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6"
          >
            <ArrowLeft size={18} />
            <span>กลับหน้าหลัก</span>
          </Link>
          <h2 className="text-3xl font-serif font-bold text-amber-400">เข้าสู่ระบบ</h2>
          <p className="mt-2 text-sm text-zinc-400">
            เข้าสู่ระบบเพื่อค้นหาคู่ที่ใช่สำหรับคุณ
          </p>
        </div>

        <div className="bg-gradient-to-b from-zinc-900 to-black border border-amber-500/30 rounded-xl p-8 shadow-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-zinc-300">
                อีเมลหรือชื่อผู้ใช้
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={18}
                />
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
                <Label htmlFor="password" className="text-zinc-300">
                  รหัสผ่าน
                </Label>
                <a href="#" className="text-xs text-amber-400 hover:underline">
                  ลืมรหัสผ่าน?
                </a>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={18}
                />
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

            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500"
                checked={formData.rememberMe}
                onChange={handleInputChange}
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-zinc-400"
              >
                จดจำฉันในระบบ
              </label>
            </div>

            <Button type="submit" className="w-full" variant="premium">
              <LogIn size={18} className="mr-2" /> เข้าสู่ระบบ
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="space-y-4">
            <p className="text-center text-sm text-zinc-400">หรือเข้าสู่ระบบด้วย</p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white"
              >
                <FaGoogle className="mr-2 text-red-500" /> กูเกิล
              </Button>
              <Button
                variant="outline"
                className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white"
              >
                <FaFacebook className="mr-2 text-blue-500" /> เฟซบุ๊ก
              </Button>
              <Button
                variant="outline"
                className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white"
              >
                <FaLine className="mr-2 text-green-500" /> ไลน์
              </Button>
              <Button
                variant="outline"
                className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white"
              >
                <Phone className="mr-2 text-blue-400" size={16} /> เบอร์โทร
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-zinc-400">
            ยังไม่มีบัญชี?{" "}
            <Link to="/register" className="text-amber-400 hover:underline">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
