import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Edit, 
  MapPin, 
  Calendar, 
  Heart, 
  MessageCircle, 
  Gift, 
  Wine, 
  Music, 
  Coffee, 
  Utensils, 
  Film, 
  Briefcase, 
  GraduationCap, 
  Users, 
  Home, 
  Check, 
  Shield, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Camera,
  Image,
  Crown,
  Lock,
  BadgeCheck,
  X,
  Plus,
  Search // เพิ่ม Search icon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { useNotification } from '../../components/ui/notification';

const UserProfile = () => {
  const { username } = useParams();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [fetchingImages, setFetchingImages] = useState(true);
  const [likeStatus, setLikeStatus] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const fileInputRef = useRef(null);
  
  // เพิ่ม state สำหรับ form editing
  const [editFormData, setEditFormData] = useState({});
  
  // String states สำหรับ array fields เพื่อป้องกันปัญหาเว้นวรรค
  const [interestsString, setInterestsString] = useState('');
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Check if viewing own profile
        if (!username && isAuthenticated) {
          setIsOwner(true);
          
          // เรียก API เพื่อดึงข้อมูล profile ล่าสุด
          try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/profile', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              setProfile(data.data);
              fetchUserPhotos(data.data._id || data.data.id);
            } else {
              // ถ้า API ไม่ทำงาน ใช้ข้อมูลจาก user context
              setProfile(user);
              fetchUserPhotos(user.id);
            }
          } catch (apiError) {
            console.log('API error, using context user:', apiError);
            setProfile(user);
            fetchUserPhotos(user.id);
          }
          
          setLoading(false);
          return;
        }
        
        // If username provided, fetch that user's profile
        if (username) {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/profile/${username}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              setProfile(data.data);
              setIsOwner(isAuthenticated && user?.username === username);
              fetchUserPhotos(data.data._id || data.data.id);
            } else {
              setError('ไม่พบข้อมูลผู้ใช้');
            }
          } catch (err) {
            console.error('Error fetching profile:', err);
            setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [username, user, isAuthenticated]);
  
  // Initialize editFormData when profile is loaded
  useEffect(() => {
    if (profile && isOwner) {
      setEditFormData({
        // Basic Information
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        nickname: profile.nickname || '',
        phone: profile.phone || '',
        age: profile.age || '',
        bio: profile.bio || '',
        location: profile.location || '',
        occupation: profile.occupation || '',
        education: profile.education || '',
        selfDescription: profile.selfDescription || '',
        
        // Interests
        interests: profile.interests || [],
        lookingFor: profile.lookingFor || [],
        
        // Personal Details
        personalDetails: {
          height: profile.personalDetails?.height || '',
          weight: profile.personalDetails?.weight || '',
          bodyType: profile.personalDetails?.bodyType || '',
          exercise: profile.personalDetails?.exercise || '',
          drinking: profile.personalDetails?.drinking || '',
          smoking: profile.personalDetails?.smoking || '',
          children: profile.personalDetails?.children || '',
          languages: profile.personalDetails?.languages || []
        },
        
        // Lifestyle
        lifeStyle: {
          pets: profile.lifeStyle?.pets || '',
          diet: profile.lifeStyle?.diet || '',
          religion: profile.lifeStyle?.religion || '',
          zodiac: profile.lifeStyle?.zodiac || '',
          mbti: profile.lifeStyle?.mbti || '',
          workLifeBalance: profile.lifeStyle?.workLifeBalance || ''
        },
        
        // Relationship Preferences
        relationshipPreferences: {
          relationshipType: profile.relationshipPreferences?.relationshipType || '',
          location: profile.relationshipPreferences?.location || '',
          ageRange: {
            min: profile.relationshipPreferences?.ageRange?.min || '',
            max: profile.relationshipPreferences?.ageRange?.max || ''
          },
          dealBreakers: profile.relationshipPreferences?.dealBreakers || []
        }
      });
    }
  }, [profile, isOwner]);
  
  // เมื่อ profile เปลี่ยนแปลง ให้อัพเดต editFormData ด้วย
  useEffect(() => {
    if (profile) {
      console.log('Profile updated, updating editFormData');
      setEditFormData({
        ...profile,
        // เพิ่มการจัดการ string สำหรับ input fields ที่เป็น array
        petsString: profile.pets?.join(', ') || '',
        foodStyleString: profile.foodStyle?.join(', ') || '',
        favoriteMoviesString: profile.favoriteMovies?.join(', ') || '',
        favoriteMusicString: profile.favoriteMusic?.join(', ') || '',
        lookingForString: profile.lookingFor?.join(', ') || '',
      });
      
      // Set string states แยกต่างหาก
      setInterestsString(profile.interests?.join(', ') || '');
    }
  }, [profile]);
  
  // Handle form input changes with support for nested objects
  const handleFormChange = (field, value) => {
    setEditFormData(prev => {
      // ถ้าฟิลด์มีจุดคั่น (เช่น 'personalDetails.height')
      if (field.includes('.')) {
        const keys = field.split('.');
        let newData = { ...prev };
        
        // เข้าถึงฟิลด์แบบเนสต์ด้วยการวนลูปผ่านทุกคีย์
        if (keys.length === 2) {
          const [parent, child] = keys;
          return {
            ...prev,
            [parent]: {
              ...(prev[parent] || {}),
              [child]: value
            }
          };
        } else if (keys.length === 3) {
          const [parent, middle, child] = keys;
          return {
            ...prev,
            [parent]: {
              ...(prev[parent] || {}),
              [middle]: {
                ...(prev[parent]?.[middle] || {}),
                [child]: value
              }
            }
          };
        }
        return newData;
      }
      
      // จัดการฟิลด์พิเศษตามชื่อของพวกมัน
      if (field === 'height' || field === 'bodyType' || 
          field === 'exercise' || field === 'children' || field === 'languages') {
        return {
          ...prev,
          personalDetails: {
            ...(prev.personalDetails || {}),
            [field]: value
          }
        };
      } else if (field === 'religion' || 
                field === 'zodiac' || field === 'mbti' || field === 'workLifeBalance') {
        return {
          ...prev,
          lifeStyle: {
            ...(prev.lifeStyle || {}),
            [field]: value
          }
        };
      } else if (field === 'relationshipType' || field === 'dealBreakers') {
        return {
          ...prev,
          relationshipPreferences: {
            ...(prev.relationshipPreferences || {}),
            [field]: value
          }
        };
      } else if (field === 'minAge') {
        return {
          ...prev,
          relationshipPreferences: {
            ...(prev.relationshipPreferences || {}),
            ageRange: {
              ...(prev.relationshipPreferences?.ageRange || {}),
              min: value
            }
          }
        };
      } else if (field === 'maxAge') {
        return {
          ...prev,
          relationshipPreferences: {
            ...(prev.relationshipPreferences || {}),
            ageRange: {
              ...(prev.relationshipPreferences?.ageRange || {}),
              max: value
            }
          }
        };
      } else if (field === 'personality' || field === 'commonInterests') {
        return {
          ...prev,
          idealMatch: {
            ...(prev.idealMatch || {}),
            [field]: value
          }
        };
      }
      
      // กรณีปกติสำหรับฟิลด์ทั่วไป
      return {
        ...prev,
        [field]: field === 'age' || field === 'weight' ? (value ? Number(value) : value) : value
      };
    });
    
    // ล็อกเพื่อดูการเปลี่ยนแปลง
    console.log(`Field ${field} changed to:`, value);
  };
  
  // Fetch user's photos
  const fetchUserPhotos = async (userId) => {
    try {
      setFetchingImages(true);
      console.log('🔍 Fetching photos for user:', userId);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profile/photos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📷 Photo fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📷 Photo fetch response data:', data);
        if (data.success && Array.isArray(data.data)) {
          console.log('📸 Setting photos:', data.data.length, 'photos');
          setPhotos(data.data);
        } else {
          console.log('📷 No photos found or invalid data format');
          setPhotos([]);
        }
      } else {
        console.error('Error fetching photos:', response.statusText);
        setPhotos([]);
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
      showError('ไม่สามารถโหลดรูปภาพได้', 'ข้อผิดพลาด');
    } finally {
      setFetchingImages(false);
    }
  };
  
  const handlePhotoDelete = async (photoId, filename) => {
    try {
      console.log('🗑️ Deleting photo with ID:', photoId, 'filename:', filename);
      
      // เรียก API ลบไฟล์จาก server
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profile/photos/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('ไม่สามารถลบรูปภาพได้');
      }
      
      // ลบจาก state หลังจากลบจาก server สำเร็จ
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      showSuccess('ลบรูปภาพเรียบร้อยแล้ว');
      
    } catch (err) {
      console.error('Error deleting photo:', err);
      showError(err.message || 'ไม่สามารถลบรูปภาพได้', 'ข้อผิดพลาด');
    }
  };
  
  const handleSetProfilePhoto = async (photoId, filename) => {
    try {
      console.log('⭐ Setting profile photo with ID:', photoId, 'filename:', filename);
      
      // เรียก API เพื่อตั้งเป็นรูปโปรไฟล์หลัก
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profile/set-profile-photo/${filename}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('ไม่สามารถตั้งเป็นรูปโปรไฟล์ได้');
      }
      
      // Fetch photos ใหม่เพื่อให้ได้ isProfile ที่อัปเดตแล้ว
      await fetchUserPhotos();
      
      // อัพเดท profile state ด้วย
      const photoPath = `/uploads/users/${profile._id || profile.id}/${filename}`;
      setProfile(prev => ({
        ...prev,
        avatar: photoPath
      }));
      
      // ตั้งให้แสดงรูปโปรไฟล์หลักใหม่เป็นรูปแรก
      setCurrentPhotoIndex(0);
      
      showSuccess('ตั้งเป็นรูปโปรไฟล์เรียบร้อยแล้ว');
      
    } catch (err) {
      console.error('Error setting profile photo:', err);
      showError(err.message || 'ไม่สามารถตั้งเป็นรูปโปรไฟล์ได้', 'ข้อผิดพลาด');
    }
  };
  
  // Privacy Settings Function
  const handlePrivacyToggle = async (setting) => {
    try {
      console.log('🛡️ Toggling privacy setting:', setting);
      
      const currentValue = profile.privacySettings?.[setting] || false;
      const newValue = !currentValue;
      
      // อัปเดต state ก่อนเพื่อให้ UI responsive
      const newPrivacySettings = {
        ...profile.privacySettings,
        [setting]: newValue
      };
      
      setProfile(prev => ({
        ...prev,
        privacySettings: newPrivacySettings
      }));
      
      // เรียก API เพื่อบันทึกการตั้งค่า
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/privacy', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          privacySettings: newPrivacySettings
        })
      });
      
      if (!response.ok) {
        // หากไม่สำเร็จ ให้ revert state กลับ
        setProfile(prev => ({
          ...prev,
          privacySettings: profile.privacySettings
        }));
        throw new Error('ไม่สามารถบันทึกการตั้งค่าได้');
      }
      
      showSuccess(`${newValue ? 'เปิด' : 'ปิด'}การตั้งค่าความเป็นส่วนตัวแล้ว`);
      
    } catch (err) {
      console.error('Error updating privacy settings:', err);
      showError(err.message || 'ไม่สามารถบันทึกการตั้งค่าได้', 'ข้อผิดพลาด');
    }
  };
  
  const handleUploadSuccess = async (newPhotos) => {
    // เรียกดึงรูปใหม่จาก server แทนการเพิ่ม state โดยตรง
    await fetchUserPhotos(profile._id || profile.id);
    setUploadModalOpen(false);
    showSuccess('อัปโหลดรูปภาพเรียบร้อยแล้ว');
  };
  
  const handleEditProfile = async () => {
    try {
      console.log('Current profile:', profile);
      console.log('Current editFormData:', editFormData);
      console.log('Gender in editFormData:', editFormData.gender);
      console.log('SexualOrientation in editFormData:', editFormData.sexualOrientation);
      
      // เช็คว่าเป็น owner หรือไม่
      if (!isOwner) {
        showError('คุณไม่มีสิทธิ์แก้ไขโปรไฟล์นี้');
        return;
      }
      
      // ตรวจสอบและเตรียมข้อมูลให้สมบูรณ์
      const completeProfileData = {
        // ข้อมูลพื้นฐาน
        firstName: editFormData.firstName || profile.firstName,
        lastName: editFormData.lastName || profile.lastName,
        nickname: editFormData.nickname || profile.nickname,
        bio: editFormData.bio || profile.bio,
        selfDescription: editFormData.selfDescription || profile.selfDescription,
        location: editFormData.location || profile.location,
        occupation: editFormData.occupation || profile.occupation,
        education: editFormData.education || profile.education,
        // ข้อมูลเพศและรสนิยมทางเพศ
        gender: editFormData.gender || profile.gender,
        sexualOrientation: editFormData.sexualOrientation || profile.sexualOrientation,
        age: editFormData.age || profile.age,
        weight: editFormData.weight || profile.weight,
        
        // ข้อมูลใหม่ที่ root level
        lifestyle: editFormData.lifestyle || profile.lifestyle,
        smoking: editFormData.smoking || profile.smoking,
        drinking: editFormData.drinking || profile.drinking,
        pets: editFormData.pets || profile.pets || [],
        foodStyle: editFormData.foodStyle || profile.foodStyle || [],
        favoriteMovies: editFormData.favoriteMovies || profile.favoriteMovies || [],
        favoriteMusic: editFormData.favoriteMusic || profile.favoriteMusic || [],
        funFacts: editFormData.funFacts || profile.funFacts || [],
        relationshipGoal: editFormData.relationshipGoal || profile.relationshipGoal,
        
        // จัดการข้อมูลแบบซับซ้อน
        personalDetails: {
          ...(profile.personalDetails || {}),
          ...(editFormData.personalDetails || {}),
        },
        lifeStyle: {
          ...(profile.lifeStyle || {}),
          ...(editFormData.lifeStyle || {}),
        },
        relationshipPreferences: {
          ...(profile.relationshipPreferences || {}),
          ...(editFormData.relationshipPreferences || {}),
          ageRange: {
            ...(profile.relationshipPreferences?.ageRange || {}),
            ...(editFormData.relationshipPreferences?.ageRange || {}),
          }
        },
        idealMatch: {
          ...(profile.idealMatch || {}),
          ...(editFormData.idealMatch || {}),
        },
        // จัดการกับ arrays
        interests: editFormData.interests || profile.interests || [],
        lookingFor: editFormData.lookingFor || profile.lookingFor || [],
      };
      
      console.log('Complete profile data to update:', completeProfileData);
      
      // เรียก API เพื่ออัพเดทโปรไฟล์
      const result = await updateProfile(completeProfileData);
      console.log('API update result:', result);
      
      if (result.success) {
        // อัพเดท profile state ด้วยข้อมูลใหม่จาก API 
        const updatedProfile = {
          ...profile,
          ...completeProfileData,
          ...result.data
        };
        
        setProfile(updatedProfile);
        console.log('Profile updated successfully:', updatedProfile);
        
        // เพิ่มการ reload profile จาก API เพื่อให้แน่ใจว่าข้อมูลครบถ้วน
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const profileData = await response.json();
            console.log('API profile reload response:', profileData);
            
            if (profileData.success && profileData.data) {
              setProfile(profileData.data);
              console.log('Profile reloaded from API:', profileData.data);
              console.log('Lifestyle data:', profileData.data.lifestyle);
              console.log('Pets data:', profileData.data.pets);
              console.log('FoodStyle data:', profileData.data.foodStyle);
              console.log('FavoriteMovies data:', profileData.data.favoriteMovies);
              console.log('FavoriteMusic data:', profileData.data.favoriteMusic);
              console.log('FunFacts data:', profileData.data.funFacts);
              
              // อัปเดต editFormData ด้วยข้อมูลล่าสุด
              setEditFormData(profileData.data);
            } else {
              console.warn('API response structure unexpected:', profileData);
            }
          } else {
            console.warn('Profile reload failed with status:', response.status);
          }
        } catch (reloadError) {
          console.log('Profile reload error (using cached data):', reloadError);
        }
        
        setEditModalOpen(false);
        showSuccess('อัปเดตโปรไฟล์เรียบร้อยแล้ว');
      } else {
        showError(result.error || 'ไม่สามารถอัปเดตโปรไฟล์ได้');
        console.error('Update failed:', result.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      showError('เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
    }
  };
  
  const nextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };
  
  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };
  
  // ฟังก์ชันสำหรับการกดถูกใจโปรไฟล์
  const handleLikeProfile = () => {
    if (!isAuthenticated) {
      showError('กรุณาเข้าสู่ระบบก่อนกดถูกใจ');
      return;
    }
    
    setLikeStatus(!likeStatus);
    showSuccess(likeStatus ? 'ยกเลิกการถูกใจเรียบร้อยแล้ว' : 'กดถูกใจเรียบร้อยแล้ว');
    
    // ในที่นี้เราจะจำลองการส่งข้อมูลไปยัง backend
    // ในการทำงานจริงควรมีการส่งข้อมูลไปยัง API
    console.log(`User ${user?.username} ${likeStatus ? 'unliked' : 'liked'} profile of ${profile.username}`);
  };
  
  // ฟังก์ชันสำหรับการเปิด Modal แชท
  const handleOpenChatModal = () => {
    if (!isAuthenticated) {
      showError('กรุณาเข้าสู่ระบบก่อนส่งข้อความ');
      return;
    }
    setChatModalOpen(true);
  };
  
  // ฟังก์ชันสำหรับการส่งข้อความแชท
  const handleSendMessage = () => {
    if (!chatMessage.trim()) {
      showError('กรุณากรอกข้อความก่อนส่ง');
      return;
    }
    
    // จำลองการส่งข้อความ
    console.log(`Message from ${user?.username} to ${profile.username}: ${chatMessage}`);
    showSuccess('ส่งข้อความเรียบร้อยแล้ว');
    setChatMessage('');
    setChatModalOpen(false);
  };
  
  // ฟังก์ชันสำหรับการเลือกไฟล์
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // ตรวจสอบจำนวนไฟล์ที่เลือก
    if (files.length > 6) {
      showError('สามารถอัพโหลดได้ไม่เกิน 6 รูปในครั้งเดียว');
      return;
    }
    
    // ตรวจสอบขนาดและประเภทของไฟล์
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        showError(`ไฟล์ ${file.name} ไม่ใช่รูปภาพ`);
        return false;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        showError(`ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (ไม่เกิน 5MB)`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) {
      return;
    }
    
    setSelectedFiles(validFiles);
    
    // สร้าง previews
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };
  
  // ฟังก์ชันสำหรับการลบไฟล์ที่เลือก
  const removeSelectedFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    
    const newPreviews = [...previewImages];
    URL.revokeObjectURL(newPreviews[index]); // ยกเลิก object URL เพื่อปล่อยหน่วยความจำ
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };
  
  // ฟังก์ชันสำหรับการอัพโหลดรูปภาพหลายรูป
  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) {
      showError('กรุณาเลือกรูปภาพก่อน');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // สร้าง array สำหรับเก็บผลลัพธ์
      const uploadedPhotos = [];
      
      // อัพโหลดทีละรูป
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('photo', file); // เปลี่ยนจาก 'image' เป็น 'photo'
        
        console.log('🖼️ Uploading file:', file.name);
        
        const token = localStorage.getItem('token');
        // ส่งไปยัง API
        const response = await fetch('http://localhost:5000/api/profile/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`ไม่สามารถอัพโหลดรูป ${file.name} ได้`);
        }
        
        const result = await response.json();
        
        // เพิ่มข้อมูลรูปภาพที่อัพโหลดเสร็จแล้ว
        uploadedPhotos.push({
          id: result.filename || Date.now().toString(),
          path: result.imageUrl,
          isProfile: uploadedPhotos.length === 0 && photos.length === 0, // ถ้าเป็นรูปแรกและไม่มีรูปอื่นให้เป็นรูปโปรไฟล์
          uploadedAt: new Date().toISOString()
        });
      }
      
      // เรียกใช้ฟังก์ชันสำหรับจัดการการอัพโหลดเสร็จสิ้น
      console.log('📸 Upload completed, calling handleUploadSuccess with', uploadedPhotos.length, 'photos');
      await handleUploadSuccess(uploadedPhotos);
      
      // เคลียร์ state ที่เกี่ยวข้องกับการเลือกไฟล์
      setSelectedFiles([]);
      setPreviewImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Error uploading images:', error);
      showError(error.message || 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ');
    } finally {
      setIsUploading(false);
    }
  };
  
  // ฟังก์ชันเปิด file dialog
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // ทำความสะอาด URL objects เมื่อ component unmount
  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewImages]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500"></div>
        <p className="text-amber-400 mt-4">กำลังโหลดโปรไฟล์...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex flex-col items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md w-full text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <Button onClick={() => navigate('/')} variant="outline">กลับสู่หน้าหลัก</Button>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex flex-col items-center justify-center p-4">
        <div className="bg-zinc-900/80 border border-amber-500/30 rounded-lg p-6 max-w-md w-full text-center">
          <p className="text-zinc-400 text-lg mb-4">ไม่พบข้อมูลโปรไฟล์</p>
          <Button onClick={() => navigate('/')} variant="outline">กลับสู่หน้าหลัก</Button>
        </div>
      </div>
    );
  }
  
  // หารูปโปรไฟล์หลัก
  const mainProfilePhoto = photos.find(photo => photo.isProfile);
  
  // เรียงรูปใหม่ให้รูปโปรไฟล์หลักมาก่อน
  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.isProfile) return -1;
    if (b.isProfile) return 1;
    return 0;
  });
  
  const profilePhoto = mainProfilePhoto 
    ? `http://localhost:5000${mainProfilePhoto.path}` 
    : (profile.avatar ? `http://localhost:5000${profile.avatar}` : null);
    
  // รูปสำหรับแสดงในแกลลอรี่ (ใช้รูปที่เรียงใหม่)
  const currentGalleryPhoto = sortedPhotos.length > 0 
    ? `http://localhost:5000${sortedPhotos[currentPhotoIndex].path}` 
    : null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6 text-amber-400 hover:text-amber-300 hover:bg-amber-900/20 gap-2"
          onClick={() => navigate('/')}
        >
          <ChevronLeft size={16} />
          กลับสู่หน้าหลัก
        </Button>
        
        {/* Profile Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Photo Carousel */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-b from-zinc-900 to-black border border-amber-500/30 overflow-hidden relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-xl">
                {/* Profile Photo - ใช้รูปปัจจุบันในแกลลอรี่ หรือรูปโปรไฟล์หลัก */}
                <img 
                  src={currentGalleryPhoto || profilePhoto} 
                  alt={profile.username} 
                  className="w-full h-full object-cover"
                />
                
                {/* Verified Badge */}
                {profile.verified && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-black rounded-full p-2">
                    <BadgeCheck size={20} />
                  </div>
                )}
                
                {/* Premium Badge */}
                {profile.premium && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-full p-2">
                    <Crown size={20} />
                  </div>
                )}
                
                {/* Photo Navigation */}
                {sortedPhotos.length > 1 && (
                  <>
                    <button 
                      className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                      onClick={prevPhoto}
                      disabled={currentPhotoIndex === 0}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                      onClick={nextPhoto}
                      disabled={currentPhotoIndex === sortedPhotos.length - 1}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                
                {/* Photo Indicators */}
                {sortedPhotos.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                    {sortedPhotos.map((photo, index) => (
                      <div 
                        key={index} 
                        className={`w-2 h-2 rounded-full cursor-pointer ${currentPhotoIndex === index ? 'bg-amber-500' : 'bg-white/50'}`}
                        onClick={() => setCurrentPhotoIndex(index)}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-amber-400 font-serif">
                      {profile.firstName} {profile.lastName}, {profile.age}
                    </h2>
                    <div className="flex items-center gap-1 mt-1 text-zinc-400 text-sm">
                      <MapPin size={14} />
                      <span>{profile.location}</span>
                    </div>
                  </div>
                  
                  {isOwner ? (
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full gap-2 text-amber-400 border-amber-500/50"
                        onClick={() => {
                          // กำหนดค่าเริ่มต้นให้แบบฟอร์ม
                          setEditFormData({ ...profile });
                          setEditModalOpen(true);
                        }}
                      >
                        <Edit size={14} />
                        แก้ไขโปรไฟล์
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full gap-2 text-amber-400 border-amber-500/50"
                        onClick={() => setUploadModalOpen(true)}
                      >
                        <Camera size={14} />
                        เพิ่มรูปภาพ
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        className="w-full gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={handleLikeProfile}
                      >
                        <Heart size={14} fill={likeStatus ? "white" : "none"} />
                        {likeStatus ? 'ถูกใจแล้ว' : 'ถูกใจ'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                        onClick={handleOpenChatModal}
                      >
                        <MessageCircle size={14} />
                        ส่งข้อความ
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Stats */}
            <Card className="mt-4 bg-gradient-to-b from-zinc-900 to-black border border-amber-500/30">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-amber-400 font-serif mb-2">สถานะ</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Briefcase size={14} className="text-amber-500" />
                    <span>{profile.occupation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <GraduationCap size={14} className="text-amber-500" />
                    <span>{profile.education}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Calendar size={14} className="text-amber-500" />
                    <span>เข้าร่วมเมื่อ {new Date(profile.memberSince).toLocaleDateString('th-TH')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Check size={14} className="text-amber-500" />
                    <span>ออนไลน์ล่าสุด {new Date(profile.lastActive).toLocaleDateString('th-TH')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Interests */}
            <Card className="mt-4 bg-gradient-to-b from-zinc-900 to-black border border-amber-500/30">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-amber-400 font-serif mb-2">ความสนใจ</h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.interests || []).map((interest, index) => (
                    <span 
                      key={index} 
                      className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-b from-zinc-900 to-black border border-amber-500/30">
              <CardContent className="p-6">
                <Tabs defaultValue="about">
                  <TabsList className="mb-6">
                    <TabsTrigger value="about">เกี่ยวกับฉัน</TabsTrigger>
                    <TabsTrigger value="preferences">สิ่งที่ฉันต้องการ</TabsTrigger>
                    <TabsTrigger value="photos">รูปภาพ</TabsTrigger>
                    {isOwner && <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>}
                  </TabsList>
                  
                  {/* About Me Tab */}
                  <TabsContent value="about">
                    <div className="space-y-6">
                      {/* ข้อมูลพื้นฐาน */}
                      <div>
                        <h3 className="text-xl font-bold text-amber-400 font-serif mb-3">🧍‍♂️ ข้อมูลพื้นฐาน</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium w-32">ชื่อเล่น:</span>
                              <span>{profile.nickname}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium w-32">อายุ:</span>
                              <span>{profile.privacySettings?.hideAge ? 'ไม่แสดง' : `${profile.age} ปี`}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium w-32">น้ำหนัก:</span>
                              <span>{profile.weight ? `${profile.weight} กก.` : 'ไม่ระบุ'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium w-32">ส่วนสูง:</span>
                              <span>{profile.personalDetails?.height} ซม.</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium w-32">เพศ:</span>
                              <span>{profile.gender || 'ไม่ระบุ'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium w-32">รสนิยมทางเพศ:</span>
                              <span>{profile.sexualOrientation || 'ไม่ระบุ'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium w-32">อาชีพ:</span>
                              <span>{profile.privacySettings?.hideOccupation ? 'ไม่แสดง' : profile.occupation}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium w-32">ที่อยู่:</span>
                              <span>{profile.privacySettings?.hideLocation ? 'ไม่แสดง' : profile.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-6 bg-amber-500/20" />
                      
                      {/* คำบรรยายตัวเอง */}
                      <div>
                        <h3 className="text-xl font-bold text-amber-400 font-serif mb-3">💬 คำบรรยายตัวเอง</h3>
                        <p className="text-zinc-300 leading-relaxed bg-zinc-800/30 p-4 rounded-lg border border-amber-500/20">
                          {profile.selfDescription}
                        </p>
                        <div className="mt-3">
                          <h4 className="text-amber-400 font-medium mb-2">เกี่ยวกับฉัน</h4>
                          <p className="text-zinc-300 leading-relaxed">{profile.bio}</p>
                        </div>
                      </div>
                      
                      <Separator className="my-6 bg-amber-500/20" />
                      
                      {/* ความชอบ & ไลฟ์สไตล์ */}
                      <div>
                        <h3 className="text-xl font-bold text-amber-400 font-serif mb-3">❤️ ความชอบ & ไลฟ์สไตล์</h3>
                        
                        <div className="space-y-4">
                          {/* กิจกรรมที่ชอบ */}
                          <div>
                            <h4 className="text-amber-400 font-medium mb-2">กิจกรรมที่ชอบ</h4>
                            <div className="flex flex-wrap gap-2">
                              {(profile.activities || []).map((activity, index) => (
                                <span 
                                  key={index} 
                                  className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-sm"
                                >
                                  {activity}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {/* สัตว์เลี้ยง */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-amber-400 font-medium mb-2">สัตว์เลี้ยง</h4>
                              <div className="flex flex-wrap gap-2">
                                {(profile.pets || []).map((pet, index) => (
                                  <span key={index} className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm">
                                    {pet}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-amber-400 font-medium mb-2">สไตล์การใช้ชีวิต</h4>
                              <span className="text-zinc-300">{profile.lifestyle}</span>
                            </div>
                          </div>
                          
                          {/* สายกิน */}
                          <div>
                            <h4 className="text-amber-400 font-medium mb-2">สายกิน</h4>
                            <div className="flex flex-wrap gap-2">
                              {(profile.foodStyle || []).map((food, index) => (
                                <span key={index} className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-sm">
                                  {food}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {/* สุขภาพ */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium">สูบบุหรี่:</span>
                              <span>{profile.smoking}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium">ดื่มแอลกอฮอล์:</span>
                              <span>{profile.drinking}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-6 bg-amber-500/20" />
                      
                      {/* Fun Facts */}
                      <div>
                        <h3 className="text-xl font-bold text-amber-400 font-serif mb-3">🪞 Fun Facts / จุดเด่นในตัวฉัน</h3>
                        <div className="space-y-3">
                          {(profile.funFacts || []).map((fact, index) => (
                            <div key={index} className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                              <p className="text-purple-300 text-sm">{fact}</p>
                            </div>
                          ))}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <h4 className="text-amber-400 font-medium mb-2">หนังที่ชอบ</h4>
                              <div className="flex flex-wrap gap-2">
                                {(profile.favoriteMovies || []).map((movie, index) => (
                                  <span key={index} className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs">
                                    {movie}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-amber-400 font-medium mb-2">เพลงที่ชอบ</h4>
                              <div className="flex flex-wrap gap-2">
                                {(profile.favoriteMusic || []).map((music, index) => (
                                  <span key={index} className="bg-pink-500/10 text-pink-400 px-2 py-1 rounded text-xs">
                                    {music}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-6 bg-amber-500/20" />
                      
                      {/* รายละเอียดเพิ่มเติม */}
                      <div>
                        <h3 className="text-xl font-bold text-amber-400 font-serif mb-3">รายละเอียดเพิ่มเติม</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium w-24">รูปร่าง:</span>
                              <span>{profile.personalDetails?.bodyType}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium w-24">ออกกำลังกาย:</span>
                              <span>{profile.personalDetails?.exercise}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium w-24">บุตร:</span>
                              <span>{profile.personalDetails?.children}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium w-24">ศาสนา:</span>
                              <span>{profile.lifeStyle?.religion}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium w-24">ราศี:</span>
                              <span>{profile.lifeStyle?.zodiac}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium w-24">MBTI:</span>
                              <span>{profile.lifeStyle?.mbti}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span className="text-amber-500 font-medium w-24">ภาษา:</span>
                              <span>{(profile.personalDetails?.languages || []).join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Preferences Tab */}
                  <TabsContent value="preferences">
                    <div className="space-y-6">
                      {/* มองหาอะไร */}
                      <div>
                        <h3 className="text-xl font-bold text-amber-400 font-serif mb-3">🕊️ มองหาอะไรในเว็บนี้</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(profile.lookingFor || []).map((item, index) => (
                            <span 
                              key={index} 
                              className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-sm"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                        <div className="bg-zinc-800/30 p-4 rounded-lg border border-amber-500/20">
                          <p className="text-zinc-300">{profile.relationshipGoal}</p>
                        </div>
                      </div>
                      
                      <Separator className="my-6 bg-amber-500/20" />
                      
                      {/* สเปคที่ชอบ */}
                      <div>
                        <h3 className="text-xl font-bold text-amber-400 font-serif mb-3">🧲 สเปคหรือคุณสมบัติที่ชอบ</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-amber-400 font-medium mb-2">ช่วงอายุที่สนใจ</h4>
                              <span className="text-zinc-300">{profile.idealMatch?.ageRange?.min} - {profile.idealMatch?.ageRange?.max} ปี</span>
                            </div>
                            <div>
                              <h4 className="text-amber-400 font-medium mb-2">บุคลิกที่ชอบ</h4>
                              <span className="text-zinc-300">{profile.idealMatch?.personality}</span>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-amber-400 font-medium mb-2">ความสนใจที่อยากให้มีร่วมกัน</h4>
                            <p className="text-zinc-300">{profile.interests?.join(', ') || '-'}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-amber-400 font-medium mb-2">ไลฟ์สไตล์ที่ชอบ</h4>
                            <p className="text-zinc-300">{profile.lifestyle || '-'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-6 bg-amber-500/20" />
                      
                      {/* Deal Breakers */}
                      <div>
                        <h3 className="text-xl font-bold text-amber-400 font-serif mb-3">สิ่งที่ฉันไม่ชอบ</h3>
                        <div className="flex flex-wrap gap-2">
                          {(profile.relationshipPreferences?.dealBreakers || []).map((item, index) => (
                            <span 
                              key={index} 
                              className="bg-red-900/20 text-red-400 px-3 py-1 rounded-full text-sm"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Photos Tab */}
                  <TabsContent value="photos">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-amber-400 font-serif">รูปภาพทั้งหมด</h3>
                        {isOwner && (
                          <Button 
                            variant="outline" 
                            className="gap-2 text-amber-400 border-amber-500/50"
                            onClick={() => setUploadModalOpen(true)}
                          >
                            <Camera size={14} />
                            เพิ่มรูปภาพ
                          </Button>
                        )}
                      </div>
                      
                      {fetchingImages ? (
                        <div className="flex justify-center items-center h-60">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
                        </div>
                      ) : sortedPhotos.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                          {sortedPhotos.map((photo) => (
                            <div key={photo.id} className="relative group aspect-square">
                              <img 
                                src={`http://localhost:5000${photo.path}`} 
                                alt="User uploaded" 
                                className="w-full h-full object-cover rounded-lg border border-amber-500/30"
                              />
                              {photo.isProfile && (
                                <div className="absolute top-2 left-2 bg-amber-500 text-black text-xs px-2 py-1 rounded-full">
                                  รูปโปรไฟล์
                                </div>
                              )}
                              {isOwner && (
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  {!photo.isProfile && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                      onClick={() => handleSetProfilePhoto(photo.id, photo.filename)}
                                    >
                                      <Star size={16} />
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    onClick={() => handlePhotoDelete(photo.id, photo.filename)}
                                  >
                                    <X size={16} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 border border-dashed border-amber-500/30 rounded-lg">
                          <Image size={40} className="mx-auto text-amber-500/50 mb-3" />
                          <p className="text-zinc-400">ไม่มีรูปภาพ</p>
                          {isOwner && (
                            <Button 
                              variant="outline" 
                              className="mt-4 text-amber-400 border-amber-500/50"
                              onClick={() => setUploadModalOpen(true)}
                            >
                              เพิ่มรูปภาพแรก
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Settings Tab (Owner only) */}
                  {isOwner && (
                    <TabsContent value="settings">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-amber-400 font-serif mb-3">🛡️ ตั้งค่าความเป็นส่วนตัว</h3>
                          <div className="space-y-3">
                            <div 
                              className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800/70 transition-colors"
                              onClick={() => handlePrivacyToggle('hideAge')}
                            >
                              <div className="flex items-center gap-2">
                                <Shield size={18} className="text-amber-400" />
                                <span className="text-zinc-300">ซ่อนอายุ</span>
                              </div>
                              <div className={`relative w-12 h-6 rounded-full transition-colors ${profile.privacySettings?.hideAge ? 'bg-amber-500' : 'bg-zinc-600'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${profile.privacySettings?.hideAge ? 'translate-x-7' : 'translate-x-1'}`}></div>
                              </div>
                            </div>
                            
                            <div 
                              className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800/70 transition-colors"
                              onClick={() => handlePrivacyToggle('hideOccupation')}
                            >
                              <div className="flex items-center gap-2">
                                <Shield size={18} className="text-amber-400" />
                                <span className="text-zinc-300">ซ่อนอาชีพ</span>
                              </div>
                              <div className={`relative w-12 h-6 rounded-full transition-colors ${profile.privacySettings?.hideOccupation ? 'bg-amber-500' : 'bg-zinc-600'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${profile.privacySettings?.hideOccupation ? 'translate-x-7' : 'translate-x-1'}`}></div>
                              </div>
                            </div>
                            
                            <div 
                              className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800/70 transition-colors"
                              onClick={() => handlePrivacyToggle('hideLocation')}
                            >
                              <div className="flex items-center gap-2">
                                <Shield size={18} className="text-amber-400" />
                                <span className="text-zinc-300">ซ่อนสถานที่</span>
                              </div>
                              <div className={`relative w-12 h-6 rounded-full transition-colors ${profile.privacySettings?.hideLocation ? 'bg-amber-500' : 'bg-zinc-600'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${profile.privacySettings?.hideLocation ? 'translate-x-7' : 'translate-x-1'}`}></div>
                              </div>
                            </div>
                            
                            <div 
                              className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800/70 transition-colors"
                              onClick={() => handlePrivacyToggle('hideLastSeen')}
                            >
                              <div className="flex items-center gap-2">
                                <Shield size={18} className="text-amber-400" />
                                <span className="text-zinc-300">ซ่อนเวลาออนไลน์ล่าสุด</span>
                              </div>
                              <div className={`relative w-12 h-6 rounded-full transition-colors ${profile.privacySettings?.hideLastSeen ? 'bg-amber-500' : 'bg-zinc-600'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${profile.privacySettings?.hideLastSeen ? 'translate-x-7' : 'translate-x-1'}`}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="my-6 bg-amber-500/20" />
                        
                        <div>
                          <h3 className="text-xl font-bold text-amber-400 font-serif mb-3">💡 คำแนะนำสำหรับโปรไฟล์ที่ดี</h3>
                          <div className="space-y-3 text-sm text-zinc-400">
                            <div className="flex items-start gap-2">
                              <Check size={16} className="text-green-400 mt-0.5" />
                              <span>ใส่รูปภาพที่ชัดเจนและยิ้มแย้ม อย่างน้อย 3-6 รูป</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check size={16} className="text-green-400 mt-0.5" />
                              <span>เขียนคำบรรยายตัวเองให้น่าสนใจ เล่าถึงความชอบและไลฟ์สไตล์</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check size={16} className="text-green-400 mt-0.5" />
                              <span>ระบุความสนใจที่หลากหลาย เพื่อให้คนอื่นเข้าใจตัวคุณได้มากขึ้น</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check size={16} className="text-green-400 mt-0.5" />
                              <span>เพิ่ม Fun Facts ที่ทำให้คุณดูน่าสนใจและแตกต่าง</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Upload Photo Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-lg">
            <h3 className="text-xl font-medium text-slate-800 mb-6">อัพโหลดรูปภาพ</h3>
            
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              
              {selectedFiles.length === 0 ? (
                <div 
                  className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={openFileDialog}
                >
                  <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 mb-2">คลิกเพื่อเลือกรูปภาพ</p>
                  <p className="text-slate-500 text-sm">อัพโหลดได้สูงสุด 6 รูป ขนาดไม่เกิน 5MB ต่อรูป</p>
                  <p className="text-slate-500 text-sm mt-2">รองรับไฟล์ JPG, PNG และ GIF</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-40 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100"
                          onClick={() => removeSelectedFile(index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    
                    {selectedFiles.length < 6 && (
                      <div 
                        className="w-full h-40 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-50"
                        onClick={openFileDialog}
                      >
                        <div className="text-center">
                          <Plus size={24} className="text-slate-400 mx-auto mb-1" />
                          <span className="text-slate-500 text-sm">เพิ่มรูปภาพ</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-slate-500 text-sm">
                      เลือกแล้ว {selectedFiles.length}/6 รูป
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button 
                  variant="outline" 
                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                  onClick={() => {
                    setUploadModalOpen(false);
                    setSelectedFiles([]);
                    setPreviewImages([]);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={isUploading}
                >
                  ยกเลิก
                </Button>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={handleUploadImages}
                  disabled={selectedFiles.length === 0 || isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังอัพโหลด...
                    </>
                  ) : (
                    'อัพโหลด'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-zinc-900 to-black border border-amber-500/30 rounded-xl max-w-4xl w-full shadow-xl max-h-[90vh] overflow-y-auto relative">
            {/* ปุ่มปิดที่อยู่ติดกับมุมบนขวา - แยกออกจาก Header */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 z-10 text-amber-400 hover:text-amber-300 bg-black/20 hover:bg-black/40 rounded-full"
              onClick={() => setEditModalOpen(false)}
            >
              <X size={20} />
            </Button>
            
            {/* Header ที่จะหายไปเมื่อเลื่อน */}
            <div className="p-6 pb-4 border-b border-amber-500/20">
              <h3 className="text-2xl font-bold text-amber-400 font-serif pr-12">แก้ไขโปรไฟล์</h3>
            </div>
            
            {/* เนื้อหาหลัก */}
            <div className="p-6 space-y-8">
              {/* ข้อมูลพื้นฐาน */}
              <section>
                <h4 className="text-lg font-bold text-amber-400 font-serif mb-4 flex items-center gap-2">
                  <Users size={18} /> ข้อมูลพื้นฐาน
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">ชื่อจริง *</label>
                    <input 
                      type="text" 
                      data-field="firstName"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.firstName || ''}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      placeholder="ชื่อจริง"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">นามสกุล *</label>
                    <input 
                      type="text" 
                      data-field="lastName"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.lastName || ''}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      placeholder="นามสกุล"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">ชื่อเล่น</label>
                    <input 
                      type="text" 
                      data-field="nickname"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.nickname || ''}
                      onChange={(e) => handleFormChange('nickname', e.target.value)}
                      placeholder="ชื่อเล่น"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">อายุ *</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      data-field="age"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.age || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // ยอมรับเฉพาะตัวเลข หรือค่าว่าง
                        if (/^\d*$/.test(value)) {
                          console.log('Age input changed:', value);
                          handleFormChange('age', value);
                        }
                      }}
                      placeholder="อายุ (18-80)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">เพศ *</label>
                    <select 
                      data-field="gender"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.gender || ''}
                      onChange={(e) => handleFormChange('gender', e.target.value)}
                    >
                      <option value="">เลือกเพศ</option>
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">รสนิยมทางเพศ</label>
                    <select 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.sexualOrientation || ''}
                      onChange={(e) => handleFormChange('sexualOrientation', e.target.value)}
                    >
                      <option value="">เลือกรสนิยมทางเพศ</option>
                      <option value="ชอบเพศตรงข้าม">ชอบเพศตรงข้าม</option>
                      <option value="ชอบเพศเดียวกัน">ชอบเพศเดียวกัน</option>
                      <option value="ชอบทั้งสองเพศ">ชอบทั้งสองเพศ</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">น้ำหนัก (กก.)</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.weight || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // ยอมรับเฉพาะตัวเลข หรือค่าว่าง
                        if (/^\d*$/.test(value)) {
                          console.log('Weight input changed:', value);
                          handleFormChange('weight', value);
                        }
                      }}
                      placeholder="น้ำหนัก (30-200)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">ส่วนสูง (ซม.)</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.personalDetails?.height || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // ยอมรับเฉพาะตัวเลข หรือค่าว่าง
                        if (/^\d*$/.test(value)) {
                          console.log('Height input changed:', value);
                          handleFormChange('height', value);
                        }
                      }}
                      placeholder="ส่วนสูง (140-220)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">จังหวัด/ที่อยู่ *</label>
                    <input 
                      type="text" 
                      data-field="location"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.location || ''}
                      onChange={(e) => handleFormChange('location', e.target.value)}
                      placeholder="จังหวัด/ที่อยู่"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">อาชีพ *</label>
                    <input 
                      type="text" 
                      data-field="occupation"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.occupation || ''}
                      onChange={(e) => handleFormChange('occupation', e.target.value)}
                      placeholder="อาชีพ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">การศึกษา</label>
                    <input 
                      type="text" 
                      data-field="education"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.education || ''}
                      onChange={(e) => handleFormChange('education', e.target.value)}
                      placeholder="การศึกษา"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">รูปร่าง</label>
                    <select 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      defaultValue={profile.personalDetails?.bodyType}
                      onChange={(e) => handleFormChange('bodyType', e.target.value)}
                    >
                      <option value="">เลือกรูปร่าง</option>
                      <option value="ผอม">ผอม</option>
                      <option value="สมส่วน">สมส่วน</option>
                      <option value="อวบ">อวบ</option>
                      <option value="ผู้ดี">ผู้ดี</option>
                      <option value="นักกีฬา">นักกีฬา</option>
                    </select>
                  </div>
                </div>
              </section>

              <Separator className="bg-amber-500/20" />

              {/* คำบรรยายตัวเอง */}
              <section>
                <h4 className="text-lg font-bold text-amber-400 font-serif mb-4 flex items-center gap-2">
                  <MessageCircle size={18} /> คำบรรยายตัวเอง
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">คำบรรยายตัวเอง *</label>
                    <textarea 
                      data-field="selfDescription"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
                      value={editFormData.selfDescription || ''}
                      onChange={(e) => handleFormChange('selfDescription', e.target.value)}
                      placeholder="บอกเล่าเกี่ยวกับตัวคุณเองในแง่มุมต่างๆ..."
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">เกี่ยวกับฉัน *</label>
                    <textarea 
                      data-field="bio"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
                      value={editFormData.bio || ''}
                      onChange={(e) => handleFormChange('bio', e.target.value)}
                      placeholder="เล่าเกี่ยวกับความชอบ ไลฟ์สไตล์ และสิ่งที่สนใจ..."
                    ></textarea>
                  </div>
                </div>
              </section>

              <Separator className="bg-amber-500/20" />

              {/* ไลฟ์สไตล์และความชอบ */}
              <section>
                <h4 className="text-lg font-bold text-amber-400 font-serif mb-4 flex items-center gap-2">
                  <Heart size={18} /> ไลฟ์สไตล์และความชอบ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">ความสนใจ (คั่นด้วยเครื่องหมายจุลภาค)</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.interestsString || (editFormData.interests?.join(', ')) || ''}
                      placeholder="ฟังเพลง, ท่องเที่ยว, ถ่ายรูป, อ่านหนังสือ"
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditFormData(prev => ({
                          ...prev,
                          interestsString: value,
                          interests: value ? value.split(',').map(item => item.trim()) : []
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">สไตล์การใช้ชีวิต</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.lifestyle || ''}
                      placeholder="สายชิล แต่ชอบลองของใหม่"
                      onChange={(e) => handleFormChange('lifestyle', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">สายกิน (คั่นด้วยเครื่องหมายจุลภาค)</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.foodStyleString || (editFormData.foodStyle?.join(', ')) || ''}
                      placeholder="คาเฟ่, ทำอาหารเอง, ร้านอาหารไทย"
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditFormData(prev => ({
                          ...prev,
                          foodStyleString: value,
                          foodStyle: value ? value.split(',').map(item => item.trim()) : []
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">สัตว์เลี้ยง (คั่นด้วยเครื่องหมายจุลภาค)</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.petsString || (editFormData.pets?.join(', ')) || ''}
                      placeholder="🐱 แมว 1 ตัว, 🐶 หมา 2 ตัว"
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditFormData(prev => ({
                          ...prev,
                          petsString: value,
                          pets: value ? value.split(',').map(item => item.trim()) : []
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">ออกกำลังกาย</label>
                    <select 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.personalDetails?.exercise || ''}
                      onChange={(e) => handleFormChange('exercise', e.target.value)}
                    >
                      <option value="">เลือกความถี่ในการออกกำลังกาย</option>
                      <option value="ไม่ออกกำลังกาย">ไม่ออกกำลังกาย</option>
                      <option value="นาน ๆ ครั้ง">นาน ๆ ครั้ง</option>
                      <option value="1-2 ครั้ง/สัปดาห์">1-2 ครั้ง/สัปดาห์</option>
                      <option value="3-4 ครั้ง/สัปดาห์">3-4 ครั้ง/สัปดาห์</option>
                      <option value="5-6 ครั้ง/สัปดาห์">5-6 ครั้ง/สัปดาห์</option>
                      <option value="ทุกวัน">ทุกวัน</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">สูบบุหรี่</label>
                    <select 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.smoking || ''}
                      onChange={(e) => handleFormChange('smoking', e.target.value)}
                    >
                      <option value="">เลือกสถานะการสูบบุรี่</option>
                      <option value="ไม่สูบบุรี่">ไม่สูบบุรี่</option>
                      <option value="สูบเป็นครั้งคราว">สูบเป็นครั้งคราว</option>
                      <option value="สูบเป็นประจำ">สูบเป็นประจำ</option>
                      <option value="เลิกแล้ว">เลิกแล้ว</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">ดื่มแอลกอฮอล์</label>
                    <select 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      defaultValue={profile.drinking}
                      onChange={(e) => handleFormChange('drinking', e.target.value)}
                    >
                      <option value="">เลือกสถานะการดื่มแอลกอฮอล์</option>
                      <option value="ไม่ดื่ม">ไม่ดื่ม</option>
                      <option value="ดื่มเป็นครั้งคราว">ดื่มเป็นครั้งคราว</option>
                      <option value="ดื่มเป็นประจำ">ดื่มเป็นประจำ</option>
                      <option value="ดื่มในงานสังคม">ดื่มในงานสังคม</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">บุตร</label>
                    <select 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      defaultValue={profile.personalDetails?.children}
                      onChange={(e) => handleFormChange('children', e.target.value)}
                    >
                      <option value="">เลือกสถานะเรื่องบุตร</option>
                      <option value="ไม่มี">ไม่มี</option>
                      <option value="ไม่มี แต่ต้องการมีในอนาคต">ไม่มี แต่ต้องการมีในอนาคต</option>
                      <option value="มี 1 คน">มี 1 คน</option>
                      <option value="มี 2 คน">มี 2 คน</option>
                      <option value="มี 3 คนขึ้นไป">มี 3 คนขึ้นไป</option>
                      <option value="ไม่ต้องการมี">ไม่ต้องการมี</option>
                    </select>
                  </div>
                </div>
              </section>

              <Separator className="bg-amber-500/20" />

              {/* ข้อมูลเพิ่มเติม */}
              <section>
                <h4 className="text-lg font-bold text-amber-400 font-serif mb-4 flex items-center gap-2">
                  <Star size={18} /> ข้อมูลเพิ่มเติม
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">ศาสนา</label>
                    <select 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      defaultValue={profile.lifeStyle?.religion}
                      onChange={(e) => handleFormChange('religion', e.target.value)}
                    >
                      <option value="">เลือกศาสนา</option>
                      <option value="พุทธ">พุทธ</option>
                      <option value="คริสต์">คริสต์</option>
                      <option value="อิสลาม">อิสลาม</option>
                      <option value="ฮินดู">ฮินดู</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                      <option value="ไม่นับถือศาสนา">ไม่นับถือศาสนา</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">ราศี</label>
                    <select 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      defaultValue={profile.lifeStyle?.zodiac}
                      onChange={(e) => handleFormChange('zodiac', e.target.value)}
                    >
                      <option value="">เลือกราศี</option>
                      <option value="ราศีเมษ">ราศีเมษ</option>
                      <option value="ราศีพฤษภ">ราศีพฤษภ</option>
                      <option value="ราศีเมถุน">ราศีเมถุน</option>
                      <option value="ราศีกรกฎ">ราศีกรกฎ</option>
                      <option value="ราศีสิงห์">ราศีสิงห์</option>
                      <option value="ราศีกันย์">ราศีกันย์</option>
                      <option value="ราศีตุลย์">ราศีตุลย์</option>
                      <option value="ราศีพิจิก">ราศีพิจิก</option>
                      <option value="ราศีธนู">ราศีธนู</option>
                      <option value="ราศีมกร">ราศีมกร</option>
                      <option value="ราศีกุมภ์">ราศีกุมภ์</option>
                                           <option value="ราศีมีน">ราศีมีน</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">MBTI</label>
                    <select 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      defaultValue={profile.lifeStyle?.mbti}
                      onChange={(e) => handleFormChange('mbti', e.target.value)}
                    >
                      <option value="">เลือก MBTI</option>
                      <option value="INTJ">INTJ - นักวิเคราะห์</option>
                      <option value="INTP">INTP - นักคิด</option>
                      <option value="ENTJ">ENTJ - นักบริหาร</option>
                      <option value="ENTP">ENTP - นักโต้วาที</option>
                      <option value="INFJ">INFJ - นักสนับสนุน</option>
                      <option value="INFP">INFP - นักไกล่เกลี่ย</option>
                      <option value="ENFJ">ENFJ - นักสอน</option>
                      <option value="ENFP">ENFP - นักรณรงค์</option>
                      <option value="ISTJ">ISTJ - นักจัดการ</option>
                      <option value="ISFJ">ISFJ - นักปกป้อง</option>
                      <option value="ESTJ">ESTJ - นักบริหาร</option>
                      <option value="ESFJ">ESFJ - นักปรึกษา</option>
                      <option value="ISTP">ISTP - นักช่าง</option>
                      <option value="ISFP">ISFP - นักผจญภัย</option>
                      <option value="ESTP">ESTP - นักธุรกิจ</option>
                      <option value="ESFP">ESFP - นักสำราญ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">ภาษาที่ใช้ได้ (คั่นด้วยเครื่องหมายจุลภาค)</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      defaultValue={profile.personalDetails?.languages?.join(', ')}
                      placeholder="ไทย, อังกฤษ, จีน"
                      onChange={(e) => handleFormChange('languages', e.target.value.split(',').map(item => item.trim()))}
                    />
                  </div>
                </div>
              </section>

              <Separator className="bg-amber-500/20" />

              {/* Fun Facts */}
              <section>
                <h4 className="text-lg font-bold text-amber-400 font-serif mb-4 flex items-center gap-2">
                  <Gift size={18} /> Fun Facts & ความพิเศษ
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">หนังที่ชอบ (คั่นด้วยเครื่องหมายจุลภาค)</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      defaultValue={profile.favoriteMovies?.join(', ')}
                      placeholder="Inception, Your Name, The Grand Budapest Hotel"
                      onChange={(e) => handleFormChange('favoriteMovies', e.target.value.split(',').map(item => item.trim()))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">เพลงที่ชอบ (คั่นด้วยเครื่องหมายจุลภาค)</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      defaultValue={profile.favoriteMusic?.join(', ')}
                      placeholder="Indie Pop, Jazz, เพลงไทยเก่า"
                      onChange={(e) => handleFormChange('favoriteMusic', e.target.value.split(',').map(item => item.trim()))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Fun Facts (แต่ละข้อขึ้นบรรทัดใหม่)</label>
                    <textarea 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
                      defaultValue={profile.funFacts?.join('\n')}
                      placeholder="ความลับของฉันคือ... ทำคุกกี้เก่งมาก!&#10;ฉันมีความสามารถพิเศษคือ... จำเส้นทางได้แม่นมาก"
                      onChange={(e) => handleFormChange('funFacts', e.target.value.split('\n').map(item => item.trim()))}
                    ></textarea>
                  </div>
                </div>
              </section>

              <Separator className="bg-amber-500/20" />

              {/* สิ่งที่มองหา */}
              <section>
                <h4 className="text-lg font-bold text-amber-400 font-serif mb-4 flex items-center gap-2">
                  <Search size={18} /> สิ่งที่มองหา
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">มองหาอะไรในเว็บนี้ (คั่นด้วยเครื่องหมายจุลภาค)</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      defaultValue={profile.lookingFor?.join(', ')}
                      placeholder="เพื่อนใหม่, แฟนจริงจัง, คนที่เข้าใจกันและเดินไปด้วยกัน"
                      onChange={(e) => handleFormChange('lookingFor', e.target.value.split(',').map(item => item.trim()))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">เป้าหมายความสัมพันธ์</label>
                    <textarea 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
                      defaultValue={profile.relationshipGoal}
                      placeholder="อยากหาคนที่มีความคิดเป็นผู้ใหญ่ เข้าใจกัน และสามารถสร้างอนาคตร่วมกันได้"
                      onChange={(e) => handleFormChange('relationshipGoal', e.target.value)}
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">ช่วงอายุที่สนใจ (ต่ำสุด)</label>
                      <input 
                        type="number" 
                        min="18"
                        max="80"
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        defaultValue={profile.idealMatch?.ageRange?.min}
                        placeholder="25"
                        onChange={(e) => handleFormChange('idealMatch.ageRange.min', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">ช่วงอายุที่สนใจ (สูงสุด)</label>                    <input 
                      type="number" 
                      min="18"
                      max="80"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      defaultValue={profile.idealMatch?.ageRange?.max}
                      placeholder="35"
                      onChange={(e) => handleFormChange('idealMatch.ageRange.max', e.target.value)}
                    />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">บุคลิกที่ชอบ</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      defaultValue={profile.idealMatch?.personality}
                      placeholder="ผู้ใหญ่ มีความรับผิดชอบ อารมณ์ดี"
                      onChange={(e) => handleFormChange('idealMatch.personality', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">ความสนใจที่อยากให้มีร่วมกัน</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={interestsString}
                      placeholder="ชอบท่องเที่ยว, รักการเรียนรู้สิ่งใหม่"
                      onChange={(e) => {
                        setInterestsString(e.target.value);
                        // แปลงเป็น array สำหรับ backend
                        const interestsArray = e.target.value.split(',').map(item => item.trim()).filter(item => item.length > 0);
                        handleFormChange('interests', interestsArray);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">ไลฟ์สไตล์ที่ชอบ</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={editFormData.lifestyle || ''}
                      placeholder="ดูแลสุขภาพ, มีเป้าหมายในชีวิต"
                      onChange={(e) => handleFormChange('lifestyle', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">สิ่งที่ไม่ชอบ/Deal Breakers (คั่นด้วยเครื่องหมายจุลภาค)</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      defaultValue={profile.relationshipPreferences?.dealBreakers?.join(', ')}
                      placeholder="สูบบุรี่, ดื่มหนัก, ไม่รักสัตว์, ไม่ซื่อสัตย์"
                      onChange={(e) => handleFormChange('dealBreakers', e.target.value.split(',').map(item => item.trim()))}
                    />
                  </div>
                </div>
              </section>

              {/* ปุ่มบันทึก */}
              <div className="flex justify-end gap-3 pt-4 border-t border-amber-500/20">
                <Button 
                  variant="outline" 
                  className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                  onClick={() => setEditModalOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button 
                  variant="premium"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold"
                  onClick={() => {
                    console.log('Saving profile data:', editFormData);
                    // แก้ไขเป็นการเรียกใช้ฟังก์ชันโดยไม่ส่งพารามิเตอร์ เพราะข้อมูลอยู่ใน state แล้ว
                    handleEditProfile();
                  }}
                >
                  <Check size={16} className="mr-2" />
                  บันทึกการเปลี่ยนแปลง
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Modal */}
      {chatModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
            <h3 className="text-xl font-medium text-slate-800 mb-4 flex items-center gap-2">
              <MessageCircle size={20} className="text-blue-500" />
              ส่งข้อความถึง {profile.firstName}
            </h3>
            
            <div className="space-y-4">
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                placeholder="พิมพ์ข้อความของคุณที่นี่..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              ></textarea>
              
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                  onClick={() => setChatModalOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                >
                  ส่งข้อความ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
