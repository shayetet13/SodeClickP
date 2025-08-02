const fs = require('fs');
const path = require('path');

// สร้างโฟลเดอร์ uploads/avatar ถ้ายังไม่มี
const avatarDir = path.join(__dirname, 'uploads', 'avatar');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
  console.log('📁 Created uploads/avatar directory');
}

// สร้าง default.png จาก base64
const defaultAvatarBase64 = `iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;

// สร้าง SVG avatar ที่สวยกว่า
const defaultAvatarSVG = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="50" fill="#92400e"/>
  <circle cx="50" cy="35" r="15" fill="#fff"/>
  <path d="M25 85c0-13.8 11.2-25 25-25s25 11.2 25 25v10H25v-10z" fill="#fff"/>
</svg>`;

try {
  // สร้าง default.png
  const defaultPngPath = path.join(avatarDir, 'default.png');
  fs.writeFileSync(defaultPngPath, Buffer.from(defaultAvatarBase64, 'base64'));
  console.log('✅ Created default.png');

  // สร้าง default.svg ที่สวยกว่า
  const defaultSvgPath = path.join(avatarDir, 'default.svg');
  fs.writeFileSync(defaultSvgPath, defaultAvatarSVG);
  console.log('✅ Created default.svg');

  console.log('📁 Avatar files created successfully!');
} catch (error) {
  console.error('❌ Error creating avatar files:', error);
}


