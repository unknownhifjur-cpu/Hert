import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// ANSI color codes for stylish console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function colorize(text, color) {
  return `${colors[color] || ''}${text}${colors.reset}`;
}

function printProgress(current, total, size) {
  const percent = Math.floor((current / total) * 100);
  const barLength = 30;
  const filled = Math.floor((current / total) * barLength);
  const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
  process.stdout.write(
    `\r${colorize('▶', 'cyan')} Generating ${colorize(size.toString().padEnd(4), 'yellow')} ` +
    `[${colorize(bar, 'green')}] ${colorize(percent.toString().padStart(3) + '%', 'magenta')}`
  );
}

async function generateIcons() {
  console.log(colorize('\n✨ HeartLock PWA Icon Generator ✨', 'bright') + '\n');
  
  const inputFile = path.join(__dirname, '../public/favicon.png');
  
  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(colorize(`❌ Error: Input file not found at ${inputFile}`, 'red'));
    process.exit(1);
  }

  const outputDir = path.join(__dirname, '../public');
  const startTime = Date.now();

  console.log(colorize(`📁 Input:  ${inputFile}`, 'cyan'));
  console.log(colorize(`📁 Output: ${outputDir}`, 'cyan'));
  console.log(colorize(`🔍 Sizes:  ${sizes.join(', ')}`, 'cyan') + '\n');

  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i];
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);

    try {
      printProgress(i + 1, sizes.length, size);
      
      await sharp(inputFile)
        .resize(size, size)
        .toFile(outputFile);
      
      // Small delay to make the progress visible (optional)
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (err) {
      console.error(colorize(`\n❌ Failed to generate ${size}x${size}: ${err.message}`, 'red'));
      process.exit(1);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(colorize(`\n\n✅ Successfully generated ${sizes.length} icons in ${duration}s!`, 'green'));
  console.log(colorize('🎉 Your PWA icons are ready in the public folder.\n', 'magenta'));
}

generateIcons().catch(err => {
  console.error(colorize(`\n❌ Unexpected error: ${err.message}`, 'red'));
  process.exit(1);
});