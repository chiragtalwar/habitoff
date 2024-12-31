import { createCanvas } from 'canvas';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a 512x512 canvas (we'll resize it later for different icon sizes)
const canvas = createCanvas(512, 512);
const ctx = canvas.getContext('2d');

// Set background
ctx.fillStyle = '#0F4435';
ctx.fillRect(0, 0, 512, 512);

// Draw a simple plant
ctx.beginPath();
ctx.moveTo(256, 400); // stem start
ctx.lineTo(256, 200); // stem
ctx.strokeStyle = '#4ade80';
ctx.lineWidth = 20;
ctx.stroke();

// Draw leaves
const drawLeaf = (x, y, angle) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, 80, 30, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#4ade80';
  ctx.fill();
  ctx.restore();
};

// Draw multiple leaves
drawLeaf(256, 300, Math.PI / 4);
drawLeaf(256, 300, -Math.PI / 4);
drawLeaf(256, 250, Math.PI / 3);
drawLeaf(256, 250, -Math.PI / 3);
drawLeaf(256, 200, Math.PI / 2);
drawLeaf(256, 200, -Math.PI / 2);

// Save the logo
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(join(__dirname, '../src/assets/logo.png'), buffer);
console.log('Logo created successfully!'); 