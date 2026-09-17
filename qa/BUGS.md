# Registro Exhaustivo de Defectos y Vulnerabilidades (BUGS.md)

**Proyecto:** GYM PROGRESS / gymcorleone  
**Fecha de Auditoría:** 17 de Septiembre, 2026  
**Auditor:** Equipo de QA Integral (QA Lead, Security, Accessibility, Performance, Frontend, Backend)  
**Entornos Evaluados:**
- Producción: `https://gymcorleone-web.vercel.app/`
- Local / Staging: `http://localhost:3000/`

---

## Resumen de Severidad de Defectos

| Severidad | Cantidad | Descripción |
|---|:---:|---|
| **Bloqueante (P0)** | 1 | Ausencia de Error Boundaries que causan White Screen ante excepciones en tiempo de ejecución. |
| **Crítico (P1)** | 3 | Falta de headers de seguridad HTTP esenciales, Controles `<select>` inaccesibles (WCAG A), Duplicación de envíos en sesión de entrenamiento. |
| **Alto (P2)** | 3 | Trampas de foco y modales sin cierre por `Escape` ni backdrop, Iconos PWA rotos (404), Ratio de contraste de color insuficiente (WCAG AA). |
| **Medio (P3)** | 3 | Descarga monolítica de 6.2MB de catálogo sin compresión ni persistencia IndexedDB, Duplicación de equipos en Mi Gimnasio, `userScalable: false` en viewport. |
| **Bajo (P4)** | 2 | Importación errónea en tests unitarios de cálculos, Excedente de dependencia de LocalStorage sin verificación de cuota. |

---

## Detalle de Bugs Encontrados

---

### BUG-001: Ausencia de Cabeceras de Seguridad HTTP Críticas en Producción
- **ID:** BUG-001
- **Módulo:** Infraestructura / DevOps / Seguridad de Red
- **Severidad:** Crítico (P1)
- **Prioridad:** Inmediata
- **Estado:** Abierto
- **Componente Afectado:** [`next.config.mjs`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/next.config.mjs) y Vercel Edge Headers.

#### Descripción
La inspección de cabeceras HTTP en `https://gymcorleone-web.vercel.app/` revela que el servidor web omite 5 de las 6 cabeceras de endurecimiento recomendadas por OWASP. Solo se incluye `Strict-Transport-Security`.

#### Evidencia (Respuesta HTTP Producción)
```http
HTTP/2 200 OK
server: Vercel
strict-transport-security: max-age=63072000; includeSubDomains; preload
content-type: text/html; charset=utf-8
cache-control: public, max-age=0, must-revalidate
x-vercel-cache: HIT
```
*Faltantes:*
- `Content-Security-Policy` (CSP)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` o `SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(self), geolocation=(), microphone=()`

#### Pasos para Reproducir
1. Ejecutar una petición curl o inspección con Playwright a `https://gymcorleone-web.vercel.app/`.
2. Inspeccionar el bloque de headers de respuesta.
3. Constatar la ausencia de `Content-Security-Policy` y `X-Frame-Options`.

#### Resultado Actual
La aplicación es susceptible a Clickjacking en iframes de terceros y ataques MIME-type sniffing.

#### Resultado Esperado
Todas las respuestas de páginas y recursos estáticos deben servir las cabeceras de protección estándar.

#### Causa Raíz
[`next.config.mjs`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/next.config.mjs) no implementa la directiva async `headers()`.

#### Solución Sugerida
Agregar en `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' }
      ]
    }
  ];
}
```

---

### BUG-002: Ausencia de Error Boundary Global en Next.js (White Screen ante Excepciones)
- **ID:** BUG-002
- **Módulo:** Frontend / Resiliencia de la Aplicación
- **Severidad:** Bloqueante (P0)
- **Prioridad:** Crítica
- **Estado:** Abierto
- **Componente Afectado:** [`apps/web/src/app`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/app)

