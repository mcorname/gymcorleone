'use client';

import React from 'react';
import { Dumbbell, Cloud, CloudOff, RefreshCw, CheckCircle2, Shield, User as UserIcon } from 'lucide-react';
import type { SyncStatus } from '@gym/offline-sync';
import type { User } from '@gym/types';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  syncStatus: SyncStatus;
  gymName: string;
  hasActiveWorkout: boolean;
  onOpenActiveWorkout: () => void;
  currentUser?: User | null;
  onOpenProfile?: () => void;
  onLogout?: () => void;
}

export function Navbar({
  activeTab,
  onNavigate,
  syncStatus,
  gymName,
  hasActiveWorkout,
  onOpenActiveWorkout,
  currentUser,
  onOpenProfile,
  onLogout
}: NavbarProps) {
  const getSyncBadge = () => {
    switch (syncStatus) {
      case 'offline':
        return (
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium">
            <CloudOff className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Sin conexión</span>
          </div>
        );
      case 'syncing':
        return (
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span className="hidden sm:inline">Sincronizando...</span>
          </div>
        );
      case 'saved_local':
        return (
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Guardado</span>
          </div>
        );
      case 'synced':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Sincronizado</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-brand-border h-16 flex items-center justify-between px-4 lg:px-8 shadow-subtle">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-brand-darkBlue font-bold text-lg tracking-tight hover:opacity-90"
        >
          <div className="w-9 h-9 rounded-lg bg-brand-blue flex items-center justify-center text-white shadow-sm">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="leading-none text-brand-darkBlue font-black text-base">GYM PROGRESS</div>
            <div className="text-[11px] font-normal text-brand-textSecondary mt-0.5">Asistente Inteligente</div>
          </div>
        </button>

        {/* Gimnasio activo badge */}
        <div 
          onClick={() => onNavigate('gym')} 
          className="hidden md:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer text-xs text-brand-textPrimary font-medium border border-gray-200 transition-colors"
          title="Equipamiento sincronizado con tu gimnasio"
        >
          <Shield className="w-3.5 h-3.5 text-brand-blue" />
          <span>{gymName}</span>
        </div>
      </div>

      {/* Acciones del Topbar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Banner o botón rápido de entrenamiento en curso (en móvil el BottomNav ya tiene el botón Activo destacado) */}
        {hasActiveWorkout && (
          <button
            onClick={onOpenActiveWorkout}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#D83B01] text-white text-xs font-semibold shadow-sm hover:bg-[#b83200] transition-colors animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>Entrenamiento en Vivo</span>
          </button>
        )}

        {/* Indicador de estado de sincronización */}
        {getSyncBadge()}

        {/* Indicador de Idioma / Localización Activa */}
        <div 
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/80 border border-blue-200 text-xs font-bold text-brand-darkBlue shadow-xs"
          title="Idioma activo: Español Neutral Fitness"
        >
          <span className="text-[12px] leading-none">🇪🇸</span>
          <span className="text-[11px] tracking-wide text-brand-blue font-black">ES</span>
        </div>

        {/* Perfil de Usuario */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-gray-200 hover:opacity-80 transition-opacity text-left group"
          title="Ver y editar Mi Perfil"
          aria-label="Abrir perfil de usuario"
        >
          <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:ring-2 group-hover:ring-blue-300 transition-all">
            {currentUser?.name
              ? currentUser.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
              : 'MC'}
          </div>
          <div className="hidden xl:block text-left text-xs">
            <div className="font-semibold text-brand-textPrimary leading-none truncate max-w-[120px]">
              {currentUser?.name || 'Mario Castro'}
            </div>
            <div className="text-[10px] text-brand-textSecondary mt-0.5 capitalize">
              {currentUser?.level || 'Intermedio'}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
