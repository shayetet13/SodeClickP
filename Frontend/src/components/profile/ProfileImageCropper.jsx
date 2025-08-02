import React, { useState, useCallback, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Scissors, RotateCw, Save, ZoomIn, ZoomOut, Move } from 'lucide-react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export const ProfileImageCropper = ({ isOpen, onClose, image, onCropComplete, aspectRatio = 1 }) => {
  const [crop, setCrop] = useState();
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [completedCrop, setCompletedCrop] = useState(null);
  
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  
  // ฟังก์ชันสำหรับตั้งค่า crop เริ่มต้นเมื่อโหลดรูปภาพ
  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    
    // ทำให้ crop อยู่ตรงกลางและมี aspect ratio ตามที่กำหนด
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(crop);
  }, [aspectRatio]);
  
  // ฟังก์ชันสำหรับหมุนรูปภาพ
  const handleRotate = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };
  
  // ฟังก์ชันสำหรับปรับขนาด (zoom)
  const handleScaleChange = (value) => {
    setScale(value / 100);
  };
  
  // ฟังก์ชันสำหรับ render preview
  const updatePreview = useCallback(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }
    
    const img = imgRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return;
    }
    
    // ตั้งค่าขนาดของ canvas ตาม crop
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    
    const pixelRatio = window.devicePixelRatio || 1;
    
    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;
    
    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';
    
    // คำนวณจุดศูนย์กลางของรูปภาพ
    const centerX = img.width / 2;
    const centerY = img.height / 2;
    
    // บันทึกสถานะของ canvas
    ctx.save();
    
    // แปลงค่าเพื่อหมุนรูปภาพ
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    
    // วาดรูปภาพลงบน canvas
    ctx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      0,
      0,
      img.width,
      img.height
    );
    
    // คืนค่าสถานะของ canvas
    ctx.restore();
    
    // ตัดส่วนที่ต้องการจากรูปภาพ
    const croppedImageData = ctx.getImageData(
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );
    
    // ล้าง canvas และวาดส่วนที่ตัดแล้ว
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    ctx.putImageData(croppedImageData, 0, 0);
  }, [completedCrop, rotation, scale]);
  
  // อัพเดต preview เมื่อ crop, rotation, หรือ scale เปลี่ยนแปลง
  React.useEffect(() => {
    updatePreview();
  }, [updatePreview]);
  
  // ฟังก์ชันสำหรับบันทึกรูปภาพที่ตัดแล้ว
  const handleSave = () => {
    if (!previewCanvasRef.current) {
      return;
    }
    
    const canvas = previewCanvasRef.current;
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedImageUrl);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-zinc-900 to-black border border-amber-500/30 max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-400 font-serif">ปรับแต่งรูปภาพ</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* ส่วนควบคุมการปรับแต่งรูปภาพ */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              variant="outline" 
              className="gap-2 text-amber-400" 
              onClick={handleRotate}
            >
              <RotateCw size={16} /> หมุน 90°
            </Button>
            
            <div className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-lg">
              <ZoomOut size={16} className="text-zinc-400" />
              <Slider
                value={[scale * 100]}
                onValueChange={([value]) => handleScaleChange(value)}
                min={50}
                max={200}
                step={1}
                className="w-32"
              />
              <ZoomIn size={16} className="text-zinc-400" />
            </div>
          </div>
          
          {/* ReactCrop component */}
          <div className="flex justify-center">
            <div className="relative max-w-full max-h-[60vh] overflow-hidden rounded-lg border border-amber-500/20">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                className="max-h-[60vh]"
              >
                <img
                  ref={imgRef}
                  alt="ปรับแต่งรูปภาพ"
                  src={image}
                  style={{
                    transform: `rotate(${rotation}deg) scale(${scale})`,
                    transformOrigin: 'center',
                    maxHeight: '60vh',
                    width: 'auto'
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>
          </div>
          
          {/* Preview and canvas (hidden) */}
          <div className="flex justify-center">
            <div className="relative">
              <h3 className="text-sm font-medium text-amber-400 mb-2">ตัวอย่าง</h3>
              <div className="w-32 h-32 border border-amber-500/30 rounded-lg overflow-hidden bg-zinc-800 flex items-center justify-center">
                {completedCrop ? (
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full max-h-full"
                    style={{
                      objectFit: 'contain',
                      width: completedCrop.width,
                      height: completedCrop.height
                    }}
                  />
                ) : (
                  <span className="text-zinc-500 text-xs text-center px-2">ตัดภาพเพื่อดูตัวอย่าง</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={onClose}
            >
              ยกเลิก
            </Button>
            <Button 
              variant="default" 
              className="gap-2" 
              onClick={handleSave}
              disabled={!completedCrop}
            >
              <Save size={16} /> บันทึก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
