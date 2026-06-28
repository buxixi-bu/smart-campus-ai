const fs = require('fs');
const path = require('path');

const tabsDir = path.join(__dirname, '../src/static/tabs');

const icons = {
  'home': { normal: '#999999', active: '#4F7CFF' },
  'chat': { normal: '#999999', active: '#4F7CFF' },
  'writer': { normal: '#999999', active: '#4F7CFF' },
  'analysis': { normal: '#999999', active: '#4F7CFF' }
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function createPNG(width, height, color) {
  const rgb = hexToRgb(color);
  const png = [];
  
  png.push(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
  
  const ihdr = [
    (width >> 24) & 0xFF, (width >> 16) & 0xFF, (width >> 8) & 0xFF, width & 0xFF,
    (height >> 24) & 0xFF, (height >> 16) & 0xFF, (height >> 8) & 0xFF, height & 0xFF,
    8, 2, 0, 0, 0
  ];
  const ihdrCrc = crc32([0x49, 0x48, 0x44, 0x52, ...ihdr]);
  png.push(0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, ...ihdr, ...intToBytes(ihdrCrc));
  
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      rawData.push(rgb.r, rgb.g, rgb.b);
    }
  }
  
  const deflated = deflate(rawData);
  const idatCrc = crc32([0x49, 0x44, 0x41, 0x54, ...deflated]);
  const len = deflated.length;
  png.push((len >> 24) & 0xFF, (len >> 16) & 0xFF, (len >> 8) & 0xFF, len & 0xFF);
  png.push(0x49, 0x44, 0x41, 0x54, ...deflated, ...intToBytes(idatCrc));
  
  const iendCrc = crc32([0x49, 0x45, 0x4E, 0x44]);
  png.push(0, 0, 0, 0, 0x49, 0x45, 0x4E, 0x44, ...intToBytes(iendCrc));
  
  return Buffer.from(png);
}

function intToBytes(val) {
  return [(val >> 24) & 0xFF, (val >> 16) & 0xFF, (val >> 8) & 0xFF, val & 0xFF];
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function deflate(data) {
  const result = [0x78, 0x01];
  const blockSize = 65535;
  
  for (let i = 0; i < data.length; i += blockSize) {
    const block = data.slice(i, Math.min(i + blockSize, data.length));
    const isLast = i + blockSize >= data.length;
    result.push(isLast ? 1 : 0);
    const len = block.length;
    result.push(len & 0xFF, (len >> 8) & 0xFF, (~len) & 0xFF, ((~len) >> 8) & 0xFF);
    result.push(...block);
  }
  
  let a = 1, b = 0;
  for (const byte of data) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  const adler = ((b << 16) | a) >>> 0;
  result.push((adler >> 24) & 0xFF, (adler >> 16) & 0xFF, (adler >> 8) & 0xFF, adler & 0xFF);
  
  return result;
}

if (!fs.existsSync(tabsDir)) {
  fs.mkdirSync(tabsDir, { recursive: true });
}

for (const [name, colors] of Object.entries(icons)) {
  const normalPng = createPNG(48, 48, colors.normal);
  const activePng = createPNG(48, 48, colors.active);
  
  fs.writeFileSync(path.join(tabsDir, `${name}.png`), normalPng);
  fs.writeFileSync(path.join(tabsDir, `${name}-active.png`), activePng);
  
  console.log(`Created ${name}.png and ${name}-active.png`);
}

console.log('All icons generated successfully!');
