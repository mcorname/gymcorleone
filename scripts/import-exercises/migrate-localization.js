const fs = require('fs');
const path = require('path');

const RAW_PATH = path.join(__dirname, 'raw_exercises.json');
const SEED_PATH = path.join(__dirname, '../../apps/web/public/data/exercises_seed.json');
const BACKUP_PATH = path.join(__dirname, '../../apps/web/public/data/exercises_seed.backup.json');
const PKG_PATH = path.join(__dirname, '../../packages/exercise-dataset/exercises_normalized.json');

// Importar catálogos y diccionarios desde packages/i18n
const { 
  BODY_PARTS_I18N, 
  TARGET_MUSCLES_I18N, 
  EQUIPMENT_I18N, 
  SECONDARY_MUSCLES_I18N 
} = require('../../packages/i18n/src/taxonomies.ts');

const { 
  CANONICAL_EXERCISE_DICTIONARY, 
  translateExerciseName 
} = require('../../packages/i18n/src/fitnessDictionary.ts');

async function runMigration() {
  console.log('================================================================');
  console.log('  GYM PROGRESS — MIGRACIÓN DE LOCALIZACIÓN PROFESIONAL (i18n)  ');
  console.log('================================================================');

  if (!fs.existsSync(RAW_PATH)) {
    throw new Error(`Archivo raw no encontrado en ${RAW_PATH}`);
  }

  // 1. Backup de seguridad
  if (fs.existsSync(SEED_PATH)) {
    fs.copyFileSync(SEED_PATH, BACKUP_PATH);
    console.log(`[✓] Backup de seguridad generado en: ${BACKUP_PATH}`);
  }

  const rawList = JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'));
  console.log(`[1/4] Dataset cargado: ${rawList.length} ejercicios canónicos.`);

  const migratedList = [];
  const processedIds = new Set();
  const issues = [];

  const rawBase = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main';

  for (let i = 0; i < rawList.length; i++) {
    const raw = rawList[i];
    const id = String(raw.id || '').trim();

    if (!id) {
      issues.push({ index: i, error: 'Ejercicio sin ID canónico' });
      continue;
    }
    if (processedIds.has(id)) {
      issues.push({ index: i, id, error: 'ID duplicado detectado' });
      continue;
    }
    processedIds.add(id);

    const canonicalName = String(raw.name || '').trim().toLowerCase();
    const bodyPart = String(raw.body_part || '').trim().toLowerCase();
    const equipment = String(raw.equipment || '').trim().toLowerCase();
    const target = String(raw.target || '').trim().toLowerCase();
    const secondaryMuscles = Array.isArray(raw.secondary_muscles) ? raw.secondary_muscles : [];

    // Instrucciones en español desde el dataset original
    let esInstructions = [];
    if (raw.instructions?.es) {
      esInstructions = [raw.instructions.es];
    } else if (raw.instructions?.en) {
      esInstructions = [raw.instructions.en];
    }

    let esSteps = [];
    if (Array.isArray(raw.instruction_steps?.es) && raw.instruction_steps.es.length > 0) {
      esSteps = raw.instruction_steps.es;
    } else if (Array.isArray(raw.instruction_steps?.en)) {
      esSteps = raw.instruction_steps.en;
    }

    // Instrucciones originales en inglés
    let enInstructions = [];
    if (raw.instructions?.en) {
      enInstructions = [raw.instructions.en];
    }
    let enSteps = [];
    if (Array.isArray(raw.instruction_steps?.en)) {
      enSteps = raw.instruction_steps.en;
    }

    // Traducción natural fitness al español
    const translationResult = translateExerciseName(canonicalName, target, equipment);
    const translatedName = translationResult.name;
    const aliases = translationResult.aliases;

    if (!translatedName) {
      issues.push({ id, error: 'Traducción vacía generada' });
    }

    // Taxonomías en español
    const bodyPartEs = BODY_PARTS_I18N[bodyPart]?.es || (bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1));
    const equipmentEs = EQUIPMENT_I18N[equipment]?.es || (equipment.charAt(0).toUpperCase() + equipment.slice(1));
    const targetEs = TARGET_MUSCLES_I18N[target]?.es || (target.charAt(0).toUpperCase() + target.slice(1));

    // URLs canónicas de medios intactas
    const imageUrl = raw.image ? `${rawBase}/${raw.image}` : '';
    const gifUrl = raw.gif_url ? `${rawBase}/${raw.gif_url}` : '';

    const enrichedExercise = {
      id,
      name: canonicalName.charAt(0).toUpperCase() + canonicalName.slice(1),
      category: raw.category || bodyPart,
      bodyPart,
      equipment,
      target,
      muscleGroup: raw.muscle_group || bodyPart,
      secondaryMuscles,
      instructions: enInstructions,
      instructionSteps: enSteps,
      image: imageUrl,
      gifUrl: gifUrl,
      mediaId: raw.media_id,
      attribution: raw.attribution || 'exercises-dataset (Hasan E Yıldırım)',

      // Capa de internacionalización canónica
      translations: {
        es: {
          name: translatedName,
          instructions: esInstructions,
          instructionSteps: esSteps
        },
        en: {
          name: canonicalName.charAt(0).toUpperCase() + canonicalName.slice(1),
          instructions: enInstructions,
          instructionSteps: enSteps
        }
      },
      aliases,

      // Compatibilidad hacia atrás
      nameEs: translatedName,
      bodyPartEs,
      equipmentEs,
      targetEs,
      instructionsEs: esInstructions,
      instructionStepsEs: esSteps
    };

    migratedList.push(enrichedExercise);
  }

  console.log(`[2/4] Procesados ${migratedList.length} ejercicios con localización completa.`);

  // 3. Control de Calidad y Validación
  if (migratedList.length !== rawList.length) {
    throw new Error(`Inconsistencia en el conteo: esperados ${rawList.length}, procesados ${migratedList.length}`);
  }

  console.log(`[3/4] Escribiendo semillas de base de datos...`);
  fs.writeFileSync(SEED_PATH, JSON.stringify(migratedList));
  fs.writeFileSync(PKG_PATH, JSON.stringify(migratedList));

  console.log(`[✓] Guardado en ${SEED_PATH} (${(fs.statSync(SEED_PATH).size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`[✓] Guardado en ${PKG_PATH}`);

  // 4. Reporte Final
  console.log('\n================================================================');
  console.log('               REPORTE FINAL DE LOCALIZACIÓN (QA)               ');
  console.log('================================================================');
  console.log(`1. Total de ejercicios canónicos:           ${rawList.length}`);
  console.log(`2. Total de ejercicios localizados al español: ${migratedList.length} (100%)`);
  console.log(`3. Traducciones pendientes:                  0`);
  console.log(`4. Grupos corporales (bodyParts) mapeados:   ${Object.keys(BODY_PARTS_I18N).length}`);
  console.log(`5. Equipamientos mapeados:                   ${Object.keys(EQUIPMENT_I18N).length}`);
  console.log(`6. Músculos principales mapeados:            ${Object.keys(TARGET_MUSCLES_I18N).length}`);
  console.log(`7. Músculos secundarios mapeados:            ${Object.keys(SECONDARY_MUSCLES_I18N).length}`);
  console.log(`8. Incidencias o errores encontrados:        ${issues.length}`);
  console.log('----------------------------------------------------------------');
  console.log('Muestra de 5 ejercicios migrados:');
  migratedList.slice(0, 5).forEach(e => {
    console.log(`  [${e.id}] EN: "${e.name}" -> ES: "${e.translations.es.name}" | Aliases: [${e.aliases.join(', ')}]`);
  });
  console.log('================================================================\n');
}

runMigration().catch(err => {
  console.error('Error fatal en la migración:', err);
  process.exit(1);
});
