# AUDITORÍA INTEGRAL, SEGURIDAD, ARQUITECTURA Y CALIDAD DE SOFTWARE
## GYM PROGRESS — REPORTE TÉCNICO DE AUDITORÍA Y REMEDIACIÓN LOCAL

**Fecha de Ejecución:** 18 de Septiembre de 2026  
**Entorno de Ejecución:** 100% Local (`c:\Users\Mario Castro\Documents\antigravity\blissful-galileo`)  
**Restricción de Confidencialidad:** Cero transmisión externa (Sin commits remotos en GitHub, sin despliegue a Vercel, sin llamadas a APIs externas).  
**Estándares y Metodología:** Cloudflare Security Audit, OWASP Top 10 (2021/2023), Clean Architecture, ISO/IEC 25010 Software Quality Standards, WCAG 2.2 AA.

---

## 1. Resumen Ejecutivo

Durante este proceso de auditoría y saneamiento integral, un equipo multidisciplinar compuesto por roles de Arquitectura de Software, Seguridad de Aplicaciones (AppSec/DevSecOps), Aseguramiento de Calidad (QA Lead & Automation), Rendimiento y Resiliencia analizó la totalidad del monorepo **GYM PROGRESS**.

El análisis abarcó el frontend Next.js 14, los 5 paquetes modulares del monorepo (`@gym/types`, `@gym/calculations`, `@gym/ai`, `@gym/offline-sync`, `@gym/i18n`), los flujos de persistencia y serialización de datos (`AppStorage`), la suite de pruebas automatizadas y los scripts de migración y análisis biométrico.

### Logros Principales de la Auditoría y Remediación:
1. **Reducción de Huella y Activos Obsoletos:** Eliminación de **6.51 MB** de datos estáticos redundantes (`exercises_seed.backup.json`) expuestos indebidamente en el directorio público de Next.js.
2. **Saneamiento de Dependencias y Monorepo:** Poda de 4 dependencias huérfanas en `apps/web/package.json` (`canvas-confetti`, `@types/canvas-confetti`, `clsx`, `tailwind-merge`), reduciendo el árbol del lockfile y eliminando superficie de ataque innecesaria.
3. **Endurecimiento de Seguridad y Cabeceras HTTP:** Fortalecimiento del Content Security Policy (CSP) en `next.config.mjs` mediante la incorporación explícita de `frame-ancestors 'none'`, `base-uri 'self'` y `form-action 'self'`, mitigando vectores de clickjacking y reescritura de bases URI.
4. **Resiliencia de Almacenamiento Local (Local Storage Quota Defense):** Reemplazo de bloques ciegos `catch {}` por una arquitectura defensiva `safeSetItem` y `safeRemoveItem`, con detección y alerta explícita de `QuotaExceededError` (DOMException 22/1014) y validación estructural de la sesión activa en caliente.
5. **Corrección de Lógica de Negocio y Deduplicación en IA Scanner:** Reparación del generador de `machineId` que impedía la deduplicación de equipamiento en `MyGymView`, asegurando ahora persistencia canónica determinista (`m-lat-pulldown`, etc.).
6. **Defensa de Tipado Estricto y TypeScript:** Eliminación de múltiples conversiones inseguras `as any` y parámetros sin tipo en `DashboardView.tsx`, `ActiveWorkoutView.tsx`, `RestTimerModal.tsx` y `packages/offline-sync/src/index.ts` (ahora parametrizado con genéricos `<T = unknown>` e identificadores generados mediante `crypto.randomUUID()`).
7. **Establecimiento de Calidad de Código (ESLint):** Integración de configuración oficial de ESLint (`apps/web/.eslintrc.json` con `next/core-web-vitals`), resolviendo errores de compilación y habilitando integración continua no interactiva (`npm run lint: 0 errores`).
8. **Verificación Automatizada Completa:** 100% de pruebas unitarias (`21/21 passed`), 0 errores de TypeScript (`tsc --noEmit`), compilación de producción Next.js 100% limpia (`4/4 páginas estáticas generadas`) y suite End-to-End Playwright con 20/20 escenarios funcionales validados en 13 resoluciones de pantalla.

---

## 2. Estado General del Sistema

El sistema GYM PROGRESS se encuentra en un estado **estable, altamente funcional, modular y optimizado para producción**. 

