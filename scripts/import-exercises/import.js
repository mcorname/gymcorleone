const fs = require('fs');
const path = require('path');

const DATASET_URL = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json';
const RAW_CACHE_PATH = path.join(__dirname, 'raw_exercises.json');
const OUTPUT_SEED_PATH = path.join(__dirname, '../../apps/web/public/data/exercises_seed.json');
const OUTPUT_PACKAGES_PATH = path.join(__dirname, '../../packages/exercise-dataset/exercises_normalized.json');

// Mapeo amigable de grupos musculares y partes del cuerpo en español
const TRANSLATIONS = {
  body_parts: {
    'waist': 'Abdomen / Core',
    'chest': 'Pecho',
    'back': 'Espalda',
    'upper arms': 'Brazos',
    'lower arms': 'Antebrazos',
    'upper legs': 'Piernas (Cuádriceps/Femoral)',
    'lower legs': 'Pantorrillas',
    'shoulders': 'Hombros',
    'neck': 'Cuello',
    'cardio': 'Cardio'
  },
  equipment: {
    'body weight': 'Peso corporal',
    'cable': 'Polea / Cable',
    'barbell': 'Barra',
    'dumbbell': 'Mancuernas',
    'lever machine': 'Máquina de palanca / Placas',
    'smith machine': 'Máquina Smith',
    'kettlebell': 'Kettlebell',
    'band': 'Banda elástica',
    'medicine ball': 'Balón medicinal',
    'assisted': 'Asistido',
    'sled machine': 'Trineo / Prensa',
    'wheel roller': 'Rueda abdominal',
    'roller': 'Rodillo',
    'trap bar': 'Barra hexagonal'
  },
  target: {
    'abs': 'Abdominales',
    'pectorals': 'Pectorales',
    'lats': 'Dorsales',
    'biceps': 'Bíceps',
    'triceps': 'Tríceps',
    'delts': 'Deltoides',
    'glutes': 'Glúteos',
    'quads': 'Cuádriceps',
    'hamstrings': 'Isquiotibiales (Femoral)',
    'calves': 'Pantorrillas',
    'forearms': 'Antebrazos',
    'traps': 'Trapecios',
    'spine': 'Erectores espinales',
    'cardiovascular system': 'Sistema cardiovascular'
  }
};

