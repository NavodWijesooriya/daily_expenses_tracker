import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcTarget = buf.subarray(4, 8 + len);
  const crcVal = crc32(crcTarget);
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

function generatePNG(width, height, isMaskable = false) {
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  const cx = width / 2;
  const cy = height / 2;
  const rCorner = width * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Calculate background or icon shapes
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default dark theme background with hint of brand: #180415
      let r = 24;
      let g = 4;
      let b = 21;
      let a = 255;

      // Inside wallet area
      const inWalletBody = Math.abs(dx) < width * 0.32 && dy > -height * 0.05 && dy < height * 0.28;
      const inWalletFlap = Math.abs(dx) < width * 0.32 && dy >= -height * 0.12 && dy <= -height * 0.05;
      const inCoin = Math.sqrt(Math.pow(dx - width * 0.04, 2) + Math.pow(dy + height * 0.18, 2)) < width * 0.12;
      const inClasp = Math.abs(dx - width * 0.18) < width * 0.08 && Math.abs(dy - height * 0.1) < height * 0.05;

      if (inCoin) {
        // Bright #ff70df / #ff38ce
        r = 255;
        g = 112;
        b = 223;
      } else if (inClasp) {
        r = 255;
        g = 56;
        b = 206;
      } else if (inWalletFlap) {
        r = 255;
        g = 56;
        b = 206;
      } else if (inWalletBody) {
        r = 50;
        g = 12;
        b = 42;
      } else {
        // Corner squircle rounding for non-maskable icons
        if (!isMaskable) {
          const cornerDistX = Math.max(0, Math.abs(dx) - (cx - rCorner));
          const cornerDistY = Math.max(0, Math.abs(dy) - (cy - rCorner));
          if (Math.hypot(cornerDistX, cornerDistY) > rCorner) {
            a = 0;
            r = 0;
            g = 0;
            b = 0;
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // deflate
  ihdrData[11] = 0; // filter none
  ihdrData[12] = 0; // non-interlaced
  const ihdrChunk = createChunk('IHDR', ihdrData);

  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), generatePNG(192, 192, false));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), generatePNG(512, 512, false));
fs.writeFileSync(path.join(iconsDir, 'maskable-icon.png'), generatePNG(512, 512, true));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));

console.log('PWA icons created successfully in public/icons/');
