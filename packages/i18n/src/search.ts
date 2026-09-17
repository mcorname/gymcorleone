import type { Exercise } from '@gym/types';
import { BODY_PARTS_I18N, TARGET_MUSCLES_I18N, EQUIPMENT_I18N } from './taxonomies';

/**
 * Normaliza cualquier texto eliminando acentos, diacríticos, mayúsculas y espacios duplicados.
 * Ejemplo: "BÍCEPS  " -> "biceps"
 */
export function normalizeSearchTerm(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Verifica si un ejercicio coincide con una consulta de búsqueda de forma bilingüe
 */
export function matchesExercise(exercise: Exercise, rawQuery: string): boolean {
  const query = normalizeSearchTerm(rawQuery);
  if (!query) return true;

  // 1. Nombre en español (translations.es.name o fallback nameEs)
  const esName = normalizeSearchTerm(exercise.translations?.es?.name || exercise.nameEs || '');
  if (esName.includes(query)) return true;

  // 2. Nombre canónico original en inglés
  const enName = normalizeSearchTerm(exercise.name || '');
  if (enName.includes(query)) return true;

  // 3. Aliases bilingües
  if (Array.isArray(exercise.aliases)) {
    for (const alias of exercise.aliases) {
      if (normalizeSearchTerm(alias).includes(query)) return true;
    }
  }

  // 4. Músculo objetivo (target) en español y en inglés
  const targetEn = normalizeSearchTerm(exercise.target || '');
  const targetEs = normalizeSearchTerm(
    exercise.targetEs || TARGET_MUSCLES_I18N[exercise.target?.toLowerCase()]?.es || ''
  );
  if (targetEn.includes(query) || targetEs.includes(query)) return true;

  // 5. Grupo corporal / anatomía (bodyPart) en español y en inglés
  const bodyPartEn = normalizeSearchTerm(exercise.bodyPart || '');
  const bodyPartEs = normalizeSearchTerm(
    exercise.bodyPartEs || BODY_PARTS_I18N[exercise.bodyPart?.toLowerCase()]?.es || ''
  );
  if (bodyPartEn.includes(query) || bodyPartEs.includes(query)) return true;

  // 6. Equipamiento (equipment) en español y en inglés
  const equipEn = normalizeSearchTerm(exercise.equipment || '');
  const equipEs = normalizeSearchTerm(
    exercise.equipmentEs || EQUIPMENT_I18N[exercise.equipment?.toLowerCase()]?.es || ''
  );
  if (equipEn.includes(query) || equipEs.includes(query)) return true;

  // 7. Búsqueda por palabras múltiples: si cada palabra de la query coincide con algún campo
  const tokens = query.split(' ').filter(t => t.length > 1);
  if (tokens.length > 1) {
    const fullHaystack = `${esName} ${enName} ${targetEs} ${targetEn} ${bodyPartEs} ${bodyPartEn} ${equipEs} ${equipEn}`;
    const allTokensMatch = tokens.every(token => fullHaystack.includes(token));
    if (allTokensMatch) return true;
  }

  return false;
}
