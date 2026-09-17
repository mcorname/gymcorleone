# GYM PROGRESS — Tu Asistente Inteligente de Entrenamiento

> Plataforma profesional, moderna y completa de entrenamiento para gimnasio que combina la velocidad de registro de **HEVY** con la elegancia y sobriedad de **MICROSOFT 365**, potenciada por Inteligencia Artificial y un catálogo de más de 1,300 ejercicios.

---

## ⚡ Filosofía del Producto

* **"Registrar una serie debe tomar segundos"**: Interacción táctil sin fricción, visualización inmediata de los pesos de la sesión anterior en gris tenue, teclado numérico directo y confirmación en 1 toque.
* **Sobriedad Microsoft 365**: Fondos limpios (`#F5F6F8`), tarjetas blancas discretas, bordes suaves de 1px, tipografía `Segoe UI` / `Inter`, números tabulares de alto impacto y paleta cromática con significado funcional (Azul Principal `#2563EB`, Verde Excel `#107C41`, Naranja PowerPoint `#D83B01`, Morado Teams `#6264A7`, Rojo Alerta `#D13438`).
* **Flujo Diferencial de Visión IA**:
  $$\text{Fotografiar Máquina} \rightarrow \text{Identificar (IA)} \rightarrow \text{Ajustes Ergonómicos} \rightarrow \text{Biomecánica} \rightarrow \text{Ejercicios Compatibles} \rightarrow \text{Entrenar / Guardar en Mi Gimnasio}$$

---

## 🏛️ Arquitectura del Monorepo

```
gym-progress/
├── apps/
│   └── web/                    # Next.js 14+ (App Router, Tailwind CSS, PWA)
├── packages/
│   ├── types/                  # Modelos de dominio y contratos TypeScript transversales
│   ├── i18n/                   # Internacionalización, taxonomías bilingües y motor de búsqueda diacrítica
│   ├── calculations/           # Motor de cálculo puro: 1RM Epley, volumen, PRs y sobrecarga
│   ├── ai/                     # Visión artificial para escaneo de máquinas y mapeo de ejercicios
│   ├── offline-sync/           # Motor de almacenamiento y sincronización offline-first
│   └── exercise-dataset/       # Dataset normalizado con 1,324 ejercicios e instrucciones en español
├── scripts/
│   └── import-exercises/       # Script CLI de validación, normalización y siembra en BD
├── vercel.json                 # Configuración de despliegue optimizada para Vercel
├── package.json
└── README.md
```

---

## 🚀 Puesta en Marcha Rápida

### 1. Requisitos Previos
* Node.js v18+ (recomendado v20+ o v24)
* npm v10+

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Ejecutar Pruebas Unitarias del Motor de Cálculo
```bash
node --experimental-strip-types packages/calculations/tests/calculations.test.js
```
Verifica:
* 1RM Epley exacto: $1\text{RM} = \text{peso} \times (1 + \text{reps} / 30)$
* Volumen por serie y acumulado por sesión
* Detección automática de Récords Personales (PR)
* Motor de recomendaciones de sobrecarga progresiva
* Cálculo informativo de IMC

### 4. Importar y Normalizar el Dataset (1,300+ Ejercicios)
```bash
npm run import-exercises
```
Descarga, valida y normaliza 1,324 ejercicios desde el repositorio oficial `hasaneyldrm/exercises-dataset`, traduciendo categorías, objetivos y pasos biomecánicos al español con separación de recursos multimedia.

