#!/usr/bin/env node

/**
 * Simple App Icon Generator for Sweat24
 * 
 * This script creates a basic app icon with "S24" text
 * Run: node generate-app-icons.js
 */

const fs = require('fs');
const path = require('path');

// Icon sizes for Android
const androidSizes = [
  { name: 'mipmap-mdpi', size: 48 },
  { name: 'mipmap-hdpi', size: 72 },
  { name: 'mipmap-xhdpi', size: 96 },
  { name: 'mipmap-xxhdpi', size: 144 },
  { name: 'mipmap-xxxhdpi', size: 192 }
];

// Create a simple SVG icon
function createSVGIcon(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#7C3AED" rx="${size * 0.2}"/>
  
  <!-- Text -->
  <text x="50%" y="50%" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.35}" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="middle">
    S24
  </text>
</svg>`;
}

// Generate icons
console.log('Generating app icons for Sweat24...\n');

androidSizes.forEach(({ name, size }) => {
  const svg = createSVGIcon(size);
  const outputPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', name);
  const fileName = 'ic_launcher.svg';
  
  // Ensure directory exists
  if (!fs.existsSync(outputPath)) {
    console.log(`Directory ${name} not found, skipping...`);
    return;
  }
  
  // Write SVG file (you'll need to convert to PNG manually or use a library)
  fs.writeFileSync(path.join(outputPath, fileName), svg);
  console.log(`✓ Created ${name}/ic_launcher.svg (${size}x${size})`);
});

console.log('\n📌 Note: You need to convert these SVG files to PNG format.');
console.log('   You can use online tools or image editing software.');
console.log('   Alternatively, install sharp: npm install sharp');