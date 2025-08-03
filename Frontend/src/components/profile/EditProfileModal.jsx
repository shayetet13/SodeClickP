import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { X, Plus, Minus } from 'lucide-react';

export const EditProfileModal = ({ profile, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    age: profile?.age || '',
    location: profile?.location || '',
    address: profile?.address || '', // เพิ่ม address
    bio: profile?.bio || '',
    occupation: profile?.occupation || '',
    education: profile?.education || '',
    interests: [...(profile?.interests || [])],
    lookingFor: [...(profile?.lookingFor || [])],
    personalDetails: { 
      height: profile?.personalDetails?.height || '',
      bodyType: profile?.personalDetails?.bodyType || '',
      exercise: profile?.personalDetails?.exercise || '',
      drinking: profile?.personalDetails?.drinking || '',
      smoking: profile?.personalDetails?.smoking || '',
      children: profile?.personalDetails?.children || '',
      languages: [...(profile?.personalDetails?.languages || [])],
      ...(profile?.personalDetails || {})
    },
    lifeStyle: { 
      pets: profile?.lifeStyle?.pets || '',
      diet: profile?.lifeStyle?.diet || '',
      religion: profile?.lifeStyle?.religion || '',
      zodiac: profile?.lifeStyle?.zodiac || '',
      mbti: profile?.lifeStyle?.mbti || '',
      ...(profile?.lifeStyle || {})
    },
    relationshipPreferences: { 
      relationshipType: profile?.relationshipPreferences?.relationshipType || '',
      ageRange: {
        min: profile?.relationshipPreferences?.ageRange?.min || '',
        max: profile?.relationshipPreferences?.ageRange?.max || ''
      },
      location: profile?.relationshipPreferences?.location || '',
      dealBreakers: [...(profile?.relationshipPreferences?.dealBreakers || [])],
      ...(profile?.relationshipPreferences || {})
    }
  });
  
  const [newInterest, setNewInterest] = useState('');
  const [newLookingFor, setNewLookingFor] = useState('');
  const [newDealBreaker, setNewDealBreaker] = useState('');
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleNestedInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };
  
  const handleAgeRangeChange = (minOrMax, value) => {
    setFormData((prev) => ({
      ...prev,
      relationshipPreferences: {
        ...prev.relationshipPreferences,
        ageRange: {
          ...prev.relationshipPreferences.ageRange,
          [minOrMax]: parseInt(value) || 0,
        },
      },
    }));
  };
  
  // Interest handlers
  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest('');
    }
  };
  
  const removeInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };
  
  // Looking For handlers
  const addLookingFor = () => {
    if (newLookingFor.trim() && !formData.lookingFor.includes(newLookingFor.trim())) {
      setFormData((prev) => ({
        ...prev,
        lookingFor: [...prev.lookingFor, newLookingFor.trim()],
      }));
      setNewLookingFor('');
    }
  };
  
  const removeLookingFor = (item) => {
    setFormData((prev) => ({
      ...prev,
      lookingFor: prev.lookingFor.filter((i) => i !== item),
    }));
  };
  
  // Deal Breaker handlers
  const addDealBreaker = () => {
    if (newDealBreaker.trim() && !(formData.relationshipPreferences.dealBreakers || []).includes(newDealBreaker.trim())) {
      setFormData((prev) => ({
        ...prev,
        relationshipPreferences: {
          ...prev.relationshipPreferences,
          dealBreakers: [...(prev.relationshipPreferences.dealBreakers || []), newDealBreaker.trim()],
        },
      }));
      setNewDealBreaker('');
    }
  };
  
  const removeDealBreaker = (item) => {
    setFormData((prev) => ({
      ...prev,
      relationshipPreferences: {
        ...prev.relationshipPreferences,
        dealBreakers: (prev.relationshipPreferences.dealBreakers || []).filter((i) => i !== item),
      },
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-zinc-900 to-black border border-amber-500/30 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-400 font-serif">แก้ไขโปรไฟล์</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic">
            <TabsList className="mb-6">
              <TabsTrigger value="basic">ข้อมูลพื้นฐาน</TabsTrigger>
              <TabsTrigger value="personal">รายละเอียดส่วนตัว</TabsTrigger>
              <TabsTrigger value="preferences">ความต้องการ</TabsTrigger>
              <TabsTrigger value="lifestyle">ไลฟ์สไตล์</TabsTrigger>
            </TabsList>
            
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-zinc-300">ชื่อ</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-zinc-300">นามสกุล</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-zinc-300">อายุ</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-zinc-300">สถานที่</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="occupation" className="text-zinc-300">อาชีพ</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="text-zinc-300">ที่อยู่</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="education" className="text-zinc-300">การศึกษา</Label>
                <Input
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-zinc-300">เกี่ยวกับคุณ</Label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-white resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="เล่าเกี่ยวกับตัวคุณสักเล็กน้อย..."
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-zinc-300">ความสนใจ</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.interests.map((interest, index) => (
                    <div
                      key={index}
                      className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="text-amber-400 hover:text-amber-300 ml-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white flex-1"
                    placeholder="เพิ่มความสนใจ..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addInterest();
                      }
                    }}
                  />
                  <Button type="button" onClick={addInterest} variant="outline">
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Personal Details Tab */}
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-zinc-300">ส่วนสูง (ซม.)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="140"
                    max="220"
                    value={formData.personalDetails.height || ''}
                    onChange={(e) => handleNestedInputChange('personalDetails', 'height', parseInt(e.target.value) || '')}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bodyType" className="text-zinc-300">รูปร่าง</Label>
                  <select
                    id="bodyType"
                    value={formData.personalDetails.bodyType || ''}
                    onChange={(e) => handleNestedInputChange('personalDetails', 'bodyType', e.target.value)}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">เลือกรูปร่าง</option>
                    <option value="ผอม">ผอม</option>
                    <option value="สมส่วน">สมส่วน</option>
                    <option value="แข็งแรง">แข็งแรง</option>
                    <option value="ท้วม">ท้วม</option>
                    <option value="สูงใหญ่">สูงใหญ่</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exercise" className="text-zinc-300">การออกกำลังกาย</Label>
                  <select
                    id="exercise"
                    value={formData.personalDetails.exercise || ''}
                    onChange={(e) => handleNestedInputChange('personalDetails', 'exercise', e.target.value)}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">เลือกความถี่</option>
                    <option value="ไม่ออกกำลังกาย">ไม่ออกกำลังกาย</option>
                    <option value="นาน ๆ ครั้ง">นาน ๆ ครั้ง</option>
                    <option value="ออกกำลังกาย 1-2 ครั้ง/สัปดาห์">ออกกำลังกาย 1-2 ครั้ง/สัปดาห์</option>
                    <option value="ออกกำลังกาย 3-4 ครั้ง/สัปดาห์">ออกกำลังกาย 3-4 ครั้ง/สัปดาห์</option>
                    <option value="ออกกำลังกายเป็นประจำทุกวัน">ออกกำลังกายเป็นประจำทุกวัน</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="drinking" className="text-zinc-300">การดื่มแอลกอฮอล์</Label>
                  <select
                    id="drinking"
                    value={formData.personalDetails.drinking || ''}
                    onChange={(e) => handleNestedInputChange('personalDetails', 'drinking', e.target.value)}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">เลือก</option>
                    <option value="ไม่ดื่ม">ไม่ดื่ม</option>
                    <option value="ดื่มเป็นครั้งคราว">ดื่มเป็นครั้งคราว</option>
                    <option value="ดื่มบ่อย">ดื่มบ่อย</option>
                    <option value="ดื่มเป็นประจำ">ดื่มเป็นประจำ</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smoking" className="text-zinc-300">การสูบบุหรี่</Label>
                  <select
                    id="smoking"
                    value={formData.personalDetails.smoking || ''}
                    onChange={(e) => handleNestedInputChange('personalDetails', 'smoking', e.target.value)}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">เลือก</option>
                    <option value="ไม่สูบบุหรี่">ไม่สูบบุหรี่</option>
                    <option value="สูบเป็นครั้งคราว">สูบเป็นครั้งคราว</option>
                    <option value="สูบเป็นประจำ">สูบเป็นประจำ</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="children" className="text-zinc-300">บุตร</Label>
                  <select
                    id="children"
                    value={formData.personalDetails.children || ''}
                    onChange={(e) => handleNestedInputChange('personalDetails', 'children', e.target.value)}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">เลือก</option>
                    <option value="ไม่มี">ไม่มี</option>
                    <option value="ไม่มี แต่ต้องการมีในอนาคต">ไม่มี แต่ต้องการมีในอนาคต</option>
                    <option value="ไม่มี และไม่ต้องการมี">ไม่มี และไม่ต้องการมี</option>
                    <option value="มี และไม่ต้องการมีเพิ่ม">มี และไม่ต้องการมีเพิ่ม</option>
                    <option value="มี และต้องการมีเพิ่ม">มี และต้องการมีเพิ่ม</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-zinc-300">ภาษาที่ใช้</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['ไทย', 'อังกฤษ', 'จีน', 'ญี่ปุ่น', 'เกาหลี', 'ฝรั่งเศส', 'เยอรมัน', 'สเปน'].map((language) => (
                    <div key={language} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`lang-${language}`}
                        checked={(formData.personalDetails.languages || []).includes(language)}
                        onChange={(e) => {
                          const currentLangs = formData.personalDetails.languages || [];
                          const newLangs = e.target.checked
                            ? [...currentLangs, language]
                            : currentLangs.filter((l) => l !== language);
                          handleNestedInputChange('personalDetails', 'languages', newLangs);
                        }}
                        className="rounded bg-zinc-800 border-amber-500 text-amber-500 focus:ring-amber-500"
                      />
                      <label htmlFor={`lang-${language}`} className="text-zinc-300 text-sm">
                        {language}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="relationshipType" className="text-zinc-300">ประเภทความสัมพันธ์ที่ต้องการ</Label>
                <select
                  id="relationshipType"
                  value={formData.relationshipPreferences.relationshipType || ''}
                  onChange={(e) => handleNestedInputChange('relationshipPreferences', 'relationshipType', e.target.value)}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">เลือก</option>
                  <option value="ความสัมพันธ์ระยะยาว">ความสัมพันธ์ระยะยาว</option>
                  <option value="ความสัมพันธ์แบบไม่จริงจัง">ความสัมพันธ์แบบไม่จริงจัง</option>
                  <option value="หาเพื่อน">หาเพื่อน</option>
                  <option value="ยังไม่แน่ใจ">ยังไม่แน่ใจ</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAge" className="text-zinc-300">อายุต่ำสุดที่สนใจ</Label>
                  <Input
                    id="minAge"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.relationshipPreferences.ageRange?.min || ''}
                    onChange={(e) => handleAgeRangeChange('min', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxAge" className="text-zinc-300">อายุสูงสุดที่สนใจ</Label>
                  <Input
                    id="maxAge"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.relationshipPreferences.ageRange?.max || ''}
                    onChange={(e) => handleAgeRangeChange('max', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prefLocation" className="text-zinc-300">สถานที่ที่สนใจ</Label>
                <Input
                  id="prefLocation"
                  value={formData.relationshipPreferences.location || ''}
                  onChange={(e) => handleNestedInputChange('relationshipPreferences', 'location', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="เช่น กรุงเทพฯ และปริมณฑล, เชียงใหม่, ..."
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-zinc-300">สิ่งที่คุณกำลังมองหา</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.lookingFor.map((item, index) => (
                    <div
                      key={index}
                      className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeLookingFor(item)}
                        className="text-amber-400 hover:text-amber-300 ml-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newLookingFor}
                    onChange={(e) => setNewLookingFor(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white flex-1"
                    placeholder="เพิ่มสิ่งที่คุณกำลังมองหา..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addLookingFor();
                      }
                    }}
                  />
                  <Button type="button" onClick={addLookingFor} variant="outline">
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-zinc-300">สิ่งที่คุณไม่ชอบ</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.relationshipPreferences.dealBreakers || []).map((item, index) => (
                    <div
                      key={index}
                      className="bg-red-900/20 text-red-400 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeDealBreaker(item)}
                        className="text-red-400 hover:text-red-300 ml-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newDealBreaker}
                    onChange={(e) => setNewDealBreaker(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white flex-1"
                    placeholder="เพิ่มสิ่งที่คุณไม่ชอบ..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDealBreaker();
                      }
                    }}
                  />
                  <Button type="button" onClick={addDealBreaker} variant="outline">
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Lifestyle Tab */}
            <TabsContent value="lifestyle" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pets" className="text-zinc-300">สัตว์เลี้ยง</Label>
                  <Input
                    id="pets"
                    value={formData.lifeStyle.pets || ''}
                    onChange={(e) => handleNestedInputChange('lifeStyle', 'pets', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="เช่น แมว 1 ตัว, สุนัข 2 ตัว, ..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="diet" className="text-zinc-300">อาหาร</Label>
                  <select
                    id="diet"
                    value={formData.lifeStyle.diet || ''}
                    onChange={(e) => handleNestedInputChange('lifeStyle', 'diet', e.target.value)}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">เลือก</option>
                    <option value="ทานได้ทุกอย่าง">ทานได้ทุกอย่าง</option>
                    <option value="มังสวิรัติ">มังสวิรัติ</option>
                    <option value="เจ">เจ</option>
                    <option value="วีแกน">วีแกน</option>
                    <option value="ทานเนื้อแต่ไม่ทานหมู">ทานเนื้อแต่ไม่ทานหมู</option>
                    <option value="ไม่ทานเนื้อวัว">ไม่ทานเนื้อวัว</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="religion" className="text-zinc-300">ศาสนา</Label>
                  <select
                    id="religion"
                    value={formData.lifeStyle.religion || ''}
                    onChange={(e) => handleNestedInputChange('lifeStyle', 'religion', e.target.value)}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">เลือก</option>
                    <option value="พุทธ">พุทธ</option>
                    <option value="คริสต์">คริสต์</option>
                    <option value="อิสลาม">อิสลาม</option>
                    <option value="ฮินดู">ฮินดู</option>
                    <option value="ไม่นับถือศาสนา">ไม่นับถือศาสนา</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zodiac" className="text-zinc-300">ราศี</Label>
                  <select
                    id="zodiac"
                    value={formData.lifeStyle.zodiac || ''}
                    onChange={(e) => handleNestedInputChange('lifeStyle', 'zodiac', e.target.value)}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">เลือก</option>
                    <option value="ราศีเมษ">ราศีเมษ</option>
                    <option value="ราศีพฤษภ">ราศีพฤษภ</option>
                    <option value="ราศีเมถุน">ราศีเมถุน</option>
                    <option value="ราศีกรกฎ">ราศีกรกฎ</option>
                    <option value="ราศีสิงห์">ราศีสิงห์</option>
                    <option value="ราศีกันย์">ราศีกันย์</option>
                    <option value="ราศีตุล">ราศีตุล</option>
                    <option value="ราศีพิจิก">ราศีพิจิก</option>
                    <option value="ราศีธนู">ราศีธนู</option>
                    <option value="ราศีมังกร">ราศีมังกร</option>
                    <option value="ราศีกุมภ์">ราศีกุมภ์</option>
                    <option value="ราศีมีน">ราศีมีน</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mbti" className="text-zinc-300">MBTI</Label>
                  <select
                    id="mbti"
                    value={formData.lifeStyle.mbti || ''}
                    onChange={(e) => handleNestedInputChange('lifeStyle', 'mbti', e.target.value)}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">เลือก</option>
                    <option value="INTJ">INTJ</option>
                    <option value="INTP">INTP</option>
                    <option value="ENTJ">ENTJ</option>
                    <option value="ENTP">ENTP</option>
                    <option value="INFJ">INFJ</option>
                    <option value="INFP">INFP</option>
                    <option value="ENFJ">ENFJ</option>
                    <option value="ENFP">ENFP</option>
                    <option value="ISTJ">ISTJ</option>
                    <option value="ISFJ">ISFJ</option>
                    <option value="ESTJ">ESTJ</option>
                    <option value="ESFJ">ESFJ</option>
                    <option value="ISTP">ISTP</option>
                    <option value="ISFP">ISFP</option>
                    <option value="ESTP">ESTP</option>
                    <option value="ESFP">ESFP</option>
                  </select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="default">
              บันทึกการเปลี่ยนแปลง
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
