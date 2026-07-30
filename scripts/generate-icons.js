import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve(process.cwd(), 'public');
const iconsDir = path.resolve(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Locate the authentic Currylicious logo image
const logoPath = path.resolve(process.cwd(), 'src/assets/images/currylicious_logo_1785234718076.jpg');

async function generateIcons() {
  console.log('Generating PWA icons from real Currylicious logo image...');

  if (!fs.existsSync(logoPath)) {
    throw new Error(`Logo file not found at ${logoPath}`);
  }

  const logoBuffer = fs.readFileSync(logoPath);

  // 1. Standard 192x192 PNG for Android / PWA
  await sharp(logoBuffer)
    .resize(192, 192, { fit: 'cover' })
    .png()
    .toFile(path.resolve(iconsDir, 'icon-192.png'));

  // 2. Standard 512x512 PNG for Android / Desktop PWA
  await sharp(logoBuffer)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(path.resolve(iconsDir, 'icon-512.png'));

  // 3. Apple Touch Icon (180x180) for iPhone/iPad Home Screen
  await sharp(logoBuffer)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.resolve(publicDir, 'apple-touch-icon.png'));

  // 4. Maskable 512x512 PNG with safe margin for adaptive launcher icons
  await sharp(logoBuffer)
    .resize(410, 410, { fit: 'cover' })
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 192, g: 86, b: 33, alpha: 1 } // #C05621 (Currylicious theme color)
    })
    .png()
    .toFile(path.resolve(iconsDir, 'maskable-512.png'));

  // 5. Favicon PNG 32x32 for browser tabs
  await sharp(logoBuffer)
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(path.resolve(publicDir, 'favicon-32x32.png'));

  // 6. Favicon PNG 512x512 directly in public for fallback
  await sharp(logoBuffer)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(path.resolve(publicDir, 'logo.png'));

  console.log('PWA icons successfully generated from official logo!');
}

generateIcons().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});

