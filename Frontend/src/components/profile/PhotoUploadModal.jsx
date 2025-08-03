import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Image, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

export const PhotoUploadModal = ({ isOpen, onClose, userId, onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // ตรวจสอบว่าเป็นไฟล์รูปภาพ
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB ต่อไฟล์)
    const validFiles = imageFiles.filter(file => file.size <= 5 * 1024 * 1024);
    
    if (validFiles.length !== files.length) {
      setError('บางไฟล์ไม่ถูกเลือกเนื่องจากไม่ใช่รูปภาพหรือมีขนาดเกิน 5MB');
    }
    
    // สร้าง preview URLs
    const newFiles = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(2),
      preview: URL.createObjectURL(file)
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
    
    // รีเซ็ต input เพื่อสามารถเลือกไฟล์เดิมซ้ำได้
    e.target.value = '';
  };
  
  const removeFile = (id) => {
    setSelectedFiles(prev => {
      const filteredFiles = prev.filter(file => file.id !== id);
      // ลบ object URL เพื่อป้องกัน memory leak
      const fileToRemove = prev.find(file => file.id === id);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return filteredFiles;
    });
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setError(null);
    
    const uploadedPhotos = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const { file, id } = selectedFiles[i];
      
      // อัพเดตสถานะเป็น "กำลังอัปโหลด"
      setUploadProgress(prev => ({ ...prev, [id]: 0 }));
      setUploadStatus(prev => ({ ...prev, [id]: 'uploading' }));
      
      try {
        const formData = new FormData();
        formData.append('photos', file);
        
        // ทำการอัปโหลดไฟล์
        const response = await fetch(`http://localhost:5000/api/photos/${userId}`, {
          method: 'POST',
          body: formData,
          // สามารถใช้ Fetch API Event ในการติดตามความคืบหน้าได้หากต้องการ
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'อัปโหลดไม่สำเร็จ');
        }
        
        const data = await response.json();
        
        // อัพเดตสถานะเป็น "สำเร็จ"
        setUploadProgress(prev => ({ ...prev, [id]: 100 }));
        setUploadStatus(prev => ({ ...prev, [id]: 'success' }));
        
        // เพิ่มรูปภาพที่อัปโหลดสำเร็จลงในรายการ
        if (data.files && data.files.length > 0) {
          uploadedPhotos.push(...data.files.map(file => ({
            id: file.filename,
            path: file.path,
            isProfile: false
          })));
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        
        // อัพเดตสถานะเป็น "ล้มเหลว"
        setUploadProgress(prev => ({ ...prev, [id]: 0 }));
        setUploadStatus(prev => ({ ...prev, [id]: 'error' }));
        setError(`เกิดข้อผิดพลาดในการอัปโหลด: ${error.message}`);
      }
    }
    
    setUploading(false);
    
    // หากมีรูปภาพที่อัปโหลดสำเร็จอย่างน้อย 1 รูป
    if (uploadedPhotos.length > 0) {
      onUploadSuccess(uploadedPhotos);
    }
  };
  
  const clearAll = () => {
    // ลบ object URLs เพื่อป้องกัน memory leak
    selectedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    
    setSelectedFiles([]);
    setUploadProgress({});
    setUploadStatus({});
    setError(null);
  };
  
  // ฟังก์ชันแสดงสถานะการอัปโหลด
  const getStatusIcon = (id) => {
    const status = uploadStatus[id];
    if (status === 'uploading') {
      const progress = uploadProgress[id] || 0;
      return <div className="h-5 w-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />;
    } else if (status === 'success') {
      return <CheckCircle size={20} className="text-green-400" />;
    } else if (status === 'error') {
      return <AlertCircle size={20} className="text-red-400" />;
    }
    return null;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-zinc-900 to-black border border-amber-500/30 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-400 font-serif">เพิ่มรูปภาพ</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {/* Drop zone หรือ File input */}
          <div 
            className="border-2 border-dashed border-amber-500/30 rounded-xl p-8 text-center cursor-pointer hover:border-amber-500/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <Image size={48} className="text-amber-500/50 mb-3" />
              <p className="text-zinc-300 text-lg font-medium mb-2">คลิกเพื่อเลือกรูปภาพ</p>
              <p className="text-zinc-500 text-sm">หรือลากและวางรูปภาพที่นี่</p>
              <p className="text-zinc-500 text-xs mt-2">รองรับ JPG, PNG, GIF ขนาดไม่เกิน 5MB ต่อไฟล์</p>
            </div>
          </div>
          
          {/* แสดงข้อผิดพลาด */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {/* Preview รูปภาพที่เลือก */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-zinc-300">รูปภาพที่เลือก ({selectedFiles.length})</h3>
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-zinc-400 hover:text-white">
                  ล้างทั้งหมด
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedFiles.map(({ id, preview }) => (
                  <div key={id} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg border border-zinc-700">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* สถานะการอัปโหลด */}
                    <div className="absolute top-2 right-2">
                      {getStatusIcon(id)}
                    </div>
                    
                    {/* ปุ่มลบ */}
                    <button
                      className="absolute top-2 left-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(id);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            ยกเลิก
          </Button>
          <Button 
            variant="default"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            className="gap-2"
          >
            {uploading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                กำลังอัปโหลด...
              </>
            ) : (
              <>
                <Upload size={16} />
                อัปโหลด {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
