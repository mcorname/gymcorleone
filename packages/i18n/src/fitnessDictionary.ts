export interface TranslatedExerciseInfo {
  name: string;
  aliases: string[];
}

// 1. Diccionario de traducciones canónicas exactas para los ejercicios más frecuentes y emblemáticos
export const CANONICAL_EXERCISE_DICTIONARY: Record<string, TranslatedExerciseInfo> = {
  // --- PECHO (CHEST) ---
  "barbell bench press": {
    name: "Press de banca con barra",
    aliases: ["bench press", "press plano", "press de pecho con barra", "press banca", "press banca plano"]
  },
  "dumbbell bench press": {
    name: "Press de banca con mancuernas",
    aliases: ["dumbbell press", "press mancuernas plano", "press plano", "bench press"]
  },
  "incline barbell bench press": {
    name: "Press inclinado con barra",
    aliases: ["incline bench press", "press de banca inclinado", "press inclinado barra"]
  },
  "barbell incline bench press": {
    name: "Press inclinado con barra",
    aliases: ["incline bench press", "press de banca inclinado", "press inclinado barra"]
  },
  "incline dumbbell bench press": {
    name: "Press inclinado con mancuernas",
    aliases: ["incline dumbbell press", "press superior con mancuernas", "press inclinado mancuernas"]
  },
  "dumbbell incline bench press": {
    name: "Press inclinado con mancuernas",
    aliases: ["incline dumbbell press", "press superior con mancuernas", "press inclinado mancuernas"]
  },
  "decline barbell bench press": {
    name: "Press declinado con barra",
    aliases: ["decline bench press", "press inferior con barra", "press declinado"]
  },
  "barbell decline bench press": {
    name: "Press declinado con barra",
    aliases: ["decline bench press", "press inferior con barra", "press declinado"]
  },
  "decline dumbbell bench press": {
    name: "Press declinado con mancuernas",
    aliases: ["decline dumbbell press", "press declinado mancuerna"]
  },
  "dumbbell decline bench press": {
    name: "Press declinado con mancuernas",
    aliases: ["decline dumbbell press", "press declinado mancuerna"]
  },
  "dumbbell fly": {
    name: "Aperturas con mancuernas en banco plano",
    aliases: ["dumbbell flyes", "aperturas mancuernas", "aperturas pecho"]
  },
  "incline dumbbell fly": {
    name: "Aperturas inclinadas con mancuernas",
    aliases: ["incline flyes", "aperturas inclinadas"]
  },
  "decline dumbbell fly": {
    name: "Aperturas declinadas con mancuernas",
    aliases: ["decline flyes", "aperturas declinadas"]
  },
  "cable crossover": {
    name: "Cruces en polea (Cable Crossover)",
    aliases: ["cable crossover", "cruces polea", "aperturas en polea"]
  },
  "cable middle fly": {
    name: "Cruces en polea a media altura",
    aliases: ["cable fly", "cruces polea media"]
  },
  "push-up": {
    name: "Flexiones de pecho",
    aliases: ["push up", "lagartijas", "fondos en suelo", "planchas de pecho"]
  },
  "push up": {
    name: "Flexiones de pecho",
    aliases: ["push up", "lagartijas", "fondos en suelo", "planchas de pecho"]
  },
  "chest dip": {
    name: "Fondos para pecho en barras paralelas",
    aliases: ["chest dip", "fondos paralelas pecho", "dips pecho"]
  },
  "pec deck fly": {
    name: "Aperturas en máquina Pec Deck",
    aliases: ["pec deck", "contractora", "mariposa en maquina"]
  },

  // --- ESPALDA (BACK) ---
  "barbell deadlift": {
    name: "Peso muerto convencional con barra",
    aliases: ["deadlift", "peso muerto", "despegue", "peso muerto barra"]
  },
  "deadlift": {
    name: "Peso muerto convencional",
    aliases: ["deadlift", "peso muerto"]
  },
  "romanian deadlift": {
    name: "Peso muerto rumano",
    aliases: ["rdl", "romanian deadlift", "peso muerto femorales"]
  },
  "barbell romanian deadlift": {
    name: "Peso muerto rumano con barra",
    aliases: ["rdl", "barbell rdl", "peso muerto rumano barra"]
  },
  "dumbbell romanian deadlift": {
    name: "Peso muerto rumano con mancuernas",
    aliases: ["dumbbell rdl", "rdl mancuernas", "peso muerto mancuernas"]
  },
  "lat pulldown": {
    name: "Jalón al pecho en polea",
    aliases: ["lat pulldown", "jalón dorsal", "polea al pecho", "tirón al pecho", "jalon"]
  },
  "cable lat pulldown": {
    name: "Jalón al pecho en polea alta",
    aliases: ["lat pulldown", "jalón polea", "jalón dorsal", "jalon al pecho"]
  },
  "cable seated row": {
    name: "Remo sentado en polea baja",
    aliases: ["cable row", "remo bajo", "remo en polea", "seated row", "remo sentado"]
  },
  "seated cable row": {
    name: "Remo sentado en polea baja",
    aliases: ["cable row", "remo bajo", "remo en polea", "seated row", "remo sentado"]
  },
  "barbell bent over row": {
    name: "Remo inclinado con barra",
    aliases: ["bent over row", "barbell row", "remo con barra", "remo 90 grados"]
  },
  "dumbbell row": {
    name: "Remo con mancuerna a una mano",
    aliases: ["one arm dumbbell row", "remo mancuerna", "remo unilateral"]
  },
  "one arm dumbbell row": {
    name: "Remo con mancuerna a una mano",
    aliases: ["dumbbell row", "remo serrucho", "remo unilateral"]
  },
  "t-bar row": {
    name: "Remo en barra T",
    aliases: ["t bar row", "remo barra t", "remo esquina"]
  },
  "pull-up": {
    name: "Dominadas pronas",
    aliases: ["pull up", "dominadas", "pullup", "dominadas barra"]
  },
  "chin-up": {
    name: "Dominadas supinas",
    aliases: ["chin up", "dominadas agarre supino", "chinup", "dominadas bíceps"]
  },
  "hyperextension": {
    name: "Hiperextensiones lumbares en banco a 45°",
    aliases: ["hyperextensions", "lumbares en banco", "back extension"]
  },
  "back extension on exercise ball": {
    name: "Hiperextensiones lumbares en fitball",
    aliases: ["back extension", "lumbares pelota"]
  },

  // --- PIERNAS (LEGS) ---
  "barbell squat": {
    name: "Sentadilla con barra",
    aliases: ["squat", "sentadillas traseras", "back squat", "sentadilla libre"]
  },
  "barbell back squat": {
    name: "Sentadilla trasera con barra",
    aliases: ["back squat", "sentadilla con barra", "squat", "sentadillas"]
  },
  "barbell front squat": {
    name: "Sentadilla frontal con barra",
    aliases: ["front squat", "sentadilla delantera"]
  },
  "leg press": {
    name: "Prensa de piernas a 45°",
    aliases: ["leg press", "prensa 45", "prensa inclinada", "prensa piernas"]
  },
  "sled 45° leg press": {
    name: "Prensa de piernas a 45°",
    aliases: ["leg press", "prensa 45", "prensa inclinada"]
  },
  "leg extension": {
    name: "Extensiones de cuádriceps en máquina",
    aliases: ["leg extension", "sillón de cuádriceps", "cuadriceps maquina"]
  },
  "lever leg extension": {
    name: "Extensiones de cuádriceps en máquina",
    aliases: ["leg extension", "extension cuadriceps"]
  },
  "lying leg curl": {
    name: "Curl femoral tumbado en máquina",
    aliases: ["lying leg curl", "isquiotibiales tumbado", "femoral acostado"]
  },
  "lever lying leg curl": {
    name: "Curl femoral tumbado en máquina",
    aliases: ["lying leg curl", "isquios tumbado", "femoral"]
  },
  "seated leg curl": {
    name: "Curl femoral sentado en máquina",
    aliases: ["seated leg curl", "isquios sentado", "femoral sentado"]
  },
  "standing calf raise": {
    name: "Elevación de talones de pie (Gemelos)",
    aliases: ["calf raise", "gemelos de pie", "pantorrillas de pie"]
  },
  "seated calf raise": {
    name: "Elevación de talones sentado (Sóleo)",
    aliases: ["seated calf raise", "soleo sentado", "gemelos sentado"]
  },
  "barbell hip thrust": {
    name: "Hip thrust con barra (Empuje de cadera)",
    aliases: ["hip thrust", "empuje de cadera con barra", "glúteos barra"]
  },
  "hip thrust": {
    name: "Hip thrust (Empuje de cadera)",
    aliases: ["hip thrust", "empuje cadera", "glúteos"]
  },
  "barbell walking lunge": {
    name: "Zancadas caminando con barra",
    aliases: ["walking lunges", "estocadas caminando"]
  },
  "dumbbell walking lunge": {
    name: "Zancadas caminando con mancuernas",
    aliases: ["walking lunges", "estocadas con mancuernas"]
  },
  "bulgarian split squat": {
    name: "Sentadilla búlgara",
    aliases: ["bulgarian split squat", "sentadilla bulgara", "split squat"]
  },
  "dumbbell bulgarian split squat": {
    name: "Sentadilla búlgara con mancuernas",
    aliases: ["bulgarian split squat", "sentadilla bulgara con mancuernas"]
  },

  // --- HOMBROS (SHOULDERS) ---
  "overhead press": {
    name: "Press militar sobre la cabeza",
    aliases: ["overhead press", "military press", "press militar hombros", "ohp"]
  },
  "barbell overhead press": {
    name: "Press militar con barra",
    aliases: ["barbell military press", "press de pie con barra", "ohp", "press militar"]
  },
  "barbell military press": {
    name: "Press militar con barra",
    aliases: ["military press", "press militar de pie", "ohp"]
  },
  "dumbbell shoulder press": {
    name: "Press militar con mancuernas",
    aliases: ["dumbbell press hombros", "press sentado con mancuernas", "press hombros"]
  },
  "dumbbell lateral raise": {
    name: "Elevaciones laterales con mancuernas",
    aliases: ["lateral raises", "vuelos laterales", "elevaciones laterales", "hombro lateral"]
  },
  "cable lateral raise": {
    name: "Elevaciones laterales en polea",
    aliases: ["cable lateral raise", "vuelos en polea"]
  },
  "dumbbell front raise": {
    name: "Elevaciones frontales con mancuernas",
    aliases: ["front raises", "vuelos frontales", "hombro frontal"]
  },
  "face pull": {
    name: "Face pull en polea con cuerda",
    aliases: ["face pull", "tirón a la cara", "deltoides posterior cuerda", "facepull"]
  },
  "dumbbell rear delt fly": {
    name: "Pájaros con mancuernas para deltoides posterior",
    aliases: ["rear delt fly", "pajaros mancuerna", "vuelos posteriores"]
  },
  "barbell shrug": {
    name: "Encogimientos de hombros con barra (Trapecios)",
    aliases: ["shrugs", "encogimientos barra", "trapecios"]
  },
  "dumbbell shrug": {
    name: "Encogimientos de hombros con mancuernas",
    aliases: ["shrugs", "encogimientos mancuerna", "trapecios"]
  },

  // --- BRAZOS (ARMS - BICEPS & TRICEPS) ---
  "barbell bicep curl": {
    name: "Curl de bíceps con barra",
    aliases: ["barbell curl", "curl con barra recta", "biceps barra"]
  },
  "barbell curl": {
    name: "Curl de bíceps con barra",
    aliases: ["barbell curl", "curl con barra recta"]
  },
  "dumbbell bicep curl": {
    name: "Curl de bíceps con mancuernas",
    aliases: ["bicep curl", "curl mancuernas", "curl de pie", "curl biceps"]
  },
  "hammer curl": {
    name: "Curl martillo con mancuernas",
    aliases: ["hammer curl", "curl neutro", "martillo bíceps", "curl martillo"]
  },
  "preacher curl": {
    name: "Curl de bíceps en banco Scott (predicador)",
    aliases: ["preacher curl", "banco scott", "curl predicador"]
  },
  "ez barbell curl": {
    name: "Curl de bíceps con barra EZ",
    aliases: ["ez curl", "curl barra z", "barra ez biceps"]
  },
  "cable triceps pushdown": {
    name: "Extensiones de tríceps en polea",
    aliases: ["triceps pushdown", "jalón de tríceps", "polea tríceps", "pushdown"]
  },
  "cable pushdown": {
    name: "Extensiones de tríceps en polea",
    aliases: ["triceps pushdown", "jalón tríceps"]
  },
  "skullcrusher": {
    name: "Press francés con barra (Skullcrusher)",
    aliases: ["skull crusher", "press frances", "extension tríceps acostado", "rompecraneos"]
  },
  "barbell skullcrusher": {
    name: "Press francés con barra",
    aliases: ["skull crusher", "press frances barra", "rompecraneos"]
  },
  "dips": {
    name: "Fondos en barras paralelas",
    aliases: ["dips", "fondos paralelas", "paralelas pecho tríceps", "fondos"]
  },
  "triceps dip": {
    name: "Fondos de tríceps en paralelas",
    aliases: ["triceps dips", "fondos triceps"]
  },
  "dumbbell kickback": {
    name: "Patada de tríceps con mancuerna",
    aliases: ["triceps kickback", "patada trasera triceps"]
  },

  // --- CORE & ABDOMEN ---
  "hanging leg raise": {
    name: "Elevaciones de piernas colgado en barra",
    aliases: ["hanging leg raise", "abdominales colgado", "elevación piernas", "barra fija abdomen"]
  },
  "hanging knee raise": {
    name: "Elevaciones de rodillas colgado en barra",
    aliases: ["hanging knee raise", "rodillas colgado", "elevacion rodillas"]
  },
  "plank": {
    name: "Plancha abdominal isométrica",
    aliases: ["plank", "plancha estática", "plancha frontal"]
  },
  "side plank": {
    name: "Plancha lateral isométrica",
    aliases: ["side plank", "plancha oblicuos"]
  },
  "ab wheel rollout": {
    name: "Despliegue con rueda abdominal",
    aliases: ["ab wheel", "rueda abdominal", "rollout", "despliegue abdominal"]
  },
  "russian twist": {
    name: "Giro ruso (Russian Twist)",
    aliases: ["russian twist", "giros rusos", "oblicuos suelo"]
  },
  "cable woodchopper": {
    name: "Leñador en polea (Woodchopper)",
    aliases: ["woodchopper", "leñador polea", "giro polea"]
  },
  "air bike": {
    name: "Bicicleta en el aire (Abdominales bicicleta)",
    aliases: ["air bike", "bicycle crunch", "bici abdominal"]
  },
  "3/4 sit-up": {
    name: "Abdominales tradicionales 3/4",
    aliases: ["sit-up", "situp", "crunch abdominal"]
  },
  "45° side bend": {
    name: "Flexión lateral a 45°",
    aliases: ["side bend", "oblicuos en banco", "flexion lateral"]
  }
};

