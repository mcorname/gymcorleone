'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Flame, 
  Trophy, 
  Dumbbell, 
  TrendingUp, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Scale, 
  ArrowUpRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import type { WorkoutSession } from '@gym/types';
import { MuscleHeatmap } from './MuscleHeatmap';
import { AppStorage, DEFAULT_ROUTINES } from '../../lib/storage';

interface DashboardViewProps {
  onStartWorkout: (session?: WorkoutSession) => void;
  onNavigate: (tab: string) => void;
}

export function DashboardView({ onStartWorkout, onNavigate }: DashboardViewProps) {
  const [history, setHistory] = useState<WorkoutSession[]>(() => AppStorage.getHistory());
  const [prs, setPRs] = useState(() => AppStorage.getPRs());
  const [measurements, setMeasurements] = useState(() => AppStorage.getMeasurements());
  const [progressRange, setProgressRange] = useState<'7D' | '30D' | '3M' | '6M' | '1A'>('7D');
  const [progressMetric, setProgressMetric] = useState<'volume' | 'weight' | '1rm'>('volume');

  const latestWeight = measurements[0]?.weightKg ?? 76.8;
  const topPR = prs[0];
  const weeklyWorkoutsCount = 4;
  const weeklyVolume = 28450;
  const currentStreak = 5;

  // Determinar saludo según la hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días, Mario';
    if (hour < 19) return 'Buenas tardes, Mario';
    return 'Buenas noches, Mario';
  };

  const handleStartTodayWorkout = () => {
    // Tomar el primer día de la rutina principal
    const routine = DEFAULT_ROUTINES[0];
    const day = routine.days[0];

    const session: WorkoutSession = {
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
          weightKg: 70,
          reps: item.minReps,
          rir: item.targetRir,
          isCompleted: false,
          volumeKg: 0,
          estimated1rmKg: 0,
          previousSet: { weightKg: 70, reps: 10 }
        }))
      }))
    };

    onStartWorkout(session);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* 1. Saludo y Hero Card del Día */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-brand-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-brand-blue mb-1">
            {getGreeting()}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-darkBlue tracking-tight">
            Entrenamiento de Hoy: Push Day
          </h1>
          <p className="text-xs sm:text-sm text-brand-textSecondary mt-1 max-w-lg">
            Pecho, Hombro anterior y Tríceps. Objetivo: 18 series efectivas y consolidar la sobrecarga en Press de Banca.
          </p>
        </div>

        <button
          onClick={handleStartTodayWorkout}
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand-blue hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 shrink-0"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>INICIAR ENTRENAMIENTO</span>
        </button>
      </div>

      {/* 2. Métricas Clave Superiores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Peso Actual */}
        <div 
          onClick={() => onNavigate('progress')}
          className="bg-white p-4 rounded-xl border border-brand-border shadow-subtle hover:border-gray-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Peso Corporal</span>
            <Scale className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="text-2xl font-black text-brand-darkBlue tabular-data">
            {latestWeight} <span className="text-xs font-normal text-gray-600">kg</span>
          </div>
          <div className="text-[10px] text-[#107C41] font-bold mt-1">
            -1.4 kg este mes
          </div>
        </div>

        {/* Entrenamientos Esta Semana */}
        <div className="bg-white p-4 rounded-xl border border-brand-border shadow-subtle">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Sesiones Semanales</span>
            <Calendar className="w-4 h-4 text-[#107C41]" />
          </div>
          <div className="text-2xl font-black text-brand-darkBlue tabular-data">
            {weeklyWorkoutsCount} <span className="text-xs font-normal text-gray-600">/ 5 días</span>
          </div>
          <div className="text-[10px] text-[#107C41] font-bold mt-1">
            80% del objetivo completado
          </div>
        </div>

        {/* Volumen Semanal */}
        <div className="bg-white p-4 rounded-xl border border-brand-border shadow-subtle">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Volumen Semanal</span>
            <Dumbbell className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="text-2xl font-black text-brand-darkBlue tabular-data">
            {(weeklyVolume / 1000).toFixed(1)}k <span className="text-xs font-normal text-gray-600">kg</span>
          </div>
          <div className="text-[10px] text-[#107C41] font-bold mt-1">
            +5.2% vs semana anterior
          </div>
        </div>

        {/* Racha Activa */}
        <div className="bg-white p-4 rounded-xl border border-brand-border shadow-subtle">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Racha Activa</span>
            <Flame className="w-4 h-4 text-[#C43100]" />
          </div>
          <div className="text-2xl font-black text-brand-darkBlue tabular-data">
            {currentStreak} <span className="text-xs font-normal text-gray-600">días</span>
          </div>
          <div className="text-[10px] text-[#C43100] font-bold mt-1">
            ¡Constancia impecable!
          </div>
        </div>

        {/* Último Récord Personal (PR) */}
        <div 
          onClick={() => onNavigate('progress')}
          className="bg-white p-4 rounded-xl border border-brand-border shadow-subtle hover:border-gray-300 cursor-pointer transition-all col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Último PR</span>
            <Trophy className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-xl font-black text-[#107C41] tabular-data truncate">
            {topPR ? `${topPR.recordValue} kg` : '80 kg'}
          </div>
          <div className="text-[10px] text-gray-500 font-medium truncate mt-1">
            {topPR ? topPR.exerciseName : 'Press Banca'}
          </div>
        </div>
      </div>

      {/* 3. Mapa Muscular Anatómico */}
      <MuscleHeatmap />

      {/* 4. Gráfica de Progreso y Evolución */}
      <div className="bg-white rounded-xl p-5 border border-brand-border shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-semibold text-brand-textPrimary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-blue" />
              Tu Progreso y Tendencia
            </h3>
            <p className="text-xs text-brand-textSecondary mt-0.5">
              Visualiza el aumento de fuerza, tonelaje acumulado y composición
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Selector de métrica */}
            <select
              aria-label="Métrica de progreso a visualizar"
              value={progressMetric}
              onChange={(e) => setProgressMetric(e.target.value as any)}
              className="px-2.5 py-1 text-xs border border-gray-200 rounded-md font-medium text-brand-darkBlue bg-white outline-none"
            >
              <option value="volume">Volumen Total (kg)</option>
              <option value="1rm">1RM Estimado (Fuerza)</option>
              <option value="weight">Peso Corporal (kg)</option>
            </select>

            {/* Selector de rango de tiempo */}
            <div className="inline-flex rounded-lg p-1 bg-gray-100 border border-gray-200 text-xs">
              {(['7D', '30D', '3M', '6M', '1A'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setProgressRange(range)}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    progressRange === range ? 'bg-white text-brand-darkBlue font-bold shadow-xs' : 'text-gray-600'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visualización de Gráfica SVG interactiva */}
        <div className="h-44 w-full flex items-end justify-between gap-2 pt-4 px-2 border-b border-gray-100">
          {[
            { label: 'Lun', val: 7800, height: '65%' },
            { label: 'Mar', val: 9200, height: '80%' },
            { label: 'Mié', val: 0, height: '6%' },
            { label: 'Jue', val: 8450, height: '72%' },
            { label: 'Vie', val: 10500, height: '95%' },
            { label: 'Sáb', val: 0, height: '6%' },
            { label: 'Dom', val: 0, height: '6%' }
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity tabular-data font-bold">
                {bar.val > 0 ? `${(bar.val / 1000).toFixed(1)}k` : 'Descanso'}
              </div>
              <div
                className={`w-full max-w-[36px] rounded-t-md transition-all duration-500 ${
                  bar.val > 0 ? 'bg-brand-blue group-hover:bg-blue-700' : 'bg-gray-100'
                }`}
                style={{ height: bar.height }}
              />
              <span className="text-[11px] font-semibold text-gray-500">{bar.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-600 pt-2">
          <span>Sobrecarga progresiva: Tendencia alcista continua</span>
          <span className="font-bold text-brand-darkBlue">Promedio: 8,987 kg / sesión</span>
        </div>
      </div>

      {/* 5. Actividad Reciente */}
      <div className="bg-white rounded-xl border border-brand-border p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-brand-textPrimary flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-blue" />
            Actividad Reciente
          </h3>
          <span className="text-xs text-brand-textSecondary">
            {history.length} entrenamientos registrados
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {history.slice(0, 3).map((item, idx) => (
            <div key={item.id} className="py-3.5 flex items-center justify-between hover:bg-gray-50/50 rounded-lg px-2 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-xs">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-textPrimary">{item.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-brand-textSecondary mt-0.5">
                    <span>{idx === 0 ? 'Hoy' : `Hace ${idx * 2} días`}</span>
                    <span>•</span>
                    <span>{Math.floor(item.durationSeconds / 60)} minutos</span>
                    <span>•</span>
                    <span>{item.exercises.reduce((acc, e) => acc + e.sets.length, 12)} series</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black text-brand-darkBlue tabular-data">
                  {item.totalVolumeKg.toLocaleString()} kg
                </div>
                <div className="text-[10px] text-[#107C41] font-semibold mt-0.5">
                  ✓ Completado
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
