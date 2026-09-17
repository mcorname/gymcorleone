'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Dumbbell, 
  ClipboardList, 
  BookOpen, 
  Scan, 
  Building2, 
  TrendingUp, 
  Trophy, 
  Settings,
  Flame
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  hasActiveWorkout: boolean;
}

export function Sidebar({ activeTab, onNavigate, hasActiveWorkout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'workout', label: 'Entrenar', icon: Dumbbell, highlight: true },
    { id: 'routines', label: 'Mis Rutinas', icon: ClipboardList },
    { id: 'exercises', label: 'Biblioteca (1,300+)', icon: BookOpen },
    { id: 'machines', label: 'Escanear Máquina (IA)', icon: Scan, isAI: true },
    { id: 'gym', label: 'Mi Gimnasio', icon: Building2 },
    { id: 'progress', label: 'Progreso & Medidas', icon: TrendingUp },
    { id: 'records', label: 'Récords Personales', icon: Trophy }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-brand-border h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 flex-1 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary">
          Menú Principal
        </div>

        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-brand-blue font-semibold shadow-xs'
                  : 'text-brand-textPrimary hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${
                  isActive 
                    ? 'text-brand-blue' 
                    : item.isAI 
                      ? 'text-brand-purple' 
                      : item.highlight 
                        ? 'text-brand-blue' 
                        : 'text-gray-500'
                }`} />
                <span>{item.label}</span>
              </div>

              {item.isAI && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-brand-purple font-semibold">
                  IA
                </span>
              )}
              {item.highlight && hasActiveWorkout && (
                <span className="w-2 h-2 rounded-full bg-[#D83B01] animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Racha y constancia semanal en la parte inferior */}
      <div className="p-4 border-t border-gray-100">
        <div className="p-3 rounded-lg bg-orange-50/70 border border-orange-200">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D83B01]">
            <Flame className="w-4 h-4 fill-[#D83B01]" />
            <span>Racha activa: 5 días</span>
          </div>
          <p className="text-[11px] text-gray-600 mt-1">
            Has entrenado 4 de tus 5 días objetivo de esta semana.
          </p>
        </div>
      </div>
    </aside>
  );
}