#### Descripción
No existen archivos [`error.tsx`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/app/error.tsx) ni [`global-error.tsx`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/app/global-error.tsx) en el App Router de Next.js. Si un estado de LocalStorage se corrompe (por ejemplo, un valor `null` en un ejercicio de `gym_workout_active_session` o una fecha inválida), la aplicación lanza un error no capturado en React y presenta una pantalla blanca sin posibilidad de recuperación por parte del usuario.

#### Pasos para Reproducir
1. En la consola del navegador, ejecutar: `localStorage.setItem('gym_workout_active_session', '{"exercises": [null]}')`.
2. Recargar la página o navegar a `/` y hacer clic en "Continuar entrenamiento".
3. Observar la pantalla blanca total y el error en consola: `TypeError: Cannot read properties of null`.

#### Resultado Actual
La pantalla se congela en blanco; el usuario queda bloqueado a menos que limpie manualmente las cookies o el almacenamiento del navegador.

#### Resultado Esperado
Un componente `error.tsx` debe atrapar el error, mostrar un mensaje de recuperación claro ("Ocurrió un error inesperado al cargar la sesión") y un botón para "Restablecer sesión" o "Volver al Dashboard".

#### Causa Raíz
Falta de implementación del patrón Error Boundary estándar de Next.js App Router.

#### Solución Sugerida
Crear `apps/web/src/app/error.tsx` con manejo de fallback y logging seguro de la excepción.

---

