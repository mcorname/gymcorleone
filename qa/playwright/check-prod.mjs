import { chromium } from 'playwright';

async function checkProd() {
  console.log('Connecting to https://gymcorleone-web.vercel.app/ ...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  await page.goto('https://gymcorleone-web.vercel.app/', { waitUntil: 'networkidle' });
  console.log('Page title:', await page.title());

  const startBtn = await page.waitForSelector('button:has-text("INICIAR ENTRENAMIENTO")', { timeout: 15000 });
  await startBtn.click();
  await page.waitForTimeout(1000);

  // Check for the "Técnica y pasos" button
  const techBtn = await page.waitForSelector('button:has-text("Técnica y pasos")', { timeout: 10000 });
  console.log('Found "Técnica y pasos" on production:', !!techBtn);

  // Check for +2.5 button
  const stepperBtn = await page.waitForSelector('button:has-text("+2.5"):visible', { timeout: 10000 });
  console.log('Found "+2.5" stepper on production:', !!stepperBtn);

  await page.screenshot({ path: 'qa/screenshots/prod-mobile-verified.png' });
  console.log('Production screenshot saved to qa/screenshots/prod-mobile-verified.png');
  await browser.close();
}

checkProd().catch(err => {
  console.error('Prod verification error:', err.message);
  process.exit(1);
});
