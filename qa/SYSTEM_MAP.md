# GYM PROGRESS — Mapa del Sistema & Inventario Funcional (SYSTEM_MAP.md)

---

## 1. Arquitectura del Sistema

```
gymcorleone (Monorepo Turborepo + npm Workspaces)
├── apps/
│   └── web/ (Next.js 14.2 App Router, Tailwind CSS, Lucide React, PWA)
│       ├── public/
│       │   ├── data/exercises_seed.json (Dataset canónico: 1,324 ejercicios con i18n)
│       │   └── manifest.json (Configuración PWA)
│       └── src/
│           ├── app/ (layout.tsx, page.tsx, globals.css)
│           ├── components/
│           │   ├── layout/ (Navbar, Sidebar, BottomNav)
│           │   ├── dashboard/ (DashboardView, MuscleHeatmap)
│           │   ├── workout/ (ActiveWorkoutView, RestTimerModal)
│           │   ├── routines/ (RoutinesView)
│           │   ├── exercises/ (ExerciseCatalogView)
│           │   ├── machines/ (MachineScannerView)
│           │   ├── gym/ (MyGymView)
│           │   └── progress/ (ProgressView)
│           └── lib/ (storage.ts - AppStorage API)
└── packages/
    ├── types/ (Contratos TypeScript: Exercise, WorkoutSession, Routine, Machine, etc.)
    ├── i18n/ (Taxonomías bilingües, motor de búsqueda diacrítica, diccionario fitness)
    ├── calculations/ (1RM Epley, volumen acumulado, PRs, sobrecarga progresiva, IMC)
    ├── ai/ (Visión artificial de máquinas de gimnasio y mapeo de ejercicios)
    ├── offline-sync/ (Cola de mutaciones offline-first y estados de conectividad)
    └── exercise-dataset/ (Catálogo normalizado)
```

---

## 2. Inventario de Rutas y Vistas

La aplicación está diseñada como una **Single Page Application (SPA) modular y offline-first** montada sobre la ruta raíz `/` de Next.js, con navegación por pestañas internas sincronizadas con estado reactivo y persistencia local:

| ID Pestaña | Nombre Visible | Componente Principal | Acceso Desktop | Acceso Mobile |
|:---|:---|:---|:---|:---|
| `dashboard` | **Inicio** | `DashboardView.tsx` | Sidebar (`Inicio`) / Logo Navbar | BottomNav (`Inicio`) |
| `workout` | **Entrenar** | `ActiveWorkoutView.tsx` | Sidebar (`Entrenar`) / Botón Hero | Botón central destacado |
| `routines` | **Mis Rutinas** | `RoutinesView.tsx` | Sidebar (`Mis Rutinas`) | BottomNav (`Rutinas`) |
| `exercises` | **Biblioteca (1,300+)** | `ExerciseCatalogView.tsx` | Sidebar (`Biblioteca`) | Menú lateral |
| `machines` | **Escáner Máquina (IA)** | `MachineScannerView.tsx` | Sidebar (`Escanear Máquina`) | BottomNav (`Escáner IA`) |
| `gym` | **Mi Gimnasio** | `MyGymView.tsx` | Sidebar (`Mi Gimnasio`) / Badge Navbar | Enlace desde escáner |
| `progress` | **Progreso & Medidas** | `ProgressView.tsx` | Sidebar (`Progreso`) | BottomNav (`Progreso`) |
| `records` | **Récords Personales** | `ProgressView.tsx` (Tab PRs) | Sidebar (`Récords Personales`) | Desde Dashboard card |

---

## 3. Inventario Detallado de Componentes, Modales y Acciones

### 3.1 Layout & Navegación Global
* **`Navbar.tsx`**:
  - Logo `GYM PROGRESS` ➔ Clic navega a `dashboard`.
  - Badge de gimnasio activo (`SmartFit Centro`) ➔ Clic navega a `gym`.
  - Badge de estado de sincronización (`Sincronizado`, `Sin conexión`, `Guardado local`).
  - Badge de idioma `🇪🇸 ES` (Español neutro).
  - Indicador flotante de entrenamiento en vivo (`Entrenamiento en Vivo`) cuando hay sesión activa.
  - Perfil de usuario (`Mario Castro - Nivel Intermedio`).
