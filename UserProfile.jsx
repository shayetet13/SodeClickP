import React, { useState, useEffect } from 'react';
import { getUserProfile, updateProfile } from '../services/api';
import EditProfileModal from './EditProfileModal';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await getUserProfile();
        setProfile(userProfile);
        
        // Fetch photos if profile is loaded
        if (userProfile?._id) {
          fetchPhotos(userProfile._id);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const fetchPhotos = async (userId) => {
    try {
      setPhotosLoading(true);
      const response = await fetch(`/api/profile/photos/${userId}`);
      if (response.ok) {
        const photosData = await response.json();
        setPhotos(photosData);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      // Don't set error state for photos, just log it
    } finally {
      setPhotosLoading(false);
    }
  };

  const getAvatarUrl = () => {
    if (profile?.avatar) {
      // Try the profile avatar first
      return profile.avatar;
    }
    if (photos && photos.length > 0) {
      // Use first photo as avatar if available
      return photos[0].url;
    }
    // Fallback to a default avatar
    return '/images/default-avatar.png';
  };

  const handleImageError = (e) => {
    // Set fallback image when image fails to load
    e.target.src = '/images/default-avatar.png';
    e.target.onerror = null; // Prevent infinite loop
  };

  const handleEditProfile = async (updatedData) => {
    try {
      console.log('Sending update data:', updatedData);
      const updatedProfile = await updateProfile(updatedData);
      console.log('Update response:', updatedProfile);
      
      // Always update profile state with the updated data
      setProfile(updatedData); // Use the data we sent, since it's the most current
      setIsEditModalOpen(false);
      setError(''); // Clear any previous errors
      console.log('Profile updated successfully');
      
      // Optional: Fetch fresh data from server to ensure sync
      try {
        const freshProfile = await getUserProfile();
        setProfile(freshProfile);
      } catch (fetchError) {
        console.warn('Could not fetch fresh profile, using local data:', fetchError);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Try to refresh profile data even if update failed
      try {
        const freshProfile = await getUserProfile();
        setProfile(freshProfile);
      } catch (fetchError) {
        console.error('Failed to fetch fresh profile:', fetchError);
      }
      
      setError('เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์ กรุณาลองใหม่อีกครั้ง');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error && !profile) {
    return <div className="error-message" style={{color: 'red'}}>{error}</div>;
  }

  return (
    <div className="user-profile">
      <h1>โปรไฟล์ของฉัน</h1>
      
      {error && <div className="error-message" style={{color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffe6e6', border: '1px solid #ff9999', borderRadius: '4px'}}>{error}</div>}
      
      <div className="profile-header" style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px'}}>
        <div className="avatar-container">
          <img 
            src={getAvatarUrl()} 
            alt="Profile Avatar"
            onError={handleImageError}
            style={{
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '2px solid #ddd'
            }}
          />
        </div>
        <div className="profile-summary">
          <h2>{profile?.firstName} {profile?.lastName}</h2>
          <p>{profile?.age ? `${profile.age} ปี` : ''} {profile?.location ? `• ${profile.location}` : ''}</p>
        </div>
      </div>
      
      <div className="profile-details">
        <p>ชื่อ: {profile?.firstName || 'ไม่ระบุ'} {profile?.lastName || ''}</p>
        <p>อีเมล: {profile?.email || 'ไม่ระบุ'}</p>
        <p>อายุ: {profile?.age || 'ไม่ระบุ'}</p>
        <p>สถานที่: {profile?.location || 'ไม่ระบุ'}</p>
        <p>อาชีพ: {profile?.occupation || 'ไม่ระบุ'}</p>
        <p>การศึกษา: {profile?.education || 'ไม่ระบุ'}</p>
        <p>เกี่ยวกับฉัน: {profile?.bio || 'ไม่ระบุ'}</p>
        <p>ส่วนสูง: {profile?.personalDetails?.height ? `${profile.personalDetails.height} ซม.` : 'ไม่ระบุ'}</p>
        <p>รูปร่าง: {profile?.personalDetails?.bodyType || 'ไม่ระบุ'}</p>
        <p>การออกกำลังกาย: {profile?.personalDetails?.exercise || 'ไม่ระบุ'}</p>
        <p>สัตว์เลี้ยง: {profile?.lifeStyle?.pets || 'ไม่ระบุ'}</p>
        <p>อาหาร: {profile?.lifeStyle?.diet || 'ไม่ระบุ'}</p>
        <p>ศาสนา: {profile?.lifeStyle?.religion || 'ไม่ระบุ'}</p>
        <p>ราศี: {profile?.lifeStyle?.zodiac || 'ไม่ระบุ'}</p>
        <p>MBTI: {profile?.lifeStyle?.mbti || 'ไม่ระบุ'}</p>
        <p>การสูบบุหรี่: {profile?.personalDetails?.smoking || 'ไม่ระบุ'}</p>
        <p>การดื่มสุรา: {profile?.personalDetails?.drinking || 'ไม่ระบุ'}</p>
        <p>บุตร: {profile?.personalDetails?.children || 'ไม่ระบุ'}</p>
        <p>ภาษา: {profile?.personalDetails?.languages?.join(', ') || 'ไม่ระบุ'}</p>
        <p>ความสนใจ: {profile?.interests?.join(', ') || 'ไม่ระบุ'}</p>
        <p>กำลังมองหา: {profile?.lookingFor?.join(', ') || 'ไม่ระบุ'}</p>
        <p>ประเภทความสัมพันธ์: {profile?.relationshipPreferences?.relationshipType || 'ไม่ระบุ'}</p>
        <p>ช่วงอายุที่สนใจ: {
          profile?.relationshipPreferences?.ageRange?.min && profile?.relationshipPreferences?.ageRange?.max 
            ? `${profile.relationshipPreferences.ageRange.min}-${profile.relationshipPreferences.ageRange.max} ปี`
            : 'ไม่ระบุ'
        }</p>
        <p>สถานที่ที่สนใจ: {profile?.relationshipPreferences?.location || 'ไม่ระบุ'}</p>
        <p>สิ่งที่ไม่ชอบ: {profile?.relationshipPreferences?.dealBreakers?.join(', ') || 'ไม่ระบุ'}</p>
      </div>

      {photos.length > 0 && (
        <div className="profile-photos" style={{marginTop: '20px'}}>
          <h3>รูปภาพ</h3>
          <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
            {photos.map((photo, index) => (
              <img 
                key={index}
                src={photo.url} 
                alt={`Profile ${index + 1}`}
                onError={handleImageError}
                style={{
                  width: '100px', 
                  height: '100px', 
                  objectFit: 'cover', 
                  borderRadius: '8px'
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsEditModalOpen(true)}
        className="edit-profile-btn"
      >
        แก้ไขโปรไฟล์
      </button>

      <EditProfileModal
        profile={profile}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditProfile}
      />
    </div>
  );
};

export default UserProfile;