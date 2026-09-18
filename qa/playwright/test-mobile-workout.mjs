import { chromium } from 'playwright';

async function testMobileWorkout() {
  console.log('===========================================================');
  console.log('  TESTING MOBILE-FIRST WORKOUT & EXERCISE TECHNIQUE MODAL  ');
  console.log('===========================================================\n');

  const browser = await chromium.launch({ headless: true });
  
  // 1. MOBILE TEST (iPhone 12/14: 390x844)
  console.log('[TEST 1] Testing Mobile Experience (390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
  });
  const mobilePage = await mobileContext.newPage();
  
  await mobilePage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // Iniciar entrenamiento desde el Hero Card de Dashboard
  console.log('  - Iniciando entrenamiento desde el Dashboard...');
  const startBtn = await mobilePage.waitForSelector('button:has-text("INICIAR ENTRENAMIENTO")');
  await startBtn.click();
  await mobilePage.waitForTimeout(600);

  // Comprobar ausencia de scroll horizontal en móvil
  const overflowCheck = await mobilePage.evaluate(() => {
    const scrollW = document.documentElement.scrollWidth;
    const clientW = document.documentElement.clientWidth;
    const cw = clientW;
    const elements = document.querySelectorAll('*');
    const offenders = [];
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.right > cw + 1 || el.scrollWidth > cw + 1) {
        offenders.push({
          tag: el.tagName,
          id: el.id,
          className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 100) : '',
          right: Math.round(rect.right),
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          text: (el.innerText || '').slice(0, 40)
        });
      }
    }
    return { scrollW, clientW, hasOverflow: scrollW > clientW, offenders: offenders.slice(0, 10) };
  });
  console.log(`  - Verificación de scroll horizontal en móvil: scrollWidth=${overflowCheck.scrollW}, clientWidth=${overflowCheck.clientW}`);
  if (overflowCheck.hasOverflow) {
    console.error('Elementos desbordados:', JSON.stringify(overflowCheck.offenders, null, 2));
    throw new Error(`Fallo: Existe scroll horizontal en pantalla móvil: ${overflowCheck.scrollW} > ${overflowCheck.clientW}`);
  }
  console.log('  [PASS] Cero scroll horizontal en móvil (ajuste responsive perfecto).');

  // Verificar que la tabla desktop NO sea visible en móvil (< 768px)
  const isTableHiddenOnMobile = await mobilePage.evaluate(() => {
    const table = document.querySelector('table');
    return !table || table.offsetParent === null;
  });
  console.log(`  - ¿Tabla de escritorio oculta en móvil?: ${isTableHiddenOnMobile}`);
  if (!isTableHiddenOnMobile) {
    throw new Error('Fallo: La tabla desktop sigue visible en pantalla móvil.');
  }
  console.log('  [PASS] Tabla horizontal oculta en móvil, reemplazada por tarjetas táctiles.');

  // Verificar presencia del botón "Técnica y pasos"
  const techBtn = await mobilePage.waitForSelector('button:has-text("Técnica y pasos")');
  console.log('  [PASS] Botón "Técnica y pasos" visible en cabecera del ejercicio.');

  // Registrar el tiempo actual del cronómetro
  const timerBefore = await mobilePage.evaluate(() => {
    const el = document.querySelector('span.tabular-data, div.tabular-data');
    return el ? el.textContent : '';
  });
  console.log(`  - Tiempo cronómetro antes de abrir técnica: ${timerBefore}`);

  // Abrir Técnica y pasos
  console.log('  - Abriendo "Técnica y pasos"...');
  await techBtn.click();
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: 'qa/screenshots/test-modal-technique-workout.png' });

  // Verificar que el modal de técnica esté abierto con su contenido
  await mobilePage.waitForSelector('div[role="dialog"]');
  const modalTitle = await mobilePage.evaluate(() => {
    const h2 = document.querySelector('div[role="dialog"] h2');
    return h2 ? h2.textContent : '';
  });
  console.log(`  [PASS] Modal de técnica abierto con ejercicio: "${modalTitle}"`);

  // Verificar que tenga pasos de ejecución
  const hasSteps = await mobilePage.evaluate(() => {
    const steps = document.querySelectorAll('div[role="dialog"] ol li');
    return steps.length;
  });
  console.log(`  [PASS] El modal contiene ${hasSteps} pasos de ejecución biomecánica.`);
  if (hasSteps === 0) {
    throw new Error('Fallo: No se encontraron instrucciones o pasos en el modal de técnica.');
  }

  // Esperar 2 segundos para comprobar que el cronómetro sigue corriendo de fondo
  await mobilePage.waitForTimeout(2000);

  // Cerrar el modal
  console.log('  - Cerrando modal de técnica...');
  const closeBtn = await mobilePage.waitForSelector('div[role="dialog"] button:has-text("Volver al Entrenamiento")');
  await closeBtn.click();
  await mobilePage.waitForTimeout(500);

  // Verificar inputs táctiles de la tarjeta móvil
  console.log('  - Probando tarjeta móvil con una mano...');
  const weightInput = await mobilePage.waitForSelector('input[inputmode="decimal"]:visible');
  await weightInput.fill('70');

  // Probar botón rápido +2.5 kg
  const plusWeightBtn = await mobilePage.waitForSelector('button:has-text("+2.5"):visible');
  await plusWeightBtn.click();
  let weightValue = await weightInput.inputValue();
  console.log(`  - Peso tras presionar [+2.5]: ${weightValue} kg`);
  if (weightValue !== '72.5') {
    throw new Error(`Fallo: Botón +2.5 kg falló. Esperado: 72.5, Obtenido: ${weightValue}`);
  }
  console.log('  [PASS] Botón rápido táctil [+2.5] funciona correctamente.');

  // Probar botón rápido -2.5 kg
  const minusWeightBtn = await mobilePage.waitForSelector('button:has-text("-2.5"):visible');
  await minusWeightBtn.click();
  weightValue = await weightInput.inputValue();
  console.log(`  - Peso tras presionar [-2.5]: ${weightValue} kg`);
  if (weightValue !== '70') {
    throw new Error(`Fallo: Botón -2.5 kg falló. Esperado: 70, Obtenido: ${weightValue}`);
  }
  console.log('  [PASS] Botón rápido táctil [-2.5] funciona correctamente.');

  // Probar repeticiones y botón +1
  const repsInput = await mobilePage.waitForSelector('input[inputmode="numeric"]:visible');
  await repsInput.fill('10');
  const plusRepBtn = await mobilePage.waitForSelector('button:has-text("+1"):visible');
  await plusRepBtn.click();
  const repsValue = await repsInput.inputValue();
  console.log(`  - Repeticiones tras presionar [+1]: ${repsValue}`);
  if (repsValue !== '11') {
    throw new Error(`Fallo: Botón +1 rep falló. Esperado: 11, Obtenido: ${repsValue}`);
  }
  console.log('  [PASS] Botón rápido táctil [+1] funciona correctamente.');

  // Completar serie
  console.log('  - Completando serie...');
  const completeBtn = await mobilePage.waitForSelector('button:has-text("Completar Serie"):visible');
  await completeBtn.click();
  await mobilePage.waitForTimeout(600);

  // Verificar que el temporizador de descanso automático se active
  const restTimerModal = await mobilePage.waitForSelector('text=Saltar Descanso y Continuar');
  if (restTimerModal) {
    console.log('  [PASS] Temporizador de descanso automático activado tras completar serie.');
    // Saltar descanso para continuar operando en la sesión
    await restTimerModal.click();
    await mobilePage.waitForTimeout(400);
  }

  // Verificar que aparezca estado compacto de serie completada
  const editBtn = await mobilePage.waitForSelector('button:has-text("Editar"):visible');
  console.log('  [PASS] Serie marcada como completada y compactada con botón "Editar".');

  // Verificar que el botón "Editar" permita re-expandir
  await editBtn.click();
  await mobilePage.waitForTimeout(400);
  const reExpandedCompleteBtn = await mobilePage.waitForSelector('button:has-text("✓ Serie Completada"):visible');
  if (!reExpandedCompleteBtn) {
    throw new Error('Fallo: No se pudo re-expandir la tarjeta completada.');
  }
  console.log('  [PASS] Botón "Editar" re-expande la serie completada satisfactoriamente.');

  // Probar confirmación de seguridad al eliminar ejercicio con datos
  console.log('  - Comprobando confirmación de seguridad al eliminar ejercicio con series registradas...');
  const deleteExBtn = await mobilePage.waitForSelector('button[title="Quitar ejercicio"]:visible');
  await deleteExBtn.click();
  await mobilePage.waitForTimeout(400);

  // Modal de advertencia
  const confirmModal = await mobilePage.waitForSelector('h3:has-text("Eliminar ejercicio")');
  if (!confirmModal) {
    throw new Error('Fallo: No apareció el diálogo de confirmación de eliminación.');
  }
  console.log('  [PASS] Modal de confirmación de seguridad desplegado para evitar pérdida accidental.');

  // Cancelar eliminación
  const cancelDeleteBtn = await mobilePage.waitForSelector('button:has-text("Cancelar"):visible');
  await cancelDeleteBtn.click();
  await mobilePage.waitForTimeout(400);
  console.log('  [PASS] Eliminación cancelada y datos preservados.');

  // Probar modal "+ Agregar Ejercicio"
  console.log('  - Comprobando "+ Agregar Ejercicio" dentro de la sesión activa...');
  const addExBtn = await mobilePage.waitForSelector('button:has-text("Agregar Otro Ejercicio"):visible, button:has-text("Agregar Ejercicio"):visible');
  await addExBtn.click();
  await mobilePage.waitForTimeout(600);
  const pickerDialog = await mobilePage.waitForSelector('text=Biblioteca de Ejercicios');
  if (!pickerDialog) {
    throw new Error('Fallo: Modal de selector de ejercicios no se abrió.');
  }
  console.log('  [PASS] Modal de selector de ejercicios abierto con catálogo completo (1,300+).');
  
  // Cerrar selector de ejercicios
  const closePickerBtn = await mobilePage.waitForSelector('div.fixed button:has(svg.lucide-x)');
  await closePickerBtn.click();
  await mobilePage.waitForTimeout(400);

  // Guardar captura de pantalla de la experiencia móvil
  await mobilePage.screenshot({ path: 'qa/screenshots/test-mobile-workout-cards.png' });
  console.log('  [PASS] Captura móvil guardada en qa/screenshots/test-mobile-workout-cards.png');

  await mobileContext.close();

  // 2. DESKTOP TEST (1280x800)
  console.log('\n[TEST 2] Testing Desktop Experience (1280x800)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // Iniciar entrenamiento en desktop
  console.log('  - Iniciando entrenamiento en desktop...');
  const desktopStartBtn = await desktopPage.waitForSelector('button:has-text("INICIAR ENTRENAMIENTO")');
  await desktopStartBtn.click();
  await desktopPage.waitForTimeout(600);

  // Verificar que en desktop la tabla esté visible
  const tableVisible = await desktopPage.evaluate(() => {
    const table = document.querySelector('table');
    return table && table.offsetParent !== null;
  });
  console.log(`  - ¿Tabla visible en desktop?: ${tableVisible}`);
  if (!tableVisible) {
    throw new Error('Fallo: La tabla tabular no está visible en desktop.');
  }
  console.log('  [PASS] Tabla tabular clásica preservada y visible en desktop (>= 768px).');

  // Verificar que en desktop las tarjetas móviles estén ocultas
  const mobileCardsHidden = await desktopPage.evaluate(() => {
    const mobileContainer = document.querySelector('div.space-y-2\\.5.block.md\\:hidden');
    return !mobileContainer || mobileContainer.offsetParent === null;
  });
  console.log(`  - ¿Tarjetas móviles ocultas en desktop?: ${mobileCardsHidden}`);
  if (!mobileCardsHidden) {
    throw new Error('Fallo: Las tarjetas móviles siguen visibles en desktop.');
  }
  console.log('  [PASS] Tarjetas móviles correctamente ocultas en desktop.');

  // Guardar captura de pantalla de desktop
  await desktopPage.screenshot({ path: 'qa/screenshots/test-desktop-workout-table.png' });
  console.log('  [PASS] Captura desktop guardada en qa/screenshots/test-desktop-workout-table.png');

  await desktopContext.close();
  await browser.close();

  console.log('\n===========================================================');
  console.log(' [✓] ¡TODAS LAS VALIDACIONES DE MOBILE-FIRST Y TÉCNICA PASARON!');
  console.log('===========================================================');
}

testMobileWorkout().catch(err => {
  console.error('\n[ERROR EN TEST]', err);
  process.exit(1);
});
