import fs from 'fs';
import { iconData } from '../src/utils/icons';

// Function to convert base64 to buffer
function base64ToBuffer(base64: string) {
  return Buffer.from(base64.split(',')[1], 'base64');
}

// Create icons directory if it doesn't exist
if (!fs.existsSync('public/icons')) {
  fs.mkdirSync('public/icons', { recursive: true });
}

// Save each icon
Object.entries(iconData).forEach(([name, data]) => {
  const buffer = base64ToBuffer(data);
  fs.writeFileSync(`public/icons/${name}.png`, buffer);
});

console.log('Icons created successfully!'); 