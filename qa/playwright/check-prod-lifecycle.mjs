import { chromium } from 'playwright';

async function checkProdLifecycle() {
  console.log('Connecting to https://gymcorleone-web.vercel.app/ ...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  await page.goto('https://gymcorleone-web.vercel.app/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  console.log('Page title:', await page.title());

  // Check dashboard hero button has new label
  const heroBtn = await page.waitForSelector('button:has-text("PREPARAR ENTRENAMIENTO")', { timeout: 20000 });
  console.log('Found "PREPARAR ENTRENAMIENTO" button on Dashboard:', !!heroBtn);

  // Navigate to workout via BottomNav
  const trainNavBtn = page.locator('nav button:has-text("Entrenar")').first();
  await trainNavBtn.click();
  await page.waitForTimeout(1000);

  // Verify preparation state
  const isPrep = await page.locator('text=Preparando entrenamiento').isVisible();
  console.log('Verified "Preparando entrenamiento" header on production:', isPrep);

  const isTimerVisible = await page.locator('span:has(svg.lucide-timer)').isVisible();
  console.log('Timer is completely stopped/hidden on production:', !isTimerVisible);

  const isFinishVisible = await page.locator('button:has-text("Finalizar")').isVisible();
  console.log('Button [Finalizar] is NOT present in draft:', !isFinishVisible);

  const isCancelVisible = await page.locator('button:has-text("Cancelar")').isVisible();
  console.log('Button [Cancelar] IS present in draft:', isCancelVisible);

  const startBtn = page.locator('button:has-text("INICIAR ENTRENAMIENTO")');
  const isDisabled = await startBtn.isDisabled();
  console.log('Button [INICIAR ENTRENAMIENTO] is DISABLED with 0 exercises:', isDisabled);

  await page.screenshot({ path: 'qa/screenshots/prod-workout-lifecycle.png', fullPage: true });
  console.log('Production screenshot saved to qa/screenshots/prod-workout-lifecycle.png');
  await browser.close();
}

checkProdLifecycle().catch(err => {
  console.error('Prod verification error:', err.message);
  process.exit(1);
});
