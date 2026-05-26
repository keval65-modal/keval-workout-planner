import sharp from "sharp";
import { mkdir } from "fs/promises";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#059669"/>
  <text x="256" y="310" font-family="Arial,sans-serif" font-size="180" font-weight="bold" fill="white" text-anchor="middle">FC</text>
</svg>`;

await mkdir("public/icons", { recursive: true });
const buf = Buffer.from(svg);
await sharp(buf).resize(192, 192).png().toFile("public/icons/icon-192.png");
await sharp(buf).resize(512, 512).png().toFile("public/icons/icon-512.png");
console.log("Generated PWA icons");