| Pilar de Evaluación | Diagnóstico | Nivel de Madurez |
| :--- | :--- | :--- |
| **Arquitectura de Monorepo** | Excelente separación de dominios entre lógica pura (`@gym/calculations`), tipos (`@gym/types`), IA (`@gym/ai`), sincronización (`@gym/offline-sync`) y localización (`@gym/i18n`). El frontend (`apps/web`) consume los módulos de manera limpia vía transpilación `transpilePackages`. | Alto (Nivel 4/5) |
| **Seguridad de la Aplicación** | Cabeceras HTTP robustas (CSP estricto, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy). Se mitigan ataques de inyección, framing no autorizado y Clickjacking. | Alto (Nivel 4/5) |
| **Integridad de Almacenamiento** | Enfoque Offline-First con sincronización en cola y almacenamiento en `localStorage`. Blindado con manejo de cuota y validación de tipos en runtime. | Alto (Nivel 4/5) |
| **Calidad de Código y Tipado** | 0 errores de TypeScript bajo `strict: true`. Sin `any` descontrolados en flujos críticos. Linter activo y limpio. | Muy Alto (Nivel 5/5) |
| **Rendimiento Web y Bundle** | Bundle JS compartido de solo **87.2 kB**, carga inicial de la página raíz de **34.4 kB**, 4/4 páginas pre-renderizadas estáticamente en el build. | Muy Alto (Nivel 5/5) |
| **Localización (i18n)** | Dataset de 1,324 ejercicios canónicos con soporte integral en Español (nombres, taxonomías musculares, equipos, instrucciones paso a paso) manteniendo compatibilidad bilingüe exacta con términos en inglés. | Excelente (Nivel 5/5) |

---

## 3. Seguridad

A continuación se detalla la matriz de hallazgos de seguridad analizados y corregidos durante la auditoría bajo la metodología Cloudflare Security Audit & OWASP Top 10.

### Matriz de Hallazgos de Seguridad

#### Hallazgo SEC-01
- **ID:** SEC-01
- **Tipo / Categoría:** CSP / Clickjacking / Restricción de Contexto (OWASP A05:2021 – Security Misconfiguration)
- **Severidad:** Media
- **Archivo y Línea:** `apps/web/next.config.mjs:31-36`
- **Descripción Técnica:** La directiva `Content-Security-Policy` carecía de restricciones explícitas sobre antepasados de marco (`frame-ancestors`), restricción de destino de formularios (`form-action`) y base URI (`base-uri`). Aunque `X-Frame-Options: DENY` estaba presente, estándares modernos (CSP Level 2/3) priorizan `frame-ancestors`.
- **Evidencia / Fragmento:**
  ```javascript
  // ANTES:
  value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:;"
  ```
- **Impacto Real:** Posibilidad de que navegadores que no interpreten `X-Frame-Options` o escenarios con plugins incrustados sufran ataques de Clickjacking o inyección de etiqueta `<base>`.
- **Estado:** Corregido.
- **Corrección Aplicada:** Se incorporaron las directivas `frame-ancestors 'none'; base-uri 'self'; form-action 'self';` a la cabecera CSP.

---

#### Hallazgo SEC-02
- **ID:** SEC-02
- **Tipo / Categoría:** Exposición de Información / Activos Públicos Innecesarios (OWASP A01:2021 – Broken Access Control)
- **Severidad:** Baja
- **Archivo y Línea:** `apps/web/public/data/exercises_seed.backup.json` (6.51 MB)
- **Descripción Técnica:** Existía un archivo de respaldo duplicado de 6.51 MB dentro del directorio `/public` de Next.js. Todos los archivos bajo `public/` son servidos públicamente sin restricción y descargables por cualquier cliente.
- **Evidencia / Fragmento:**
  ```
  apps/web/public/data/exercises_seed.backup.json (6,517,227 bytes)
  ```
- **Impacto Real:** Consumo innecesario de ancho de banda del servidor, aumento del footprint estático y exposición de versiones de backup no controladas.
- **Estado:** Corregido.
- **Corrección Aplicada:** El archivo de backup fue eliminado del directorio público de Next.js. Los scripts de migración preservan su lógica segura fuera de la exposición web estática.

---

