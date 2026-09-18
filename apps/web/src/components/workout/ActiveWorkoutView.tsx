'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Plus, 
  Trash2, 
  Timer, 
  Trophy, 
  ArrowLeft, 
  Dumbbell, 
  Sparkles,
  Search, 
  X, 
  Loader2,
  BookOpen
} from 'lucide-react';
import type { 
  WorkoutSession, 
  WorkoutExercise, 
  WorkoutSet, 
  SetType, 
  Exercise 
} from '@gym/types';
import { 
  calculateEpley1RM, 
  calculateSetVolume, 
  calculateSessionVolume, 
  evaluatePersonalRecord,
  evaluateProgressiveOverload 
} from '@gym/calculations';
import { getExerciseDisplayName, matchesExercise, getLocalizedTaxonomy } from '@gym/i18n';
import { AppStorage } from '../../lib/storage';
import { RestTimerModal } from './RestTimerModal';
import { ExerciseTechniqueModal } from '../exercises/ExerciseTechniqueModal';

interface ActiveWorkoutViewProps {
  initialSession?: WorkoutSession | null;
  onFinish: () => void;
  onCancel: () => void;
}

export function ActiveWorkoutView({
  initialSession,
  onFinish,
  onCancel
}: ActiveWorkoutViewProps) {
  const [session, setSession] = useState<WorkoutSession>(() => {
    const saved = AppStorage.getActiveSession();
    if (saved) return saved;
    if (initialSession) return initialSession;

    // Sesión por defecto (Push Day)
    return {
      id: 'active-' + Date.now(),
      title: 'Push Day (Fuerza & Hipertrofia)',
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      totalVolumeKg: 0,
      status: 'in_progress',
      exercises: []
    };
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseCatalog, setExerciseCatalog] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePRAlert, setActivePRAlert] = useState<string | null>(null);
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [selectedTechniqueExercise, setSelectedTechniqueExercise] = useState<Exercise | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<{ index: number; name: string } | null>(null);
  const [expandedSetIds, setExpandedSetIds] = useState<Record<string, boolean>>({});

  const toggleExpandSet = (setId: string) => {
    setExpandedSetIds(prev => ({
      ...prev,
      [setId]: !prev[setId]
    }));
  };

  const handleRequestDeleteExercise = (index: number) => {
    const targetEx = session.exercises[index];
    if (!targetEx) return;
    const hasData = targetEx.sets.some(s => s.isCompleted || s.weightKg > 0);
    if (hasData) {
      setExerciseToDelete({
        index,
        name: getExerciseDisplayName(targetEx.exercise, 'es')
      });
    } else {
      const updated = [...session.exercises];
      updated.splice(index, 1);
      setSession({ ...session, exercises: updated });
    }
  };

  // Inicializar catálogo y temporizador de sesión
  useEffect(() => {
    // Calcular segundos transcurridos desde startedAt
    const start = new Date(session.startedAt).getTime();
    const now = Date.now();
    const diffSec = Math.max(0, Math.floor((now - start) / 1000));
    setElapsedSeconds(diffSec);

    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    // Cargar catálogo de ejercicios para el picker
    fetch('/data/exercises_seed.json')
      .then(r => r.json())
      .then((data: Exercise[]) => setExerciseCatalog(data))
      .catch(() => setExerciseCatalog([]));

    return () => clearInterval(interval);
  }, [session.startedAt]);

  // Guardar en almacenamiento local cada vez que cambie la sesión (Offline-first)
  useEffect(() => {
    AppStorage.setActiveSession(session);
  }, [session]);

  const formatTimer = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Actualizar campo de una serie (peso o repeticiones)
  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weightKg' | 'reps' | 'rir' | 'setType',
    value: string | number | boolean
  ) => {
    const updatedExercises = [...session.exercises];
    const targetSet = { ...updatedExercises[exerciseIndex].sets[setIndex] };

    if (field === 'weightKg') targetSet.weightKg = Math.max(0, Number(value));
    else if (field === 'reps') targetSet.reps = Math.max(0, Number(value));
    else if (field === 'rir') targetSet.rir = Number(value);
    else if (field === 'setType') targetSet.setType = value as SetType;

    // Recalcular métricas de la serie
    targetSet.volumeKg = calculateSetVolume(targetSet.weightKg, targetSet.reps);
    targetSet.estimated1rmKg = calculateEpley1RM(targetSet.weightKg, targetSet.reps);

    updatedExercises[exerciseIndex].sets[setIndex] = targetSet;

    const newTotalVolume = calculateSessionVolume({ ...session, exercises: updatedExercises });
    setSession({
      ...session,
      exercises: updatedExercises,
      totalVolumeKg: newTotalVolume
    });
  };

  // Marcar serie como completada o pendiente
  const handleToggleSetCompleted = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...session.exercises];
    const targetSet = { ...updatedExercises[exerciseIndex].sets[setIndex] };
    const exObj = updatedExercises[exerciseIndex];

    const nextState = !targetSet.isCompleted;
    targetSet.isCompleted = nextState;
    targetSet.completedAt = nextState ? new Date().toISOString() : undefined;

    // Si se marca como completada, chequear si es un nuevo PR
    if (nextState) {
      const currentPRs = AppStorage.getPRs();
      const prResults = evaluatePersonalRecord(
        exObj.exerciseId,
        exObj.exercise.nameEs || exObj.exercise.name,
        targetSet,
        currentPRs
      );

      if (prResults.length > 0) {
        const topPR = prResults[0];
        setActivePRAlert(topPR.message || '¡Nuevo Récord Personal Alcanzado!');
        AppStorage.savePR({
          id: 'pr-' + Date.now(),
          exerciseId: exObj.exerciseId,
          exerciseName: exObj.exercise.nameEs || exObj.exercise.name,
          recordType: topPR.recordType || 'max_weight',
          recordValue: topPR.newValue || targetSet.weightKg,
          achievedAt: new Date().toISOString(),
          weightKg: targetSet.weightKg,
          reps: targetSet.reps
        });

        // Ocultar alerta después de 4 segundos
        setTimeout(() => setActivePRAlert(null), 4000);
      }

      // Disparar temporizador automático de descanso
      setShowRestTimer(true);
    }

    updatedExercises[exerciseIndex].sets[setIndex] = targetSet;
    const newTotalVolume = calculateSessionVolume({ ...session, exercises: updatedExercises });

    setSession({
      ...session,
      exercises: updatedExercises,
      totalVolumeKg: newTotalVolume
    });
  };

  // Agregar serie a un ejercicio
  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...session.exercises];
    const sets = updatedExercises[exerciseIndex].sets;
    const lastSet = sets[sets.length - 1];

    const newSet: WorkoutSet = {
      id: 'set-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      workoutExerciseId: updatedExercises[exerciseIndex].id,
      setNumber: sets.length + 1,
      setType: 'normal',
      weightKg: lastSet ? lastSet.weightKg : 60,
      reps: lastSet ? lastSet.reps : 10,
      rir: 2,
      isCompleted: false,
      volumeKg: 0,
      estimated1rmKg: 0,
      previousSet: lastSet ? { weightKg: lastSet.weightKg, reps: lastSet.reps } : undefined
    };

    updatedExercises[exerciseIndex].sets.push(newSet);
    setSession({ ...session, exercises: updatedExercises });
  };

  // Eliminar serie
  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...session.exercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    // Reordenar números
    updatedExercises[exerciseIndex].sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    const newTotalVolume = calculateSessionVolume({ ...session, exercises: updatedExercises });
    setSession({ ...session, exercises: updatedExercises, totalVolumeKg: newTotalVolume });
  };

  // Agregar ejercicio a la sesión activa desde el picker
  const handleSelectExercise = (ex: Exercise) => {
    const newWorkoutExercise: WorkoutExercise = {
      id: 'we-' + Date.now(),
      sessionId: session.id,
      exerciseId: ex.id,
      exercise: ex,
      order: session.exercises.length + 1,
      sets: [
        {
          id: 'set-1-' + Date.now(),
          workoutExerciseId: 'we-' + Date.now(),
          setNumber: 1,
          setType: 'normal',
          weightKg: 50,
          reps: 10,
          rir: 2,
          isCompleted: false,
          volumeKg: 0,
          estimated1rmKg: 0
        }
      ]
    };

    setSession(prev => ({
      ...prev,
      exercises: [...prev.exercises, newWorkoutExercise]
    }));
    setShowExercisePicker(false);
    setSearchQuery('');
  };

  // Finalizar sesión y guardar en historial con prevención de doble envío
  const handleFinishWorkout = () => {
    if (isFinishing) return;
    setIsFinishing(true);
    try {
      const completedSession: WorkoutSession = {
        ...session,
        completedAt: new Date().toISOString(),
        durationSeconds: elapsedSeconds,
        status: 'completed',
        totalVolumeKg: calculateSessionVolume(session)
      };

      AppStorage.addCompletedWorkout(completedSession);
      AppStorage.setActiveSession(null);
      onFinish();
    } catch (err) {
      console.error('Error al guardar entrenamiento:', err);
      setIsFinishing(false);
    }
  };

  const filteredExercises = exerciseCatalog.filter(ex => {
    if (!searchQuery.trim()) return true;
    return matchesExercise(ex, searchQuery);
  }).slice(0, 30);

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Alerta animada de Récord Personal (PR) */}
      {activePRAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#107C41] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-pr-pop border border-emerald-400">
          <Trophy className="w-6 h-6 text-yellow-300" />
          <div className="text-sm font-bold">{activePRAlert}</div>
        </div>
      )}

      {/* Header Fijo de Entrenamiento */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-brand-border px-4 py-3 -mx-4 sm:mx-0 sm:rounded-xl sm:border shadow-subtle mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-brand-darkBlue leading-none">
                {session.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-brand-textSecondary mt-1">
                <span className="flex items-center gap-1 font-semibold text-[#D83B01] tabular-data">
                  <Timer className="w-3.5 h-3.5" />
                  {formatTimer(elapsedSeconds)}
                </span>
                <span>•</span>
                <span className="tabular-data font-medium">
                  Volumen: <strong className="text-brand-textPrimary">{session.totalVolumeKg.toLocaleString()} kg</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setFinishModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#107C41] hover:bg-[#0e6837] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            Finalizar
          </button>
        </div>
      </div>

      {/* Lista de Ejercicios en la Sesión */}
      {session.exercises.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border border-brand-border text-center shadow-subtle my-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center mx-auto mb-3">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-brand-textPrimary">
            Comienza agregando tu primer ejercicio
          </h3>
          <p className="text-xs text-brand-textSecondary max-w-sm mx-auto mt-1 mb-5">
            Selecciona entre más de 1,300 ejercicios con instrucciones biomecánicas en español.
          </p>
          <button
            onClick={() => setShowExercisePicker(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Ejercicio</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {session.exercises.map((exItem, exIdx) => {
            // Evaluar recomendación de sobrecarga progresiva
            const completedSetsHistory = exItem.sets
              .filter(s => s.isCompleted)
              .map(s => ({ weightKg: s.weightKg, reps: s.reps }));
            const advice = evaluateProgressiveOverload(8, 12, completedSetsHistory);

            return (
              <div
                key={exItem.id}
                className="bg-white rounded-xl border border-brand-border p-4 shadow-subtle transition-all"
              >
                {/* Cabecera del Ejercicio */}
                <div className="flex items-start justify-between pb-3 border-b border-gray-100 gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Miniatura clicable (48-56px) que abre Técnica y pasos */}
                    <button
                      type="button"
                      onClick={() => setSelectedTechniqueExercise(exItem.exercise)}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shrink-0 relative group hover:ring-2 hover:ring-brand-blue transition-all"
                      title="Ver técnica y pasos"
                      aria-label={`Ver técnica y pasos de ${getExerciseDisplayName(exItem.exercise, 'es')}`}
                    >
                      {exItem.exercise.image ? (
                        <img
                          src={exItem.exercise.image}
                          alt={getExerciseDisplayName(exItem.exercise, 'es')}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-sm">
                          {exIdx + 1}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <BookOpen className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    </button>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-brand-textPrimary truncate">
                        {getExerciseDisplayName(exItem.exercise, 'es')}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-brand-textSecondary mt-0.5 flex-wrap">
                        <span className="capitalize font-semibold text-brand-blue">
                          {getLocalizedTaxonomy('bodyParts', exItem.exercise.bodyPart, 'es')}
                        </span>
                        <span>•</span>
                        <span>{getLocalizedTaxonomy('equipments', exItem.exercise.equipment, 'es')}</span>
                      </div>

                      {/* Botón secundario claro: Técnica y pasos */}
                      <button
                        type="button"
                        onClick={() => setSelectedTechniqueExercise(exItem.exercise)}
                        className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-brand-blue text-xs font-semibold border border-blue-200 transition-colors touch-manipulation"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Técnica y pasos</span>
                      </button>
                    </div>
                  </div>

                  {/* Quitar ejercicio */}
                  <button
                    type="button"
                    onClick={() => handleRequestDeleteExercise(exIdx)}
                    className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                    title="Quitar ejercicio"
                    aria-label={`Eliminar ${getExerciseDisplayName(exItem.exercise, 'es')} del entrenamiento`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Banner de recomendación de Sobrecarga Progresiva si aplica */}
                {advice.hasAdvice && advice.type === 'increase_weight' && (
                  <div className="my-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{advice.message}</span>
                  </div>
                )}

                {/* 1. VISTA ESCRITORIO (>= 768px): Tabla tabular completa */}
                <div className="mt-3 overflow-x-auto hidden md:block">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-gray-400 font-medium border-b border-gray-100">
                        <th className="py-2 px-1 w-12 text-center">Serie</th>
                        <th className="py-2 px-2 w-24">Anterior</th>
                        <th className="py-2 px-2 w-28">Kg</th>
                        <th className="py-2 px-2 w-24">Reps</th>
                        <th className="py-2 px-1 w-16 text-center">RIR</th>
                        <th className="py-2 px-1 w-12 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {exItem.sets.map((set, sIdx) => {
                        const isDone = set.isCompleted;

                        return (
                          <tr
                            key={set.id}
                            className={`transition-colors ${
                              isDone ? 'bg-emerald-50/60' : 'hover:bg-gray-50/50'
                            }`}
                          >
                            {/* Número y Tipo de Serie */}
                            <td className="py-2.5 px-1 text-center font-semibold text-brand-darkBlue">
                              <span className="inline-block w-6 text-center py-0.5 rounded bg-gray-100 text-xs font-bold">
                                {set.setType === 'warmup' ? 'W' : set.setType === 'drop_set' ? 'D' : sIdx + 1}
                              </span>
                            </td>

                            {/* Valor Anterior */}
                            <td className="py-2.5 px-2 text-gray-500 font-medium tabular-data">
                              {set.previousSet 
                                ? `${set.previousSet.weightKg} × ${set.previousSet.reps}` 
                                : '70 × 10'}
                            </td>

                            {/* Peso (Kg) con controles rápidos */}
                            <td className="py-2.5 px-2">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.5"
                                  inputMode="decimal"
                                  value={set.weightKg === 0 ? '' : set.weightKg}
                                  onChange={(e) => handleUpdateSet(exIdx, sIdx, 'weightKg', e.target.value)}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded-md font-bold tabular-data text-brand-textPrimary focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none"
                                />
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSet(exIdx, sIdx, 'weightKg', set.weightKg + 2.5)}
                                    className="px-1 text-[9px] bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded font-bold text-gray-600"
                                  >
                                    +2.5
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSet(exIdx, sIdx, 'weightKg', Math.max(0, set.weightKg - 2.5))}
                                    className="px-1 text-[9px] bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded font-bold text-gray-600"
                                  >
                                    -2.5
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Repeticiones */}
                            <td className="py-2.5 px-2">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  value={set.reps === 0 ? '' : set.reps}
                                  onChange={(e) => handleUpdateSet(exIdx, sIdx, 'reps', e.target.value)}
                                  className="w-14 px-2 py-1 border border-gray-300 rounded-md font-bold tabular-data text-brand-textPrimary focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none"
                                />
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSet(exIdx, sIdx, 'reps', set.reps + 1)}
                                    className="px-1 text-[9px] bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded font-bold text-gray-600"
                                  >
                                    +1
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSet(exIdx, sIdx, 'reps', Math.max(0, set.reps - 1))}
                                    className="px-1 text-[9px] bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded font-bold text-gray-600"
                                  >
                                    -1
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* RIR (Repeticiones en Reserva) */}
                            <td className="py-2.5 px-1 text-center">
                              <select
                                aria-label={`RIR para serie ${set.setNumber} de ${getExerciseDisplayName(exItem.exercise, 'es')}`}
                                value={set.rir ?? 2}
                                onChange={(e) => handleUpdateSet(exIdx, sIdx, 'rir', e.target.value)}
                                className="px-1 py-1 border border-gray-200 rounded text-xs bg-white font-medium"
                              >
                                <option value="0">0 (Fallo)</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4+</option>
                              </select>
                            </td>

                            {/* Estado: Botón Check [✓] */}
                            <td className="py-2.5 px-1 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleSetCompleted(exIdx, sIdx)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                  isDone
                                    ? 'bg-[#107C41] text-white shadow-xs scale-105'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                                }`}
                                title={isDone ? 'Serie completada' : 'Marcar como completada'}
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 2. VISTA MÓVIL (< 768px): Tarjetas ergonómicas diseñadas para uso con una mano */}
                <div className="mt-3 space-y-2.5 block md:hidden">
                  {exItem.sets.map((set, sIdx) => {
                    const isDone = set.isCompleted;
                    const isExplicitlyExpanded = expandedSetIds[set.id];
                    // Si está completada y no se expandió manualmente para editar, mostrar formato compacto
                    const isCompact = isDone && !isExplicitlyExpanded;

                    if (isCompact) {
                      return (
                        <div
                          key={set.id}
                          className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-[#107C41] text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-emerald-950">
                                  Serie {sIdx + 1}
                                </span>
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white text-emerald-800 border border-emerald-200">
                                  {set.setType === 'warmup' ? 'W' : set.setType === 'drop_set' ? 'D' : 'Efectiva'}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-emerald-900 mt-0.5">
                                {set.weightKg} kg × {set.reps} reps · <span className="font-normal text-emerald-700">RIR {set.rir ?? 2}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleExpandSet(set.id)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-brand-blue bg-white border border-blue-200 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Tarjeta expandida para registrar o editar
                    return (
                      <div
                        key={set.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isDone
                            ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                            : 'bg-gray-50/80 border-gray-200'
                        }`}
                      >
                        {/* Cabecera de la serie */}
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-brand-darkBlue text-white font-bold text-xs">
                              SERIE {sIdx + 1}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium">
                              {set.setType === 'warmup' ? 'Calentamiento' : set.setType === 'drop_set' ? 'Drop set' : 'Serie regular'}
                            </span>
                          </div>

                          <div className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                            Anterior: <strong className="text-brand-darkBlue font-bold">{set.previousSet ? `${set.previousSet.weightKg} kg × ${set.previousSet.reps}` : '70 kg × 10'}</strong>
                          </div>
                        </div>

                        {/* Grid de 2 columnas para PESO y REPETICIONES */}
                        <div className="grid grid-cols-2 gap-2.5 mb-3">
                          {/* Columna Peso */}
                          <div className="bg-white p-2.5 rounded-xl border border-gray-200 flex flex-col justify-between">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-textSecondary block mb-1">
                              Peso (Kg)
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              inputMode="decimal"
                              value={set.weightKg === 0 ? '' : set.weightKg}
                              onChange={(e) => handleUpdateSet(exIdx, sIdx, 'weightKg', e.target.value)}
                              placeholder="0"
                              className="w-full text-center text-xl font-bold py-1 text-brand-darkBlue border-b-2 border-gray-200 focus:border-brand-blue outline-none"
                            />
                            {/* Botones rápidos +/- 2.5 kg */}
                            <div className="grid grid-cols-2 gap-1 mt-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateSet(exIdx, sIdx, 'weightKg', Math.max(0, set.weightKg - 2.5))}
                                className="py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-xs font-bold text-gray-700 transition-colors touch-manipulation"
                              >
                                -2.5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateSet(exIdx, sIdx, 'weightKg', set.weightKg + 2.5)}
                                className="py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-xs font-bold text-gray-700 transition-colors touch-manipulation"
                              >
                                +2.5
                              </button>
                            </div>
                          </div>

                          {/* Columna Repeticiones */}
                          <div className="bg-white p-2.5 rounded-xl border border-gray-200 flex flex-col justify-between">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-textSecondary block mb-1">
                              Repeticiones
                            </label>
                            <input
                              type="number"
                              inputMode="numeric"
                              value={set.reps === 0 ? '' : set.reps}
                              onChange={(e) => handleUpdateSet(exIdx, sIdx, 'reps', e.target.value)}
                              placeholder="0"
                              className="w-full text-center text-xl font-bold py-1 text-brand-darkBlue border-b-2 border-gray-200 focus:border-brand-blue outline-none"
                            />
                            {/* Botones rápidos +/- 1 rep */}
                            <div className="grid grid-cols-2 gap-1 mt-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateSet(exIdx, sIdx, 'reps', Math.max(0, set.reps - 1))}
                                className="py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-xs font-bold text-gray-700 transition-colors touch-manipulation"
                              >
                                -1
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateSet(exIdx, sIdx, 'reps', set.reps + 1)}
                                className="py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-xs font-bold text-gray-700 transition-colors touch-manipulation"
                              >
                                +1
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Selector de RIR en móvil */}
                        <div className="bg-white p-2 rounded-xl border border-gray-200 flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-brand-textSecondary">
                            RIR (Reps en Reserva):
                          </span>
                          <select
                            aria-label={`RIR para serie ${sIdx + 1}`}
                            value={set.rir ?? 2}
                            onChange={(e) => handleUpdateSet(exIdx, sIdx, 'rir', e.target.value)}
                            className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-brand-darkBlue bg-gray-50 outline-none font-medium"
                          >
                            <option value="0">0 (Fallo muscular)</option>
                            <option value="1">1 (Muy cerca del fallo)</option>
                            <option value="2">2 (2 reps restantes)</option>
                            <option value="3">3 (3 reps restantes)</option>
                            <option value="4">4+ (RPE bajo / calentamiento)</option>
                          </select>
                        </div>

                        {/* Botón táctil grande: [ ✓ Completar serie ] */}
                        <button
                          type="button"
                          onClick={() => {
                            handleToggleSetCompleted(exIdx, sIdx);
                            // Si se completa y no estaba marcada para quedar abierta, se contrae
                            if (!isDone) {
                              setExpandedSetIds(prev => ({ ...prev, [set.id]: false }));
                            }
                          }}
                          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] touch-manipulation ${
                            isDone
                              ? 'bg-[#107C41] hover:bg-[#0e6837] text-white'
                              : 'bg-brand-blue hover:bg-blue-700 text-white'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>{isDone ? '✓ Serie Completada' : 'Completar Serie'}</span>
                        </button>

                        {/* Acciones secundarias en móvil */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-[11px]">
                          {isDone && (
                            <button
                              type="button"
                              onClick={() => toggleExpandSet(set.id)}
                              className="text-gray-500 hover:text-gray-700 font-semibold"
                            >
                              Contraer
                            </button>
                          )}
                          {exItem.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSet(exIdx, sIdx)}
                              className="text-gray-400 hover:text-red-600 ml-auto flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Eliminar serie</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Botón de añadir serie */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleAddSet(exIdx)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-xs font-bold text-brand-darkBlue transition-colors touch-manipulation"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Serie</span>
                  </button>

                  <div className="text-xs text-gray-500 font-medium">
                    <strong className="text-brand-darkBlue font-bold">{exItem.sets.filter(s => s.isCompleted).length}</strong> de {exItem.sets.length} completadas
                  </div>
                </div>
              </div>
            );
          })}

          {/* Botón para añadir más ejercicios */}
          <button
            type="button"
            onClick={() => setShowExercisePicker(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 hover:border-brand-blue hover:text-brand-blue text-xs sm:text-sm font-bold text-gray-600 flex items-center justify-center gap-2 transition-all bg-white/70 shadow-subtle hover:bg-white touch-manipulation"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar Otro Ejercicio a la Sesión</span>
          </button>
        </div>
      )}

      {/* Modal / Selector de Ejercicios del Dataset */}
      {showExercisePicker && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl p-5 max-h-[85vh] flex flex-col shadow-modal">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-brand-textPrimary">
                Biblioteca de Ejercicios (1,300+)
              </h3>
              <button
                onClick={() => setShowExercisePicker(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buscador de ejercicios en tiempo real */}
            <div className="relative my-3">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por ejercicio, músculo o equipamiento (ej. Pecho, Smith, Mancuernas)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            {/* Lista de resultados */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 pr-1">
              {filteredExercises.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => handleSelectExercise(ex)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-blue-50/60 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {ex.image && (
                      <img
                        src={ex.image}
                        alt={getExerciseDisplayName(ex, 'es')}
                        className="w-10 h-10 rounded-md object-cover bg-gray-50 border border-gray-200"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    )}
                    <div>
                      <div className="text-xs font-bold text-brand-textPrimary">
                        {getExerciseDisplayName(ex, 'es')}
                      </div>
                      <div className="text-[11px] text-brand-textSecondary mt-0.5">
                        <span className="capitalize">{getLocalizedTaxonomy('bodyParts', ex.bodyPart, 'es')}</span> • {getLocalizedTaxonomy('equipments', ex.equipment, 'es')}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-brand-blue bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                    + Seleccionar
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Finalización y Resumen */}
      {finishModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-modal border border-brand-border">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#107C41] flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brand-darkBlue text-center">
              ¡Entrenamiento Completado!
            </h3>
            <p className="text-xs text-brand-textSecondary text-center mt-1 mb-5">
              Gran sesión de sobrecarga y constancia. Aquí está tu resumen:
            </p>

            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 mb-5 text-center">
              <div>
                <div className="text-xs text-gray-500">Tiempo</div>
                <div className="text-base font-bold text-brand-darkBlue tabular-data mt-0.5">
                  {formatTimer(elapsedSeconds)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Volumen</div>
                <div className="text-base font-bold text-brand-darkBlue tabular-data mt-0.5">
                  {session.totalVolumeKg.toLocaleString()} kg
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Series</div>
                <div className="text-base font-bold text-brand-darkBlue tabular-data mt-0.5">
                  {session.exercises.reduce((acc, e) => acc + e.sets.filter(s => s.isCompleted).length, 0)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFinishModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Continuar entrenando
              </button>
              <button
                onClick={handleFinishWorkout}
                disabled={isFinishing}
                className="flex-1 py-2.5 rounded-lg bg-[#107C41] hover:bg-[#0e6837] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                {isFinishing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Guardar y Salir</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet del Temporizador de Descanso */}
      <RestTimerModal
        isOpen={showRestTimer}
        initialSeconds={restDuration}
        onClose={() => setShowRestTimer(false)}
      />

      {/* Modal Reutilizable de Técnica y Pasos */}
      <ExerciseTechniqueModal
        exercise={selectedTechniqueExercise}
        isOpen={!!selectedTechniqueExercise}
        onClose={() => setSelectedTechniqueExercise(null)}
      />

      {/* Diálogo de Confirmación para Eliminar Ejercicio con Datos */}
      {exerciseToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-modal">
            <h3 className="text-base font-bold text-brand-darkBlue mb-2">
              ¿Eliminar ejercicio del entrenamiento?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-5">
              Ya tienes series registradas para <strong>&ldquo;{exerciseToDelete.name}&rdquo;</strong>. Esta acción quitará el ejercicio de tu sesión activa.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setExerciseToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = [...session.exercises];
                  updated.splice(exerciseToDelete.index, 1);
                  setSession({ ...session, exercises: updated });
                  setExerciseToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
