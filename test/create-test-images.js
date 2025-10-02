import { PNG } from 'pngjs';
import { createWriteStream } from 'fs';

// Create test image 1 - red square
const img1 = new PNG({ width: 100, height: 100 });
for (let y = 0; y < 100; y++) {
  for (let x = 0; x < 100; x++) {
    const idx = (100 * y + x) << 2;
    img1.data[idx] = 255;     // red
    img1.data[idx + 1] = 0;   // green
    img1.data[idx + 2] = 0;   // blue
    img1.data[idx + 3] = 255; // alpha
  }
}

// Create test image 2 - mostly red with some blue pixels
const img2 = new PNG({ width: 100, height: 100 });
for (let y = 0; y < 100; y++) {
  for (let x = 0; x < 100; x++) {
    const idx = (100 * y + x) << 2;
    // Make center 20x20 area blue
    if (x >= 40 && x < 60 && y >= 40 && y < 60) {
      img2.data[idx] = 0;       // red
      img2.data[idx + 1] = 0;   // green
      img2.data[idx + 2] = 255; // blue
    } else {
      img2.data[idx] = 255;     // red
      img2.data[idx + 1] = 0;   // green
      img2.data[idx + 2] = 0;   // blue
    }
    img2.data[idx + 3] = 255;   // alpha
  }
}

// Save images
img1.pack().pipe(createWriteStream('test/image1.png'));
img2.pack().pipe(createWriteStream('test/image2.png'));

console.log('Test images created:');
console.log('  test/image1.png - 100x100 red square');
console.log('  test/image2.png - 100x100 red square with 20x20 blue center');