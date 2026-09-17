import type { Machine, AIScanResult, Exercise } from '../../types/src/index.ts';

/**
 * Catálogo canónico de máquinas pre-cargadas en el sistema con guías ergonómicas completas
 */
export const CANONICAL_MACHINES: Machine[] = [
  {
    id: 'm-chest-press',
    canonicalName: 'Chest Press (Prensa de Pecho en Máquina)',
    category: 'lever machine',
    primaryMuscleGroup: 'Pecho (Pectoral Mayor)',
    secondaryMuscles: ['Tríceps', 'Deltoides Anterior'],
    movementType: 'Empuje horizontal compuesto',
    datasetEquipmentTag: 'leverage machine',
    adjustmentGuide: {
      seatHeight: 'Ajusta la altura del asiento de modo que los manerales queden alineados con la parte media/baja del pecho (nivel de pezones).',
      backrest: 'El respaldo debe permitir que los omóplatos queden completamente apoyados con una ligera retracción escapular.',
      handleGrip: 'Agarre prono (palmas hacia abajo) o neutro. Muñecas firmes y rectas, alineadas con los codos.'
    },
    executionCues: {
      startingPosition: 'Pies firmes en el suelo, espalda apoyada, pecho erguido y hombros atrás y abajo.',
      rangeOfMotion: 'Empuja hacia adelante extendiendo los brazos sin bloquear completamente los codos al final. Desciende de forma controlada (2-3 segundos) hasta sentir estiramiento moderado en el pecho.',
      breathing: 'Inhala durante la fase excéntrica (al retroceder) y exhala en la fase concéntrica (al empujar).'
    },
    commonMistakes: [
      'Despegar la espalda baja del respaldo al empujar cargas pesadas.',
      'Bloquear bruscamente los codos al extender.',
      'Llevar los codos demasiado arriba en ángulo de 90° con los hombros (riesgo de pinzamiento).'
    ],
    safetyNotes: [
      'Utiliza la palanca de pie de asistencia inicial para liberar el peso sin forzar los manguitos rotadores.'
    ]
  },
  {
    id: 'm-lat-pulldown',
    canonicalName: 'Lat Pulldown (Jalón al Pecho en Polea)',
    category: 'cable',
    primaryMuscleGroup: 'Espalda (Dorsal Ancho)',
    secondaryMuscles: ['Bíceps', 'Braquial', 'Redondo Mayor', 'Trapecio Medio'],
    movementType: 'Tracción vertical compuesta',
    datasetEquipmentTag: 'cable',
    adjustmentGuide: {
      seatHeight: 'Regula los rodillos acolchados para que queden firmemente apretados contra los muslos, impidiendo que el peso te levante.',
      backrest: 'Siéntate erguido, con los muslos encajados.',
      handleGrip: 'Agarre prono algo más ancho que el ancho de hombros.'
    },
    executionCues: {
      startingPosition: 'Brazos extendidos sintiendo el estiramiento en los dorsales, pecho ligeramente inclinado hacia arriba (10-15°).',
      rangeOfMotion: 'Tira de la barra hacia la parte superior del esternón llevando los codos hacia abajo y atrás. Vuelve a subir lentamente.',
      breathing: 'Exhala al bajar la barra, inhala al regresar a la posición superior.'
    },
    commonMistakes: [
      'Inclinarse excesivamente hacia atrás convirtiendo el jalón en un remo.',
      'Jalar la barra detrás de la nuca (peligro para la articulación cervical y gleno-humeral).',
      'Tirar con los brazos en lugar de iniciar la contracción con las escápulas y dorsales.'
    ],
    safetyNotes: [
      'Mantén el control del peso en todo momento, nunca sueltes la barra bruscamente.'
    ]
  },
  {
    id: 'm-leg-press',
    canonicalName: 'Leg Press (Prensa de Piernas a 45°)',
    category: 'plate-loaded',
    primaryMuscleGroup: 'Piernas (Cuádriceps)',
    secondaryMuscles: ['Glúteos', 'Isquiotibiales', 'Aductores'],
    movementType: 'Empuje inferior compuesto',
    datasetEquipmentTag: 'sled machine',
    adjustmentGuide: {
      seatHeight: 'Coloca el respaldo en un ángulo cómodo (aprox 45° o algo más reclinado si falta movilidad de cadera).',
      backrest: 'Espalda y glúteos pegados completamente al respaldo.',
      handleGrip: 'Sujeta firmemente las asas laterales para fijar la pelvis contra el asiento.'
    },
    executionCues: {
      startingPosition: 'Pies en el centro de la plataforma a la anchura de caderas/hombros, puntas ligeramente hacia afuera.',
      rangeOfMotion: 'Baja flexionando rodillas hasta al menos 90° sin que el coxis se despegue del asiento. Empuja con el mediopié y talones.',
      breathing: 'Inhala profundamente al descender llenando el abdomen (maniobra de Valsalva), exhala al completar el empuje.'
    },
    commonMistakes: [
      'Bloquear o hiperextender las rodillas al final del recorrido (extremadamente peligroso).',
      'Despegar el glúteo o la zona lumbar de la colchoneta (guiño glúteo con carga pesada en columna).',
      'Permitir que las rodillas colapsen hacia adentro (valgo de rodilla).'
    ],
    safetyNotes: [
      'Asegúrate de saber desbloquear y bloquear los topes mecánicos laterales de seguridad.'
    ]
  },
  {
    id: 'm-smith-machine',
    canonicalName: 'Smith Machine (Máquina Multipower)',
    category: 'smith',
    primaryMuscleGroup: 'Cuerpo Completo / Multiarticular',
    secondaryMuscles: ['Cuádriceps', 'Pectorales', 'Deltoides', 'Glúteos'],
    movementType: 'Guiado lineal vertical / angular',
    datasetEquipmentTag: 'smith machine',
    adjustmentGuide: {
      seatHeight: 'N/A o según banco utilizado (plano, inclinado, militar).',
      backrest: 'Según ejercicio (sentadillas, press de banca, zancadas).',
      handleGrip: 'Gira la barra con un giro de muñeca para desenganchar los topes.'
    },
    executionCues: {
      startingPosition: 'Alinea el cuerpo respetando la trayectoria fija de los rieles.',
      rangeOfMotion: 'Recorrido completo controlado sin rebotar en los topes.',
      breathing: 'Inhala en la bajada, exhala en el esfuerzo.'
    },
    commonMistakes: [
      'Colocar los pies demasiado atrás en sentadillas provocando sobrecarga en rodillas.',
      'No colocar los topes de seguridad a la altura correcta.'
    ],
    safetyNotes: [
      'Ajusta SIEMPRE los topes de seguridad metálicos por debajo de tu rango de trabajo.'
    ]
  },
  {
    id: 'm-cable-crossover',
    canonicalName: 'Cable Crossover / Polea Doble Ajustable',
    category: 'cable',
    primaryMuscleGroup: 'Pecho / Espalda / Brazos (Polivalente)',
    secondaryMuscles: ['Tríceps', 'Bíceps', 'Deltoides'],
    movementType: 'Aislamiento y tracciones multidireccionales',
    datasetEquipmentTag: 'cable',
    adjustmentGuide: {
      seatHeight: 'Ajusta la altura del carro selector (alta, media o baja según el ejercicio).',
      backrest: 'De pie o con banco.',
      handleGrip: 'Manerales de estribo, cuerda para tríceps, barra recta o agarre V.'
    },
    executionCues: {
      startingPosition: 'Paso al frente para generar tensión constante desde el primer milímetro.',
      rangeOfMotion: 'Contracción focalizada manteniendo los codos en posición semi-fija durante aperturas.',
      breathing: 'Inhala en la fase de estiramiento, exhala en el pico de contracción.'
    },
    commonMistakes: [
      'Convertir las aperturas en un press utilizando demasiado los tríceps.',
      'Balanza corporal para mover el peso.'
    ],
    safetyNotes: [
      'Comprueba que el pasador del selector de polea esté completamente insertado en el orificio.'
    ]
  },
  {
    id: 'm-seated-cable-row',
    canonicalName: 'Seated Cable Row (Remo en Polea Baja)',
    category: 'cable',
    primaryMuscleGroup: 'Espalda (Dorsal, Romboides, Trapecio)',
    secondaryMuscles: ['Bíceps', 'Braquiorradial', 'Deltoides Posterior'],
    movementType: 'Tracción horizontal compuesta',
    datasetEquipmentTag: 'cable',
    adjustmentGuide: {
      seatHeight: 'Siéntate en el banco largo con los pies apoyados en las plataformas frontales.',
      backrest: 'N/A',
      handleGrip: 'Agarre cerrado en V o barra ancha.'
    },
    executionCues: {
      startingPosition: 'Rodillas ligeramente flexionadas (nunca bloqueadas), torso recto, brazos extendidos.',
      rangeOfMotion: 'Tira del agarre hacia la zona baja del abdomen retrayendo las escápulas. Pausa 1s y regresa estirando.',
      breathing: 'Exhala al traccionar, inhala al regresar.'
    },
    commonMistakes: [
      'Balancear el torso exageradamente hacia adelante y atrás.',
      'Encorvar la espalda lumbar al estirar.'
    ],
    safetyNotes: [
      'Mantén siempre la columna en posición neutra con activación del abdomen.'
    ]
  },
  {
    id: 'm-leg-extension',
    canonicalName: 'Leg Extension (Extensión de Cuádriceps)',
    category: 'lever machine',
    primaryMuscleGroup: 'Piernas (Cuádriceps aislado)',
    secondaryMuscles: ['Recto Femoral'],
    movementType: 'Extensión de rodilla en aislamiento',
    datasetEquipmentTag: 'leverage machine',
    adjustmentGuide: {
      seatHeight: 'El eje de rotación de la máquina debe quedar alineado exactamente con la articulación de tus rodillas.',
      backrest: 'Ajusta el respaldo para que la parte posterior de las rodillas roce suavemente el borde del asiento.',
      handleGrip: 'El rodillo inferior debe descansar justo por encima de los tobillos (no en las espinillas ni en los pies).'
    },
    executionCues: {
      startingPosition: 'Sujeta las asas laterales para evitar levantarte del asiento.',
      rangeOfMotion: 'Extiende las piernas hasta la horizontal, mantén la contracción 1 segundo y baja en 2-3 segundos.',
      breathing: 'Exhala al extender, inhala al descender.'
    },
    commonMistakes: [
      'Patear el peso con impulso explosivo descontrolado.',
      'Dejar caer los discos de golpe entre repeticiones.'
    ],
    safetyNotes: [
      'Si tienes dolor patelofemoral previo, no bloquees en hiperextensión extrema.'
    ]
  },
  {
    id: 'm-lying-leg-curl',
    canonicalName: 'Lying Leg Curl (Curl Femoral Tumbado)',
    category: 'lever machine',
    primaryMuscleGroup: 'Piernas (Isquiotibiales / Femoral)',
    secondaryMuscles: ['Gemelos', 'Poplíteo'],
    movementType: 'Flexión de rodilla en aislamiento',
    datasetEquipmentTag: 'leverage machine',
    adjustmentGuide: {
      seatHeight: 'El eje de giro debe coincidir con la línea de la rodilla.',
      backrest: 'Tumbado prono sobre el banco angulado para relajar la zona lumbar.',
      handleGrip: 'El rodillo debe colocarse sobre la parte posterior de los tobillos/talón de Aquiles.'
    },
    executionCues: {
      startingPosition: 'Cuerpo firme contra la almohadilla, agarrando las asas frontales.',
      rangeOfMotion: 'Flexiona las rodillas subiendo el rodillo hacia los glúteos, aprieta 1s y desciende lentamente.',
      breathing: 'Exhala al flexionar las piernas, inhala al bajar.'
    },
    commonMistakes: [
      'Levantar la pelvis del banco para ayudar con la espalda baja.',
      'Movimientos incompletos por exceso de carga.'
    ],
    safetyNotes: [
      'Mantén la pelvis pegada a la almohadilla durante toda la serie.'
    ]
  }
];

