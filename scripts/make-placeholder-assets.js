/* eslint-disable */
// Generates tiny placeholder PNGs for icon / adaptive-icon / splash / favicon so
// `expo start` doesn't error on missing files. The shapes are documented SVGs
// in assets/SOURCE.svg — these PNGs are minimal stand-ins. Replace before submission.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function makePng(width, height, rgba) {
  const sigBytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  function chunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([length, typeBuf, data, crc]);
  }
  function crc32(buf) {
    let c;
    const table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    return (crc ^ 0xffffffff) >>> 0;
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;     // bit depth
  ihdr[9] = 6;     // color type RGBA
  ihdr[10] = 0;    // compression
  ihdr[11] = 0;    // filter
  ihdr[12] = 0;    // interlace
  const rows = [];
  for (let y = 0; y < height; y++) {
    rows.push(Buffer.from([0])); // filter type none
    const row = Buffer.alloc(width * 4);
    for (let x = 0; x < width; x++) {
      const o = x * 4;
      // simple gradient + subtle grid for a "lattice" feel
      const gx = Math.floor((x / width) * 255);
      const gy = Math.floor((y / height) * 255);
      const onGrid = x % Math.max(1, Math.floor(width / 4)) === 0 || y % Math.max(1, Math.floor(height / 4)) === 0;
      row[o] = onGrid ? 122 : Math.max(rgba[0], gx / 2);
      row[o + 1] = onGrid ? 167 : Math.max(rgba[1], gy / 2);
      row[o + 2] = onGrid ? 255 : Math.max(rgba[2], (gx + gy) / 4);
      row[o + 3] = rgba[3];
    }
    rows.push(row);
  }
  const raw = Buffer.concat(rows);
  const idat = zlib.deflateSync(raw);
  const png = Buffer.concat([
    sigBytes,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  return png;
}

const outDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(outDir, { recursive: true });
const bgRGBA = [11, 14, 20, 255];
fs.writeFileSync(path.join(outDir, 'icon.png'), makePng(1024, 1024, bgRGBA));
fs.writeFileSync(path.join(outDir, 'adaptive-icon.png'), makePng(1024, 1024, bgRGBA));
fs.writeFileSync(path.join(outDir, 'splash.png'), makePng(1242, 2436, bgRGBA));
fs.writeFileSync(path.join(outDir, 'favicon.png'), makePng(48, 48, bgRGBA));
console.log('wrote placeholder assets');