### BUG-003: Doble Envío Concurrente al Finalizar Entrenamiento (Duplicación de Sesiones)
- **ID:** BUG-003
- **Módulo:** Active Workout / Gestión de Estado
- **Severidad:** Crítico (P1)
- **Prioridad:** Alta
- **Estado:** Abierto
- **Componente Afectado:** [`ActiveWorkoutView.tsx`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/components/workout/ActiveWorkoutView.tsx#L535-L555)

#### Descripción
En el modal de finalización del entrenamiento, la función `handleFinishWorkout` escribe directamente en `gym_workout_history` y redirige al Dashboard, pero el botón "Guardar y Salir" carece de estado `disabled={isSubmitting}` o debounce. En dispositivos móviles o ante toques rápidos, se dispara dos veces la función, duplicando el registro en el historial.

#### Pasos para Reproducir
1. Iniciar un entrenamiento activo.
2. Completar 1 serie de cualquier ejercicio.
3. Presionar "Finalizar Entrenamiento" para abrir el modal de resumen.
4. Hacer doble clic rápido en "Guardar y Salir".
5. Ir a la pestaña Progreso o inspeccionar `localStorage.getItem('gym_workout_history')`.

#### Resultado Actual
Se crean dos entradas idénticas en el historial con el mismo timestamp y volumen total duplicado.

#### Resultado Esperado
El botón debe deshabilitarse inmediatamente en el primer clic (`isFinishing = true`) evitando clics subsiguientes.

#### Causa Raíz
Falta de estado de bloqueo asíncrono o flag de debounce en el manejador del botón.

#### Solución Sugerida
Introducir un estado local `const [isSaving, setIsSaving] = useState(false)` y deshabilitar el botón mientras esté activo.

---

### BUG-004: Inaccesibilidad de Elementos `<select>` para Lectores de Pantalla (WCAG A)
- **ID:** BUG-004
- **Módulo:** Accesibilidad (A11y) / Formularios
- **Severidad:** Crítico (P1)
- **Prioridad:** Alta
- **Estado:** Abierto
- **Componente Afectado:** [`DashboardView.tsx`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/components/dashboard/DashboardView.tsx#L210) y [`ActiveWorkoutView.tsx`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/components/workout/ActiveWorkoutView.tsx#L512)

#### Descripción
La auditoría de Axe-Core identificó una violación con impacto **Crítico** bajo la regla `select-name` (WCAG 2.1 A - 4.1.2 Name, Role, Value). Los elementos desplegables de filtro de categoría o selección de RIR/RPE no tienen una etiqueta `<label>` asociada ni un atributo `aria-label`.

#### Evidencia (Axe-Core Log)
```json
{
  "id": "select-name",
  "impact": "critical",
  "description": "Ensure select element has an accessible name",
  "help": "Select element must have an accessible name",
  "targets": [["select"]]
}
```

#### Pasos para Reproducir
1. Ejecutar `@axe-core/playwright` sobre la página principal y el modal de selección de ejercicios.
2. Comprobar la regla `select-name`.

#### Resultado Actual
Los lectores de pantalla anuncian "Desplegable, opción 1" sin describir qué parámetro está cambiando el usuario.

#### Resultado Esperado
Cada `<select>` debe poseer `aria-label="Filtrar por grupo muscular"` o estar envuelto en un `<label>` semántico.

---

### BUG-005: Trampa de Teclado y Modales sin Cierre por Tecla `Escape` ni Clic en Fondo
- **ID:** BUG-005
- **Módulo:** UX / Accesibilidad / Modales
- **Severidad:** Alto (P2)
- **Prioridad:** Alta
- **Estado:** Abierto
- **Componente Afectado:** [`RestTimerModal.tsx`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/components/workout/RestTimerModal.tsx), [`ExerciseDetailModal`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/components/catalog/ExerciseCatalogView.tsx)

#### Descripción
Al abrir el detalle de un ejercicio en el catálogo o cuando emerge el temporizador de descanso (`RestTimerModal`), presionar la tecla `Escape` no cierra la ventana emergente. Asimismo, hacer clic en el backdrop oscuro circundante no despide el modal. El usuario está obligado a localizar visualmente y hacer clic en el botón diminuto de cierre con la cruz `X`.

#### Pasos para Reproducir
1. Ir al Catálogo de Ejercicios.
2. Hacer clic en cualquier ejercicio (ej. "Press de Banca con Barra").
3. Presionar la tecla física `Escape` en el teclado.
4. Hacer clic en el área oscura fuera del modal blanco.

#### Resultado Actual
El modal permanece visible e inmóvil.

#### Resultado Esperado
De acuerdo con las guías WAI-ARIA Modal Dialog Pattern, presionar `Escape` o hacer clic en el overlay debe invocar `onClose()`.

#### Causa Raíz
Los componentes modales no montan un hook `useEffect` que escuche el evento `keydown` con `e.key === 'Escape'` ni asignan un manejador `onClick={onClose}` al backdrop con `e.stopPropagation()` en el contenedor interno.

---

### BUG-006: Assets de Iconos PWA Inexistentes (Error HTTP 404 en Manifest)
- **ID:** BUG-006
- **Módulo:** PWA / Experiencia Móvil
- **Severidad:** Alto (P2)
- **Prioridad:** Media
- **Estado:** Abierto
- **Componente Afectado:** [`manifest.json`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/public/manifest.json) y carpeta `apps/web/public/data/`

#### Descripción
El archivo de manifiesto PWA declara las rutas `/data/icon-192.png` y `/data/icon-512.png`. Sin embargo, al inspeccionar la carpeta pública del proyecto, los archivos no existen en disco. Al intentar instalar la aplicación como PWA en Chrome o Safari, el navegador rechaza los iconos o utiliza una captura por defecto de baja calidad.

#### Pasos para Reproducir
1. Abrir `https://gymcorleone-web.vercel.app/data/icon-192.png`.
2. Observar la respuesta 404 de Vercel.

#### Resultado Actual
HTTP 404 Not Found. Instalación PWA sin identidad visual corporativa en el home screen del dispositivo móvil.

#### Resultado Esperado
Ambas imágenes cuadradas deben existir en PNG optimizado con transparencias y tamaños 192x192 y 512x512 px.

---

### BUG-007: Fallo de Contraste de Color en Textos de Métricas y Acentos (WCAG AA)
- **ID:** BUG-007
- **Módulo:** Accesibilidad (A11y) / Diseño Visual
- **Severidad:** Alto (P2)
- **Prioridad:** Media
- **Estado:** Abierto
- **Componente Afectado:** [`DashboardView.tsx`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/components/dashboard/DashboardView.tsx)

#### Descripción
Axe-Core reportó 6 nodos con ratio de contraste insuficiente:
1. El color naranja vibrante `#D83B01` utilizado en textos informativos sobre fondo blanco tiene un ratio de contraste de aproximadamente 3.4:1 (requerido mínimo 4.5:1 para texto normal según WCAG 1.4.3).
2. Los textos secundarios en clase `text-gray-400` (`#9CA3AF`) sobre tarjetas blancas alcanzan únicamente 2.8:1.

#### Pasos para Reproducir
1. Evaluar el Dashboard con el inspector de contraste de Chrome DevTools o Lighthouse / Axe.
2. Analizar las tarjetas de métricas "Volumen Semanal", "Racha Actual".

#### Resultado Actual
Usuarios con baja visión o bajo luz solar intensa en el gimnasio no pueden leer con nitidez los subtítulos de métricas y badges.

#### Resultado Esperado
Ajustar los colores: utilizar `#C43100` o `#B83200` para acentos con contraste >= 4.5:1, y subir `text-gray-400` a `text-gray-500` o `text-gray-600` (`#4B5563`).

---

### BUG-008: Inhabilitación de Zoom y Escalado en Metatag Viewport (WCAG 1.4.4)
- **ID:** BUG-008
- **Módulo:** Frontend / Accesibilidad Móvil
- **Severidad:** Medio (P3)
- **Prioridad:** Media
- **Estado:** Abierto
- **Componente Afectado:** [`layout.tsx`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/app/layout.tsx#L18-L23)

#### Descripción
El viewport configurado en `layout.tsx` incluye:
```typescript
export const viewport: Viewport = {
  themeColor: '#D83B01',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
```
La propiedad `userScalable: false` y `maximumScale: 1` bloquea el zoom táctil con dos dedos (pinch-to-zoom). Esto viola WCAG 2.1 criterio 1.4.4 (Resize Text), impidiendo que personas con discapacidad visual o presbicia aumenten el tamaño de la tipografía.

#### Pasos para Reproducir
1. Abrir la app en un dispositivo móvil táctil o simulador con emulación de gestos.
2. Intentar hacer gesto de pellizco para acercar el texto de una rutina.

#### Resultado Actual
La pantalla no responde al gesto de zoom.

#### Resultado Esperado
El viewport debe permitir escalado: `maximumScale: 5` y `userScalable: true` (o simplemente omitir ambas directivas para comportamiento estándar accesible).

---

### BUG-009: Duplicación Indiscriminada de Equipamiento en "Mi Gimnasio"
- **ID:** BUG-009
- **Módulo:** AI Scanner / Mi Gimnasio
- **Severidad:** Medio (P3)
- **Prioridad:** Media
- **Estado:** Abierto
- **Componente Afectado:** [`ScannerView.tsx`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/components/scanner/ScannerView.tsx#L180-L210)

#### Descripción
Al identificar una máquina mediante el simulador o cámara y hacer clic en "Guardar en Mi Gimnasio", la aplicación genera un ID aleatorio `crypto.randomUUID()` o `Date.now()` sin verificar si el modelo de máquina (ej. `chest_press_machine`) ya existe en el inventario del gimnasio activo. Si el usuario presiona el botón varias veces o escanea la misma máquina en días distintos, se agregan filas idénticas redundantes en el inventario.

#### Pasos para Reproducir
1. Ir al Escáner IA.
2. Seleccionar "Press de Pecho en Máquina".
3. Hacer clic en "Guardar en Mi Gimnasio".
4. Volver a hacer clic en "Guardar en Mi Gimnasio".
5. Ir al módulo "Mi Gimnasio".

#### Resultado Actual
Aparecen dos o más tarjetas idénticas de "Press de Pecho en Máquina" en la lista de equipos.

#### Resultado Esperado
El sistema debe detectar la preexistencia: si la máquina ya se encuentra registrada, debe notificar "Esta máquina ya está en tu gimnasio" o actualizar la fecha de último uso en lugar de duplicarla.

---

### BUG-010: Descarga Monolítica No Segmentada del Catálogo de Ejercicios (6.21 MB)
- **ID:** BUG-010
- **Módulo:** Rendimiento / Red / Almacenamiento
- **Severidad:** Medio (P3)
- **Prioridad:** Media
- **Estado:** Abierto
- **Componente Afectado:** [`exerciseService.ts`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/services/exerciseService.ts#L35-L60)

#### Descripción
La carga de la biblioteca de ejercicios descarga directamente `fetch('/data/exercises_seed.json')`. Este archivo tiene un peso en bruto de **6.21 Megabytes**. Si bien Vercel aplica compresión Brotli en vuelo reduciéndolo a ~750 KB, el cliente debe descomprimir y transformar 1,324 objetos en memoria en cada sesión si no se cachea en IndexedDB. En conexiones celulares de gimnasio (habitualmente con señal atenuada o subterráneas), esto provoca latencia perceptible de hasta 3 segundos en el primer acceso al catálogo.

#### Pasos para Reproducir
1. En Chrome DevTools, ir a Network y simular "Fast 3G".
2. Limpiar caché del navegador y recargar la aplicación.
3. Navegar a Catálogo de Ejercicios.
4. Monitorear el tiempo de descarga y parseo de `exercises_seed.json`.

#### Resultado Actual
Descarga bloqueante de 6.2MB en el primer toque.

#### Resultado Esperado
1. Implementar paginación o carga diferida de descripciones biomecánicas (chunking).
2. Persistir el catálogo parseado en IndexedDB con control de versión mediante ETag.

---

### BUG-011: Fallo de Resolución de Módulos en Tests Unitarios de Cálculos
- **ID:** BUG-011
- **Módulo:** Testing / Suite de Regresión
- **Severidad:** Bajo (P4)
- **Prioridad:** Baja
- **Estado:** Abierto
- **Componente Afectado:** [`packages/calculations/tests/calculations.test.js`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/packages/calculations/tests/calculations.test.js#L1)

#### Descripción
El script de prueba `packages/calculations/tests/calculations.test.js` contiene un path de importación relativo erróneo:
`const { calculate1RM, calculateVolumeLoad } = require('./packages/calculations/src/index.ts');`
Cuando se invoca el runner directamente desde el paquete `packages/calculations`, falla con `Cannot find module './packages/calculations/src/index.ts'`.

#### Pasos para Reproducir
1. Ejecutar en terminal: `rtk node packages/calculations/tests/calculations.test.js`.
2. Observar el error de módulo no encontrado.

#### Resultado Actual
Error de ejecución de tests unitarios automáticos aislados.

#### Resultado Esperado
La importación debe ser relativa al archivo de test: `require('../src/index.ts')` o referenciar `@gym/calculations` en el monorepo.

---

### BUG-012: Riesgo de Cuota Excedida en Almacenamiento LocalStorage
- **ID:** BUG-012
- **Módulo:** Persistencia de Datos / Arquitectura
- **Severidad:** Bajo (P4)
- **Prioridad:** Baja
- **Estado:** Abierto
- **Componente Afectado:** Toda la capa de persistencia `localStorage`

#### Descripción
Actualmente, el historial de entrenamientos, fotos en Base64 de la evolución física (`gym_body_progress`), inventario de máquinas y rutinas se escriben en `window.localStorage`. La mayoría de navegadores móviles imponen un límite rígido de 5MB por dominio. Al almacenar fotos de progreso en Base64, la aplicación puede arrojar una excepción `QuotaExceededError`, provocando la pérdida de datos del entrenamiento en curso.

#### Pasos para Reproducir
1. En el módulo Progreso, intentar registrar 10 fotos en alta resolución en formato Base64.
2. Monitorear el consumo de bytes de LocalStorage.

#### Resultado Actual
`DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'gym_body_progress' exceeded the quota.`

#### Resultado Esperado
Las fotos deben comprimirse y guardarse en `IndexedDB` (o almacenamiento de objetos en la nube en fases posteriores con backend), reservando LocalStorage únicamente para preferencias livianas y banderas de sesión.