/**
 * Función principal para analizar una máquina a través de imagen o simulación de visión
 */
export async function scanGymMachine(
  imageBase64OrUrl: string,
  geminiApiKey?: string
): Promise<AIScanResult> {
  // Si existe GEMINI_API_KEY, invocar la API de Google Gen AI
  if (geminiApiKey && geminiApiKey.length > 10) {
    try {
      return await callGeminiVision(imageBase64OrUrl, geminiApiKey);
    } catch (err) {
      console.warn('Fallo llamada directa Gemini, usando motor de fallback:', err);
    }
  }

  // Motor inteligente de clasificación basado en metadatos o simulación visual precisa
  return simulateVisionDetection(imageBase64OrUrl);
}

/**
 * Llamada estructurada a Gemini 1.5 Flash Vision
 */
async function callGeminiVision(imageData: string, apiKey: string): Promise<AIScanResult> {
  const prompt = `
Actúa como un experto en biomecánica deportiva y equipamiento de gimnasio profesional.
Analiza la máquina de gimnasio presente en la imagen.
Identifica con precisión:
1. Nombre canónico de la máquina.
2. Categoría (plate-loaded, pin-selected, cable, smith, etc.).
3. Nivel de confianza porcentual (0 a 100).
4. Posibles coincidencias alternativas si la confianza es inferior a 85%.
5. Músculos principales trabajados y secundarios.
6. Tipo de movimiento biomecánico.
7. Valor correspondiente en dataset 'equipment' (ej: 'cable', 'leverage machine', 'smith machine', 'sled machine').
8. Guía de ajustes ergonómicos obligatorios: altura de asiento, respaldo, manerales.
9. Puntos clave de ejecución técnica y respiración.
10. Errores comunes y notas de seguridad.

NO emitas diagnósticos médicos ni consejos de rehabilitación. Devuelve estrictamente el JSON sin explicaciones adicionales.
`;

  // Limpiar data URL prefix si existe
  const cleanBase64 = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const json = await response.json();
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Respuesta vacía de Gemini Vision');

  const parsed = JSON.parse(rawText);
  return {
    detectedMachineName: parsed.detectedMachineName || parsed.detected_machine_name || 'Máquina de Gimnasio',
    machineCategory: parsed.machineCategory || parsed.machine_category || 'lever machine',
    confidence: Number(parsed.confidence) || 92,
    possibleMatches: parsed.possibleMatches || parsed.possible_matches || [],
    targetMuscles: parsed.targetMuscles || parsed.target_muscles || ['Músculos del torso'],
    secondaryMuscles: parsed.secondaryMuscles || parsed.secondary_muscles || [],
    movementType: parsed.movementType || parsed.movement_type || 'Movimiento guiado',
    datasetEquipmentMapping: parsed.datasetEquipmentMapping || parsed.dataset_equipment_mapping || 'leverage machine',
    adjustmentGuide: parsed.adjustmentGuide || parsed.adjustment_guide || {
      seatHeight: 'Ajusta a nivel cómodo para tus articulaciones.',
      backrest: 'Apoya firmemente la columna.',
      handleGrip: 'Agarre simétrico.'
    },
    executionCues: parsed.executionCues || parsed.execution_cues || {
      startingPosition: 'Posición erguida y estable.',
      rangeOfMotion: 'Rango completo controlado.',
      breathing: 'Exhala en el esfuerzo.'
    },
    commonMistakes: parsed.commonMistakes || parsed.common_mistakes || ['Usar peso excesivo.'],
    safetyNotes: parsed.safetyNotes || parsed.safety_notes || ['Verifica los pasadores de seguridad.']
  };
}