* **`Sidebar.tsx`** (Pantallas $\ge 1024\text{px}$):
  - 8 botones de navegación principal con iconos y estados activos.
  - Badge de notificación pulsante en `Entrenar` cuando hay sesión activa.
  - Tarjeta inferior de racha semanal (`Racha activa: 5 días`).
* **`BottomNav.tsx`** (Pantallas $< 1024\text{px}$):
  - 5 accesos táctiles: Inicio, Rutinas, Botón flotante central de Entrenar, Escáner IA, Progreso.

### 3.2 Módulo 1: Dashboard (`DashboardView.tsx`)
* **Hero Banner**:
  - Saludo dinámico según hora del día (`Buenos días / tardes / noches`).
  - Resumen del día actual (`Push Day - Pecho, Hombro anterior y Tríceps`).
  - Botón primario: `INICIAR ENTRENAMIENTO` ➔ Carga sesión predeterminada y abre `ActiveWorkoutView`.
* **Métricas Clave Superiores (5 cards)**:
  - Peso Corporal (clic navega a `progress`).
  - Sesiones Semanales (4/5 días - 80%).
  - Volumen Semanal (tonelaje acumulado en kg).
  - Racha Activa (días consecutivos).
  - Último PR (clic navega a `progress`).
* **Mapa de Carga Muscular (`MuscleHeatmap.tsx`)**:
  - Selector de perspectiva: `Frontal` vs `Posterior`.
  - 11 tarjetas interactivas de grupos musculares con barras de progreso y categorías de estímulo (`Óptimo`, `Moderado`, `Bajo`).
* **Gráfica de Progreso y Tendencia**:
  - Selector de métrica: `Volumen Total`, `1RM Estimado`, `Peso Corporal`.
  - Selector de rango temporal: `7D`, `30D`, `3M`, `6M`, `1A`.
  - Gráfico interactivo de barras de tonelaje diario (Lun - Dom).
* **Actividad Reciente**:
  - Historial de las últimas sesiones finalizadas con tiempo, series y volumen en kg.

### 3.3 Módulo 2: Entrenamiento Activo (`ActiveWorkoutView.tsx`)
* **Header Fijo**:
  - Botón volver (`ArrowLeft`).
  - Cronómetro de sesión en tiempo real (formato `MM:SS` o `HH:MM:SS`).
  - Contador dinámico de volumen total en kg.
  - Botón primario: `Finalizar` ➔ Abre modal de resumen.
* **Alertas Biomecánicas**:
  - Toast emergente animado de Récord Personal (PR).
  - Banner inteligente de recomendación de Sobrecarga Progresiva (+2.5 kg).
* **Listado de Ejercicios en Sesión**:
  - Miniatura o icono del ejercicio.
  - Nombre en español y taxonomías de músculo / equipamiento.
  - Botón eliminar ejercicio (`Trash2`).
  - Tabla de series:
    * Columna Set # con tipo (`normal`, `warmup`, `dropset`).
    * Columna Anterior (peso previo en gris tenue).
    * Columna Peso (kg) con botones de ajuste rápido `+2.5` y `-2.5`.
    * Columna Reps con botones de ajuste rápido `+1` y `-1`.
    * Selector de RIR (0 al fallo, 1, 2, 3, 4+).
    * Botón de Check [✓] para marcar serie completada en verde.
  - Botón `Agregar Serie` (+1 serie clonando peso y reps de la anterior).
* **Modal Selector de Ejercicios (Picker)**:
  - Campo de búsqueda bilingüe con debounce en tiempo real.
  - Lista de 1,324 ejercicios con miniatura, nombre en español y equipamiento.
  - Botón `+ Seleccionar` ➔ Añade el ejercicio a la sesión y cierra el modal.
* **Modal de Temporizador de Descanso (`RestTimerModal.tsx`)**:
  - Disparador automático al completar una serie.
  - Cronómetro gigante con barra de progreso circular / lineal.
  - Presets rápidos: 30s, 45s, 60s, 90s, 120s, 180s.
  - Controles `+15s`, `-15s`, `Pausar / Reanudar`.
  - Botón `Saltar Descanso y Continuar`.
