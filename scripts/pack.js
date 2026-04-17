#!/usr/bin/env node
/**
 * npm run pack
 * Builds CSS then zips the theme into dist/4leafclover-<version>.zip
 * Excludes: node_modules, dist, src, .git, scripts, .gitignore, *.map
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const outFile = path.join(distDir, `4leafclover-${version}.zip`);

// Build CSS
console.log('Building CSS...');
execSync('npx postcss src/main.css -o assets/built/main.css --env production', {
  cwd: root,
  stdio: 'inherit'
});

// Ensure dist exists
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

// Remove previous zip for this version if it exists
if (fs.existsSync(outFile)) fs.unlinkSync(outFile);

// Collect files to zip (everything not excluded)
const EXCLUDE = new Set([
  'node_modules', 'dist', 'src', '.git', 'scripts',
  '.gitignore', '.DS_Store', 'Thumbs.db'
]);

function walk(dir, base) {
  const entries = [];
  for (const name of fs.readdirSync(dir)) {
    if (EXCLUDE.has(name)) continue;
    const abs = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      entries.push(...walk(abs, rel));
    } else {
      entries.push({ abs, rel });
    }
  }
  return entries;
}

const files = walk(root, '');
console.log(`Zipping ${files.length} files → dist/4leafclover-${version}.zip`);

// Use Node's built-in zlib + a minimal ZIP writer (no extra deps)
const { createDeflateRaw } = require('zlib');

function toU16LE(n) { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; }
function toU32LE(n) { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b; }

function dosDateTime(d) {
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  return { date, time };
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = crc32.table || (crc32.table = (() => {
    const t = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t.push(c);
    }
    return t;
  })());
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

async function deflate(buf) {
  return new Promise((resolve, reject) => {
    const deflater = createDeflateRaw({ level: 6 });
    const chunks = [];
    deflater.on('data', c => chunks.push(c));
    deflater.on('end', () => resolve(Buffer.concat(chunks)));
    deflater.on('error', reject);
    deflater.end(buf);
  });
}

async function buildZip() {
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;
  const now = new Date();
  const { date: dosDate, time: dosTime } = dosDateTime(now);

  for (const { abs, rel } of files) {
    const data = fs.readFileSync(abs);
    const crc = crc32(data);
    const compressed = await deflate(data);
    const nameBytes = Buffer.from(rel, 'utf8');

    // Local file header
    const local = Buffer.concat([
      Buffer.from([0x50,0x4B,0x03,0x04]), // signature
      toU16LE(20),           // version needed
      toU16LE(0),            // flags
      toU16LE(8),            // deflate
      toU16LE(dosTime),
      toU16LE(dosDate),
      toU32LE(crc),
      toU32LE(compressed.length),
      toU32LE(data.length),
      toU16LE(nameBytes.length),
      toU16LE(0),            // extra length
      nameBytes,
      compressed
    ]);

    localHeaders.push(local);

    // Central directory entry
    const central = Buffer.concat([
      Buffer.from([0x50,0x4B,0x01,0x02]),
      toU16LE(20), toU16LE(20),
      toU16LE(0),
      toU16LE(8),
      toU16LE(dosTime),
      toU16LE(dosDate),
      toU32LE(crc),
      toU32LE(compressed.length),
      toU32LE(data.length),
      toU16LE(nameBytes.length),
      toU16LE(0), toU16LE(0), toU16LE(0), toU16LE(0),
      toU32LE(0),
      toU32LE(offset),
      nameBytes
    ]);

    centralHeaders.push(central);
    offset += local.length;
  }

  const centralStart = offset;
  const centralData = Buffer.concat(centralHeaders);
  const eocd = Buffer.concat([
    Buffer.from([0x50,0x4B,0x05,0x06]),
    toU16LE(0), toU16LE(0),
    toU16LE(centralHeaders.length),
    toU16LE(centralHeaders.length),
    toU32LE(centralData.length),
    toU32LE(centralStart),
    toU16LE(0)
  ]);

  fs.writeFileSync(outFile, Buffer.concat([...localHeaders, centralData, eocd]));
  console.log(`Done → dist/4leafclover-${version}.zip`);
}

buildZip().catch(err => { console.error(err); process.exit(1); });
