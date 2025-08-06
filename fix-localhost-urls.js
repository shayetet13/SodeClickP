const fs = require('fs');
const path = require('path');

// ฟังก์ชันสำหรับค้นหาและแทนที่ localhost:5000 ในไฟล์
function replaceLocalhostInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // แทนที่ localhost:5000 ด้วย API_BASE_URL
    content = content.replace(/http:\/\/localhost:5000/g, '${API_BASE_URL}');
    
    // ถ้ามีการเปลี่ยนแปลง ให้บันทึกไฟล์
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// ฟังก์ชันสำหรับค้นหาไฟล์ .jsx และ .js ในโฟลเดอร์
function findAndFixFiles(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      fixedCount += findAndFixFiles(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      // ข้ามไฟล์ที่มี backup, copy, หรือ fixed ในชื่อ
      const fileName = file.toLowerCase();
      if (fileName.includes('backup') || fileName.includes('copy') || fileName.includes('fixed')) {
        console.log(`⏭️  Skipped backup/copy file: ${filePath}`);
        continue;
      }
      if (replaceLocalhostInFile(filePath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

// เริ่มการแก้ไข
console.log('🔧 Starting to fix localhost:5000 URLs...');
console.log('⏭️  Skipping backup/copy files...');
const fixedCount = findAndFixFiles('./Frontend/src');
console.log(`✅ Fixed ${fixedCount} files`);
console.log('🎉 Done! All localhost:5000 URLs have been replaced with API_BASE_URL'); 