import type { Exercise, SupportedLocale } from '@gym/types';
import { 
  BODY_PARTS_I18N, 
  TARGET_MUSCLES_I18N, 
  EQUIPMENT_I18N, 
  SECONDARY_MUSCLES_I18N, 
  getLocalizedTaxonomy 
} from './taxonomies';

export * from './taxonomies';
export * from './fitnessDictionary';
export * from './search';

/**
 * Obtiene el nombre del ejercicio según el idioma seleccionado con fallback automático al inglés
 */
export function getExerciseDisplayName(exercise: Exercise, locale: SupportedLocale = 'es'): string {
  if (!exercise) return '';
  if (locale === 'es') {
    return exercise.translations?.es?.name || exercise.nameEs || exercise.name;
  }
  return exercise.translations?.en?.name || exercise.name;
}

/**
 * Obtiene las instrucciones del ejercicio según el idioma seleccionado
 */
export function getExerciseInstructions(exercise: Exercise, locale: SupportedLocale = 'es'): string[] {
  if (!exercise) return [];
  if (locale === 'es') {
    if (exercise.translations?.es?.instructions && exercise.translations.es.instructions.length > 0) {
      return exercise.translations.es.instructions;
    }
    if (exercise.instructionsEs && exercise.instructionsEs.length > 0) {
      return exercise.instructionsEs;
    }
  }
  return exercise.instructions || [];
}

/**
 * Obtiene los pasos del ejercicio según el idioma seleccionado
 */
export function getExerciseSteps(exercise: Exercise, locale: SupportedLocale = 'es'): string[] {
  if (!exercise) return [];
  if (locale === 'es') {
    if (exercise.translations?.es?.instructionSteps && exercise.translations.es.instructionSteps.length > 0) {
      return exercise.translations.es.instructionSteps;
    }
    if (exercise.instructionStepsEs && exercise.instructionStepsEs.length > 0) {
      return exercise.instructionStepsEs;
    }
  }
  return exercise.instructionSteps || [];
}

/**
 * Traduce una lista de músculos secundarios al idioma seleccionado
 */
export function getLocalizedSecondaryMuscles(muscles: string[], locale: SupportedLocale = 'es'): string[] {
  if (!muscles || !Array.isArray(muscles)) return [];
  return muscles.map(m => getLocalizedTaxonomy(SECONDARY_MUSCLES_I18N, m, locale));
}
