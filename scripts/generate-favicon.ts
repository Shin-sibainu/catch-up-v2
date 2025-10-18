import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateFavicons() {
  const publicDir = path.join(process.cwd(), 'public');

  // Read the existing favicon.svg
  const svgPath = path.join(publicDir, 'favicon.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf-8');

  // Create higher resolution version for better quality
  const svg = svgContent
    .replace('viewBox="0 0 100 100"', 'width="512" height="512" viewBox="0 0 100 100"');

  const buffer = Buffer.from(svg);

  // Generate favicon.ico (32x32)
  await sharp(buffer)
    .resize(32, 32)
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('✅ Generated favicon.ico');

  // Generate apple-touch-icon.png (180x180)
  await sharp(buffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('✅ Generated apple-touch-icon.png');

  // Generate larger favicon for modern browsers (192x192)
  await sharp(buffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'favicon-192.png'));

  console.log('✅ Generated favicon-192.png');

  // Generate larger favicon for modern browsers (512x512)
  await sharp(buffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'favicon-512.png'));

  console.log('✅ Generated favicon-512.png');
}

generateFavicons()
  .then(() => {
    console.log('🎉 All favicons generated successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  });
