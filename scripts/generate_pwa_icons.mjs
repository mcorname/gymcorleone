import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const svgContent = (size) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: ${size}px;
            height: ${size}px;
            background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: ${Math.round(size * 0.22)}px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            overflow: hidden;
          }
          .icon {
            font-size: ${Math.round(size * 0.45)}px;
            filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
          }
          .text {
            color: #FFFFFF;
            font-weight: 900;
            font-size: ${Math.max(12, Math.round(size * 0.085))}px;
            letter-spacing: 2px;
            margin-top: ${Math.round(size * 0.02)}px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          }
        </style>
      </head>
      <body>
        <div class="icon">⚡</div>
        <div class="text">GYM PROGRESS</div>
      </body>
    </html>
  `;

  const publicDataDir = path.resolve('apps/web/public/data');
  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }

  for (const size of [192, 512]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(svgContent(size));
    const outputPath = path.join(publicDataDir, `icon-${size}.png`);
    await page.screenshot({ path: outputPath, omitBackground: false });
    console.log(`Generated: ${outputPath} (${size}x${size})`);
  }

  await browser.close();
}

generateIcons().catch(console.error);
