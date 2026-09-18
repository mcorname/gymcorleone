'use client';

import React, { useEffect } from 'react';
import { X, Plus, Dumbbell, Activity, Layers, CheckCircle2 } from 'lucide-react';
import type { Exercise } from '@gym/types';
import { 
  getExerciseDisplayName, 
  getLocalizedTaxonomy, 
  getLocalizedSecondaryMuscles 
} from '@gym/i18n';

export interface ExerciseTechniqueModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectForWorkout?: (exercise: Exercise) => void;
}

export function ExerciseTechniqueModal({
  exercise,
  isOpen,
  onClose,
  onSelectForWorkout
}: ExerciseTechniqueModalProps) {
  // Manejo de accesibilidad: Cerrar con tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !exercise) return null;

  const displayName = getExerciseDisplayName(exercise, 'es');
  const primaryMuscle = getLocalizedTaxonomy('targets', exercise.target, 'es');
  const bodyPart = getLocalizedTaxonomy('bodyParts', exercise.bodyPart, 'es');
  const equipment = getLocalizedTaxonomy('equipments', exercise.equipment, 'es');
  const secondaryList = exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0
    ? getLocalizedSecondaryMuscles(exercise.secondaryMuscles, 'es')
    : [];

  const instructions = exercise.instructionStepsEs && exercise.instructionStepsEs.length > 0
    ? exercise.instructionStepsEs
    : exercise.instructionsEs && exercise.instructionsEs.length > 0
      ? exercise.instructionsEs
      : exercise.instructions && exercise.instructions.length > 0
        ? exercise.instructions
        : ['Realiza el movimiento controlando la fase excéntrica y concéntrica con postura erguida.'];

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Técnica y pasos: ${displayName}`}
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[90vh] sm:max-w-xl bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-modal flex flex-col overflow-y-auto pb-8 sm:pb-6"
      >
        {/* Manilla táctil en móvil */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Cabecera del Modal / Sheet */}
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-blue-50 px-2 py-0.5 rounded">
                {bodyPart} • {equipment}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-brand-darkBlue mt-1">
              {displayName}
            </h2>
            {exercise.name && exercise.name !== displayName && (
              <div className="text-[11px] text-gray-500 mt-0.5 font-medium">
                Nombre original: {exercise.name}
              </div>
            )}

            {exercise.aliases && exercise.aliases.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {exercise.aliases.slice(0, 4).map(alias => (
                  <span key={alias} className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600 font-medium">
                    {alias}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar técnica y pasos"
            className="p-2 -mr-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multimedia: GIF animado o imagen con relación de aspecto correcta */}
        <div className="my-4 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center min-h-[180px] max-h-64">
          {exercise.gifUrl || exercise.image ? (
            <img
              src={exercise.gifUrl || exercise.image}
              alt={`Demostración técnica de ${displayName}`}
              className="max-h-64 w-auto object-contain mx-auto"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== exercise.image && exercise.image) {
                  target.src = exercise.image;
                }
              }}
            />
          ) : (
            <div className="p-8 text-center text-gray-400">
              <Dumbbell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">Demostración gráfica no disponible</p>
            </div>
          )}
        </div>

        {/* Desglose de Músculos Involucrados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
            <div className="flex items-center gap-1.5 font-bold text-brand-blue mb-1">
              <Activity className="w-4 h-4" />
              <span>Músculo Principal:</span>
            </div>
            <span className="capitalize font-bold text-brand-darkBlue text-sm">
              {primaryMuscle}
            </span>
          </div>

          {secondaryList.length > 0 && (
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-1.5 font-bold text-gray-600 mb-1">
                <Layers className="w-4 h-4" />
                <span>Músculos Secundarios:</span>
              </div>
              <span className="capitalize text-gray-700 font-medium">
                {secondaryList.join(' · ')}
              </span>
            </div>
          )}
        </div>

        {/* Pasos de Ejecución Técnica */}
        <div className="mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-blue" />
            <span>Instrucciones y Pasos de Ejecución:</span>
          </h3>

          <ol className="space-y-2.5 text-xs text-gray-700 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
            {instructions.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-brand-blue font-bold text-[11px] flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <span className="flex-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Botones de acción inferiores */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-auto">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            Volver al Entrenamiento
          </button>

          {onSelectForWorkout && (
            <button
              onClick={() => {
                onSelectForWorkout(exercise);
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar al Entrenamiento</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
