'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  BookOpen,
  Play,
  ArrowUp,
  ArrowDown,
  ClipboardList,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import type { 
  WorkoutSession, 
  WorkoutExercise, 
  WorkoutSet, 
  SetType, 
  Exercise,
  Routine 
} from '@gym/types';
import { 
  calculateEpley1RM, 
  calculateSetVolume, 
  calculateSessionVolume, 
  evaluatePersonalRecord,
  evaluateProgressiveOverload 
} from '@gym/calculations';
import { getExerciseDisplayName, matchesExercise, getLocalizedTaxonomy } from '@gym/i18n';
import { AppStorage, DEFAULT_ROUTINES } from '../../lib/storage';
import { RestTimerModal } from './RestTimerModal';
import { ExerciseTechniqueModal } from '../exercises/ExerciseTechniqueModal';

interface ActiveWorkoutViewProps {
  initialSession?: WorkoutSession | null;
  onFinish: () => void;
  onCancel: () => void;
  onActivateWorkout?: (session: WorkoutSession) => void;
  onSaveDraft?: (draft: WorkoutSession | null) => void;
  onOpenRoutines?: () => void;
  hasActiveWorkout?: boolean;
}

export function ActiveWorkoutView({
  initialSession,
  onFinish,
  onCancel,
  onActivateWorkout,
  onSaveDraft,
  onOpenRoutines,
  hasActiveWorkout
}: ActiveWorkoutViewProps) {
  // Inicialización de la sesión:
  // 1. Si hay una sesión activa real en storage
  // 2. Si se pasó una sesión inicial (desde rutina o draft)
  // 3. Si hay un borrador guardado
  // 4. Modo preparación en blanco (DRAFT) sin startedAt y sin cronómetro
  const [session, setSession] = useState<WorkoutSession>(() => {
    const active = AppStorage.getActiveSession();
    if (active) return active;

    if (initialSession) return initialSession;

    const draft = AppStorage.getDraftWorkout();
    if (draft) return draft;

    return {
      id: 'draft-' + Date.now(),
      title: 'Preparar Entrenamiento',
      startedAt: undefined,
      durationSeconds: 0,
      totalVolumeKg: 0,
      status: 'draft',
      exercises: []
    };
  });

  // Estado que determina si estamos en MODO PREPARACIÓN (DRAFT) o MODO ACTIVO (IN_PROGRESS)
  const isDraft = session.status === 'draft' || !session.startedAt;

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseCatalog, setExerciseCatalog] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pickerCategory, setPickerCategory] = useState<string>('all');
  const [selectedForBatch, setSelectedForBatch] = useState<Record<string, Exercise>>({});
  const [activePRAlert, setActivePRAlert] = useState<string | null>(null);
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [selectedTechniqueExercise, setSelectedTechniqueExercise] = useState<Exercise | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<{ index: number; name: string } | null>(null);
  const [showDiscardDraftModal, setShowDiscardDraftModal] = useState(false);
  const [expandedSetIds, setExpandedSetIds] = useState<Record<string, boolean>>({});

  const toggleExpandSet = (setId: string) => {
    setExpandedSetIds(prev => ({
      ...prev,
      [setId]: !prev[setId]
    }));
  };

  // Cargar catálogo de ejercicios para el picker
  useEffect(() => {
    fetch('/data/exercises_seed.json')
      .then(r => r.json())
      .then((data: Exercise[]) => setExerciseCatalog(data))
      .catch(() => setExerciseCatalog([]));
  }, []);

  // Sincronizar si el componente recibe una nueva sesión inicial distinta
  useEffect(() => {
    if (initialSession && initialSession.id !== session.id) {
      setSession(initialSession);
    }
  }, [initialSession, session.id]);

  // Temporizador de sesión:
  // ÚNICAMENTE corre cuando el entrenamiento está en MODO ACTIVO (status === 'in_progress' y startedAt != null)
  useEffect(() => {
    if (isDraft || !session.startedAt) {
      setElapsedSeconds(0);
      return;
    }

    const start = new Date(session.startedAt).getTime();
    const now = Date.now();
    const diffSec = Math.max(0, Math.floor((now - start) / 1000));
    setElapsedSeconds(diffSec);

    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isDraft, session.startedAt]);

  // Persistencia reactiva:
  // Si es DRAFT, se guarda exclusivamente en draftWorkout (NUNCA en activeSession ni historial)
  // Si es ACTIVO, se guarda en activeSession
  useEffect(() => {
    if (isDraft) {
      AppStorage.setDraftWorkout(session);
      if (onSaveDraft) onSaveDraft(session);
    } else {
      AppStorage.setActiveSession(session);
    }
  }, [isDraft, session, onSaveDraft]);

  const formatTimer = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Acción principal: INICIAR ENTRENAMIENTO
  // Convierte el estado DRAFT en ACTIVE, asigna startedAt e inicia el cronómetro
  const handleStartWorkout = () => {
    if (session.exercises.length === 0) return;

    const startedAt = new Date().toISOString();
    const activatedSession: WorkoutSession = {
      ...session,
      startedAt,
      status: 'in_progress'
    };

    AppStorage.setDraftWorkout(null);
    AppStorage.setActiveSession(activatedSession);
    setSession(activatedSession);

    if (onActivateWorkout) {
      onActivateWorkout(activatedSession);
    }
  };

  // Reordenar ejercicios durante la preparación
  const handleMoveExercise = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= session.exercises.length) return;
    const updated = [...session.exercises];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    updated.forEach((ex, idx) => {
      ex.order = idx + 1;
    });
    setSession(prev => ({ ...prev, exercises: updated }));
  };

  // Solicitar eliminación de ejercicio
  const handleRequestDeleteExercise = (index: number) => {
    const targetEx = session.exercises[index];
    if (!targetEx) return;

    if (isDraft) {
      // En modo preparación se puede quitar directamente
      const updated = [...session.exercises];
      updated.splice(index, 1);
      updated.forEach((ex, idx) => { ex.order = idx + 1; });
      setSession(prev => ({ ...prev, exercises: updated }));
      return;
    }

    // En modo activo, confirmar si hay datos
    const hasData = targetEx.sets.some(s => s.isCompleted || s.weightKg > 0);
    if (hasData) {
      setExerciseToDelete({
        index,
        name: getExerciseDisplayName(targetEx.exercise, 'es')
      });
    } else {
      const updated = [...session.exercises];
      updated.splice(index, 1);
      updated.forEach((ex, idx) => { ex.order = idx + 1; });
      setSession(prev => ({ ...prev, exercises: updated }));
    }
  };

  // Cancelar preparación o volver
  const handleCancelClick = () => {
    if (isDraft) {
      if (session.exercises.length > 0) {
        setShowDiscardDraftModal(true);
      } else {
        AppStorage.setDraftWorkout(null);
        if (onSaveDraft) onSaveDraft(null);
        onCancel();
      }
    } else {
      // Entrenamiento activo: vuelve a la pantalla anterior pero sigue corriendo de fondo
      onCancel();
    }
  };

  const handleConfirmDiscardDraft = () => {
    AppStorage.setDraftWorkout(null);
    setShowDiscardDraftModal(false);
    if (onSaveDraft) onSaveDraft(null);
    onCancel();
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
    updatedExercises[exerciseIndex].sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    const newTotalVolume = calculateSessionVolume({ ...session, exercises: updatedExercises });
    setSession({ ...session, exercises: updatedExercises, totalVolumeKg: newTotalVolume });
  };

  // Agregar ejercicio único desde el selector
  const handleSelectSingleExercise = (ex: Exercise) => {
    const newWorkoutExercise: WorkoutExercise = {
      id: 'we-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
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
    setSelectedForBatch({});
  };

  // Agregar múltiples ejercicios seleccionados a la vez (Multi-select)
  const handleAddBatchExercises = () => {
    const exercisesToAdd = Object.values(selectedForBatch);
    if (exercisesToAdd.length === 0) return;

    const newWorkoutExercises: WorkoutExercise[] = exercisesToAdd.map((ex, idx) => ({
      id: 'we-' + Date.now() + '-' + idx,
      sessionId: session.id,
      exerciseId: ex.id,
      exercise: ex,
      order: session.exercises.length + idx + 1,
      sets: [
        {
          id: `set-${Date.now()}-${idx}-1`,
          workoutExerciseId: 'we-' + Date.now() + '-' + idx,
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
    }));

    setSession(prev => ({
      ...prev,
      exercises: [...prev.exercises, ...newWorkoutExercises]
    }));

    setShowExercisePicker(false);
    setSearchQuery('');
    setSelectedForBatch({});
  };

  // Alternar selección en lote en el picker
  const toggleBatchSelect = (ex: Exercise) => {
    setSelectedForBatch(prev => {
      const next = { ...prev };
      if (next[ex.id]) {
        delete next[ex.id];
      } else {
        next[ex.id] = ex;
      }
      return next;
    });
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
      AppStorage.setDraftWorkout(null);
      onFinish();
    } catch (e) {
      console.error('Error al finalizar entrenamiento:', e);
      setIsFinishing(false);
    }
  };

  // Filtrado de ejercicios en el picker
  const filteredExercises = useMemo(() => {
    let result = exerciseCatalog;
    if (pickerCategory !== 'all') {
      result = result.filter(e => e.bodyPart === pickerCategory || e.category === pickerCategory);
    }
    if (searchQuery.trim()) {
      result = result.filter(ex => matchesExercise(ex, searchQuery));
    }
    return result.slice(0, 50);
  }, [exerciseCatalog, searchQuery, pickerCategory]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-28">
      {/* Alerta animada de Récord Personal (PR) */}
      {activePRAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#107C41] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-pr-pop border border-emerald-400">
          <Trophy className="w-6 h-6 text-yellow-300" />
          <div className="text-sm font-bold">{activePRAlert}</div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CABECERA: MODO PREPARACIÓN (DRAFT) vs MODO ACTIVO (IN_PROGRESS)        */}
      {/* ========================================================================= */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-brand-border px-4 py-3 -mx-4 sm:mx-0 sm:rounded-xl sm:border shadow-subtle mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancelClick}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors touch-manipulation"
              title={isDraft ? 'Cancelar preparación' : 'Volver al menú principal'}
              aria-label={isDraft ? 'Cancelar preparación' : 'Volver al menú principal'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-brand-darkBlue leading-none">
                {session.title || 'Preparar Entrenamiento'}
              </h2>

              {isDraft ? (
                <div className="flex items-center gap-2 text-xs text-brand-textSecondary mt-1">
                  <span className="font-semibold text-brand-blue">
                    Preparando entrenamiento
                  </span>
                  <span>•</span>
                  <span>
                    {session.exercises.length === 0
                      ? 'Elige los ejercicios que realizarás'
                      : `${session.exercises.length} ${session.exercises.length === 1 ? 'ejercicio preparado' : 'ejercicios preparados'}`}
                  </span>
                </div>
              ) : (
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
              )}
            </div>
          </div>

          {/* Botón de cabecera: [Cancelar] en preparación vs [Finalizar] en activo */}
          {isDraft ? (
            <button
              type="button"
              onClick={handleCancelClick}
              className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-all touch-manipulation"
            >
              Cancelar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setFinishModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#107C41] hover:bg-[#0e6837] text-white text-xs font-bold transition-all shadow-sm active:scale-95 touch-manipulation"
            >
              Finalizar
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. VISTA MODO PREPARACIÓN (DRAFT)                                         */}
      {/* ========================================================================= */}
      {isDraft ? (
        <div className="space-y-4">
          {session.exercises.length === 0 ? (
            <div className="space-y-4">
              {/* Tarjeta de decisión: ¿Cómo quieres entrenar hoy? */}
              <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-subtle text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mx-auto mb-3">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-brand-darkBlue">
                  ¿Cómo quieres entrenar hoy?
                </h3>
                <p className="text-xs text-brand-textSecondary mt-1 max-w-md mx-auto mb-5">
                  Puedes seleccionar una rutina estructurada de tu plan o armar un entrenamiento libre con tus ejercicios preferidos.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                  {onOpenRoutines && (
                    <button
                      type="button"
                      onClick={onOpenRoutines}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-brand-blue/30 bg-blue-50/50 hover:bg-blue-50 text-brand-blue font-bold text-xs transition-colors shadow-xs touch-manipulation"
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>Usar una rutina</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowExercisePicker(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-blue hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs touch-manipulation"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Elegir ejercicios</span>
                  </button>
                </div>
              </div>

              {/* Estado vacío con instrucciones claras */}
              <div className="bg-white rounded-2xl p-8 border border-brand-border text-center shadow-subtle">
                <h4 className="text-sm font-bold text-brand-textPrimary mb-1">
                  Comienza agregando ejercicios
                </h4>
                <p className="text-xs text-brand-textSecondary max-w-sm mx-auto mb-5">
                  Selecciona entre más de 1,300 ejercicios de nuestra biblioteca con técnica biomecánica en español.
                </p>
                <button
                  type="button"
                  onClick={() => setShowExercisePicker(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all touch-manipulation"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Agregar ejercicios</span>
                </button>
                <div className="text-[11px] text-gray-600 mt-4">
                  Agrega al menos un ejercicio para poder comenzar.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary">
                  Ejercicios Preparados ({session.exercises.length})
                </span>
                <span className="text-[11px] text-gray-500">
                  Usa las flechas para ordenar tu sesión
                </span>
              </div>

              {/* Lista de ejercicios en preparación (Reordenamiento y Técnica) */}
              <div className="space-y-2.5">
                {session.exercises.map((exItem, exIdx) => (
                  <div
                    key={exItem.id}
                    className="bg-white rounded-xl border border-brand-border p-3.5 sm:p-4 shadow-subtle flex items-center justify-between gap-3 transition-all hover:border-gray-300"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Controles de Reordenamiento */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveExercise(exIdx, exIdx - 1)}
                          disabled={exIdx === 0}
                          className="p-1 rounded text-gray-400 hover:text-brand-blue hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors touch-manipulation"
                          title="Mover arriba"
                          aria-label={`Mover ${getExerciseDisplayName(exItem.exercise, 'es')} hacia arriba`}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveExercise(exIdx, exIdx + 1)}
                          disabled={exIdx === session.exercises.length - 1}
                          className="p-1 rounded text-gray-400 hover:text-brand-blue hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors touch-manipulation"
                          title="Mover abajo"
                          aria-label={`Mover ${getExerciseDisplayName(exItem.exercise, 'es')} hacia abajo`}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Miniatura clicable (Abre técnica sin riesgo de iniciar sesión) */}
                      <button
                        type="button"
                        onClick={() => setSelectedTechniqueExercise(exItem.exercise)}
                        className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-50 border border-gray-200 shrink-0 relative group hover:ring-2 hover:ring-brand-blue transition-all"
                        title="Ver técnica y pasos"
                        aria-label={`Ver técnica de ${getExerciseDisplayName(exItem.exercise, 'es')}`}
                      >
                        {exItem.exercise.image ? (
                          <img
                            src={exItem.exercise.image}
                            alt={getExerciseDisplayName(exItem.exercise, 'es')}
                            loading="lazy"
                            className="w-full h-full object-contain p-0.5"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-xs">
                            {exIdx + 1}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <BookOpen className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </button>

                      {/* Detalles del ejercicio */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-gray-100 text-brand-darkBlue font-bold text-[11px] flex items-center justify-center shrink-0">
                            {exIdx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-brand-textPrimary truncate">
                            {getExerciseDisplayName(exItem.exercise, 'es')}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-brand-textSecondary mt-0.5 flex-wrap">
                          <span className="capitalize font-semibold text-brand-blue">
                            {getLocalizedTaxonomy('bodyParts', exItem.exercise.bodyPart, 'es')}
                          </span>
                          <span>•</span>
                          <span>{getLocalizedTaxonomy('equipments', exItem.exercise.equipment, 'es')}</span>
                          <span>•</span>
                          <span className="font-semibold text-gray-700">
                            {exItem.sets.length} {exItem.sets.length === 1 ? 'serie' : 'series'}
                          </span>
                        </div>

                        {/* Botón claro de técnica */}
                        <button
                          type="button"
                          onClick={() => setSelectedTechniqueExercise(exItem.exercise)}
                          className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-brand-blue text-[11px] font-semibold transition-colors touch-manipulation"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Técnica y pasos</span>
                        </button>
                      </div>
                    </div>

                    {/* Eliminar ejercicio del borrador */}
                    <button
                      type="button"
                      onClick={() => handleRequestDeleteExercise(exIdx)}
                      className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors shrink-0 touch-manipulation"
                      title="Quitar ejercicio"
                      aria-label={`Quitar ${getExerciseDisplayName(exItem.exercise, 'es')}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Botón para agregar más ejercicios al borrador */}
              <button
                type="button"
                onClick={() => setShowExercisePicker(true)}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-gray-300 hover:border-brand-blue hover:text-brand-blue text-xs sm:text-sm font-bold text-gray-600 flex items-center justify-center gap-2 transition-all bg-white/70 shadow-subtle hover:bg-white touch-manipulation"
              >
                <Plus className="w-4 h-4" />
                <span>+ Agregar otro ejercicio</span>
              </button>
            </div>
          )}

          {/* ================================================================= */}
          {/* CTA PRINCIPAL: [ INICIAR ENTRENAMIENTO ]                          */}
          {/* ================================================================= */}
          <div className="pt-2 sticky bottom-20 sm:bottom-6 z-20">
            <button
              type="button"
              onClick={handleStartWorkout}
              disabled={session.exercises.length === 0}
              className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg transition-all touch-manipulation ${
                session.exercises.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-brand-blue hover:bg-blue-700 text-white hover:shadow-xl active:scale-[0.99]'
              }`}
            >
              <Play className={`w-5 h-5 ${session.exercises.length === 0 ? 'fill-gray-400 text-gray-400' : 'fill-white text-white'}`} />
              <span>INICIAR ENTRENAMIENTO</span>
            </button>
            {session.exercises.length === 0 && (
              <p className="text-[11px] text-center text-gray-500 mt-2 font-medium">
                Agrega al menos un ejercicio para comenzar.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. VISTA MODO ACTIVO (IN_PROGRESS)                                        */
        /* ========================================================================= */
        <div className="space-y-4">
          {session.exercises.map((exItem, exIdx) => {
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
                    <button
                      type="button"
                      onClick={() => setSelectedTechniqueExercise(exItem.exercise)}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-slate-50 border border-gray-200 shrink-0 relative group hover:ring-2 hover:ring-brand-blue transition-all"
                      title="Ver técnica y pasos"
                      aria-label={`Ver técnica y pasos de ${getExerciseDisplayName(exItem.exercise, 'es')}`}
                    >
                      {exItem.exercise.image ? (
                        <img
                          src={exItem.exercise.image}
                          alt={getExerciseDisplayName(exItem.exercise, 'es')}
                          loading="lazy"
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-sm">
                          {exIdx + 1}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <BookOpen className="w-5 h-5 text-white drop-shadow" />
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

                {advice.hasAdvice && advice.type === 'increase_weight' && (
                  <div className="my-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{advice.message}</span>
                  </div>
                )}

                {/* VISTA ESCRITORIO (>= 768px): Tabla tabular */}
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
                            <td className="py-2.5 px-1 text-center font-semibold text-brand-darkBlue">
                              <span className="inline-block w-6 text-center py-0.5 rounded bg-gray-100 text-xs font-bold">
                                {set.setType === 'warmup' ? 'W' : set.setType === 'drop_set' ? 'D' : sIdx + 1}
                              </span>
                            </td>

                            <td className="py-2.5 px-2 text-gray-500 font-medium tabular-data">
                              {set.previousSet 
                                ? `${set.previousSet.weightKg} × ${set.previousSet.reps}` 
                                : '70 × 10'}
                            </td>

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

                            <td className="py-2.5 px-1 text-center">
                              <select
                                aria-label={`RIR para serie ${sIdx + 1}`}
                                value={set.rir ?? 2}
                                onChange={(e) => handleUpdateSet(exIdx, sIdx, 'rir', e.target.value)}
                                className="w-14 px-1 py-1 border border-gray-300 rounded-md text-xs font-bold text-brand-darkBlue bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                              >
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4+</option>
                              </select>
                            </td>

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

                {/* VISTA MÓVIL (< 768px): Tarjetas ergonómicas */}
                <div className="mt-3 space-y-2.5 block md:hidden">
                  {exItem.sets.map((set, sIdx) => {
                    const isDone = set.isCompleted;
                    const isExplicitlyExpanded = expandedSetIds[set.id];
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

                          <button
                            type="button"
                            onClick={() => toggleExpandSet(set.id)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-brand-blue bg-white border border-blue-200 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                          >
                            Editar
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={set.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isDone
                            ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                            : 'bg-gray-50/80 border-gray-200'
                        }`}
                      >
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

                        <div className="grid grid-cols-2 gap-2.5 mb-3">
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

                        <button
                          type="button"
                          onClick={() => {
                            handleToggleSetCompleted(exIdx, sIdx);
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

      {/* ========================================================================= */}
      {/* MODAL / SELECTOR MULTI-SELECCIÓN DE EJERCICIOS (+1,300 DATASET)          */}
      {/* ========================================================================= */}
      {showExercisePicker && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div role="dialog" aria-modal="true" className="w-full max-w-xl bg-white rounded-2xl p-5 max-h-[88vh] flex flex-col shadow-modal">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-brand-textPrimary">
                  Biblioteca de Ejercicios (1,300+)
                </h3>
                <p className="text-xs text-brand-textSecondary mt-0.5">
                  Selecciona uno o varios ejercicios para tu entrenamiento
                </p>
              </div>
              <button
                onClick={() => {
                  setShowExercisePicker(false);
                  setSelectedForBatch({});
                }}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar selector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buscador */}
            <div className="relative my-3">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, músculo o equipamiento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            {/* Chips de Categorías Rápidas */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar text-xs">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'chest', label: 'Pecho' },
                { id: 'back', label: 'Espalda' },
                { id: 'upper legs', label: 'Piernas' },
                { id: 'shoulders', label: 'Hombros' },
                { id: 'upper arms', label: 'Brazos' },
                { id: 'waist', label: 'Abdomen' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setPickerCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    pickerCategory === cat.id
                      ? 'bg-brand-blue text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Lista de resultados con Checkboxes para Multi-selección */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 pr-1">
              {filteredExercises.map(ex => {
                const isSelected = !!selectedForBatch[ex.id];

                return (
                  <div
                    key={ex.id}
                    onClick={() => toggleBatchSelect(ex)}
                    className={`py-2.5 px-2 flex items-center justify-between rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Checkbox táctil */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBatchSelect(ex);
                        }}
                        className="text-brand-blue shrink-0 touch-manipulation"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-brand-blue" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {ex.image && (
                        <img
                          src={ex.image}
                          alt={getExerciseDisplayName(ex, 'es')}
                          loading="lazy"
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg object-contain bg-slate-50 border border-gray-200 p-0.5 shrink-0"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-brand-textPrimary truncate">
                          {getExerciseDisplayName(ex, 'es')}
                        </div>
                        <div className="text-[11px] text-brand-textSecondary mt-0.5">
                          <span className="capitalize">{getLocalizedTaxonomy('bodyParts', ex.bodyPart, 'es')}</span> • {getLocalizedTaxonomy('equipments', ex.equipment, 'es')}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSingleExercise(ex);
                      }}
                      className="ml-2 text-[11px] font-semibold text-brand-blue bg-white hover:bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 transition-colors shrink-0"
                    >
                      + Agregar
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Barra inferior de lote si hay seleccionados */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {Object.keys(selectedForBatch).length} seleccionados
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowExercisePicker(false);
                    setSelectedForBatch({});
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>

                {Object.keys(selectedForBatch).length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddBatchExercises}
                    className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    Agregar {Object.keys(selectedForBatch).length} ejercicios
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMACIÓN AL DESCARTAR PREPARACIÓN                            */}
      {/* ========================================================================= */}
      {showDiscardDraftModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-modal">
            <h3 className="text-base font-bold text-brand-darkBlue mb-2">
              ¿Descartar preparación de entrenamiento?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-5">
              Tienes {session.exercises.length} ejercicios seleccionados. Si descartas la preparación, la lista volverá a estar vacía.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDiscardDraftModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Continuar editando
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscardDraft}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE FINALIZACIÓN Y RESUMEN (MODO ACTIVO)                             */}
      {/* ========================================================================= */}
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
                type="button"
                onClick={() => setFinishModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Continuar entrenando
              </button>
              <button
                type="button"
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

      {/* Diálogo de Confirmación para Eliminar Ejercicio con Datos (Modo Activo) */}
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

      {/* Diálogo para descartar o conservar borrador de preparación */}
      {showDiscardDraftModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-modal">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-darkBlue mb-2">
              ¿Descartar preparación?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-5">
              Tienes ejercicios preparados en este borrador. Puedes descartarlos o conservarlos para más tarde.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDiscardDraftModal(false);
                  onCancel();
                }}
                className="w-full py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Guardar borrador y salir
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscardDraft}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                Descartar borrador
              </button>
              <button
                type="button"
                onClick={() => setShowDiscardDraftModal(false)}
                className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Continuar preparando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