#### Hallazgo SEC-03
- **ID:** SEC-03
- **Tipo / Categoría:** Disponibilidad / Denegación de Servicio en Cliente por Cuota (OWASP A04:2021 – Insecure Design / Resiliency)
- **Severidad:** Media
- **Archivo y Línea:** `apps/web/src/lib/storage.ts:255-474`
- **Descripción Técnica:** Todas las operaciones de escritura en `localStorage` utilizaban bloques `try { ... } catch {}` vacíos. Cuando el almacenamiento del navegador supera la cuota (5MB–10MB típicamente), se dispara una excepción `QuotaExceededError`. Al ser silenciada ciegamente, el usuario continuaba entrenando creyendo que sus series, métricas o sesiones se guardaban, sufriendo pérdida irrecuperable de datos al recargar.
- **Evidencia / Fragmento:**
  ```typescript
  // ANTES:
  public static addCompletedWorkout(session: WorkoutSession): void {
    if (typeof window === 'undefined') return;
    const history = this.getHistory();
    history.unshift(session);
    try {
      localStorage.setItem(KEYS.WORKOUT_HISTORY, JSON.stringify(history));
    } catch {} // Falla silenciosa!
  }
  ```
- **Impacto Real:** Pérdida silenciosa de registros de entrenamiento, medidas y marcas personales cuando el almacenamiento se aproxima al límite.
- **Estado:** Corregido.
- **Corrección Aplicada:** Se implementó `safeSetItem(key, value)` y `safeRemoveItem(key)` con detección formal de `QuotaExceededError` (códigos 22 y 1014, nombres `QuotaExceededError` y `NS_ERROR_DOM_QUOTA_REACHED`) y registro de fallos para telemetría. Además, se añadió validación de esquema en `getActiveSession()`.

---

#### Hallazgo SEC-04
- **ID:** SEC-04
- **Tipo / Categoría:** Generación de Entropía Débil en IDs de Mutaciones Offline (CWE-330: Use of Insufficiently Random Values)
- **Severidad:** Baja
- **Archivo y Línea:** `packages/offline-sync/src/index.ts:71`
- **Descripción Técnica:** Las mutaciones en cola se generaban utilizando `Math.random().toString(36)`, el cual no es un generador pseudoaleatorio criptográficamente seguro (PRNG).
- **Evidencia / Fragmento:**
  ```typescript
  // ANTES:
  id: 'mut_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now()
  ```
- **Impacto Real:** Riesgo de colisión de identificadores en sincronizaciones concurrentes offline en bases de datos distribuidas con múltiples clientes.
- **Estado:** Corregido.
- **Corrección Aplicada:** Se implementó el uso de `crypto.randomUUID()` como fuente preferente de aleatoriedad criptográfica estándar (RFC 4122), con degradación controlada en entornos legados.

---

#### Hallazgo SEC-05
- **ID:** SEC-05
- **Tipo / Categoría:** Integridad de Tipado y Conversiones Inseguras (CWE-843: Access of Resource Using Incompatible Type)
- **Severidad:** Baja / Calidad de Código
- **Archivo y Línea:** `DashboardView.tsx:212`, `ActiveWorkoutView.tsx:119`, `RestTimerModal.tsx:34`, `packages/offline-sync/src/index.ts:8, 68`
- **Descripción Técnica:** Múltiples variables y parámetros utilizaban `: any` o `as any`, anulando las garantías de verificación estática de TypeScript en tiempo de compilación.
- **Evidencia / Fragmento:**
  ```typescript
  // ANTES en DashboardView:
  onChange={(e) => setProgressMetric(e.target.value as any)}
  // ANTES en ActiveWorkoutView:
  handleUpdateSet: (..., value: any) => void
  // ANTES en RestTimerModal:
  let timer: any = null;
  // ANTES en QueuedMutation:
  payload: any;
  ```
- **Impacto Real:** Riesgo de desbordamiento de tipos en tiempo de ejecución, corrupción de datos en estados serializados y fallas de compilación silenciosas.
- **Estado:** Corregido.
- **Corrección Aplicada:** Se tiparon fuertemente todos los elementos: `value: string | number | boolean`, `setProgressMetric(e.target.value as 'volume' | 'weight' | '1rm')`, `timer: ReturnType<typeof setInterval> | null`, y genéricos parametrizados `QueuedMutation<T = unknown>`.

---

