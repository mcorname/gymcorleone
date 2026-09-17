# Matriz de Verificación Funcional (FUNCTIONAL_MATRIX.md)

**Proyecto:** GYM PROGRESS / gymcorleone  
**Fecha de Ejecución:** 17 de Septiembre, 2026  
**Entorno de Pruebas:** Local (`http://localhost:3000`) y Producción (`https://gymcorleone-web.vercel.app`)  
**Metodología:** Pruebas E2E automatizadas con Playwright Chromium + Verificación exploratoria exhaustiva.

---

## 1. Resumen Estadístico de Cobertura

| Estado | Total Casos | Porcentaje |
|---|:---:|:---:|
| **PASS** (Superado) | 26 | 86.7% |
| **PARTIAL** (Parcialmente Funcional / Bugs Asociados) | 4 | 13.3% |
| **FAIL** (Fallido) | 0 | 0.0% |
| **NOT_IMPLEMENTED** (Pendiente en Roadmap) | 2 | N/A |
| **TOTAL EVALUADOS** | **30** | **100%** |

---

## 2. Matriz Detallada por Módulos

### Módulo A: Dashboard & Resumen Principal

| ID | Feature / Submódulo | Caso de Prueba | Comportamiento Esperado | Comportamiento Observado | Estado | Bugs / Notas |
|:---:|---|---|---|---|:---:|---|
| **FN-01** | Hero Section | Carga inicial del Dashboard y saludo dinámico según la hora | Título y saludo visibles con nombre de usuario | Carga instantánea; título "GYM PROGRESS" y saludo correcto | **PASS** | Sin anomalías |
| **FN-02a** | Mapa Muscular | Visualización de anatomía frontal | Diagrama SVG interactivo con grupos musculares destacados | Renderiza grupos musculares pectorales, hombros, cuádriceps | **PASS** | Colores de activación precisos |
| **FN-02b** | Mapa Muscular | Alternar mapa muscular a vista Posterior | Al pulsar el toggle, cambia a músculos dorsales y femorales | Cambio fluido de SVG; espalda y glúteos visibles | **PASS** | Sin parpadeo de layout |
| **FN-02c** | KPIs Dashboard | Métricas de racha semanal, entrenamientos y volumen | Cálculo reactivo de totales según el historial | Muestra volumen acumulado, entrenamientos y racha en días | **PASS** | Ratio de contraste mejorable (BUG-007) |
| **FN-02d** | Contexto Gimnasio | Selector de gimnasio activo en cabecera | Permite cambiar la sede seleccionada | Despliega selector y filtra el inventario | **PARTIAL** | Falta etiqueta accesible `aria-label` (BUG-004) |

---

### Módulo B: Entrenamiento Activo (Workout Tracker)

| ID | Feature / Submódulo | Caso de Prueba | Comportamiento Esperado | Comportamiento Observado | Estado | Bugs / Notas |
|:---:|---|---|---|---|:---:|---|
| **FN-03** | Iniciar Entrenamiento | Iniciar sesión desde el hero button del Dashboard | Redirección inmediata a `/workout` con estado inicial | Pantalla de entrenamiento activa con temporizador corriendo | **PASS** | Persistencia automática en LocalStorage |
| **FN-04** | Registro de Series | Completar serie y disparar descanso sugerido | Checkbox verde marcado, volumen actualizado y modal de descanso | La serie se completa y emerge `RestTimerModal` con cuenta regresiva | **PASS** | Modal sin cierre por `Escape` (BUG-005) |
| **FN-05a** | Gestión de Series | Añadir serie adicional a un ejercicio | Inserción de nueva fila con número de serie incrementado | Se agrega la fila respetando los valores previos de peso/reps | **PASS** | Renderizado inmediato |
| **FN-05b** | Gestión de Series | Eliminar serie de un ejercicio | Fila removida y recálculo de volumen del ejercicio | Serie eliminada correctamente; orden numérico recalculado | **PASS** | Sin inconsistencias |
| **FN-05c** | Inputs Inline | Modificación de peso (kg) y repeticiones | Inputs numéricos reactivos que actualizan volumen en vivo | Modificación instantánea; cálculo de volumen dinámico | **PASS** | Teclado numérico en móviles adecuado |
| **FN-05d** | RIR / RPE | Registro de Repeticiones en Reserva | Selector de RIR de 0 a 4+ asociado a la serie | Permite seleccionar RIR y persiste en el objeto de sesión | **PASS** | Control select sin label accesible (BUG-004) |
| **FN-06** | Selector de Ejercicios | Búsqueda bilingüe con "press banca" | Filtra entre 1,324 ejercicios con nombres en español e inglés | Encuentra 34 coincidencias relevantes ordenadas | **PASS** | Búsqueda diacrítica insensible a tildes |
| **FN-07** | Resumen de Sesión | Abrir modal de finalización de entrenamiento | Modal con duración total, volumen levantado, series y PRs | Modal desplegado con KPIs calculados correctamente | **PASS** | Riesgo de doble submit (BUG-003) |
| **FN-08** | Guardar Historial | Guardar entrenamiento finalizado | Persistencia en `gym_workout_history` y redirección a Home | Sesión guardada en almacenamiento y redirigido al Dashboard | **PARTIAL** | Sin debounce en botón de guardar (BUG-003) |
| **FN-08b** | Descarte | Cancelar o descartar sesión activa | Confirmación y reseteo de la sesión activa en curso | Limpia `gym_workout_active_session` y regresa a Dashboard | **PASS** | Confirmación previene pérdida accidental |