async function fetchDataset() {
  if (fs.existsSync(RAW_CACHE_PATH)) {
    console.log(`[1/5] Cargando dataset en caché local desde: ${RAW_CACHE_PATH}`);
    const data = fs.readFileSync(RAW_CACHE_PATH, 'utf8');
    return JSON.parse(data);
  }

  console.log(`[1/5] Descargando dataset oficial desde GitHub (${DATASET_URL})...`);
  const res = await fetch(DATASET_URL);
  if (!res.ok) {
    throw new Error(`Error HTTP al descargar dataset: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  fs.writeFileSync(RAW_CACHE_PATH, JSON.stringify(data));
  console.log(`[✓] Dataset descargado y guardado en caché (${data.length} ejercicios encontrados).`);
  return data;
}

function normalizeExercise(raw) {
  const externalId = String(raw.id || '').trim();
  if (!externalId) {
    throw new Error('Ejercicio sin ID');
  }

  const name = String(raw.name || '').trim();
  const category = String(raw.category || '').trim();
  const bodyPart = String(raw.body_part || '').trim();
  const equipment = String(raw.equipment || '').trim();
  const target = String(raw.target || '').trim();
  const muscleGroup = String(raw.muscle_group || bodyPart || '').trim();

  // Obtener instrucciones en español (fallback a en)
  let instructionsEs = [];
  if (raw.instructions && typeof raw.instructions === 'object') {
    if (raw.instructions.es) {
      instructionsEs = [raw.instructions.es];
    } else if (raw.instructions.en) {
      instructionsEs = [raw.instructions.en];
    }
  }

  let instructionStepsEs = [];
  if (raw.instruction_steps && typeof raw.instruction_steps === 'object') {
    if (Array.isArray(raw.instruction_steps.es) && raw.instruction_steps.es.length > 0) {
      instructionStepsEs = raw.instruction_steps.es;
    } else if (Array.isArray(raw.instruction_steps.en)) {
      instructionStepsEs = raw.instruction_steps.en;
    }
  }

  // Nombre formateado en mayúscula inicial
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
  const targetEs = TRANSLATIONS.target[target.toLowerCase()] || target;
  const bodyPartEs = TRANSLATIONS.body_parts[bodyPart.toLowerCase()] || bodyPart;
  const equipmentEs = TRANSLATIONS.equipment[equipment.toLowerCase()] || equipment;

  // Media URLs del repositorio GitHub
  const rawBase = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main';
  const imageUrl = raw.image ? `${rawBase}/${raw.image}` : '';
  const gifUrl = raw.gif_url ? `${rawBase}/${raw.gif_url}` : '';

  const secondaryMuscles = Array.isArray(raw.secondary_muscles) ? raw.secondary_muscles : [];

  return {
    exercise: {
      id: externalId,
      name: formattedName,
      nameEs: formattedName,
      category,
      bodyPart,
      bodyPartEs,
      equipment,
      equipmentEs,
      target,
      targetEs,
      muscleGroup,
      secondaryMuscles,
      instructionsEs,
      instructionStepsEs,
      image: imageUrl,
      gifUrl: gifUrl,
      mediaId: raw.media_id,
      attribution: raw.attribution || 'exercises-dataset (Hasan E Yıldırım)'
    },
    media: [
      {
        exerciseId: externalId,
        mediaType: 'image',
        url: imageUrl,
        attribution: raw.attribution || 'exercises-dataset'
      },
      {
        exerciseId: externalId,
        mediaType: 'gif',
        url: gifUrl,
        attribution: raw.attribution || 'exercises-dataset'
      }
    ]
  };
}

async function runImport() {
  console.log('====================================================');
  console.log('   GYM PROGRESS — IMPORTADOR DE EJERCICIOS DATASET  ');
  console.log('====================================================');

  const rawList = await fetchDataset();
  console.log(`[2/5] Validando y normalizando ${rawList.length} ejercicios...`);

  const normalizedMap = new Map();
  const allMedia = [];
  const errors = [];
  const stats = {
    byBodyPart: {},
    byEquipment: {}
  };

  for (let i = 0; i < rawList.length; i++) {
    try {
      const item = rawList[i];
      const { exercise, media } = normalizeExercise(item);

      if (normalizedMap.has(exercise.id)) {
        // Evitar duplicados
        continue;
      }

      normalizedMap.set(exercise.id, exercise);
      allMedia.push(...media);

      stats.byBodyPart[exercise.bodyPart] = (stats.byBodyPart[exercise.bodyPart] || 0) + 1;
      stats.byEquipment[exercise.equipment] = (stats.byEquipment[exercise.equipment] || 0) + 1;
    } catch (err) {
      errors.push({ index: i, error: err.message });
    }
  }

  const normalizedList = Array.from(normalizedMap.values());
  console.log(`[3/5] Procesados con éxito: ${normalizedList.length} ejercicios únicos.`);
  console.log(`[3/5] Registros de medios vinculados: ${allMedia.length}.`);

  // Asegurar directorios de salida
  const seedDir = path.dirname(OUTPUT_SEED_PATH);
  if (!fs.existsSync(seedDir)) fs.mkdirSync(seedDir, { recursive: true });

  const pkgDir = path.dirname(OUTPUT_PACKAGES_PATH);
  if (!fs.existsSync(pkgDir)) fs.mkdirSync(pkgDir, { recursive: true });

  console.log(`[4/5] Escribiendo semillas de base de datos...`);
  fs.writeFileSync(OUTPUT_SEED_PATH, JSON.stringify(normalizedList));
  fs.writeFileSync(OUTPUT_PACKAGES_PATH, JSON.stringify(normalizedList));

  console.log(`[✓] Guardado en: ${OUTPUT_SEED_PATH} (${(fs.statSync(OUTPUT_SEED_PATH).size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`[✓] Guardado en: ${OUTPUT_PACKAGES_PATH}`);

  console.log('[5/5] REPORTE DE IMPORTACIÓN:');
  console.log('----------------------------------------------------');
  console.log(`Total ejercicios raw procesados:   ${rawList.length}`);
  console.log(`Total ejercicios únicos guardados: ${normalizedList.length}`);
  console.log(`Total errores encontrados:         ${errors.length}`);
  console.log('\nTop 5 partes del cuerpo:');
  Object.entries(stats.byBodyPart)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([bp, count]) => console.log(`  - ${bp}: ${count} ejercicios`));
  console.log('\nTop 5 tipos de equipamiento:');
  Object.entries(stats.byEquipment)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([eq, count]) => console.log(`  - ${eq}: ${count} ejercicios`));
  console.log('----------------------------------------------------');
  console.log('¡Importación completada con éxito!');
}

runImport().catch(err => {
  console.error('Error fatal en importador:', err);
  process.exit(1);
});
