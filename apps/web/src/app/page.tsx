'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNav } from '../components/layout/BottomNav';

import { DashboardView } from '../components/dashboard/DashboardView';
import { ActiveWorkoutView } from '../components/workout/ActiveWorkoutView';
import { RoutinesView } from '../components/routines/RoutinesView';
import { ExerciseCatalogView } from '../components/exercises/ExerciseCatalogView';
import { MachineScannerView } from '../components/machines/MachineScannerView';
import { MyGymView } from '../components/gym/MyGymView';
import { ProgressView } from '../components/progress/ProgressView';

import type { WorkoutSession, Exercise } from '@gym/types';
import type { SyncStatus } from '@gym/offline-sync';
import { syncManager } from '@gym/offline-sync';
import { AppStorage } from '../lib/storage';
import { Dumbbell, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [gymName, setGymName] = useState<string>('SmartFit Centro');

  useEffect(() => {
    // Suscribirse al gestor de sincronización offline
    const unsubscribe = syncManager.subscribeStatus(status => {
      setSyncStatus(status);
    });

    // Cargar sesión activa si existe guardada en local
    const saved = AppStorage.getActiveSession();
    if (saved) {
      setActiveSession(saved);
    }

    const currentGym = AppStorage.getMyGym();
    if (currentGym?.name) {
      setGymName(currentGym.name);
    }

    return () => unsubscribe();
  }, []);

  // Iniciar entrenamiento desde cualquier parte (Dashboard o Rutinas)
  const handleStartWorkout = (session?: WorkoutSession) => {
    if (session) {
      setActiveSession(session);
      AppStorage.setActiveSession(session);
    } else {
      // Sesión libre
      const newSession: WorkoutSession = {
        id: 'session-' + Date.now(),
        title: 'Entrenamiento Libre',
        startedAt: new Date().toISOString(),
        durationSeconds: 0,
        totalVolumeKg: 0,
        status: 'in_progress',
        exercises: []
      };
      setActiveSession(newSession);
      AppStorage.setActiveSession(newSession);
    }
    setActiveTab('workout');
  };

  // Agregar ejercicio a la sesión activa (por ejemplo desde el escáner de máquinas o catálogo)
  const handleAddExerciseToActiveWorkout = (exercise: Exercise) => {
    let current = activeSession || AppStorage.getActiveSession();
    if (!current) {
      current = {
        id: 'session-' + Date.now(),
        title: 'Entrenamiento Libre',
        startedAt: new Date().toISOString(),
        durationSeconds: 0,
        totalVolumeKg: 0,
        status: 'in_progress',
        exercises: []
      };
    }

    const updatedExercises = [
      ...current.exercises,
      {
        id: 'we-' + Date.now(),
        sessionId: current.id,
        exerciseId: exercise.id,
        exercise: exercise,
        order: current.exercises.length + 1,
        sets: [
          {
            id: 'set-1-' + Date.now(),
            workoutExerciseId: 'we-' + Date.now(),
            setNumber: 1,
            setType: 'normal' as const,
            weightKg: 50,
            reps: 10,
            rir: 2,
            isCompleted: false,
            volumeKg: 0,
            estimated1rmKg: 0
          }
        ]
      }
    ];

    const updatedSession = { ...current, exercises: updatedExercises };
    setActiveSession(updatedSession);
    AppStorage.setActiveSession(updatedSession);
  };

  const handleFinishWorkout = () => {
    setActiveSession(null);
    AppStorage.setActiveSession(null);
    setActiveTab('dashboard');
  };

  const hasActiveWorkout = !!activeSession;

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        syncStatus={syncStatus}
        gymName={gymName}
        hasActiveWorkout={hasActiveWorkout}
        onOpenActiveWorkout={() => setActiveTab('workout')}
      />

      <div className="flex flex-1">
        {/* Web Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={setActiveTab}
          hasActiveWorkout={hasActiveWorkout}
        />

        {/* Contenido Central */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onStartWorkout={handleStartWorkout}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'workout' && (
            <ActiveWorkoutView
              initialSession={activeSession}
              onFinish={handleFinishWorkout}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'routines' && (
            <RoutinesView
              onStartRoutine={(session) => {
                setActiveSession(session);
                AppStorage.setActiveSession(session);
                setActiveTab('workout');
              }}
            />
          )}

          {activeTab === 'exercises' && (
            <ExerciseCatalogView
              onSelectExerciseForWorkout={(exercise) => {
                handleAddExerciseToActiveWorkout(exercise);
                setActiveTab('workout');
              }}
            />
          )}

          {activeTab === 'machines' && (
            <MachineScannerView
              onAddExerciseToActiveWorkout={(exercise) => {
                handleAddExerciseToActiveWorkout(exercise);
              }}
              onNavigateToGym={() => setActiveTab('gym')}
            />
          )}

          {activeTab === 'gym' && (
            <MyGymView
              onNavigateToScanner={() => setActiveTab('machines')}
            />
          )}

          {(activeTab === 'progress' || activeTab === 'records') && (
            <ProgressView />
          )}
        </main>
      </div>

      {/* Barra flotante inferior de entrenamiento activo (si estás navegando en otra pestaña) */}
      {hasActiveWorkout && activeTab !== 'workout' && (
        <div 
          onClick={() => setActiveTab('workout')}
          className="fixed bottom-18 left-4 right-4 sm:left-auto sm:right-8 sm:w-96 z-40 bg-[#D83B01] text-white p-3 rounded-xl shadow-lg flex items-center justify-between cursor-pointer hover:bg-[#b83200] transition-transform active:scale-98 animate-bounce-short border border-orange-400"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">{activeSession?.title}</div>
              <div className="text-[10px] text-orange-100">Sesión activa en curso • Toca para volver</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4" />
        </div>
      )}

      {/* Bottom Navigation para Dispositivos Móviles */}
      <BottomNav
        activeTab={activeTab}
        onNavigate={setActiveTab}
        hasActiveWorkout={hasActiveWorkout}
      />
    </div>
  );
}
