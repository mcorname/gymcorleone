'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Dumbbell, 
  ClipboardList, 
  TrendingUp, 
  Scan
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  hasActiveWorkout: boolean;
}

export function BottomNav({ activeTab, onNavigate, hasActiveWorkout }: BottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-brand-border h-16 px-2 flex items-center justify-around shadow-lg">
      {/* Inicio */}
      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center justify-center flex-1 py-1 ${
          activeTab === 'dashboard' ? 'text-brand-blue font-semibold' : 'text-gray-500'
        }`}
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Inicio</span>
      </button>

      {/* Rutinas */}
      <button
        onClick={() => onNavigate('routines')}
        className={`flex flex-col items-center justify-center flex-1 py-1 ${
          activeTab === 'routines' ? 'text-brand-blue font-semibold' : 'text-gray-500'
        }`}
      >
        <ClipboardList className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Rutinas</span>
      </button>

      {/* BOTÓN PROMINENTE: ENTRENAR */}
      <div className="flex-1 flex justify-center -mt-5">
        <button
          onClick={() => onNavigate('workout')}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white shadow-md transition-transform active:scale-95 ${
            hasActiveWorkout ? 'bg-[#D83B01] ring-4 ring-orange-100' : 'bg-brand-blue ring-4 ring-blue-100'
          }`}
        >
          <Dumbbell className="w-6 h-6" />
          <span className="text-[9px] font-bold mt-0.5 uppercase tracking-wider">
            {hasActiveWorkout ? 'Activo' : 'Entrenar'}
          </span>
        </button>
      </div>

      {/* Escanear Máquina (IA) */}
      <button
        onClick={() => onNavigate('machines')}
        className={`flex flex-col items-center justify-center flex-1 py-1 ${
          activeTab === 'machines' ? 'text-brand-purple font-semibold' : 'text-gray-500'
        }`}
      >
        <Scan className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Escáner IA</span>
      </button>

      {/* Progreso */}
      <button
        onClick={() => onNavigate('progress')}
        className={`flex flex-col items-center justify-center flex-1 py-1 ${
          activeTab === 'progress' ? 'text-brand-blue font-semibold' : 'text-gray-500'
        }`}
      >
        <TrendingUp className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Progreso</span>
      </button>
    </nav>
  );
}
