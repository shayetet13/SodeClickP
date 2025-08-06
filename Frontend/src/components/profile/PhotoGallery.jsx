import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { X, Edit, Star, Image } from 'lucide-react';

export const PhotoGallery = ({ 
  photos, 
  isOwner, 
  onDelete, 
  onSetProfilePhoto, 
  onEdit,
  onUpload
}) => {
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // กลุ่มรูปภาพตาม "กลุ่ม" (แบ่งตาม columns - 3 columns = 3 กลุ่ม)
  const groupedPhotos = photos.reduce((result, photo, index) => {
    const groupIndex = index % 3;
    if (!result[groupIndex]) {
      result[groupIndex] = [];
    }
    result[groupIndex].push(photo);
    return result;
  }, []);
  
  const handleDeleteClick = (photoId) => {
    setConfirmDelete(photoId);
  };
  
  const confirmDeleteAction = () => {
    if (confirmDelete) {
      onDelete(confirmDelete);
      setConfirmDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setConfirmDelete(null);
  };
  
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-dashed border-amber-500/30 rounded-xl">
        <Image size={48} className="text-amber-500/50 mb-4" />
        <p className="text-zinc-400 mb-4">ยังไม่มีรูปภาพในโปรไฟล์</p>
        {isOwner && (
          <Button onClick={onUpload} className="gap-2">
            <Image size={16} /> เพิ่มรูปภาพแรกของคุณ
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* ใช้ CSS Grid สำหรับการแสดงภาพแบบ Masonry (Pinterest-like) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {groupedPhotos.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-4">
            {column.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg border border-amber-500/30">
                  <img 
                    src={photo.path}
                    alt="User uploaded" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                
                {/* Badge แสดงว่าเป็นรูปโปรไฟล์ */}
                {photo.isProfile && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-black text-xs px-2 py-1 rounded-full">
                    รูปโปรไฟล์
                  </div>
                )}
                
                {/* ปุ่มการจัดการสำหรับเจ้าของโปรไฟล์ */}
                {isOwner && (
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-lg">
                    {/* ปุ่มแก้ไข */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                      onClick={() => onEdit(photo)}
                    >
                      <Edit size={16} />
                    </Button>
                    
                    {/* ปุ่มตั้งเป็นรูปโปรไฟล์ (แสดงเฉพาะรูปที่ไม่ใช่รูปโปรไฟล์) */}
                    {!photo.isProfile && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        onClick={() => onSetProfilePhoto(photo.id)}
                      >
                        <Star size={16} />
                      </Button>
                    )}
                    
                    {/* ปุ่มลบ */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      onClick={() => handleDeleteClick(photo.id)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Confirmation Dialog for Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-zinc-900 border border-red-500/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">ยืนยันการลบรูปภาพ</h3>
              <p className="text-zinc-300 mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={cancelDelete}>
                  ยกเลิก
                </Button>
                <Button variant="destructive" onClick={confirmDeleteAction}>
                  ยืนยันการลบ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
