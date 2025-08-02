import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft, User, Phone } from "lucide-react";
import { FaGoogle, FaFacebook, FaLine } from "react-icons/fa6";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
      return;
    }
    console.log("Registration attempt:", formData);
    // Add registration logic here
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
          <h2 className="text-3xl font-serif font-bold text-amber-400">สมัครสมาชิก</h2>
          <p className="mt-2 text-sm text-zinc-400">
            สร้างบัญชีเพื่อเริ่มต้นการค้นหาคู่ที่พิเศษ
          </p>
        </div>

        <div className="bg-gradient-to-b from-zinc-900 to-black border border-amber-500/30 rounded-xl p-8 shadow-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-zinc-300">
                ชื่อ-นามสกุล
              </Label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={18}
                />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="ชื่อจริง นามสกุล"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                อีเมล
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={18}
                />
                <Input
                  id="email"
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
              <Label htmlFor="password" className="text-zinc-300">
                รหัสผ่าน
              </Label>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300">
                ยืนยันรหัสผ่าน
              </Label>
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

            <div className="flex items-center">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                required
              />
              <label
                htmlFor="agreeTerms"
                className="ml-2 block text-xs text-zinc-400"
              >
                ฉันยอมรับ{" "}
                <a href="#" className="text-amber-400 hover:underline">
                  เงื่อนไขการใช้งาน
                </a>{" "}
                และ{" "}
                <a href="#" className="text-amber-400 hover:underline">
                  นโยบายความเป็นส่วนตัว
                </a>
              </label>
            </div>

            <Button type="submit" className="w-full" variant="premium">
              <UserPlus size={18} className="mr-2" /> สมัครสมาชิก
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="space-y-4">
            <p className="text-center text-sm text-zinc-400">หรือสมัครสมาชิกด้วย</p>

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
            มีบัญชีอยู่แล้ว?{" "}
            <Link to="/login" className="text-amber-400 hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