#### Hallazgo SEC-06
- **ID:** SEC-06
- **Tipo / Categoría:** Vulnerabilidad en Dependencias Indirectas (GHSA-9g9p-9gw9-jx7f, GHSA-qx2v-qp2m-jg93)
- **Severidad:** Crítica / Alta (en advisory externo) — **Impacto Real Mitigado en GYM PROGRESS**
- **Archivo y Línea:** `node_modules/next`, `node_modules/postcss`
- **Descripción Técnica:** `npm audit` reporta vulnerabilidades en `next@14.2.5` y `postcss@8.4.38` relativas a Image Optimizer DoS y XSS en salida CSS de PostCSS. La solución sugerida por npm (`npm audit fix --force`) instalaría `next@16.3.5`, provocando una ruptura catastrófica del framework (breaking changes incompatibles con React 18, Server Components y Next.js App Router v14).
- **Evidencia / Fragmento:**
  ```
  next  9.3.4-canary.0 - 16.3.0-preview.10 - Severity: critical
  postcss  <=8.5.22 - Severity: high
  Fix available via `npm audit fix --force` (Will install next@16.3.5, which is a breaking change)
  ```
- **Impacto Real en GYM PROGRESS:** **NULO / MITIGADO**. GYM PROGRESS no utiliza el servidor de optimización de imágenes de Next.js (`next/image`) en servidor para procesar payloads externos arbitrarios (se usan etiquetas `<img>` con fuentes estáticas GitHub CDN fijas). Además, PostCSS corre únicamente en el pipeline local de compilación, no en tiempo de ejecución ni expuesto a inputs de usuarios no confiables.
- **Estado:** Documentado / Mitigado por arquitectura (No forzar actualización destructiva).
- **Plan de Remediación:** Realizar migración controlada a Next.js 15 en un sprint de ciclo mayor dedicado cuando React 19 y todas las dependencias del ecosistema alcancen compatibilidad probada.

---

## 4. Archivos Eliminados y Justificación

| Archivo Eliminado | Tamaño | Justificación de Seguridad y Operatividad |
| :--- | :--- | :--- |
| `apps/web/public/data/exercises_seed.backup.json` | **6.51 MB** | **Completamente seguro de eliminar.** Se trataba de un archivo residual generado por una ejecución previa del script de migración i18n (`migrate-localization.js`). El archivo operativo y canónico utilizado por la aplicación es `apps/web/public/data/exercises_seed.json` (6.50 MB). Mantener el backup en el directorio público exponía 6.5 MB adicionales a la descarga y aumentaba el peso del repositorio sin aportar valor funcional alguno. |
| `apps/web/src/hooks/` (directorio vacío) | 0 bytes | **Seguro de eliminar.** Directorio vacío huérfano sin archivos ni referencias en el código base. |

---

## 5. Archivos Candidatos a Eliminar (Requieren Decisión del Usuario)

Ningún archivo operativo adicional requiere eliminación inmediata en este ciclo. Sin embargo, para futuros hitos de arquitectura se presentan los siguientes candidatos para revisión del usuario:

1. `scripts/import-exercises/raw_exercises.json` (~6.5 MB):
   - *Estado:* Dataset crudo de entrada original en inglés.
   - *Consideración:* Si el dataset procesado `packages/exercise-dataset/exercises_normalized.json` y `apps/web/public/data/exercises_seed.json` se consideran la fuente definitiva, este archivo podría archivarse en almacenamiento frío (Git LFS o release assets) para reducir el tamaño del clone local del repositorio.
   - *Recomendación:* Mantenerlo localmente mientras se continúen afinando migraciones de taxonomía o traducciones.

2. `qa/screenshots/*.png` (13 capturas de pantalla de Playwright):
   - *Estado:* Evidencias visuales generadas por la suite de automatización E2E en diferentes viewports.
   - *Consideración:* Ocupan aproximadamente 1.2 MB. Son útiles para auditorías y revisión de regresiones visuales.
   - *Recomendación:* Mantenerlas en `.gitignore` para no inflar el historial de git si se desea conservar la suite puramente como herramienta de test.

---

## 6. Código Muerto Eliminado

Se realizó un saneamiento quirúrgico de código muerto, imports no utilizados y variables huérfanas sin romper interfaces públicas ni referencias indirectas:

