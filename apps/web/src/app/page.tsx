'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { AuthView } from '../components/auth/AuthView';
import { UserProfileModal } from '../components/profile/UserProfileModal';

import type { WorkoutSession, Exercise, User } from '@gym/types';
import type { SyncStatus } from '@gym/offline-sync';
import { syncManager } from '@gym/offline-sync';
import { AppStorage } from '../lib/storage';
import { Dumbbell, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [draftSession, setDraftSession] = useState<WorkoutSession | null>(null);
  const [gymName, setGymName] = useState<string>('SmartFit Centro');

  const loadUserData = useCallback(() => {
    // Cargar sesión activa sólo si existe y está en curso
    const savedActive = AppStorage.getActiveSession();
    if (savedActive && savedActive.status === 'in_progress' && savedActive.startedAt) {
      setActiveSession(savedActive);
    } else {
      setActiveSession(null);
    }

    // Cargar borrador de preparación si existe
    const savedDraft = AppStorage.getDraftWorkout();
    setDraftSession(savedDraft || null);

    const currentGym = AppStorage.getMyGym();
    if (currentGym?.name) {
      setGymName(currentGym.name);
    }
  }, []);

  useEffect(() => {
    // 1. Cargar usuario actual desde storage
    const user = AppStorage.getCurrentUser();
    setCurrentUser(user);

    // 2. Suscribirse al gestor de sincronización offline
    const unsubscribe = syncManager.subscribeStatus(status => {
      setSyncStatus(status);
    });

    if (user && user.status === 'ACTIVE') {
      loadUserData();
    }

    setIsInitializing(false);

    return () => unsubscribe();
  }, [loadUserData]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.status === 'ACTIVE') {
      loadUserData();
    }
  };

  const handleActivationSuccess = (user: User) => {
    setCurrentUser(user);
    loadUserData();
  };

  const handleLogout = () => {
    AppStorage.logout();
    setCurrentUser(null);
    setActiveSession(null);
    setDraftSession(null);
    setActiveTab('dashboard');
    setIsProfileModalOpen(false);
  };

  // Determinar si hay un entrenamiento activo real en curso
  const hasActiveWorkout = !!activeSession && activeSession.status === 'in_progress' && !!activeSession.startedAt;

  // Preparar entrenamiento (desde Dashboard, Rutinas, o Menú)
  const handlePrepareWorkout = (sessionOrDraft?: WorkoutSession) => {
    // Si ya hay un entrenamiento activo en curso, ir directamente a él sin sobrescribir
    if (hasActiveWorkout) {
      setActiveTab('workout');
      return;
    }

    if (sessionOrDraft) {
      if (sessionOrDraft.status === 'in_progress' && sessionOrDraft.startedAt) {
        setActiveSession(sessionOrDraft);
        AppStorage.setActiveSession(sessionOrDraft);
      } else {
        // Modo preparación (DRAFT)
        setDraftSession(sessionOrDraft);
        AppStorage.setDraftWorkout(sessionOrDraft);
      }
    } else {
      // Si no viene sesión dada, revisar si ya hay un borrador previo guardado
      const existingDraft = AppStorage.getDraftWorkout();
      if (!existingDraft) {
        const freshDraft: WorkoutSession = {
          id: 'draft-' + Date.now(),
          title: 'Preparar Entrenamiento',
          startedAt: undefined,
          durationSeconds: 0,
          totalVolumeKg: 0,
          status: 'draft',
          exercises: []
        };
        setDraftSession(freshDraft);
        AppStorage.setDraftWorkout(freshDraft);
      } else {
        setDraftSession(existingDraft);
      }
    }
    setActiveTab('workout');
  };

  // Activación explícita (cuando el usuario pulsa [ INICIAR ENTRENAMIENTO ])
  const handleActivateWorkout = (activatedSession: WorkoutSession) => {
    setActiveSession(activatedSession);
    setDraftSession(null);
    AppStorage.setActiveSession(activatedSession);
    AppStorage.setDraftWorkout(null);
  };

  // Guardado de borrador mientras se prepara
  const handleSaveDraft = (draft: WorkoutSession | null) => {
    setDraftSession(draft);
    AppStorage.setDraftWorkout(draft);
  };

  // Descartar borrador y volver al dashboard
  const handleCancelWorkout = () => {
    setActiveTab('dashboard');
  };

  // Finalizar sesión activa
  const handleFinishWorkout = () => {
    setActiveSession(null);
    setDraftSession(null);
    AppStorage.setActiveSession(null);
    AppStorage.setDraftWorkout(null);
    setActiveTab('dashboard');
  };

  // Agregar ejercicio a la sesión activa o al borrador en preparación
  const handleAddExerciseToWorkout = (exercise: Exercise) => {
    if (hasActiveWorkout && activeSession) {
      // Sesión activa en curso: se añade a la sesión activa
      const updatedExercises = [
        ...activeSession.exercises,
        {
          id: 'we-' + Date.now(),
          sessionId: activeSession.id,
          exerciseId: exercise.id,
          exercise: exercise,
          order: activeSession.exercises.length + 1,
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
      const updatedSession = { ...activeSession, exercises: updatedExercises };
      setActiveSession(updatedSession);
      AppStorage.setActiveSession(updatedSession);
    } else {
      // Modo preparación (DRAFT): se añade al borrador sin iniciar sesión activa
      const currentDraft = draftSession || AppStorage.getDraftWorkout() || {
        id: 'draft-' + Date.now(),
        title: 'Preparar Entrenamiento',
        startedAt: undefined,
        durationSeconds: 0,
        totalVolumeKg: 0,
        status: 'draft',
        exercises: []
      };

      const updatedExercises = [
        ...currentDraft.exercises,
        {
          id: 'we-' + Date.now(),
          sessionId: currentDraft.id,
          exerciseId: exercise.id,
          exercise: exercise,
          order: currentDraft.exercises.length + 1,
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

      const updatedDraft: WorkoutSession = { ...currentDraft, exercises: updatedExercises };
      setDraftSession(updatedDraft);
      AppStorage.setDraftWorkout(updatedDraft);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue flex items-center justify-center animate-pulse">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <span className="text-xs font-semibold text-slate-400">Cargando GYM PROGRESS...</span>
        </div>
      </div>
    );
  }

  // Si no está autenticado o tiene acceso pendiente, mostrar AuthView
  if (!currentUser || currentUser.status === 'PENDING_ACCESS') {
    return (
      <AuthView
        initialMode={currentUser?.status === 'PENDING_ACCESS' ? 'activate' : 'login'}
        currentUser={currentUser}
        onAuthSuccess={handleAuthSuccess}
        onActivationSuccess={handleActivationSuccess}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onNavigate={(tab) => {
          if (tab === 'workout') {
            handlePrepareWorkout();
          } else {
            setActiveTab(tab);
          }
        }}
        syncStatus={syncStatus}
        gymName={gymName}
        hasActiveWorkout={hasActiveWorkout}
        onOpenActiveWorkout={() => setActiveTab('workout')}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      <div className="flex flex-1">
        {/* Web Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={(tab) => {
            if (tab === 'workout') {
              handlePrepareWorkout();
            } else {
              setActiveTab(tab);
            }
          }}
          hasActiveWorkout={hasActiveWorkout}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Contenido Central */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onStartWorkout={handlePrepareWorkout}
              onNavigate={setActiveTab}
              hasActiveWorkout={hasActiveWorkout}
            />
          )}

          {activeTab === 'workout' && (
            <ActiveWorkoutView
              key={hasActiveWorkout ? (activeSession?.id || 'active') : (draftSession?.id || 'draft')}
              initialSession={hasActiveWorkout ? activeSession : draftSession}
              onFinish={handleFinishWorkout}
              onCancel={handleCancelWorkout}
              onActivateWorkout={handleActivateWorkout}
              onSaveDraft={handleSaveDraft}
              onOpenRoutines={() => setActiveTab('routines')}
              hasActiveWorkout={hasActiveWorkout}
            />
          )}

          {activeTab === 'routines' && (
            <RoutinesView
              onStartRoutine={handlePrepareWorkout}
              hasActiveWorkout={hasActiveWorkout}
            />
          )}

          {activeTab === 'exercises' && (
            <ExerciseCatalogView
              onSelectExerciseForWorkout={(exercise) => {
                handleAddExerciseToWorkout(exercise);
                setActiveTab('workout');
              }}
            />
          )}

          {activeTab === 'machines' && (
            <MachineScannerView
              onAddExerciseToActiveWorkout={(exercise) => {
                handleAddExerciseToWorkout(exercise);
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
        onNavigate={(tab) => {
          if (tab === 'workout') {
            handlePrepareWorkout();
          } else {
            setActiveTab(tab);
          }
        }}
        hasActiveWorkout={hasActiveWorkout}
      />

      {/* Modal de Perfil de Usuario */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUserUpdated={(updatedUser) => {
            setCurrentUser(updatedUser);
          }}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
