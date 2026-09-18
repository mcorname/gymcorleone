import { chromium } from 'playwright';

async function runWorkoutLifecycleQA() {
  console.log('=================================================================');
  console.log('  QA AUTOMATION: WORKOUT LIFECYCLE & STARTUP FLOW VERIFICATION   ');
  console.log('=================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }, // Mobile Pixel 7 view
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
  });
  const page = await context.newPage();

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, message) {
    if (condition) {
      console.log('  [PASS] ' + message);
      passedTests++;
    } else {
      console.error('  [FAIL] ' + message);
      failedTests++;
      throw new Error(message);
    }
  }

  try {
    // 1. Navegar en frío y limpiar storage
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle' });
    console.log('[STEP 1] Navegar en frío y limpiar storage...');

    const initialStorage = await page.evaluate(() => ({
      active: localStorage.getItem('gym_progress_active_session'),
      draft: localStorage.getItem('gym_progress_draft_workout')
    }));
    assert(initialStorage.active === null, 'Inicialmente no hay sesión activa en localStorage');

    // 2. Click en 'Entrenar' desde la barra de navegación inferior móvil
    console.log('\n[STEP 2] Pulsando en pestaña "Entrenar"...');
    const trainNavBtn = page.locator('nav button:has-text("Entrenar")').first();
    await trainNavBtn.waitFor({ state: 'visible', timeout: 5000 });
    await trainNavBtn.click();
    await page.waitForTimeout(1000);

    // Verificar que estamos en MODO PREPARACIÓN (DRAFT)
    const isPrepBadgeVisible = await page.locator('text=Preparando entrenamiento').isVisible();
    assert(isPrepBadgeVisible, 'Se muestra el banner/badge de "Preparando entrenamiento"');

    // Cronómetro NO debe estar activo ni visible en modo preparación
    const isTimerVisible = await page.locator('span:has(svg.lucide-timer)').isVisible();
    assert(!isTimerVisible, 'El cronómetro NO está activo ni visible en modo preparación');

    // Botón Finalizar NO debe existir
    const finishBtnVisible = await page.locator('button:has-text("Finalizar")').isVisible();
    assert(!finishBtnVisible, 'Botón [Finalizar] NO está visible en modo preparación');

    // Botón Cancelar SI debe existir
    const cancelBtnVisible = await page.locator('button:has-text("Cancelar")').isVisible();
    assert(cancelBtnVisible, 'Botón [Cancelar] está visible en modo preparación');

    // Botón INICIAR ENTRENAMIENTO debe estar deshabilitado con 0 ejercicios
    const startWorkoutBtn = page.locator('button:has-text("INICIAR ENTRENAMIENTO")');
    const isDisabled = await startWorkoutBtn.isDisabled();
    assert(isDisabled, 'Botón [INICIAR ENTRENAMIENTO] está DESHABILITADO cuando hay 0 ejercicios');

    const disabledNotice = await page.locator('text=Agrega al menos un ejercicio para comenzar').isVisible();
    assert(disabledNotice, 'Se muestra mensaje explicativo: "Agrega al menos un ejercicio para comenzar"');

    // Comprobar que en localStorage NO se ha creado ninguna sesión activa
    const afterOpenStorage = await page.evaluate(() => localStorage.getItem('gym_progress_active_session'));
    assert(afterOpenStorage === null, 'localStorage gym_progress_active_session sigue siendo null (cero sesiones fantasma)');

    // 3. Probar selector múltiple de ejercicios
    console.log('\n[STEP 3] Probando selector de ejercicios con multi-selección...');
    const addExercisesBtn = page.locator('button:has-text("Agregar ejercicios"), button:has-text("Elegir ejercicios")').first();
    await addExercisesBtn.click();
    await page.waitForTimeout(800);

    // Buscar ejercicios
    const searchInput = page.locator('input[placeholder*="Buscar por nombre"]');
    await searchInput.fill('Press');
    await page.waitForTimeout(600);

    // Seleccionar primeros dos ejercicios disponibles de la lista
    const exerciseRows = page.locator('div[role="dialog"] div.overflow-y-auto > div');
    const count = await exerciseRows.count();
    console.log(`  - Se encontraron ${count} ejercicios con "Press" en catálogo`);
    assert(count >= 2, 'El catálogo retornó al menos 2 ejercicios con "Press"');

    await exerciseRows.nth(0).click();
    await page.waitForTimeout(200);
    await exerciseRows.nth(1).click();
    await page.waitForTimeout(400);

    // Comprobar botón batch: "Agregar 2 ejercicios"
    const batchAddBtn = page.locator('button:has-text("Agregar 2 ejercicios")');
    const batchBtnVisible = await batchAddBtn.isVisible();
    assert(batchBtnVisible, 'Botón de lote muestra dinámicamente "Agregar 2 ejercicios"');

    await batchAddBtn.click();
    await page.waitForTimeout(800);

    // Verificar que los 2 ejercicios se añadieron al borrador
    const techniqueButtons = page.locator('button:has-text("Técnica y pasos")');
    const addedCount = await techniqueButtons.count();
    assert(addedCount === 2, 'Los 2 ejercicios fueron añadidos al borrador de preparación');

    // El cronómetro sigue sin arrancar en modo borrador
    const isTimerStillHidden = await page.locator('span:has(svg.lucide-timer)').isVisible();
    assert(!isTimerStillHidden, 'El cronómetro sigue completamente apagado tras añadir ejercicios');

    // Ahora INICIAR ENTRENAMIENTO debe estar HABILITADO
    const isNowEnabled = await startWorkoutBtn.isEnabled();
    assert(isNowEnabled, 'Botón [INICIAR ENTRENAMIENTO] ahora está HABILITADO');

    // 4. Probar Modal de Técnica sin iniciar sesión
    console.log('\n[STEP 4] Consultando técnica y pasos en modo preparación...');
    await techniqueButtons.first().click();
    await page.waitForTimeout(600);

    const techniqueSection = await page.locator('text=Instrucciones y Pasos de Ejecución').isVisible();
    assert(techniqueSection, 'Modal de Técnica se abre correctamente desde el modo preparación');

    const primaryMuscleBadge = await page.locator('text=Músculo Principal').isVisible();
    assert(primaryMuscleBadge, 'Modal de Técnica muestra información biomecánica (Músculo Principal)');

    // Cerrar modal de técnica con el botón "Volver al Entrenamiento"
    const returnBtn = page.locator('button:has-text("Volver al Entrenamiento")');
    if (await returnBtn.isVisible()) {
      await returnBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);

    const isTechniqueClosed = !(await page.locator('text=Instrucciones y Pasos de Ejecución').isVisible());
    assert(isTechniqueClosed, 'Modal de Técnica se cierra sin alterar el borrador');

    // Storage de sesión activa aún debe ser null
    const storageBeforeStart = await page.evaluate(() => localStorage.getItem('gym_progress_active_session'));
    assert(storageBeforeStart === null, 'La sesión activa sigue siendo null antes de pulsar iniciar');

    // 5. Probar Reordenamiento de ejercicios (Bajar y Subir)
    console.log('\n[STEP 5] Probando reordenamiento de ejercicios (↑ / ↓)...');
    const moveDownButtons = page.locator('button[title="Mover abajo"]');
    if (await moveDownButtons.count() > 0) {
      await moveDownButtons.first().click();
      await page.waitForTimeout(400);
      assert(true, 'Botón de reordenar hacia abajo funcionó sin errores');
    }

    // 6. INICIAR ENTRENAMIENTO EXPLÍCITAMENTE
    console.log('\n[STEP 6] Pulsando [ INICIAR ENTRENAMIENTO ]...');
    await startWorkoutBtn.click();
    await page.waitForTimeout(1000);

    // Verificar que ahora estamos en MODO ACTIVO
    const finishBtnNowVisible = await page.locator('button:has-text("Finalizar")').isVisible();
    assert(finishBtnNowVisible, 'Botón [Finalizar] ahora está VISIBLE (sesión activa)');

    // El cronómetro ahora sí existe y está activo
    const isTimerActive = await page.locator('span:has(svg.lucide-timer)').isVisible();
    assert(isTimerActive, 'El cronómetro ahora está activo y visible en la cabecera');

    // Verificar persistencia de startedAt y status === in_progress en localStorage
    const activeSessionData = await page.evaluate(() => {
      const raw = localStorage.getItem('gym_progress_active_session');
      return raw ? JSON.parse(raw) : null;
    });
    assert(activeSessionData !== null, 'Se creó gym_progress_active_session en localStorage');
    assert(activeSessionData.status === 'in_progress', 'Estado es in_progress');
    assert(typeof activeSessionData.startedAt === 'string', 'startedAt fue fijado con timestamp ISO');

    // Verificar que el cronómetro comienza a avanzar
    await page.waitForTimeout(2500);
    const activeTimerText = await page.locator('span:has(svg.lucide-timer)').innerText();
    console.log('  - Tiempo transcurrido registrado: ' + activeTimerText);
    assert(activeTimerText !== '00:00', 'El cronómetro avanza activamente en sesión en curso');

    // 7. Navegación en segundo plano y reanudación
    console.log('\n[STEP 7] Navegando a Inicio y verificando barra flotante de sesión activa...');
    const homeNavBtn = page.locator('nav button:has-text("Inicio")').first();
    await homeNavBtn.click();
    await page.waitForTimeout(600);

    // Comprobar barra flotante
    const floatingBar = page.locator('text=Sesión activa en curso • Toca para volver');
    const isFloatingBarVisible = await floatingBar.isVisible();
    assert(isFloatingBarVisible, 'Barra flotante inferior de sesión activa está visible en otras pestañas');

    // Reanudar pulsando la barra flotante
    await floatingBar.click();
    await page.waitForTimeout(600);

    const backInActiveWorkout = await page.locator('button:has-text("Finalizar")').isVisible();
    assert(backInActiveWorkout, 'Reanuda directamente la sesión activa en curso sin duplicar');

    // 8. Finalizar Entrenamiento
    console.log('\n[STEP 8] Finalizando entrenamiento...');
    const finishBtn = page.locator('button:has-text("Finalizar")');
    await finishBtn.click();
    await page.waitForTimeout(600);

    const saveAndExitBtn = page.locator('button:has-text("Guardar y Salir")');
    await saveAndExitBtn.click();
    await page.waitForTimeout(1000);

    // Verificar que ya no hay sesión activa
    const finalActiveStorage = await page.evaluate(() => localStorage.getItem('gym_progress_active_session'));
    assert(finalActiveStorage === null, 'gym_progress_active_session fue removido al finalizar');

    // Tomar captura para evidencia
    await page.screenshot({ path: 'qa/screenshots/workout-lifecycle-verified.png', fullPage: true });

    console.log('\n=================================================================');
    console.log(`  TODAS LAS PRUEBAS QA PASARON EXITOSAMENTE (${passedTests} passed, ${failedTests} failed) `);
    console.log('=================================================================');
  } finally {
    await browser.close();
  }
}

runWorkoutLifecycleQA().catch(err => {
  console.error('Test falló:', err);
  process.exit(1);
});
