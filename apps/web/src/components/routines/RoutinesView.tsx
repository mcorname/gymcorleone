'use client';

import React, { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Play, 
  Copy, 
  Trash2, 
  ChevronRight, 
  Clock, 
  Repeat, 
  Dumbbell,
  Sparkles
} from 'lucide-react';
import type { Routine, RoutineDay, WorkoutSession, WorkoutExercise } from '@gym/types';
import { AppStorage, DEFAULT_ROUTINES } from '../../lib/storage';

interface RoutinesViewProps {
  onStartRoutine: (session: WorkoutSession) => void;
}

export function RoutinesView({ onStartRoutine }: RoutinesViewProps) {
  const [routines, setRoutines] = useState<Routine[]>(() => AppStorage.getRoutines());
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(routines[0] || null);

  const handleDuplicateRoutine = (routine: Routine) => {
    const duplicated: Routine = {
      ...routine,
      id: 'routine-' + Date.now(),
      title: `${routine.title} (Copia)`,
      isTemplate: false
    };
    AppStorage.saveRoutine(duplicated);
    setRoutines(AppStorage.getRoutines());
    setSelectedRoutine(duplicated);
  };

  const handleStartRoutineDay = (routine: Routine, day: RoutineDay) => {
    const workoutSession: WorkoutSession = {
      id: 'session-' + Date.now(),
      routineId: routine.id,
      routineTitle: `${routine.title} - ${day.name}`,
      title: day.name,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      totalVolumeKg: 0,
      status: 'in_progress',
      exercises: day.exercises.map((item, idx) => ({
        id: 'we-' + idx + '-' + Date.now(),
        sessionId: 'session-' + Date.now(),
        exerciseId: item.exerciseId,
        exercise: item.exercise,
        order: idx + 1,
        sets: Array.from({ length: item.targetSets }).map((_, sIdx) => ({
          id: `set-${idx}-${sIdx}-${Date.now()}`,
          workoutExerciseId: 'we-' + idx + '-' + Date.now(),
          setNumber: sIdx + 1,
          setType: 'normal',
          weightKg: 60,
          reps: item.minReps,
          rir: item.targetRir,
          isCompleted: false,
          volumeKg: 0,
          estimated1rmKg: 0
        }))
      }))
    };

    onStartRoutine(workoutSession);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Cabecera de Rutinas */}
      <div className="bg-white rounded-xl p-6 border border-brand-border shadow-subtle flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-darkBlue flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-brand-blue" />
            Mis Rutinas & Plantillas
          </h1>
          <p className="text-xs text-brand-textSecondary mt-0.5">
            Planes estructurados de entrenamiento optimizados para sobrecarga progresiva
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Lista de Rutinas */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary px-1">
            Rutinas Disponibles ({routines.length})
          </div>

          {routines.map(r => {
            const isSelected = selectedRoutine?.id === r.id;

            return (
              <div
                key={r.id}
                onClick={() => setSelectedRoutine(r)}
                className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                  isSelected 
                    ? 'border-brand-blue ring-2 ring-blue-100 shadow-sm' 
                    : 'border-brand-border hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-brand-textPrimary">
                      {r.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-brand-textSecondary mt-1">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 font-semibold text-gray-700">
                        {r.category}
                      </span>
                      <span>•</span>
                      <span>{r.days.length} días</span>
                    </div>
                  </div>

                  {r.isTemplate && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-brand-blue border border-blue-200">
                      Plantilla
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                  {r.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Columna Derecha: Detalle de la Rutina y Días */}
        <div className="lg:col-span-2">
          {selectedRoutine ? (
            <div className="bg-white rounded-xl border border-brand-border p-6 shadow-subtle space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-brand-darkBlue">
                      {selectedRoutine.title}
                    </h2>
                    {selectedRoutine.isTemplate && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-brand-blue">
                        Plantilla Oficial
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-textSecondary mt-1">
                    {selectedRoutine.description}
                  </p>
                </div>

                <button
                  onClick={() => handleDuplicateRoutine(selectedRoutine)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors shrink-0"
                  title="Duplicar para personalizar"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicar</span>
                </button>
              </div>

              {/* Días y Ejercicios Programados */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary">
                  Días de la Rutina
                </div>

                {selectedRoutine.days.map(day => (
                  <div key={day.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200/70">
                      <div>
                        <h4 className="text-sm font-bold text-brand-darkBlue">
                          {day.name}
                        </h4>
                        <span className="text-[11px] text-brand-textSecondary">
                          {day.exercises.length} ejercicios programados
                        </span>
                      </div>

                      {/* Botón principal: Iniciar este Día */}
                      <button
                        onClick={() => handleStartRoutineDay(selectedRoutine, day)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Iniciar Entrenamiento</span>
                      </button>
                    </div>

                    {/* Lista de Ejercicios del Día */}
                    {day.exercises.length > 0 ? (
                      <div className="divide-y divide-gray-100 mt-2">
                        {day.exercises.map((item, idx) => (
                          <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <span className="w-5 h-5 rounded-full bg-blue-100 text-brand-blue font-bold text-[11px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div>
                                <div className="font-bold text-brand-textPrimary">
                                  {item.exercise.nameEs || item.exercise.name}
                                </div>
                                <div className="text-[11px] text-brand-textSecondary capitalize">
                                  {item.exercise.bodyPartEs || item.exercise.bodyPart} • {item.exercise.equipmentEs || item.exercise.equipment}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-bold text-brand-darkBlue tabular-data">
                                {item.targetSets} × {item.minReps}-{item.maxReps}
                              </span>
                              <div className="text-[10px] text-gray-500">
                                RIR {item.targetRir} • {item.restSeconds}s desc.
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-xs text-gray-400 italic">
                        Sin ejercicios asignados aún.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-brand-border p-12 text-center text-gray-500 text-sm">
              Selecciona una rutina para ver sus detalles y empezar a entrenar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
