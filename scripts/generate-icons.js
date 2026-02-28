import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const inputFile = path.join(__dirname, '../public/favicon.png');
  const outputDir = path.join(__dirname, '../public');

  for (const size of sizes) {
    await sharp(inputFile)
      .resize(size, size)
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`Generated ${size}x${size} icon`);
  }
}

generateIcons().catch(console.error);