// 2. Diccionario de raíces de movimiento principales
const MOVEMENT_ROOTS: Array<{ pattern: RegExp; es: string }> = [
  { pattern: /\bbench\s*press\b/i, es: "Press de banca" },
  { pattern: /\bincline\s*bench\s*press\b/i, es: "Press inclinado de banca" },
  { pattern: /\bdecline\s*bench\s*press\b/i, es: "Press declinado de banca" },
  { pattern: /\bincline\s*press\b/i, es: "Press inclinado" },
  { pattern: /\bdecline\s*press\b/i, es: "Press declinado" },
  { pattern: /\bshoulder\s*press\b/i, es: "Press de hombros" },
  { pattern: /\boverhead\s*press\b/i, es: "Press militar sobre la cabeza" },
  { pattern: /\bmilitary\s*press\b/i, es: "Press militar" },
  { pattern: /\bchest\s*press\b/i, es: "Press de pecho" },
  { pattern: /\bleg\s*press\b/i, es: "Prensa de piernas" },
  { pattern: /\bpush\s*press\b/i, es: "Push press" },
  { pattern: /\bfloor\s*press\b/i, es: "Press en el suelo" },
  { pattern: /\bpress\b/i, es: "Press" },

  { pattern: /\bfront\s*squat\b/i, es: "Sentadilla frontal" },
  { pattern: /\bback\s*squat\b/i, es: "Sentadilla trasera" },
  { pattern: /\bhack\s*squat\b/i, es: "Sentadilla hack" },
  { pattern: /\bgoblet\s*squat\b/i, es: "Sentadilla goblet" },
  { pattern: /\bsplit\s*squat\b/i, es: "Sentadilla split (búlgara)" },
  { pattern: /\bsquats?\b/i, es: "Sentadilla" },

  { pattern: /\bromanian\s*deadlift\b/i, es: "Peso muerto rumano" },
  { pattern: /\bstiff\s*(leg|legged)\s*deadlift\b/i, es: "Peso muerto piernas rígidas" },
  { pattern: /\bsumo\s*deadlift\b/i, es: "Peso muerto sumo" },
  { pattern: /\bdeadlifts?\b/i, es: "Peso muerto" },

  { pattern: /\bwalking\s*lunges?\b/i, es: "Zancadas caminando" },
  { pattern: /\blunges?\b/i, es: "Zancadas" },

  { pattern: /\blat\s*pulldowns?\b/i, es: "Jalón al pecho" },
  { pattern: /\bpulldowns?\b/i, es: "Jalón en polea" },

  { pattern: /\bchin[\s-]?ups?\b/i, es: "Dominadas supinas" },
  { pattern: /\bpull[\s-]?ups?\b/i, es: "Dominadas" },
  { pattern: /\bpush[\s-]?ups?\b/i, es: "Flexiones de pecho" },
  { pattern: /\bchest\s*dips?\b/i, es: "Fondos de pecho" },
  { pattern: /\bdips?\b/i, es: "Fondos" },

  { pattern: /\bbent[\s-]?over\s*rows?\b/i, es: "Remo inclinado" },
  { pattern: /\bseated\s*rows?\b/i, es: "Remo sentado" },
  { pattern: /\bupright\s*rows?\b/i, es: "Remo al mentón" },
  { pattern: /\brows?\b/i, es: "Remo" },

  { pattern: /\bhammer\s*curls?\b/i, es: "Curl martillo" },
  { pattern: /\bpreacher\s*curls?\b/i, es: "Curl predicador (banco Scott)" },
  { pattern: /\bconcentration\s*curls?\b/i, es: "Curl concentrado" },
  { pattern: /\bbiceps?\s*curls?\b/i, es: "Curl de bíceps" },
  { pattern: /\bwrist\s*curls?\b/i, es: "Curl de muñeca" },
  { pattern: /\bcurls?\b/i, es: "Curl" },

  { pattern: /\bskull[\s-]?crushers?\b/i, es: "Press francés (Skullcrusher)" },
  { pattern: /\bpushdowns?\b/i, es: "Extensiones en polea" },
  { pattern: /\bkickbacks?\b/i, es: "Patada trasera" },
  { pattern: /\btriceps?\s*extensions?\b/i, es: "Extensión de tríceps" },

  { pattern: /\blateral\s*raises?\b/i, es: "Elevaciones laterales" },
  { pattern: /\bfront\s*raises?\b/i, es: "Elevaciones frontales" },
  { pattern: /\brear\s*delt\s*(fly|raise)s?\b/i, es: "Pájaros (Deltoides posterior)" },
  { pattern: /\braises?\b/i, es: "Elevaciones" },

  { pattern: /\bcalf\s*raises?\b/i, es: "Elevación de talones (Gemelos)" },
  { pattern: /\bleg\s*extensions?\b/i, es: "Extensión de cuádriceps" },
  { pattern: /\bleg\s*curls?\b/i, es: "Curl femoral" },
  { pattern: /\bhip\s*thrusts?\b/i, es: "Hip thrust (Empuje de cadera)" },
  { pattern: /\bglute\s*bridges?\b/i, es: "Puente de glúteos" },
  { pattern: /\bshrugs?\b/i, es: "Encogimientos de trapecios" },

  { pattern: /\bfly(es)?\b/i, es: "Aperturas" },
  { pattern: /\bpullovers?\b/i, es: "Pullover" },
  { pattern: /\bsit[\s-]?ups?\b/i, es: "Abdominales tradicionales" },
  { pattern: /\bcrunches?\b/i, es: "Crunch abdominal" },
  { pattern: /\bside\s*planks?\b/i, es: "Plancha lateral" },
  { pattern: /\bplanks?\b/i, es: "Plancha abdominal" },
  { pattern: /\brussian\s*twists?\b/i, es: "Giro ruso" },
  { pattern: /\bside\s*bends?\b/i, es: "Flexión lateral" },
  { pattern: /\bheel\s*touch(ers)?\b/i, es: "Toques de talón" },
  { pattern: /\bface\s*pulls?\b/i, es: "Face pull" },
  { pattern: /\bstretches?\b/i, es: "Estiramiento" },
  { pattern: /\brollouts?\b/i, es: "Despliegue con rueda" },
  { pattern: /\bjumps?\b/i, es: "Saltos" },
  { pattern: /\btwists?\b/i, es: "Giros" }
];

