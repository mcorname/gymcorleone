import type { WorkoutSet, WorkoutExercise, WorkoutSession, PersonalRecord, RecordType } from '../../types/src/index.ts';

/**
 * Calcula el 1RM estimado utilizando la fórmula de Epley:
 * 1RM = Peso * (1 + Repeticiones / 30)
 * Si las repeticiones son 1, el 1RM es exactamente el peso levantado.
 */
export function calculateEpley1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return Number(weightKg.toFixed(2));
  const oneRm = weightKg * (1 + reps / 30);
  return Number(oneRm.toFixed(2));
}

/**
 * Calcula el volumen de una serie individual (peso * repeticiones)
 */
export function calculateSetVolume(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  return Number((weightKg * reps).toFixed(2));
}

/**
 * Calcula el volumen total de un ejercicio sumando únicamente las series completadas
 */
export function calculateExerciseVolume(exercise: WorkoutExercise): number {
  return exercise.sets
    .filter(s => s.isCompleted)
    .reduce((acc, set) => acc + calculateSetVolume(set.weightKg, set.reps), 0);
}

/**
 * Calcula el volumen total de una sesión completa
 */
export function calculateSessionVolume(session: WorkoutSession): number {
  return session.exercises.reduce((acc, ex) => acc + calculateExerciseVolume(ex), 0);
}

/**
 * Calcula la distribución del volumen por grupo muscular en una o varias sesiones
 */
export function calculateVolumeByMuscleGroup(sessions: WorkoutSession[]): Record<string, number> {
  const distribution: Record<string, number> = {};

  for (const session of sessions) {
    if (session.status !== 'completed') continue;
    for (const ex of session.exercises) {
      const muscle = (ex.exercise.bodyPart || ex.exercise.muscleGroup || 'otro').toLowerCase();
      const vol = calculateExerciseVolume(ex);
      distribution[muscle] = (distribution[muscle] || 0) + vol;
    }
  }

  return distribution;
}

export interface PRDetectionResult {
  isNewPR: boolean;
  recordType?: RecordType;
  previousValue?: number;
  newValue?: number;
  message?: string;
}

/**
 * Evalúa si una serie recién completada bate algún récord personal existente
 */
export function evaluatePersonalRecord(
  exerciseId: string,
  exerciseName: string,
  set: WorkoutSet,
  currentPRs: PersonalRecord[]
): PRDetectionResult[] {
  const results: PRDetectionResult[] = [];
  if (!set.isCompleted || set.weightKg <= 0 || set.reps <= 0) return results;

  const current1RM = calculateEpley1RM(set.weightKg, set.reps);
  const currentSetVolume = calculateSetVolume(set.weightKg, set.reps);

  const existingWeightPR = currentPRs.find(pr => pr.exerciseId === exerciseId && pr.recordType === 'max_weight');
  const existing1RMPR = currentPRs.find(pr => pr.exerciseId === exerciseId && pr.recordType === 'max_1rm_estimated');
  const existingSetVolPR = currentPRs.find(pr => pr.exerciseId === exerciseId && pr.recordType === 'max_volume_set');

  // 1. Récord de Peso Máximo
  if (!existingWeightPR || set.weightKg > existingWeightPR.recordValue) {
    results.push({
      isNewPR: true,
      recordType: 'max_weight',
      previousValue: existingWeightPR?.recordValue,
      newValue: set.weightKg,
      message: `¡Nuevo Récord de Peso Máximo en ${exerciseName}: ${set.weightKg} kg!`
    });
  }

  // 2. Récord de 1RM Estimado
  if (!existing1RMPR || current1RM > existing1RMPR.recordValue) {
    results.push({
      isNewPR: true,
      recordType: 'max_1rm_estimated',
      previousValue: existing1RMPR?.recordValue,
      newValue: current1RM,
      message: `¡Nuevo Récord de 1RM Estimado en ${exerciseName}: ${current1RM} kg!`
    });
  }

  // 3. Récord de Volumen por Serie
  if (!existingSetVolPR || currentSetVolume > existingSetVolPR.recordValue) {
    results.push({
      isNewPR: true,
      recordType: 'max_volume_set',
      previousValue: existingSetVolPR?.recordValue,
      newValue: currentSetVolume,
      message: `¡Nuevo Récord de Volumen de Serie en ${exerciseName}: ${currentSetVolume} kg!`
    });
  }

  return results;
}

/**
 * Recomendación inteligente basada en reglas de sobrecarga progresiva (Double Progression)
 */
export interface ProgressionAdvice {
  hasAdvice: boolean;
  type: 'increase_weight' | 'maintain' | 'decrease_weight' | 'insufficient_data';
  suggestedWeightDeltaKg: number;
  message: string;
}

export function evaluateProgressiveOverload(
  targetMinReps: number,
  targetMaxReps: number,
  recentPerformances: { weightKg: number; reps: number }[]
): ProgressionAdvice {
  if (!recentPerformances || recentPerformances.length === 0) {
    return {
      hasAdvice: false,
      type: 'insufficient_data',
      suggestedWeightDeltaKg: 0,
      message: 'Registra tus primeras series para recibir recomendaciones de sobrecarga.'
    };
  }

  // Comprobar si todas las series completaron el tope del rango de repeticiones
  const allReachedMaxReps = recentPerformances.every(p => p.reps >= targetMaxReps);
  if (allReachedMaxReps && recentPerformances.length >= 2) {
    return {
      hasAdvice: true,
      type: 'increase_weight',
      suggestedWeightDeltaKg: 2.5,
      message: `Has completado el rango superior (${targetMaxReps} reps) en tus últimas series. Podrías intentar aumentar +2.5 kg en la próxima sesión.`
    };
  }

  const allBelowMinReps = recentPerformances.every(p => p.reps < targetMinReps);
  if (allBelowMinReps) {
    return {
      hasAdvice: true,
      type: 'maintain',
      suggestedWeightDeltaKg: 0,
      message: `Las repeticiones están por debajo del objetivo (${targetMinReps}-${targetMaxReps} reps). Mantén el peso actual y enfócate en el control y descanso.`
    };
  }

  return {
    hasAdvice: true,
    type: 'maintain',
    suggestedWeightDeltaKg: 0,
    message: `Buen ritmo dentro del rango (${targetMinReps}-${targetMaxReps} reps). Intenta sumar 1 repetición más en tu primera serie antes de subir peso.`
  };
}

/**
 * Calcula el Índice de Masa Corporal (IMC) estrictamente como métrica informativa
 */
export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; classification: string } {
  if (weightKg <= 0 || heightCm <= 0) return { bmi: 0, classification: 'N/A' };
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let classification = 'Normal';
  if (bmi < 18.5) classification = 'Bajo peso';
  else if (bmi < 25) classification = 'Normal';
  else if (bmi < 30) classification = 'Sobrepeso';
  else classification = 'Obesidad';

  return { bmi, classification };
}