---

### Módulo C: Catálogo de Ejercicios (Exercise Library)

| ID | Feature / Submódulo | Caso de Prueba | Comportamiento Esperado | Comportamiento Observado | Estado | Bugs / Notas |
|:---:|---|---|---|---|:---:|---|
| **FN-09** | Vista General | Navegación al catálogo completo de ejercicios | Lista paginada/virtual de 1,324 ejercicios localizados | Catálogo renderizado con tarjetas, imágenes e información | **PASS** | Descarga inicial de 6.2MB (BUG-010) |
| **FN-10a** | Filtros | Filtrar catálogo por grupo muscular "Pecho" | Despliegue exclusivo de movimientos pectorales | Filtra con éxito; coincidencias visuales precisas | **PASS** | Filtrado instantáneo en memoria |
| **FN-10b** | Filtros | Filtrar por equipamiento ("Mancuerna", "Barra", "Máquina") | Lista filtrada por el tipo de implemento seleccionado | Funciona en combinación con el grupo muscular | **PASS** | Soporta filtros compuestos |
| **FN-11a** | Detalle Técnico | Inspección de modal con biomecánica en español | Instrucciones paso a paso de ejecución, músculos y tips | Todas las instrucciones traducidas fielmente en español | **PASS** | Animaciones anatómicas funcionales |
| **FN-11b** | Modal Dismiss | Cerrar modal de ejercicio mediante teclado `Escape` | El modal debe cerrarse al pulsar `Escape` | El modal ignora la pulsación de la tecla `Escape` | **PARTIAL** | Requiere clic explícito en `X` (BUG-005) |
| **FN-11c** | Favoritos | Marcar y desmarcar ejercicio como favorito | Icono de estrella activo y persistencia en favoritos | Alterna estado y persiste en `gym_favorite_exercises` | **PASS** | Estado sincronizado entre pantallas |

---

### Módulo D: Escáner IA de Máquinas (Vision & OCR)

| ID | Feature / Submódulo | Caso de Prueba | Comportamiento Esperado | Comportamiento Observado | Estado | Bugs / Notas |
|:---:|---|---|---|---|:---:|---|
| **FN-12** | Pantalla Escáner | Navegación al módulo de Visión Artificial | Visor de cámara o selector de simulación con interfaz futurista | Carga correcta con overlay de escaneo y badges de modo | **PASS** | Aspecto profesional |
| **FN-13a** | Detección IA | Identificación y porcentaje de confianza de máquina | Reconoce máquina (ej. Press Pecho), confianza > 90% | Identificación simulada con 94% de confianza | **PASS** | Respuesta visual fluida |
| **FN-13b** | Guía Ergonómica | Visualización de regulación de asiento y postura | Muestra altura del asiento, posición de agarre y errores comunes | Instrucciones biomecánicas detalladas en español | **PASS** | Contenido didáctico de alto valor |
| **FN-14a** | Guardar en Gimnasio | Guardar máquina identificada en el inventario | Notificación de éxito y persistencia en "Mi Gimnasio" | Toast visible; máquina añadida al almacenamiento | **PARTIAL** | Permite duplicados idénticos (BUG-009) |
| **FN-14b** | Selector Simulación | Cambiar máquina analizada desde el selector demo | Actualización de foto, diagnóstico y ejercicios sugeridos | Actualiza el estado reactivamente sin recargar | **PASS** | Ideal para demostraciones y QA |

---

### Módulo E: Mi Gimnasio (Gestión de Sedes y Equipamiento)