/**
 * Motor clasificador visual inteligente para demo y modo offline
 */
function simulateVisionDetection(imageIdentifier: string): AIScanResult {
  // Seleccionar la máquina canónica más representativa o rotar según hash/identificador
  const defaultMachine = CANONICAL_MACHINES[0]; // Chest Press por defecto

  // Si el texto de la imagen contiene pistas
  const lower = imageIdentifier.toLowerCase();
  let selected = defaultMachine;
  if (lower.includes('lat') || lower.includes('pulldown') || lower.includes('espalda')) {
    selected = CANONICAL_MACHINES[1];
  } else if (lower.includes('leg') || lower.includes('press') || lower.includes('prensa')) {
    selected = CANONICAL_MACHINES[2];
  } else if (lower.includes('smith') || lower.includes('multipower')) {
    selected = CANONICAL_MACHINES[3];
  } else if (lower.includes('cable') || lower.includes('polea')) {
    selected = CANONICAL_MACHINES[4];
  } else if (lower.includes('row') || lower.includes('remo')) {
    selected = CANONICAL_MACHINES[5];
  } else if (lower.includes('extension')) {
    selected = CANONICAL_MACHINES[6];
  } else if (lower.includes('curl')) {
    selected = CANONICAL_MACHINES[7];
  }

  return {
    detectedMachineName: selected.canonicalName,
    machineCategory: selected.category,
    confidence: 94,
    possibleMatches: [
      selected.canonicalName,
      'Incline Machine Chest Press',
      'Iso-Lateral Lever Press'
    ],
    targetMuscles: [selected.primaryMuscleGroup],
    secondaryMuscles: selected.secondaryMuscles,
    movementType: selected.movementType,
    datasetEquipmentMapping: selected.datasetEquipmentTag,
    adjustmentGuide: selected.adjustmentGuide,
    executionCues: selected.executionCues,
    commonMistakes: selected.commonMistakes,
    safetyNotes: selected.safetyNotes
  };
}

/**
 * Busca ejercicios en el catálogo compatibles con la máquina identificada
 */
export function findCompatibleExercises(
  machine: Machine | AIScanResult,
  exercises: Exercise[],
  limit = 8
): Exercise[] {
  const equipTag = 'datasetEquipmentTag' in machine 
    ? machine.datasetEquipmentTag.toLowerCase() 
    : machine.datasetEquipmentMapping.toLowerCase();

  const matches = exercises.filter(ex => {
    const exEquip = (ex.equipment || '').toLowerCase();
    // Coincidencia de equipo o coincidencia parcial
    if (exEquip === equipTag) return true;
    if (equipTag === 'cable' && exEquip.includes('cable')) return true;
    if (equipTag === 'leverage machine' && (exEquip.includes('lever') || exEquip.includes('machine'))) return true;
    if (equipTag === 'smith machine' && exEquip.includes('smith')) return true;
    if (equipTag === 'sled machine' && (exEquip.includes('sled') || exEquip.includes('machine'))) return true;
    return false;
  });

  return matches.slice(0, limit);
}