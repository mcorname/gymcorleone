import type { 
  Exercise, 
  WorkoutSession, 
  WorkoutSet, 
  PersonalRecord, 
  Routine, 
  BodyMeasurement, 
  Machine, 
  Gym,
  GymEquipmentItem 
} from '@gym/types';
import { CANONICAL_MACHINES } from '@gym/ai';

const KEYS = {
  EXERCISES: 'gym_progress_exercises',
  ACTIVE_SESSION: 'gym_progress_active_session',
  WORKOUT_HISTORY: 'gym_progress_workout_history',
  PERSONAL_RECORDS: 'gym_progress_prs',
  ROUTINES: 'gym_progress_routines',
  BODY_MEASUREMENTS: 'gym_progress_body_measurements',
  MY_GYM: 'gym_progress_my_gym',
  LAST_REST_TIMER: 'gym_progress_rest_timer'
};

// Rutinas predeterminadas de calidad profesional
export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'routine-ppl',
    title: 'Push Pull Legs (Fuerza & Hipertrofia)',
    description: 'División clásica de 3 a 6 días por semana optimizada para recuperación muscular y sobrecarga progresiva.',
    category: 'PPL',
    isTemplate: true,
    days: [
      {
        id: 'day-push',
        name: 'Día 1: Empuje (Pecho, Hombro, Tríceps)',
        exercises: [
          {
            id: 're-1',
            exerciseId: '0025',
            targetSets: 4,
            minReps: 6,
            maxReps: 10,
            targetRir: 2,
            restSeconds: 120,
            notes: 'Enfócate en pausa de 1 segundo en el pecho.',
            exercise: {
              id: '0025',
              name: 'Barbell Bench Press',
              nameEs: 'Press de Banca con Barra',
              category: 'chest',
              bodyPart: 'chest',
              equipment: 'barbell',
              target: 'pectorals',
              muscleGroup: 'pecho',
              secondaryMuscles: ['tríceps', 'deltoides anterior'],
              instructionsEs: ['Acuéstate en el banco, baja la barra al esternón y empuja con fuerza controlada.'],
              instructionStepsEs: ['Coloca los pies planos en el suelo', 'Retrae las escápulas', 'Desciende en 2 segundos', 'Empuja sin despegar los hombros'],
              image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0025-2gPfomN.jpg',
              gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0025-2gPfomN.gif'
            }
          },
          {
            id: 're-2',
            exerciseId: '0047',
            targetSets: 3,
            minReps: 8,
            maxReps: 12,
            targetRir: 1,
            restSeconds: 90,
            exercise: {
              id: '0047',
              name: 'Dumbbell Incline Chest Press',
              nameEs: 'Press Inclinado con Mancuernas',
              category: 'chest',
              bodyPart: 'chest',
              equipment: 'dumbbell',
              target: 'pectorals',
              muscleGroup: 'pecho',
              secondaryMuscles: ['deltoides anterior'],
              instructionsEs: ['Banco a 30 grados, empuja verticalmente sintiendo la parte clavicular.'],
              instructionStepsEs: ['Banco inclinado a 30-45 grados', 'Alinea los codos a 45 grados del torso', 'Empuja hasta casi juntar las mancuernas arriba'],
              image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0047-2gPfomN.jpg',
              gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0047-2gPfomN.gif'
            }
          },
          {
            id: 're-3',
            exerciseId: '0032',
            targetSets: 3,
            minReps: 10,
            maxReps: 15,
            targetRir: 1,
            restSeconds: 60,
            exercise: {
              id: '0032',
              name: 'Cable Triceps Pushdown',
              nameEs: 'Extensiones de Tríceps en Polea',
              category: 'upper arms',
              bodyPart: 'upper arms',
              equipment: 'cable',
              target: 'triceps',
              muscleGroup: 'triceps',
              secondaryMuscles: ['antebrazo'],
              instructionsEs: ['Codos pegados al cuerpo, extiende hacia abajo contrayendo al máximo.'],
              instructionStepsEs: ['Fija los codos a los costados', 'Empuja la cuerda o barra hacia abajo', 'Controla la subida hasta 90 grados'],
              image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0032-2gPfomN.jpg',
              gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0032-2gPfomN.gif'
            }
          }
        ]
      },
      {
        id: 'day-pull',
        name: 'Día 2: Tracción (Espalda, Bíceps)',
        exercises: [
          {
            id: 're-4',
            exerciseId: '0015',
            targetSets: 4,
            minReps: 8,
            maxReps: 12,
            targetRir: 2,
            restSeconds: 90,
            exercise: {
              id: '0015',
              name: 'Cable Lat Pulldown',
              nameEs: 'Jalón al Pecho en Polea',
              category: 'back',
              bodyPart: 'back',
              equipment: 'cable',
              target: 'lats',
              muscleGroup: 'espalda',
              secondaryMuscles: ['bíceps', 'braquial'],
              instructionsEs: ['Sujeta con agarre amplio, jala la barra hacia la parte superior del pecho.'],
              instructionStepsEs: ['Espalda recta con leve inclinación atrás', 'Tracciona con los codos hacia abajo', 'Pausa en contracción y sube lento'],
              image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0015-2gPfomN.jpg',
              gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0015-2gPfomN.gif'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'routine-upper-lower',
    title: 'Upper / Lower (Torso / Pierna)',
    description: 'Excelente frecuencia 2x para ganancias equilibradas en 4 sesiones semanales.',
    category: 'Torso Pierna',
    isTemplate: true,
    days: [
      {
        id: 'day-upper-1',
        name: 'Torso A (Fuerza)',
        exercises: []
      },
      {
        id: 'day-lower-1',
        name: 'Pierna A (Cuádriceps & Gemelos)',
        exercises: []
      }
    ]
  }
];

// Récords personales iniciales de demostración
export const INITIAL_PRS: PersonalRecord[] = [
  {
    id: 'pr-1',
    exerciseId: '0025',
    exerciseName: 'Press de Banca con Barra',
    recordType: 'max_weight',
    recordValue: 80,
    achievedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'pr-2',
    exerciseId: '0025',
    exerciseName: 'Press de Banca con Barra',
    recordType: 'max_1rm_estimated',
    recordValue: 96,
    achievedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

// Historial inicial de sesiones
export const INITIAL_HISTORY: WorkoutSession[] = [
  {
    id: 'ws-prev-1',
    title: 'Push Day (Empuje)',
    startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
    durationSeconds: 3480, // 58 min
    totalVolumeKg: 8450,
    status: 'completed',
    exercises: [
      {
        id: 'we-1',
        sessionId: 'ws-prev-1',
        exerciseId: '0025',
        order: 1,
        exercise: DEFAULT_ROUTINES[0].days[0].exercises[0].exercise,
        sets: [
          {
            id: 's-1',
            workoutExerciseId: 'we-1',
            setNumber: 1,
            setType: 'normal',
            weightKg: 70,
            reps: 10,
            rir: 2,
            isCompleted: true,
            volumeKg: 700,
            estimated1rmKg: 93.33
          },
          {
            id: 's-2',
            workoutExerciseId: 'we-1',
            setNumber: 2,
            setType: 'normal',
            weightKg: 70,
            reps: 9,
            rir: 1,
            isCompleted: true,
            volumeKg: 630,
            estimated1rmKg: 91
          },
          {
            id: 's-3',
            workoutExerciseId: 'we-1',
            setNumber: 3,
            setType: 'normal',
            weightKg: 70,
            reps: 8,
            rir: 1,
            isCompleted: true,
            volumeKg: 560,
            estimated1rmKg: 88.67
          }
        ]
      }
    ]
  },
  {
    id: 'ws-prev-2',
    title: 'Upper Body (Torso)',
    startedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 4 + 3720000).toISOString(),
    durationSeconds: 3720, // 62 min
    totalVolumeKg: 9120,
    status: 'completed',
    exercises: []
  }
];

export class AppStorage {
  private static safeSetItem(key: string, value: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err: unknown) {
      if (err instanceof DOMException && (
        err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22 ||
        err.code === 1014
      )) {
        console.error(`[AppStorage] Alerta: Cuota de almacenamiento local excedida (QuotaExceededError) al guardar la clave "${key}".`);
      } else {
        console.error(`[AppStorage] Error al persistir en localStorage para la clave "${key}":`, err);
      }
      return false;
    }
  }

  private static safeRemoveItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`[AppStorage] Error al eliminar clave "${key}" de localStorage:`, err);
    }
  }

  // Ejercicios
  public static getExercises(): Exercise[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(KEYS.EXERCISES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('[AppStorage] Error al leer ejercicios de localStorage:', e);
    }
    return [];
  }

  public static setExercises(exercises: Exercise[]): void {
    this.safeSetItem(KEYS.EXERCISES, JSON.stringify(exercises));
  }

  // Sesión Activa
  public static getActiveSession(): WorkoutSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(KEYS.ACTIVE_SESSION);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.id && Array.isArray(parsed.exercises)) {
          return parsed as WorkoutSession;
        }
      }
    } catch (e) {
      console.warn('[AppStorage] Error o formato inválido al leer sesión activa:', e);
    }
    return null;
  }

  public static setActiveSession(session: WorkoutSession | null): void {
    if (session) {
      this.safeSetItem(KEYS.ACTIVE_SESSION, JSON.stringify(session));
    } else {
      this.safeRemoveItem(KEYS.ACTIVE_SESSION);
    }
  }

  // Historial de Sesiones
  public static getHistory(): WorkoutSession[] {
    if (typeof window === 'undefined') return INITIAL_HISTORY;
    try {
      const stored = localStorage.getItem(KEYS.WORKOUT_HISTORY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('[AppStorage] Error al leer historial:', e);
    }
    return INITIAL_HISTORY;
  }

  public static addCompletedWorkout(session: WorkoutSession): void {
    const history = this.getHistory();
    history.unshift(session);
    this.safeSetItem(KEYS.WORKOUT_HISTORY, JSON.stringify(history));
  }

  // Récords Personales (PRs)
  public static getPRs(): PersonalRecord[] {
    if (typeof window === 'undefined') return INITIAL_PRS;
    try {
      const stored = localStorage.getItem(KEYS.PERSONAL_RECORDS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('[AppStorage] Error al leer PRs:', e);
    }
    return INITIAL_PRS;
  }

  public static savePR(pr: PersonalRecord): void {
    const prs = this.getPRs();
    const index = prs.findIndex(p => p.exerciseId === pr.exerciseId && p.recordType === pr.recordType);
    if (index >= 0) {
      prs[index] = pr;
    } else {
      prs.unshift(pr);
    }
    this.safeSetItem(KEYS.PERSONAL_RECORDS, JSON.stringify(prs));
  }

  // Rutinas
  public static getRoutines(): Routine[] {
    if (typeof window === 'undefined') return DEFAULT_ROUTINES;
    try {
      const stored = localStorage.getItem(KEYS.ROUTINES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('[AppStorage] Error al leer rutinas:', e);
    }
    return DEFAULT_ROUTINES;
  }

  public static saveRoutine(routine: Routine): void {
    const list = this.getRoutines();
    const index = list.findIndex(r => r.id === routine.id);
    if (index >= 0) list[index] = routine;
    else list.push(routine);
    this.safeSetItem(KEYS.ROUTINES, JSON.stringify(list));
  }

  // Medidas Corporales
  public static getMeasurements(): BodyMeasurement[] {
    const defaults: BodyMeasurement[] = [
      {
        id: 'bm-1',
        measuredAt: new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0],
        weightKg: 78.2,
        bodyFatPercentage: 16.5,
        heightCm: 178,
        waistCm: 84,
        chestCm: 102,
        bicepRightCm: 37.5,
        notes: 'Inicio de definición limpia'
      },
      {
        id: 'bm-2',
        measuredAt: new Date().toISOString().split('T')[0],
        weightKg: 76.8,
        bodyFatPercentage: 15.2,
        heightCm: 178,
        waistCm: 82,
        chestCm: 103,
        bicepRightCm: 37.8,
        notes: 'Pérdida de grasa manteniendo masa muscular'
      }
    ];

    if (typeof window === 'undefined') return defaults;
    try {
      const stored = localStorage.getItem(KEYS.BODY_MEASUREMENTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('[AppStorage] Error al leer medidas corporales:', e);
    }
    return defaults;
  }

  public static saveMeasurement(measurement: BodyMeasurement): void {
    const list = this.getMeasurements();
    list.unshift(measurement);
    this.safeSetItem(KEYS.BODY_MEASUREMENTS, JSON.stringify(list));
  }

  // Mi Gimnasio
  public static getMyGym(): Gym {
    const defaultGym: Gym = {
      id: 'gym-1',
      name: 'SmartFit Centro',
      isActive: true,
      equipment: [
        {
          id: 'eq-1',
          gymId: 'gym-1',
          machineId: 'm-chest-press',
          customLabel: 'Prensa de Pecho de Placas',
          equipmentType: 'leverage machine',
          identifiedViaAi: true,
          isAvailable: true,
          machine: CANONICAL_MACHINES[0]
        },
        {
          id: 'eq-2',
          gymId: 'gym-1',
          machineId: 'm-lat-pulldown',
          customLabel: 'Jalón Dorsal Polea Alta',
          equipmentType: 'cable',
          identifiedViaAi: false,
          isAvailable: true,
          machine: CANONICAL_MACHINES[1]
        },
        {
          id: 'eq-3',
          gymId: 'gym-1',
          machineId: 'm-leg-press',
          customLabel: 'Prensa 45 Grados',
          equipmentType: 'plate-loaded',
          identifiedViaAi: true,
          isAvailable: true,
          machine: CANONICAL_MACHINES[2]
        },
        {
          id: 'eq-4',
          gymId: 'gym-1',
          machineId: 'm-smith-machine',
          customLabel: 'Smith Machine Multipower',
          equipmentType: 'smith',
          identifiedViaAi: false,
          isAvailable: true,
          machine: CANONICAL_MACHINES[3]
        }
      ]
    };

    if (typeof window === 'undefined') return defaultGym;
    try {
      const stored = localStorage.getItem(KEYS.MY_GYM);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('[AppStorage] Error al leer mi gimnasio:', e);
    }
    return defaultGym;
  }

  public static saveGymEquipment(item: GymEquipmentItem): void {
    const gym = this.getMyGym();
    const existing = gym.equipment.findIndex(e => e.machineId === item.machineId);
    if (existing >= 0) {
      gym.equipment[existing] = item;
    } else {
      gym.equipment.unshift(item);
    }
    this.safeSetItem(KEYS.MY_GYM, JSON.stringify(gym));
  }
}