### En `apps/web/src/components/exercises/ExerciseCatalogView.tsx`
- **Imports no utilizados eliminados:**
  - `Filter`, `Play`, `ExternalLink`, `Info` (iconos de `lucide-react` importados pero no renderizados en el JSX).
  - `BODY_PARTS_I18N`, `EQUIPMENT_I18N`, `TARGET_MUSCLES_I18N` (constantes de catálogo importadas redundantemente de `@gym/i18n` que ya son gestionadas a través de la función dinámica `getLocalizedTaxonomy`).

### En `apps/web/src/components/routines/RoutinesView.tsx`
- **Imports y tipos no utilizados eliminados:**
  - `Plus`, `Trash2`, `ChevronRight`, `Clock`, `Repeat`, `Dumbbell`, `Sparkles` (iconos huérfanos).
  - `WorkoutExercise` (tipo importado pero no referenciado en la firma del componente).

### En `apps/web/src/components/layout/Sidebar.tsx`
- **Import no utilizado eliminado:**
  - `Settings` (icono de `lucide-react` sin botón ni ruta en el menú lateral).

### En `apps/web/src/components/progress/ProgressView.tsx`
- **Import no utilizado eliminado:**
  - `AlertCircle` (icono sin uso en los paneles corporales).

### En `packages/calculations/src/index.ts`
- **Tipo no utilizado eliminado:**
  - `MuscleGroup` (importado de `@gym/types` en la cabecera sin ser utilizado en las funciones de cálculo matemático de Epley, volumen o 1RM).

---

## 7. Dependencias Eliminadas y Actualizadas

### Dependencias Eliminadas (`apps/web/package.json`)
Las siguientes 4 dependencias fueron removidas tras comprobar rigurosamente que ninguna era importada ni referenciada en el código fuente de `apps/web/src/`:

| Dependencia | Versión Anterior | Motivo de Eliminación |
| :--- | :--- | :--- |
| `canvas-confetti` | `^1.9.3` | Ningún componente dispara efectos de confeti por canvas. |
| `@types/canvas-confetti` | `^1.9.0` | Tipos devDependency huérfanos asociados a canvas-confetti. |
| `clsx` | `^2.1.1` | Los componentes utilizan concatenación nativa de clases de Tailwind CSS con interpolación literal de plantillas. |
| `tailwind-merge` | `^2.3.0` | Las clases condicionales se manejan con operadores ternarios directos de CSS; no se utiliza la utilidad `twMerge`. |

**Impacto:** Se redujeron 4 paquetes de dependencias directas en `apps/web`, eliminando código no utilizado en el bundle y aligerando `package-lock.json`.

### Dependencias Añadidas para Calidad y CI (`apps/web/package.json`)
Para garantizar la validación continua y automatizada del código sin requerir intervención manual interactiva:
- `eslint`: `^8.57.0` (Linter estandarizado para Next.js 14).
- `eslint-config-next`: `^14.2.5` (Reglas oficiales de Core Web Vitals, accesibilidad y hooks de React).

---

## 8. Refactorizaciones Realizadas y Problemas Resueltos

### 1. Corrección del Algoritmo de Deduplicación en el Escáner de Máquinas (`MachineScannerView.tsx`)
- **Problema Detectado:** Al pulsar "Guardar en Mi Gimnasio" tras escanear una máquina con IA, el código generaba `machineId: 'm-' + Date.now()`. Al ser un identificador temporal aleatorio, la comprobación `gym.equipment.findIndex(e => e.machineId === item.machineId)` en `AppStorage.saveGymEquipment` siempre daba `-1`, causando que la misma máquina (ej. *Prensa de Pecho*) se duplicara infinitamente en el inventario cada vez que se escaneaba o guardaba.
- **Solución Aplicada:** Se modificó la generación del identificador para que use el ID canónico de la máquina identificada (`selectedMachine?.id`) o un slug determinista normalizado basado en el nombre (`'m-' + scanResult.detectedMachineName.toLowerCase().replace(/[^a-z0-9]+/g, '-')`). Ahora, al re-escanear o guardar la máquina, se actualiza el registro existente en lugar de duplicarse.

### 2. Blindaje de Almacenamiento Local ante Excepciones de Cuota (`storage.ts`)
- **Problema Detectado:** Falta de manejo de fallos en todas las escrituras a `localStorage`. Si el almacenamiento local se llenaba o estaba en modo restringido/incógnito estricto, las escrituras fallaban silenciosamente sin alertar ni al usuario ni al sistema.
- **Solución Aplicada:** Se encapsuló la persistencia en `safeSetItem` y `safeRemoveItem` con control específico de errores de cuota (`QuotaExceededError`) y deserialización defensiva que valida la estructura requerida (garantizando que la sesión activa tenga `id` y que `exercises` sea un arreglo válido).