* **Modal de Finalización y Resumen**:
  - Resumen de métricas: Tiempo transcurrido, Tonelaje acumulado, Series completadas.
  - Botón `Continuar entrenando` (cancela modal).
  - Botón `Guardar y Salir` ➔ Persiste en `AppStorage`, limpia sesión activa y redirige a `dashboard`.

### 3.4 Módulo 3: Biblioteca de Ejercicios (`ExerciseCatalogView.tsx`)
* **Buscador Bilingüe**:
  - Input con normalización diacrítica (insensible a tildes y mayúsculas).
  - Coincidencia sobre nombres en español, inglés, músculos, equipamiento y alias.
* **Filtros de Taxonomías**:
  - 7 Filtros rápidos de músculos: `Todos`, `Pecho`, `Espalda`, `Brazos`, `Piernas`, `Hombros`, `Core`.
  - 6 Filtros de equipamiento: `Cualquier Equipo`, `Barra`, `Mancuernas`, `Polea`, `Máquinas`, `Peso Corporal`.
* **Grid de Ejercicios**:
  - Cards con imagen, nombre en español, taxonomías y objetivo muscular.
  - Botón `Ver técnica y pasos`.
  - Botón `+ Entrenar` (agrega a la sesión activa).
  - Paginación progresiva: botón `Cargar más ejercicios (+24)`.
* **Modal de Detalle Biomecánico**:
  - Animación GIF o imagen en alta resolución.
  - Nombres bilingües y badges de alias.
  - Músculo principal y músculos secundarios en español.
  - Instrucciones paso a paso en español.

### 3.5 Módulo 4: Escáner IA de Máquinas (`MachineScannerView.tsx`)
* **Opciones de Captura**:
  - Botón de apertura de cámara (`capture="environment"`).
  - Botón de carga de archivo de imagen.
  - 4 accesos rápidos de simulación: `Prensa 45°`, `Polea Alta`, `Multipower (Smith)`, `Remo en Polea`.
* **Resultado del Análisis IA**:
  - Badge de nivel de confianza (`92% Confianza`).
  - Nombre de la máquina detectada y categoría funcional.
  - Botón `Guardar en Mi Gimnasio`.
  - Desglose anatómico: Músculos Primarios (Agonistas) y Secundarios (Sinergistas).
  - Guía ergonómica de ajustes: Altura de asiento, Respaldo, Agarre.
  - Técnica de ejecución y errores frecuentes a evitar.
  - Grid de ejercicios compatibles extraídos del catálogo de 1,324.

### 3.6 Módulo 5: Mi Gimnasio (`MyGymView.tsx`)
* **Gestión de Sede**:
  - Nombre del gimnasio (`SmartFit Centro`) e indicador de estado `Activo`.
  - Filtro toggle `Solo Disponibles`.
* **Inventario de Máquinas**:
  - Lista de equipamiento con origen (`IA` vs manual).
  - Botón toggle de disponibilidad (verde = disponible, gris = fuera de servicio).
* **Modal de Añadir Máquina Manual**:
  - Lista del catálogo canónico de máquinas (`CANONICAL_MACHINES`).
  - Botón `+ Añadir`.

### 3.7 Módulo 6: Progreso & Medidas (`ProgressView.tsx`)
* **Pestaña 1: Mi Cuerpo & Medidas**:
  - Tarjeta de última medición con IMC informativo y clasificación.
  - Botón `+ Registrar Medida` ➔ Modal con campos: Peso (kg), Altura (cm), Grasa (%), Cintura (cm), Brazo (cm), Notas.
  - Historial de pesajes y mediciones antropométricas.
* **Pestaña 2: Récords Personales (PRs)**:
  - Grid de marcas históricas máximas (Peso Máximo y 1RM Estimado).
* **Pestaña 3: Comparación Visual**:
  - Comparador interactivo Antes vs Después con control deslizante horizontal (`input[type="range"]`).
