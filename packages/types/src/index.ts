export type MuscleGroup =
  | 'pecho'
  | 'espalda'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'cuadriceps'
  | 'femoral'
  | 'gluteos'
  | 'pantorrillas'
  | 'core'
  | 'antebrazo'
  | 'trapecio';

export interface Exercise {
  id: string;
  name: string;
  nameEs: string;
  category: string;
  bodyPart: string;
  bodyPartEs?: string;
  equipment: string;
  equipmentEs?: string;
  target: string;
  targetEs?: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  instructionsEs: string[];
  instructionStepsEs: string[];
  image: string;
  gifUrl: string;
  mediaId?: string;
  attribution?: string;
  isCustom?: boolean;
}

export type SetType =
  | 'normal'
  | 'warmup'
  | 'drop_set'
  | 'failure'
  | 'backoff'
  | 'amrap';

export interface WorkoutSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  setType: SetType;
  weightKg: number;
  reps: number;
  rir?: number;
  rpe?: number;
  isCompleted: boolean;
  completedAt?: string;
  volumeKg: number;
  estimated1rmKg: number;
  previousSet?: {
    weightKg: number;
    reps: number;
  };
}

export interface WorkoutExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  notes?: string;
  sets: WorkoutSet[];
}

export type WorkoutStatus = 'in_progress' | 'completed' | 'discarded';

export interface WorkoutSession {
  id: string;
  userId?: string;
  routineId?: string;
  routineTitle?: string;
  title: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  totalVolumeKg: number;
  status: WorkoutStatus;
  notes?: string;
  exercises: WorkoutExercise[];
}

export type RecordType =
  | 'max_weight'
  | 'max_reps'
  | 'max_volume_set'
  | 'max_1rm_estimated';

export interface PersonalRecord {
  id: string;
  userId?: string;
  exerciseId: string;
  exerciseName: string;
  recordType: RecordType;
  recordValue: number;
  achievedAt: string;
  weightKg?: number;
  reps?: number;
}

export interface RoutineExerciseItem {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  targetSets: number;
  minReps: number;
  maxReps: number;
  targetRir: number;
  restSeconds: number;
  notes?: string;
}

export interface RoutineDay {
  id: string;
  name: string;
  exercises: RoutineExerciseItem[];
}

export interface Routine {
  id: string;
  userId?: string;
  title: string;
  description: string;
  category: string;
  isTemplate: boolean;
  isArchived?: boolean;
  days: RoutineDay[];
}

export interface BodyMeasurement {
  id: string;
  measuredAt: string;
  weightKg: number;
  heightCm?: number;
  bodyFatPercentage?: number;
  bmi?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  neckCm?: number;
  bicepLeftCm?: number;
  bicepRightCm?: number;
  thighLeftCm?: number;
  thighRightCm?: number;
  calfCm?: number;
  notes?: string;
}

export interface Machine {
  id: string;
  canonicalName: string;
  category: string;
  primaryMuscleGroup: string;
  secondaryMuscles: string[];
  movementType: string;
  datasetEquipmentTag: string;
  adjustmentGuide: {
    seatHeight: string;
    backrest: string;
    handleGrip: string;
  };
  executionCues: {
    startingPosition: string;
    rangeOfMotion: string;
    breathing: string;
  };
  commonMistakes: string[];
  safetyNotes: string[];
}

export interface GymEquipmentItem {
  id: string;
  gymId: string;
  machineId?: string;
  machine?: Machine;
  customLabel: string;
  equipmentType: string;
  identifiedViaAi: boolean;
  isAvailable: boolean;
}

export interface Gym {
  id: string;
  name: string;
  isActive: boolean;
  equipment: GymEquipmentItem[];
}

export interface AIScanResult {
  detectedMachineName: string;
  machineCategory: string;
  confidence: number;
  possibleMatches: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  movementType: string;
  datasetEquipmentMapping: string;
  adjustmentGuide: {
    seatHeight: string;
    backrest: string;
    handleGrip: string;
  };
  executionCues: {
    startingPosition: string;
    rangeOfMotion: string;
    breathing: string;
  };
  commonMistakes: string[];
  safetyNotes: string[];
}