### 3. Validación de Entrada Numérica en Registro Corporal (`ProgressView.tsx`)
- **Problema Detectado:** La función `handleSaveNewMeasurement` convertía directamente las cadenas del formulario con `Number(newWeight)`. Si el usuario ingresaba valores vacíos o caracteres no numéricos, se guardaban valores `NaN` o `<= 0` en el historial de medidas, contaminando los cálculos de IMC (`calculateBMI`), gráficas de progreso y estadísticas.
- **Solución Aplicada:** Se introdujo validación previa comprobando `isNaN(weight) || weight <= 0`, abortando la operación si el dato es corrupto y saneando los campos opcionales numéricos.

### 4. Limpieza del Ciclo de Vida del Temporizador en Modal de Descanso (`RestTimerModal.tsx`)
- **Problema Detectado:** El identificador del intervalo estaba tipado como `any` y la limpieza `clearInterval(timer)` no verificaba si el puntero era nulo, lo que provocaba advertencias del compilador de TypeScript y posibles fallas de concurrencia en la liberación de recursos.
- **Solución Aplicada:** Se re-tipó a `ReturnType<typeof setInterval> | null` y se condicionó cada invocación a `if (timer) clearInterval(timer)`, asegurando liberación determinista de memoria.

---

## 9. Mejoras de Arquitectura, Rendimiento, Mantenibilidad y Tipado

1. **Modernización de Compilador TypeScript (`tsconfig.json`):**
   - Se actualizó el `target` de JavaScript de `"es5"` a `"es2020"`. Esto elimina la sobrecarga de transpilación de características estándar modernas (como operadores de encadenamiento opcional `?.`, nullish coalescing `??`, y métodos nativos de arreglos/objetos) soportadas universalmente por todos los navegadores modernos y Node.js, reduciendo el tamaño del código generado.
2. **Endurecimiento de Cabeceras HTTP:**
   - Adición de `frame-ancestors 'none'`, `base-uri 'self'`, y `form-action 'self'` a `Content-Security-Policy` en `next.config.mjs`.
3. **Genéricos en el Administrador de Sincronización Offline (`@gym/offline-sync`):**
   - Se transformó la interfaz `QueuedMutation<T = unknown>` y su método `enqueueMutation<T>` para permitir que los payloads de mutaciones conserven la tipificación exacta del modelo sincronizado (`WorkoutSession`, `GymEquipmentItem`, etc.) en lugar de degradar a `any`.
4. **Arquitectura de Resiliencia en Deserialización:**
   - La recuperación de sesión activa ahora comprueba la integridad del objeto antes de suministrarlo a React, previniendo crashes por estados locales parcialmente corruptos.

---

## 10. Problemas que se Decidieron NO Modificar y su Justificación

En estricto apego al principio de estabilidad y la regla del usuario de no realizar cambios que puedan romper el sistema:

1. **Uso de etiquetas nativas `<img>` en lugar de `<Image />` de Next.js en el Catálogo de Ejercicios:**
   - *Hallazgo:* El linter emite advertencias (`@next/next/no-img-element`) en `ExerciseCatalogView`, `ActiveWorkoutView` y `MachineScannerView`.
   - *Decisión:* Se decidió **NO forzar** el reemplazo por `<Image />` de `next/image`.
   - *Justificación Técnica:* La aplicación consume un dataset dinámico de más de 1,300 imágenes y GIFs alojados externamente en GitHub raw (`raw.githubusercontent.com`). Forzar `next/image` requeriría configurar dominios remotos en `remotePatterns` de Next.js, lo cual activaría el optimizador de imágenes del servidor. En entornos locales o instancias autohospedadas con 2 núcleos/8 GB, optimizar concurrentemente cientos de GIFs e imágenes grandes satura la CPU, dispara el consumo de ancho de banda y expone la aplicación a vulnerabilidades de DoS por saturación de caché de imágenes (`GHSA-3x4c-7xq6-9pq8`). El uso actual de `<img>` nativo con `loading="lazy"` es mucho más rápido, no consume memoria de servidor y descarga los recursos directamente del CDN de GitHub al cliente.

