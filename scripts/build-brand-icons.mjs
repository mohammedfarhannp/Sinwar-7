import { mkdir, writeFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDirectory = resolve(projectRoot, 'public');
const accent = '#ce1126';
const background = '#f6f7f5';
const sourceTriangle = 'M256 411.3 76.8 100.7h358.4z';

function squareIconSvg(size, { padding = 0.15, fillBackground = false } = {}) {
  const side = size * (1 - padding * 2);
  const height = (side * Math.sqrt(3)) / 2;
  const left = (size - side) / 2;
  const top = (size - height) / 2;
  const right = left + side;
  const bottom = top + height;
  const backgroundRect = fillBackground
    ? `<rect width="${size}" height="${size}" fill="${background}"/>`
    : '';

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${backgroundRect}<path fill="${accent}" d="M${size / 2} ${bottom.toFixed(2)} ${left.toFixed(2)} ${top.toFixed(2)} ${right.toFixed(2)} ${top.toFixed(2)}z"/></svg>`,
  );
}

async function renderPng(size, options) {
  return sharp(squareIconSvg(size, options)).png().toBuffer();
}

function createIco(images) {
  const directoryHeaderLength = 6;
  const entryLength = 16;
  const dataOffset = directoryHeaderLength + entryLength * images.length;
  const ico = Buffer.alloc(
    dataOffset + images.reduce((length, image) => length + image.png.length, 0),
  );

  ico.writeUInt16LE(0, 0);
  ico.writeUInt16LE(1, 2);
  ico.writeUInt16LE(images.length, 4);

  let nextOffset = dataOffset;
  images.forEach(({ size, png }, index) => {
    const entryOffset = directoryHeaderLength + entryLength * index;
    ico.writeUInt8(size, entryOffset);
    ico.writeUInt8(size, entryOffset + 1);
    ico.writeUInt8(0, entryOffset + 2);
    ico.writeUInt8(0, entryOffset + 3);
    ico.writeUInt16LE(1, entryOffset + 4);
    ico.writeUInt16LE(32, entryOffset + 6);
    ico.writeUInt32LE(png.length, entryOffset + 8);
    ico.writeUInt32LE(nextOffset, entryOffset + 12);
    png.copy(ico, nextOffset);
    nextOffset += png.length;
  });

  return ico;
}

await mkdir(publicDirectory, { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="${accent}" d="${sourceTriangle}"/></svg>\n`;
await Promise.all([
  writeFile(resolve(publicDirectory, 'icon.svg'), svg),
  writeFile(resolve(publicDirectory, 'favicon.svg'), svg),
]);

const faviconImages = await Promise.all(
  [16, 32, 48].map(async (size) => ({
    size,
    png: await renderPng(size, { padding: 0.12 }),
  })),
);
await writeFile(
  resolve(publicDirectory, 'favicon.ico'),
  createIco(faviconImages),
);

await Promise.all([
  renderPng(180, { padding: 0.2, fillBackground: true }).then((png) =>
    writeFile(resolve(publicDirectory, 'apple-touch-icon.png'), png),
  ),
  renderPng(192, { padding: 0.2, fillBackground: true }).then((png) =>
    writeFile(resolve(publicDirectory, 'icon-192.png'), png),
  ),
  renderPng(512, { padding: 0.2, fillBackground: true }).then((png) =>
    writeFile(resolve(publicDirectory, 'icon-512.png'), png),
  ),
]);

console.log('Generated favicon SVG/ICO and 180, 192, and 512 px PNG icons.');
