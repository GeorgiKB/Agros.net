import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';
const outDir = './temporary screenshots';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Find next available screenshot number
let n = 1;
while (fs.existsSync(path.join(outDir, `screenshot-${n}${label}.png`))) n++;
const outPath = path.join(outDir, `screenshot-${n}${label}.png`);

let browser;
try {
  browser = await puppeteer.connect({ browserURL: 'http://localhost:64241' });
  console.log('Connected to existing Chrome browser.');
} catch {
  console.log('No existing Chrome found on port 9222, launching new instance...');
  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  const executablePath = chromePaths.find(p => fs.existsSync(p));
  if (!executablePath) { console.error('No Chrome/Edge found'); process.exit(1); }
  browser = await puppeteer.launch({
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log(`Screenshot saved: ${outPath}`);