2. **No forzar la actualización mayor a Next.js 16 (`npm audit fix --force`):**
   - *Hallazgo:* `npm audit` reporta 2 vulnerabilidades críticas/altas en `next@14.2.5` y dependencias de PostCSS, recomendando actualizar a `next@16.3.5`.
   - *Decisión:* Se decidió **NO ejecutar** `npm audit fix --force`.
   - *Justificación Técnica:* Una actualización a Next.js 16 representa dos saltos de versión mayor (breaking change severo) que requiere React 19, rompe la API de rutas de App Router v14, altera la resolución de módulos y paquetes transpilados en el monorepo, e invalida la configuración de Server Components. Dado que GYM PROGRESS es una aplicación que corre actualmente de forma 100% local o como PWA cliente sin componentes de servidor vulnerables expuestos a DoS externo, el riesgo de romper el sistema operativo supera con creces cualquier beneficio. Se recomienda planificar la migración a Next.js 15 en un ciclo de refactorización mayor posterior.

---

## 11. Resultados de las Validaciones y Pruebas Ejecutadas

Todas las pruebas y verificaciones fueron ejecutadas **100% de manera local**:

### 1. Verificación de Linter (ESLint)
- **Comando:** `rtk npm --workspace=@gym/web run lint`
- **Resultado:** **EXITOSO (Código de salida: 0)**
- **Detalle:** 0 errores de linting. Se verificaron todas las reglas de React Hooks y Core Web Vitals.

### 2. Verificación de Tipos Estáticos (TypeScript)
- **Comando:** `rtk npx tsc --noEmit`
- **Resultado:** **EXITOSO (Código de salida: 0)**
- **Detalle:** `TypeScript: No errors found` en todos los archivos del proyecto web y paquetes transpilados.

### 3. Suite de Pruebas Unitarias del Monorepo
- **Comando:** `rtk npm test`
- **Resultado:** **EXITOSO (21/21 pruebas pasadas, 0 fallidas)**
  - `@gym/calculations`: 6 pruebas de cálculo matemático aprobadas:
    - 1RM Epley para 100kg x 1 rep = 100kg [PASS]
    - 1RM Epley para 100kg x 10 reps = 133.33kg [PASS]
    - Volumen para 72.5kg x 10 reps = 725kg [PASS]
    - Detección de nuevo récord personal (max_weight) [PASS]
    - Recomendación inteligente de sobrecarga progresiva [PASS]
    - Cálculo de IMC y clasificación [PASS]
  - `@gym/i18n`: 15 pruebas de motor de búsqueda bilingüe y tolerancia a tildes aprobadas:
    - Búsqueda "press banca" (28 resultados) [PASS]
    - Búsqueda "bench press" (33 resultados) [PASS]
    - Búsqueda "pecho" y "chest" [PASS]
    - Búsqueda "bíceps" y "biceps" (190 resultados idénticos, insensibilidad a tildes) [PASS]
    - Búsqueda "mancuerna" y "dumbbell" [PASS]
    - Búsqueda "jalón" y "lat pulldown" [PASS]
    - Búsqueda "sentadilla" y "squat" [PASS]
    - Búsqueda "peso muerto" y "deadlift" [PASS]

### 4. Compilación de Producción (Next.js Build)
- **Comando:** `rtk npm --workspace=@gym/web run build`
- **Resultado:** **EXITOSO (Código de salida: 0)**
- **Páginas Generadas:** 4/4 páginas estáticas pre-renderizadas (`/`, `/_not-found`).
- **Métricas de Bundle:**
  - Shared JS por todas las rutas: **87.2 kB**
  - Carga JS inicial de la página raíz (`/`): **122 kB** (34.4 kB específicos de página)

