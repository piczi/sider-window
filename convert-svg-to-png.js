const fs = require('fs');
const path = require('path');
const { createCanvas, Image } = require('canvas');

// 确保icons目录存在
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 读取SVG文件
const svgPath = path.join(iconsDir, 'icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

// 要生成的尺寸
const sizes = [16, 48, 128];

// 为每个尺寸生成PNG
sizes.forEach(size => {
  // 创建Canvas
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // 加载SVG
  const img = new Image();
  img.onload = () => {
    // 绘制到Canvas
    ctx.drawImage(img, 0, 0, size, size);
    
    // 保存为PNG
    const pngPath = path.join(iconsDir, `icon-${size}.png`);
    const out = fs.createWriteStream(pngPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => console.log(`生成了 ${size}x${size} 的PNG图标: ${pngPath}`));
  };
  
  // 设置SVG源
  img.src = Buffer.from(svgContent);
});