### 5. Iniciar la Aplicación en Desarrollo
```bash
npm run dev
```
Abre en tu navegador [http://localhost:3000](http://localhost:3000).

### 6. Compilar y Ejecutar en Producción
```bash
npm run build
npm --workspace=apps/web run start -- -p 3000
```

---

## 📱 Módulos Implementados en la Fase 1 (MVP)

1. **Dashboard Principal**:
   * Saludo profesional dinámico ("Buenas tardes, Mario").
   * Botón destacado de acción inmediata: **INICIAR ENTRENAMIENTO**.
   * Tarjetas métricas: Peso actual, sesiones semanales, volumen semanal acumulado, racha activa y último PR.
   * **Mapa Anatómico de Carga Muscular**: Representación frontal y posterior interactiva con gradiente azul-verde de fatiga y volumen (pecho, espalda, hombros, bíceps, tríceps, cuádriceps, femoral, glúteos, gemelos, core).
   * Historial de actividad reciente con duración, series y volumen.
   * Gráfica de evolución y sobrecarga progresiva.

2. **Entrenamiento Activo (Core Hevy Speed UX)**:
   * Cronómetro en vivo y cálculo instantáneo de volumen en la cabecera.
   * Referencia visual del peso y repeticiones de la última sesión (`70 × 10`).
   * Tipos de serie configurables: Normal (1, 2...), Calentamiento (W), Drop Set (D), Fallo (F), Backoff (B), AMRAP (A).
   * Controles rápidos de incremento (+2.5 kg, -2.5 kg, +1 rep, -1 rep).
   * **Botón Check [✓]**: Confirmación instantánea (<50ms), micro-animación verde y recálculo de volumen y 1RM.
   * **Detección Automática de PR**: Alerta animada en verde al batir peso máximo, 1RM o volumen.
   * **Temporizador Automático de Descanso**: Bottom Sheet con presets (30s, 45s, 60s, 90s, 120s, 180s), controles de +15s / -15s y saltar.
   * Modal buscador para añadir ejercicios en pleno entrenamiento entre los 1,324 disponibles.
   * Resumen de fin de sesión con métricas consolidadas.

3. **Escáner de Máquinas con Visión Artificial (IA)**:
   * Captura desde cámara en sala o subida de imagen.
   * Reconocimiento inteligente de máquinas de gimnasio con puntuación de confianza (`94%`).
   * Manejo de baja confianza (<75%) con alternativas para confirmación de usuario.
   * Desglose biomecánico: Músculos primarios (agonistas) y secundarios (sinergistas).
   * **Guía Ergonómica de Ajustes**: Altura del asiento, posición del respaldo, tipo de maneral y agarre.
   * Técnica correcta, respiración y errores comunes a evitar.
   * **Mapeo automático a ejercicios compatibles del dataset**.
   * Botones de 1 toque: **Agregar a Entrenamiento Activo** y **Guardar en Mi Gimnasio**.

4. **Mi Gimnasio**:
   * Inventario personalizado de máquinas y equipamiento de tu sede (ej. SmartFit Centro).
   * Filtro inteligente: La aplicación prioriza rutinas y ejercicios para los que el usuario sí dispone de máquinas.
   * Registro rápido mediante escaneo por foto o catálogo canónico.

5. **Biblioteca de Ejercicios (1,324 ítems)**:
   * Búsqueda en tiempo real con debounce.
   * Filtros por grupo muscular y por equipamiento (barra, mancuerna, polea, máquina, peso corporal).
   * Ficha técnica detallada con animaciones GIF/imágenes y pasos biomecánicos en español.

6. **Mis Rutinas**:
   * Plantillas profesionales precargadas: Push Pull Legs (PPL), Upper / Lower, Full Body, etc.
   * Duplicado y personalización de rutinas.
   * Lanzamiento directo a la pantalla de entrenamiento activo.

7. **Progreso Corporal & Medidas**:
   * Historial de peso, porcentaje de grasa, cintura, pecho, brazos, piernas.
   * Cálculo informativo de IMC con clasificación estandarizada.
   * **Comparador Visual de Transformación**: Slider interactivo Antes vs Después.
   * Tabla completa de Récords Personales (PRs).

8. **Modo Offline-First**:
   * Arquitectura reactiva que guarda el estado de la sesión activa en almacenamiento local.
   * Ninguna serie se pierde ante caídas de red o falta de cobertura en el gimnasio.
   * Indicador dinámico en la barra superior: *Sincronizado*, *Sincronizando...*, *Guardado en dispositivo*, *Sin conexión*.

---

## 🎨 Design System: Tokens de Color

| Token | Hex | Referencia | Propósito en la Interfaz |
| :--- | :--- | :--- | :--- |
| `primary` | `#2563EB` | Azul M365 | Acciones principales, botones primarios, enlaces, focus |
| `primary-dark` | `#1E3A8A` | Azul Oscuro | Títulos importantes, encabezados, analítica |
| `success` | `#107C41` | Verde Excel | PRs conseguidos, sets completados, constancia positiva |
| `energy` | `#D83B01` | Naranja PowerPoint | Entrenamiento activo, cronómetro, racha de días |
| `ai-purple` | `#6264A7` | Morado Teams | Escáner Vision AI, sugerencias inteligentes |
| `danger` | `#D13438` | Rojo Alerta | Eliminación, descartar sesión, alertas |
| `bg-main` | `#F5F6F8` | Gris Neutro Claro | Fondo general de la aplicación |
| `card` | `#FFFFFF` | Blanco | Superficie de tarjetas y modales |
| `border` | `#E5E7EB` | Gris Borde | Divisores y bordes suaves de 1px |

---

## 📄 Licencia

Desarrollado para GYM PROGRESS. Dataset de ejercicios atribuido a Hasan E. Yıldırım (`exercises-dataset`).