export function translateExerciseName(
  rawName: string,
  targetMuscle?: string,
  equipment?: string
): TranslatedExerciseInfo {
  let clean = (rawName || "").toLowerCase().trim();
  clean = clean.replace(/\s*\(male\)\s*/gi, "").replace(/\s*\(female\)\s*/gi, "").trim();

  // 1. Coincidencia directa en el catálogo canónico
  if (CANONICAL_EXERCISE_DICTIONARY[clean]) {
    return CANONICAL_EXERCISE_DICTIONARY[clean];
  }

  // 2. Identificar raíz de movimiento
  let rootAction = "";
  for (const root of MOVEMENT_ROOTS) {
    if (root.pattern.test(clean)) {
      rootAction = root.es;
      break;
    }
  }

  if (!rootAction) {
    // Si no coincide con ninguna raíz estándar, capitalizar limpio
    rootAction = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  // 3. Posturas y modificadores de ejecución
  let modifiers = "";
  if (/\bincline\b/i.test(clean) && !rootAction.toLowerCase().includes("inclinad")) modifiers += " inclinado";
  if (/\bdecline\b/i.test(clean) && !rootAction.toLowerCase().includes("declinad")) modifiers += " declinado";
  if (/\bseated\b/i.test(clean) && !rootAction.toLowerCase().includes("sentad")) modifiers += " sentado";
  if (/\bstanding\b/i.test(clean) && !rootAction.toLowerCase().includes("de pie")) modifiers += " de pie";
  if (/\blying\b/i.test(clean) && !rootAction.toLowerCase().includes("tumbad")) modifiers += " tumbado";
  if (/\bprone\b/i.test(clean)) modifiers += " boca abajo";
  if (/\bkneeling\b/i.test(clean)) modifiers += " de rodillas";
  if (/\bhanging\b/i.test(clean) && !rootAction.toLowerCase().includes("colgad")) modifiers += " colgado";
  if (/\bclose[\s-]?grip\b/i.test(clean)) modifiers += " con agarre cerrado";
  if (/\bwide[\s-]?grip\b/i.test(clean)) modifiers += " con agarre ancho";
  if (/\breverse[\s-]?grip\b/i.test(clean)) modifiers += " con agarre supino";
  if (/\bneutral[\s-]?grip\b/i.test(clean) || /\bparallel[\s-]?grip\b/i.test(clean)) modifiers += " con agarre neutro";
  if (/\b(single|one)[\s-]?arm\b/i.test(clean)) modifiers += " a un brazo";
  if (/\b(single|one)[\s-]?leg\b/i.test(clean)) modifiers += " a una pierna";
  if (/\balternat(e|ing)\b/i.test(clean)) modifiers += " alterno";
  if (/\bassisted\b/i.test(clean) && !rootAction.toLowerCase().includes("asistid")) modifiers = " asistido" + modifiers;

  // 4. Equipamiento implicado
  let equipText = "";
  if (/\bbarbell\b/i.test(clean) && !rootAction.toLowerCase().includes("barra")) equipText = " con barra";
  else if (/\bdumbbell\b/i.test(clean) && !rootAction.toLowerCase().includes("mancuerna")) equipText = " con mancuernas";
  else if (/\bcable\b/i.test(clean) && !rootAction.toLowerCase().includes("polea")) equipText = " en polea";
  else if (/\bsmith\b/i.test(clean) && !rootAction.toLowerCase().includes("smith")) equipText = " en máquina Smith";
  else if (/\bkettlebell\b/i.test(clean) && !rootAction.toLowerCase().includes("kettlebell")) equipText = " con kettlebell";
  else if (/\b(resistance\s*)?band\b/i.test(clean) && !rootAction.toLowerCase().includes("banda")) equipText = " con banda elástica";
  else if (/\b(stability|exercise)\s*ball\b/i.test(clean)) equipText = " en fitball";
  else if (/\bmedicine\s*ball\b/i.test(clean)) equipText = " con balón medicinal";
  else if (/\bbosu\b/i.test(clean)) equipText = " en BOSU";
  else if (/\bez\s*bar(bell)?\b/i.test(clean)) equipText = " con barra EZ";
  else if (/\btrap\s*bar\b/i.test(clean)) equipText = " con barra hexagonal";
  else if (/\bsled\b/i.test(clean)) equipText = " en trineo";

  let finalName = (rootAction + modifiers + equipText).replace(/\s+/g, ' ').trim();
  finalName = finalName.charAt(0).toUpperCase() + finalName.slice(1);

  // Generar aliases bilingües inteligentes
  const aliasesSet = new Set<string>();
  aliasesSet.add(clean); // Nombre original siempre es alias

  if (clean.includes("bench press")) { aliasesSet.add("bench press"); aliasesSet.add("press banca"); }
  if (clean.includes("squat")) { aliasesSet.add("squat"); aliasesSet.add("sentadilla"); }
  if (clean.includes("deadlift")) { aliasesSet.add("deadlift"); aliasesSet.add("peso muerto"); }
  if (clean.includes("pulldown")) { aliasesSet.add("pulldown"); aliasesSet.add("jalon"); aliasesSet.add("jalón"); }
  if (clean.includes("curl")) { aliasesSet.add("curl"); aliasesSet.add("biceps"); }
  if (clean.includes("pushdown")) { aliasesSet.add("pushdown"); aliasesSet.add("triceps"); }
  if (clean.includes("raise")) { aliasesSet.add("elevaciones"); }
  if (clean.includes("lunge")) { aliasesSet.add("zancadas"); aliasesSet.add("estocadas"); }
  if (clean.includes("thrust")) { aliasesSet.add("hip thrust"); }
  if (clean.includes("shrug")) { aliasesSet.add("trapecios"); }

  return {
    name: finalName,
    aliases: Array.from(aliasesSet)
  };
}