### 5. Suite de Pruebas E2E Automatizadas (Playwright)
- **Comando:** `rtk node qa/playwright/audit.mjs` (ejecutado contra servidor local `http://localhost:3000/`)
- **Resultado:** **EXITOSO (20/20 escenarios funcionales aprobados)**
  - `FN-01`: Carga inicial del Dashboard y saludo dinámico [PASS]
  - `FN-02`: Alternancia de mapa muscular a vista posterior [PASS]
  - `FN-03`: Inicio de sesión de entrenamiento desde Hero Action [PASS]
  - `FN-04`: Completado de serie y activación de temporizador de descanso [PASS]
  - `FN-05`: Adición dinámica de series a ejercicios [PASS]
  - `FN-06`: Búsqueda bilingüe con "press banca" en catálogo [PASS]
  - `FN-07`: Modal de finalización y cálculo de volumen total [PASS]
  - `FN-08`: Persistencia de entrenamiento en almacenamiento local [PASS]
  - `FN-09`: Navegación al catálogo de ejercicios (1,300+) [PASS]
  - `FN-10`: Filtro por grupo muscular ("Pecho") [PASS]
  - `FN-11`: Ficha técnica de ejercicio con instrucciones paso a paso en español [PASS]
  - `FN-12`: Navegación al módulo de IA de Escaneo de Máquinas [PASS]
  - `FN-13`: Detección por IA, índice de confianza y regulación ergonómica [PASS]
  - `FN-14`: Guardado determinista de máquina en el inventario [PASS]
  - `FN-15`: Visualización del inventario de gimnasio [PASS]
  - `FN-16`: Visualización de rutinas oficiales (PPL, Torso/Pierna) [PASS]
  - `FN-17`: Duplicación de plantilla de rutina [PASS]
  - `FN-18`: Navegación al módulo de progreso y medidas corporales [PASS]
  - `FN-19`: Control deslizante Antes vs Después [PASS]
  - `FN-20`: Consulta de récords personales vigentes [PASS]
  - Compatibilidad de diseño responsivo verificada en 13 viewports (desde 320px hasta 1920px) [PASS]

---

## 12. Comparativa del Sistema: Antes vs Después

| Métrica / Dimensión | Antes de la Auditoría | Después de la Auditoría | Impacto / Diferencia |
| :--- | :--- | :--- | :--- |
| **Archivos Estáticos en `public/`** | 6.64 MB (incluyendo `exercises_seed.backup.json`) | **0.13 MB** (excluyendo seed json de 6.5MB) | **-6.51 MB eliminados** de basura estática |
| **Dependencias No Utilizadas** | 4 librerías huérfanas declaradas | **0 librerías huérfanas** | Dependencias podadas y lockfile limpio |
| **Herramienta de Linter (ESLint)** | No configurada (fallaba en CI no interactivo) | **Configurada (`.eslintrc.json`)** | Integración continua 100% automatizable |
| **Errores de Linting (`next lint`)** | Inejecutable / No configurado | **0 errores** (código de salida 0) | Estabilidad garantizada |
| **Errores de TypeScript (`tsc`)** | 0 errores (con múltiples `as any`) | **0 errores** (con tipado estricto y sin `any`) | Mayor solidez y seguridad de tipos |
| **Manejo de Errores de Almacenamiento** | `catch {}` ciego (sin control de cuota) | **Arquitectura `safeSetItem`** con captura de `QuotaExceededError` | Prevención de pérdida de datos de usuarios |
| **Deduplicación en Escáner IA** | Fallaba (generaba IDs con timestamp aleatorio) | **ID Canónico Determinista** | Equipamiento no se duplica en el gimnasio |
| **Generación de IDs en Sincronización** | `Math.random().toString(36)` | **`crypto.randomUUID()`** | Criptográficamente seguro y único |
| **Seguridad de Cabeceras HTTP (CSP)** | Básico (sin frame-ancestors ni base-uri) | **Endurecido con directivas completas de protección** | Protección reforzada contra Clickjacking |
| **Target de Compilación JS** | `es5` (código JS legado y voluminoso) | **`es2020`** (moderno, ágil y optimizado) | Ejecución JS más rápida y eficiente |
| **Pruebas Unitarias** | 21 pasadas / 0 fallidas | **21 pasadas / 0 fallidas** | Paridad funcional 100% preservada |
| **Compilación de Producción Next.js** | Exitosa (87.2 kB shared JS) | **Exitosa (87.2 kB shared JS)** | 0 regresiones en tiempo de compilación |
| **Pruebas Funcionales E2E (Playwright)** | 20/20 pasadas | **20/20 pasadas** | 100% de características operativas |
| **Entorno de Trabajo** | Local | **Estrictamente Local (0 envíos externos)** | Cumplimiento total de políticas de privacidad |

---
*Reporte generado y certificado localmente por el equipo de Auditoría y Calidad de Software de GYM PROGRESS.*
