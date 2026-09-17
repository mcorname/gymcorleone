# Informe de Accesibilidad Web (ACCESSIBILITY_REPORT.md)

**Proyecto:** GYM PROGRESS / gymcorleone  
**Fecha:** 17 de Septiembre, 2026  
**Estándar de Evaluación:** WCAG 2.2 Nivel AA (Web Content Accessibility Guidelines)  
**Herramientas de Auditoría:** `@axe-core/playwright` (v4.13.0) + Inspección manual de navegación por teclado y WAI-ARIA.

---

## 1. Resumen Ejecutivo de Accesibilidad

| Categoría | Violaciones Detectadas | Nivel de Riesgo |
|---|:---:|:---:|
| **Crítico (Critical)** | 1 (`select-name`) | Alto (Bloquea a usuarios de lectores de pantalla) |
| **Serio (Serious)** | 1 (`color-contrast` en 6 nodos) | Alto (Dificulta lectura con baja visión o luz intensa) |
| **Moderado (Moderate)** | 1 (`meta-viewport`) | Medio (Impide zoom táctil en móviles) |
| **Menor (Minor)** | 2 (Focus ring sutil, falta de `aria-live` en cronómetro) | Bajo (Mejoras ergonómicas) |

**Puntuación Estimada Lighthouse A11y:** **84 / 100**  
**Conformidad WCAG 2.2 AA:** **Parcialmente Conforme (Requiere correcciones puntuales)**

---

## 2. Hallazgos Automatizados con Axe-Core

---

