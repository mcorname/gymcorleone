# Informe de Contratos de Datos y Servicios de Persistencia (API_REPORT.md)

**Proyecto:** GYM PROGRESS / gymcorleone  
**Fecha:** 17 de Septiembre, 2026  
**Naturaleza de la Arquitectura:** Client-First Architecture (Almacenamiento Local Reactivo + Distribución Estática Edge)

---

## 1. Mapa de Rutas de la Aplicación (Next.js App Router)

Todas las rutas operan mediante Renderizado del Lado del Cliente (CSR) con cascarón estático servido desde Vercel Edge:

| Ruta | Nombre del Módulo | Tipo de Render | Componente Principal | Dependencias de Datos |
|---|---|:---:|---|---|
| `/` | Dashboard Principal | SSG + Client State | `DashboardView.tsx` | Historial, Racha, Inventario de Sede Activa |
| `/workout` | Entrenamiento Activo | Dynamic CSR | `ActiveWorkoutView.tsx` | Sesión en curso, Catálogo de Ejercicios |
| `/catalog` | Catálogo de Ejercicios | SSG + Client State | `ExerciseCatalogView.tsx` | `exercises_seed.json` (1,324 items) |
| `/scanner` | Escáner IA de Máquinas | Dynamic CSR | `ScannerView.tsx` | Modelos de visión, Mi Gimnasio |
| `/my-gym` | Mi Gimnasio & Equipos | Dynamic CSR | `MyGymView.tsx` | Sedes y catálogo de máquinas asignadas |
| `/routines` | Rutinas y Plantillas | SSG + Client State | `RoutinesView.tsx` | Plantillas oficiales y rutinas de usuario |
| `/progress` | Evolución y Medidas | Dynamic CSR | `ProgressView.tsx` | Registro histórico de peso y fotos |
| `/records` | Récords Personales (PR) | Dynamic CSR | `RecordsView.tsx` | Historial de series máximas y 1RM calculado |

---

## 2. Servicios de Datos Estáticos (Endpoints HTTP)

### `GET /data/exercises_seed.json`
- **Mecanismo:** Solicitud HTTP GET de recurso estático servido por Vercel Edge CDN.
- **Cabeceras Enviadas:** `Accept: application/json`
- **Cabeceras Recibidas:**
  - `Content-Type: application/json`
  - `Content-Encoding: br` (Brotli)
  - `Cache-Control: public, max-age=0, must-revalidate`
  - `ETag: W/"586903c38d6ae8dfd89834bb2dc561ab"`
- **Payload / Parámetros:** Ninguno.
- **Estructura de la Respuesta:** Array de 1,324 objetos `Exercise`:
  ```typescript
  interface Exercise {
    id: string; // "0001", "0002", etc.
    name: string; // "3/4 sit-up"
    nameEs: string; // "Elevación de tronco 3/4"
    bodyPart: string; // "waist"
    equipment: string; // "body weight"
    target: string; // "abs"
    secondaryMuscles: string[]; // ["hip flexors", "lower back"]
    secondaryMusclesEs: string[]; // ["flexores de cadera", "espalda baja"]
    instructions: string[]; // ["Lie flat on your back...", ...]
    instructionsEs: string[]; // ["Acuéstate boca arriba...", ...]
    image: string; // "https://raw.githubusercontent.com/.../0001.gif"
  }
  ```
- **Códigos de Estado:**
  - `200 OK`: Éxito en descarga inicial.
  - `304 Not Modified`: Entregado desde la caché del navegador validado por ETag.
- **Comportamiento ante Error o Desconexión:**
  [`ExerciseCatalogView.tsx`](file:///c:/Users/Mario%20Castro/Documents/antigravity/blissful-galileo/apps/web/src/components/exercises/ExerciseCatalogView.tsx#L47) captura la excepción en `.catch(() => setLoading(false))`, dejando la lista vacía con un mensaje informativo sin romper la navegación.

---

## 3. Servicios de Persistencia Local (`window.localStorage`)

La aplicación implementa persistencia reactiva en el cliente mediante claves estandarizadas:

### Clave 1: `gym_workout_active_session`
- **Propósito:** Recuperabilidad de sesión en caso de recarga accidental o cierre de pestaña durante el entrenamiento.
- **Estructura del Payload:**
  ```json
  {
    "id": "session_1726611200000",
    "name": "Entrenamiento de Empuje (Push)",
    "startTime": "2026-09-17T18:00:00.000Z",
    "exercises": [
      {
        "exerciseId": "0025",
        "name": "Press de Banca con Barra",
        "sets": [
          { "setNumber": 1, "weightKg": 80, "reps": 10, "completed": true, "rir": 2 },
          { "setNumber": 2, "weightKg": 85, "reps": 8, "completed": true, "rir": 1 }
        ]
      }
    ]
  }
  ```
- **Ciclo de Vida:** Creado al iniciar sesión; actualizado reactivamente en cada cambio de serie; eliminado al finalizar o descartar.

### Clave 2: `gym_workout_history`
- **Propósito:** Registro histórico inmutable de sesiones finalizadas.
- **Estructura del Payload:** Array de objetos `WorkoutSession` con timestamps de finalización, duración en minutos y volumen total levantado en kilogramos.
- **Riesgos Identificados:** Susceptible a doble inserción si no se bloquea el botón "Guardar" (ver BUG-003).

### Clave 3: `gym_my_gym_locations` & `gym_active_gym_id`
- **Propósito:** Gestión de sedes de entrenamiento y vinculación de máquinas disponibles en cada una.
- **Estructura:**
  ```json
  [
    {
      "id": "gym_central",
      "name": "Gimnasio Smart Fit - Sede Central",
      "type": "comercial",
      "machines": [
        { "id": "mac_101", "model": "chest_press_machine", "addedAt": "2026-09-10" }
      ]
    }
  ]
  ```

### Clave 4: `gym_body_progress`
- **Propósito:** Seguimiento de composición corporal y fotografías de transformación.
- **Estructura:** Array de registros con peso (kg), porcentaje graso estimado y URLs o Base64 de fotografías frontales y laterales.
- **Riesgo:** Cuota máxima de almacenamiento local de 5MB (BUG-012).

---

## 4. Resiliencia de Red y Modo Offline

- **Comportamiento en Pérdida Total de Red (Modo Avión / Sótano):**
  - **Entrenamiento Activo:** **100% Funcional.** No requiere ninguna petición de red; las series, temporizadores y cálculos matemáticos operan enteramente en el hilo principal del navegador.
  - **Cálculo de Récords:** **100% Funcional.** Se evalúa localmente contra el historial ya descargado.
  - **Catálogo de Ejercicios:** Si la app ya se abrió una vez en la sesión, los datos residen en la memoria RAM y operan sin red. Si es la primera visita en frío sin red, la petición HTTP fallará hasta recuperar la conexión.
