import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateFavicons() {
  const publicDir = path.join(process.cwd(), 'public');

  // Create a simple canvas with the fire emoji
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#FFF8F0" rx="80"/>
      <text x="256" y="380" font-size="320" text-anchor="middle" font-family="Arial">🔥</text>
    </svg>
  `;

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
