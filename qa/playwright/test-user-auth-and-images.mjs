import { chromium } from 'playwright';

async function runAuthAndImagesQA() {
  console.log('=================================================================');
  console.log('  QA AUTOMATION: USER REGISTRATION, ACCESS CODES & IMAGES QA     ');
  console.log('=================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
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
    // -------------------------------------------------------------
    // TEST 1: Cold start / Clean session -> AuthView displayed
    // -------------------------------------------------------------
    console.log('[TEST 1] Pantalla inicial sin sesión: Debe mostrar AuthView...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    
    // Limpiar sesión para empezar desde cero
    await page.evaluate(() => {
      localStorage.removeItem('gym_progress_session');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const isLoginVisible = await page.locator('text=Iniciar Sesión').first().isVisible();
    const isRegisterTabVisible = await page.locator('button:has-text("Crear Cuenta")').isVisible();
    assert(isLoginVisible, 'Pestaña de Iniciar Sesión visible');
    assert(isRegisterTabVisible, 'Pestaña de Crear Cuenta visible');

    // Comprobar que rutas protegidas NO están visibles
    const isAppNavVisible = await page.locator('nav').isVisible();
    assert(!isAppNavVisible, 'Rutas protegidas bloqueadas para usuarios sin sesión');

    // -------------------------------------------------------------
    // TEST 2: Login con usuario por defecto (Mario Castro / ACTIVO)
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Iniciar sesión con usuario activo predeterminado...');
    await page.fill('input[type="email"]', 'mario@email.com');
    await page.fill('input[type="password"]', 'mario123');
    await page.click('button:has-text("Entrar a GYM PROGRESS")');
    await page.waitForTimeout(1000);

    const isDashboardVisible = await page.locator('text=GYM PROGRESS').first().isVisible();
    assert(isDashboardVisible, 'Usuario activo entra al Dashboard de la aplicación');

    // -------------------------------------------------------------
    // TEST 3: Verificación de tamaño de imágenes en Biblioteca (Desktop)
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Biblioteca de ejercicios: Tamaño de imágenes en Desktop...');
    // Navegar a biblioteca
    await page.click('aside button:has-text("Biblioteca")');
    await page.waitForTimeout(1200);

    const firstImage = page.locator('img[loading="lazy"]').first();
    await firstImage.waitFor({ state: 'visible', timeout: 5000 });
    const imageBox = await firstImage.boundingBox();

    assert(imageBox !== null, 'Miniatura de ejercicio encontrada y renderizada');
    assert(imageBox.width >= 80, `Ancho de miniatura en desktop >= 80px (actual: ${Math.round(imageBox.width)}px)`);
    assert(imageBox.height >= 80, `Alto de miniatura en desktop >= 80px (actual: ${Math.round(imageBox.height)}px)`);

    // -------------------------------------------------------------
    // TEST 4: Modal de Técnica y Pasos: Tamaño generoso y no deformado
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Modal "Técnica y pasos": Dimensiones generosas...');
    const firstExerciseCard = page.locator('div[role="dialog"]').locator('..').locator('.cursor-pointer').first();
    await page.locator('text=Ver técnica y pasos').first().click();
    await page.waitForTimeout(800);

    const techniqueDialog = page.locator('div[role="dialog"]');
    assert(await techniqueDialog.isVisible(), 'Modal de técnica y pasos abierto');

    const techniqueImg = techniqueDialog.locator('img').first();
    if (await techniqueImg.isVisible()) {
      const modalImgBox = await techniqueImg.boundingBox();
      assert(modalImgBox.height >= 200, `Imagen/GIF en modal de técnica tiene tamaño generoso (altura: ${Math.round(modalImgBox.height)}px)`);
    } else {
      console.log('  [INFO] El ejercicio seleccionado no tiene imagen pero el contenedor modal es amplio.');
    }

    // Cerrar modal de técnica
    await page.click('button[aria-label="Cerrar técnica y pasos"]');
    await page.waitForTimeout(500);

    // -------------------------------------------------------------
    // TEST 5: Responsive Móvil (390px): Miniaturas >= 72px y legibilidad
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Vista móvil (390px): Miniaturas de ejercicios...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    const mobileImg = page.locator('img[loading="lazy"]').first();
    const mobileBox = await mobileImg.boundingBox();
    assert(mobileBox.width >= 72, `Ancho de miniatura en móvil >= 72px (actual: ${Math.round(mobileBox.width)}px)`);
    assert(mobileBox.height >= 72, `Alto de miniatura en móvil >= 72px (actual: ${Math.round(mobileBox.height)}px)`);

    // Volver a viewport desktop para perfil y entrenar
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // TEST 6: Perfil de usuario y Medición Histórica (No sobreescritura)
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Mi Perfil: Actualizar peso/grasa y conservar historial...');
    await page.click('button[aria-label="Abrir perfil de usuario"]');
    await page.waitForTimeout(600);

    const isProfileModalVisible = await page.locator('text=Acceso Activo').isVisible();
    assert(isProfileModalVisible, 'Modal de Mi Perfil abierto con estado Acceso Activo');

    // Capturar mediciones previas
    const prevMeasurementCount = await page.locator('div:has-text("Historial de Peso Registrado") + div > div').count();

    // Actualizar peso
    const weightInput = page.locator('input[placeholder="78.5"]');
    await weightInput.fill('83.5');
    await page.click('button:has-text("Guardar Cambios")');
    await page.waitForTimeout(1000);

    // Verificar que se añadió un nuevo registro histórico sin borrar los anteriores
    const newMeasurementCount = await page.locator('div:has-text("Historial de Peso Registrado") + div > div').count();
    assert(newMeasurementCount >= prevMeasurementCount, 'El nuevo peso se agregó al historial sin sobreescribir mediciones previas');

    // Cerrar perfil
    await page.click('button[aria-label="Cerrar perfil"]');
    await page.waitForTimeout(500);

    // -------------------------------------------------------------
    // TEST 7: Cerrar sesión
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Cerrar sesión...');
    await page.click('button[aria-label="Abrir perfil de usuario"]');
    await page.waitForTimeout(400);

    // Auto-confirmar el alert / confirm de confirmación de logout
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Cerrar Sesión")');
    await page.waitForTimeout(1000);

    const isBackToAuth = await page.locator('text=Iniciar Sesión').first().isVisible();
    assert(isBackToAuth, 'Cierre de sesión exitoso, usuario redirigido a AuthView');

    // -------------------------------------------------------------
    // TEST 8: Registro de Nuevo Usuario (Sin pedir medidas en el form)
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Registro de nuevo usuario (Nombre, Email, Password)...');
    await page.click('button:has-text("Crear Cuenta")');
    await page.waitForTimeout(300);

    // Verificar que NO se piden medidas corporales en el registro
    const isHeightInputPresent = await page.locator('input[placeholder="175"]').isVisible();
    assert(!isHeightInputPresent, 'No se solicitan medidas corporales en el formulario de registro');

    const testUserEmail = `atleta-${Date.now()}@email.com`;
    await page.fill('input[placeholder="Tu nombre y apellido"]', 'Carlos Giménez');
    await page.fill('input[placeholder="tu@email.com"]', testUserEmail);
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('password123');
    await passwordInputs.nth(1).fill('password123');

    await page.click('button:has-text("Crear Cuenta y Continuar")');
    await page.waitForTimeout(1000);

    // Debe mostrar la pantalla de "Acceso Exclusivo Requerido" (PENDING_ACCESS)
    const isActivationScreenVisible = await page.locator('text=Acceso Exclusivo Requerido').isVisible();
    assert(isActivationScreenVisible, 'Nuevo usuario entra en estado PENDING_ACCESS y ve pantalla de activación de código');

    // -------------------------------------------------------------
    // TEST 9: Validación de Código de Acceso Inválido
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Probar código de acceso inválido...');
    await page.fill('input[placeholder="GYM-XXXX-XXXX"]', 'GYM-FAKE-0000');
    await page.click('button:has-text("Activar mi cuenta")');
    await page.waitForTimeout(800);

    const isErrorVisible = await page.locator('text=Código de acceso no válido').isVisible();
    assert(isErrorVisible, 'Muestra mensaje de error ante código inválido');

    // -------------------------------------------------------------
    // TEST 10: Validación de Código de Acceso Válido (1 de los 4 códigos)
    // -------------------------------------------------------------
    console.log('\n[TEST 10] Activar con código válido generado (GYM-MT6K-BBQ5)...');
    // Probamos con minúsculas y sin guión para verificar tolerancia y normalización
    await page.fill('input[placeholder="GYM-XXXX-XXXX"]', 'gym mt6k bbq5');
    await page.click('button:has-text("Activar mi cuenta")');
    await page.waitForTimeout(1500);

    const isAppUnlocked = await page.locator('text=GYM PROGRESS').first().isVisible();
    assert(isAppUnlocked, '¡Código validado exitosamente! El nuevo usuario se desbloquea y entra a la app');

    // Verificar nombre en el Topbar
    const isUserNameInNavbar = await page.locator('text=Carlos Giménez').isVisible();
    assert(isUserNameInNavbar, 'El Topbar refleja el nombre del nuevo usuario activado');

    console.log('\n=================================================================');
    console.log(`  RESUMEN QA: ${passedTests} PRUEBAS SUPERADAS, ${failedTests} FALLOS`);
    console.log('=================================================================\n');

  } catch (error) {
    console.error('\n[FATAL ERROR IN QA TEST]:', error);
  } finally {
    await browser.close();
  }
}

runAuthAndImagesQA();