### Violación 1: Elementos `<select>` sin Nombre Accesible (`select-name`)
- **Impacto:** **Crítico**
- **Criterio WCAG:** 4.1.2 Name, Role, Value (Nivel A)
- **Regla Axe:** `https://dequeuniversity.com/rules/axe/4.13/select-name`
- **Descripción:** Todo elemento interactivo de formulario debe proporcionar un nombre accesible que permita a las tecnologías de asistencia anunciar su propósito al usuario.
- **Selectores CSS Afectados:**
  1. `select` en selector de gimnasio de [`DashboardView.tsx`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/components/dashboard/DashboardView.tsx#L210)
  2. `select` en selector de RIR/RPE de [`ActiveWorkoutView.tsx`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/components/workout/ActiveWorkoutView.tsx#L512)
- **Impacto en el Usuario:** Cuando una persona con ceguera o baja visión utiliza NVDA, VoiceOver o TalkBack y enfoca el control, el lector anuncia únicamente *"Menú desplegable, elemento 1 de 4"*, sin explicar si está cambiando de gimnasio o asignando el esfuerzo RIR.
- **Solución Propuesta:**
  Agregar el atributo `aria-label` o vincular un `<label htmlFor="...">`:
  ```tsx
  <select
    id="gym-selector"
    aria-label="Seleccionar sede de gimnasio activa"
    value={activeGymId}
    onChange={...}
  >
  ```

---

### Violación 2: Contraste de Color Insuficiente (`color-contrast`)
- **Impacto:** **Serio**
- **Criterio WCAG:** 1.4.3 Contrast (Minimum) (Nivel AA - Ratio mínimo 4.5:1 para texto normal)
- **Regla Axe:** `https://dequeuniversity.com/rules/axe/4.13/color-contrast`
- **Descripción:** El contraste cromático entre el color del texto y su color de fondo no alcanza el umbral mínimo legal y funcional.
- **Nodos Afectados (6 elementos encontrados):**
  1. `.text-[#D83B01].gap-2.font-bold > span` — Badge de alerta y racha (Ratio actual: **3.4:1**, Fondo `#FFFFFF`).
  2. `.p-4.hover:border-gray-300.cursor-pointer:nth-child(1) > .text-2xl.font-black.text-brand-darkBlue > .font-normal.text-gray-400.text-xs` — Subtítulos de tarjetas KPI (Ratio actual: **2.8:1** con `#9CA3AF`).
  3. `.p-4.shadow-subtle.rounded-xl:nth-child(2) ...` — Subtítulo "kg levantados".
  4. `.p-4.shadow-subtle.rounded-xl:nth-child(3) ...` — Subtítulo "esta semana".
  5. `.p-4.shadow-subtle.rounded-xl:nth-child(4) ...` — Subtítulo "días seguidos".
  6. `.pt-2 > span:nth-child(1)` — Leyenda del gráfico de volumen.
- **Impacto en el Usuario:** En el entorno real de un gimnasio con iluminación fluorescente o luz solar a través de ventanales, los textos en gris claro y naranja claro se vuelven ilegibles para usuarios con fatiga visual o sensibilidad reducida.
- **Solución Propuesta:**
  - Sustituir `text-gray-400` (`#9CA3AF`) por `text-gray-600` (`#4B5563`, ratio 7.0:1) o `text-gray-500` (`#6B7280`, ratio 4.6:1).
  - Para textos con color corporativo naranja sobre blanco, oscurecer a `#C43100` (ratio 4.65:1) en lugar de `#D83B01`.

---

### Violación 3: Viewport Inhabilita Escalado y Zoom (`meta-viewport`)
- **Impacto:** **Moderado**
- **Criterio WCAG:** 1.4.4 Resize Text (Nivel AA)
- **Regla Axe:** `https://dequeuniversity.com/rules/axe/4.13/meta-viewport`
- **Descripción:** La etiqueta `<meta name="viewport">` contiene directivas que bloquean la ampliación por parte del usuario.
- **Selector Afectado:** `meta[name="viewport"]` en [`layout.tsx`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/app/layout.tsx).
- **Código Actual:**
  ```typescript
  export const viewport: Viewport = {
    themeColor: '#D83B01',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  };
  ```
- **Solución Propuesta:**
  Eliminar `maximumScale` y `userScalable` o establecer `userScalable: true, maximumScale: 5`.

---

## 3. Navegación por Teclado y Trampas de Foco (Manual A11y)

Se realizó un recorrido completo navegando exclusivamente mediante `Tab`, `Shift+Tab`, `Enter`, `Space` y `Escape`.

| Flujo / Interacción | Soporte de Teclado | ¿Foco Visible? | ¿Trampa de Foco? | Estado |
|---|:---:|:---:|:---:|:---:|
| Navegación entre páginas principales (Header/Nav) | SI (`Tab` secuencial) | SI (Outline nativo) | NO | **PASS** |
| Selección de vista en Mapa Muscular (Frontal/Posterior) | SI (`Tab` + `Enter/Space`) | SI | NO | **PASS** |
| Agregar serie en Entrenamiento Activo | SI (`Tab` + `Enter`) | SI | NO | **PASS** |
| Edición de Peso y Reps en tabla | SI (`Tab` navega inputs) | SI (`ring-brand-orange`) | NO | **PASS** |
| Apertura de Modal de Detalle de Ejercicio | SI (`Enter` en tarjeta) | SI | **SI (Escape roto)** | **PARTIAL** |
| Modal de Temporizador de Descanso (`RestTimerModal`) | SI | Parcial | **SI (Escape roto)** | **PARTIAL** |
| Slider interactivo Antes vs Después | Parcial (arrastre con mouse/touch) | NO (no recibe foco con Tab) | NO | **FAIL** |

### Análisis de Trampas de Foco (Focus Traps)
1. **Falta de Cierre por `Escape` (BUG-005):**
   Los modales `RestTimerModal` y `ExerciseDetailModal` no interceptan el evento de teclado `Escape`. Si un usuario que navega sin ratón abre un modal, no puede salir del mismo presionando la tecla estándar `Escape`; debe tabular hasta encontrar el botón con el icono de cierre `X`.
2. **Ciclo de Foco Dentro del Modal:**
   Al presionar `Tab` dentro de los modales, el cursor puede "escapar" por debajo del overlay y enfocar elementos de la página de fondo que están visualmente tapados.
   *Recomendación:* Incorporar una librería accesible de modales (como Radix UI Dialog o Headless UI) o un hook simple `useFocusTrap`.

---

## 4. Calidad de Textos Alternativos (Alt Text) y Anuncios Dinámicos (ARIA)

### A. Imágenes y Multimedia
- **Catálogo de Ejercicios:** Las imágenes y animaciones anatómicas utilizan `alt={exercise.name_es || exercise.name}`. Esto cumple con WCAG 1.1.1 (Non-text Content) ya que describe fielmente el ejercicio mostrado.
- **Iconos Decorativos:** Los iconos de Lucide (`Dumbbell`, `Trophy`, `Flame`, etc.) se renderizan como SVGs en línea. Deben incluir `aria-hidden="true"` para evitar que los lectores de pantalla intenten interpretar los trazados vectoriales.

### B. Anuncios Dinámicos (`aria-live`)
- **Temporizador de Descanso:** Cuando el reloj desciende de 90 a 0 segundos, no existe una región `aria-live="polite"` ni `role="timer"`. Un usuario invidente no recibe confirmación acústica de cuándo ha terminado su tiempo de recuperación entre series.
- **Toast Notifications:** Las alertas de confirmación ("Máquina guardada con éxito", "Rutina duplicada") deben contar con `role="status"` o `aria-live="polite"`.

---

## 5. Matriz de Corrección Priorizada para Accesibilidad

| Prioridad | Tarea de Corrección | Esfuerzo Estimado | Archivo Objetivo |
|:---:|---|:---:|---|
| **P1** | Agregar `aria-label` descriptivo a todos los `<select>` | 15 min | `DashboardView.tsx`, `ActiveWorkoutView.tsx` |
| **P1** | Implementar `keydown` para tecla `Escape` en modales | 20 min | `RestTimerModal.tsx`, `ExerciseCatalogView.tsx` |
| **P2** | Ajustar contraste de `#D83B01` y `#9CA3AF` a tokens WCAG AA | 25 min | `tailwind.config.ts`, `DashboardView.tsx` |
| **P2** | Habilitar zoom en `meta-viewport` eliminando `userScalable: false` | 5 min | `layout.tsx` |
| **P3** | Agregar `aria-live="polite"` y `role="timer"` en el descanso | 15 min | `RestTimerModal.tsx` |
| **P3** | Soporte de teclado (teclas Flecha Izquierda/Derecha) en slider de fotos | 30 min | `ProgressView.tsx` |