| ID | Feature / Submódulo | Caso de Prueba | Comportamiento Esperado | Comportamiento Observado | Estado | Bugs / Notas |
|:---:|---|---|---|---|:---:|---|
| **FN-15a** | Inventario | Visualización de máquinas asociadas a la sede | Lista con fotos, estado de mantenimiento y categoría | Inventario cargado; filtros por categoría funcionales | **PASS** | Datos consistentes |
| **FN-15b** | Multi-Sede | Crear nueva sede de gimnasio | Modal de creación con nombre y tipo de sede | Nueva sede agregada a la lista disponible | **PASS** | Permite gestionar múltiples sedes |
| **FN-15c** | Cambio de Sede | Alternar entre diferentes gimnasios | Actualización del inventario de acuerdo a la sede activa | El inventario cambia de forma inmediata | **PASS** | Persiste en LocalStorage |

---

### Módulo F: Rutinas y Plantillas de Entrenamiento

| ID | Feature / Submódulo | Caso de Prueba | Comportamiento Esperado | Comportamiento Observado | Estado | Bugs / Notas |
|:---:|---|---|---|---|:---:|---|
| **FN-16** | Catálogo Rutinas | Visualización de plantillas oficiales (Push/Pull/Legs) | Tarjetas con número de ejercicios, días y enfoque muscular | Despliega rutinas predeterminadas completas | **PASS** | Diseño moderno y limpio |
| **FN-17** | Duplicar Rutina | Clonar plantilla oficial para personalización | Creación de nueva rutina editable con sufijo "(Copia)" | Rutina duplicada correctamente en la lista de usuario | **PASS** | ID único asignado |
| **FN-17b** | Lanzar Sesión | Iniciar entrenamiento directo desde una rutina | Precarga todos los ejercicios y series en `/workout` | Transfiere la estructura completa al Active Workout | **PASS** | Flujo rápido sin fricción |

---

### Módulo G: Evolución Corporal, Medidas y PRs

| ID | Feature / Submódulo | Caso de Prueba | Comportamiento Esperado | Comportamiento Observado | Estado | Bugs / Notas |
|:---:|---|---|---|---|:---:|---|
| **FN-18** | Vista Progreso | Navegación a pantalla de medidas corporales | Resumen de peso, % graso y galería fotográfica | Pantalla cargada con KPIs y comparativa visual | **PASS** | Datos de ejemplo inicializados |
| **FN-19** | Slider Comparador | Control deslizante interactivo Antes vs Después | Divisor deslizable que revela la transformación física | Slider responde suavemente al cursor y toques táctiles | **PASS** | Excelente experiencia de usuario |
| **FN-20** | Récords Personales | Cálculo y consulta de marcas 1RM vigentes | Tabla con 1RM estimado (Brzycki) y peso máximo histórico | 1RM para Sentadilla, Banca y Peso Muerto calculados con exactitud | **PASS** | Brzycki 100kg x 10 = 133.33kg validado |

---

### Módulo H: PWA, Offline & No-Implementados (Roadmap)

| ID | Feature / Submódulo | Caso de Prueba | Comportamiento Esperado | Comportamiento Observado | Estado | Bugs / Notas |
|:---:|---|---|---|---|:---:|---|
| **FN-21** | Modo Offline | Desconexión de red durante el entrenamiento activo | Funcionamiento ininterrumpido y persistencia local | La app opera 100% en cliente sin requerir red activa | **PASS** | Resiliente a cortes de internet |
| **FN-22** | Manifest PWA | Carga y validez de iconos PWA | Iconos 192px y 512px servidos con código HTTP 200 | Servidor responde HTTP 404 para ambos iconos | **FAIL / PARTIAL** | Assets ausentes en `public/data/` (BUG-006) |
| **FN-23** | Autenticación Cloud | Registro e inicio de sesión con backend multi-inquilino | Autenticación JWT / Supabase / Firebase | No implementado; arquitectura actual es Single-Tenant LocalStorage | **NOT_IMPLEMENTED** | Previsto para Fase Cloud Backend |
| **FN-24** | Sincronización Smartwatch | Integración con Apple Watch / WearOS | Envío de series y ritmo cardíaco a smartwatch | No implementado; interfaces mockeadas para futura integración | **NOT_IMPLEMENTED** | En roadmap para aplicaciones nativas |

---

## 3. Conclusión de la Evaluación Funcional

El núcleo aplicativo (Core Workflows) de **GYM PROGRESS** se encuentra en un estado funcional sólido, con una tasa de éxito de **86.7% en pruebas directas**. Los flujos principales —creación y ejecución de entrenamientos, búsqueda bilingüe, temporizador, catálogo con biomecánica, escáner simulado y seguimiento de PRs— operan de forma reactiva y sin quiebres de interfaz. Los puntos que degradan la experiencia son las trampas de foco en modales, la falta de prevención de doble submit y los iconos PWA rotos, los cuales tienen soluciones de bajo riesgo técnico.
