'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Minus, X, Volume2 } from 'lucide-react';

interface RestTimerModalProps {
  isOpen: boolean;
  initialSeconds?: number;
  onClose: () => void;
  onTimerComplete?: () => void;
}

export function RestTimerModal({
  isOpen,
  initialSeconds = 90,
  onClose,
  onTimerComplete
}: RestTimerModalProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [totalTime, setTotalTime] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);

  // Reiniciar cuando se abre con nuevos segundos iniciales
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(initialSeconds);
      setTotalTime(initialSeconds);
      setIsRunning(true);
    }
  }, [isOpen, initialSeconds]);

  // Intervalo de decremento
  useEffect(() => {
    let timer: any = null;
    if (isOpen && isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (onTimerComplete) onTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isRunning, timeLeft, onTimerComplete]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 100;

  const handleAdjustTime = (delta: number) => {
    setTimeLeft(prev => {
      const next = Math.max(0, prev + delta);
      setTotalTime(t => Math.max(t, next));
      return next;
    });
  };

  const handleSelectPreset = (sec: number) => {
    setTimeLeft(sec);
    setTotalTime(sec);
    setIsRunning(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-5 border border-brand-border shadow-modal animate-slide-up">
        {/* Cabecera del Bottom Sheet */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-brand-darkBlue font-bold text-sm">
            <Clock className="w-4 h-4 text-[#D83B01]" />
            <span>Tiempo de Descanso</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display del Cronómetro Gigante */}
        <div className="py-6 text-center">
          <div className="text-6xl font-black tabular-data text-brand-textPrimary tracking-tight">
            {formattedTime}
          </div>
          <p className="text-xs text-brand-textSecondary mt-2">
            {timeLeft > 0 ? 'Recupera el aliento para tu siguiente serie' : '¡Listo para continuar!'}
          </p>

          {/* Barra de progreso visual */}
          <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-[#D83B01] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Botones de ajuste rápido (+15s / -15s) */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <button
            onClick={() => handleAdjustTime(-15)}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-brand-textPrimary transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>15s</span>
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-5 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-brand-textPrimary hover:bg-gray-50 transition-colors"
          >
            {isRunning ? 'Pausar' : 'Reanudar'}
          </button>

          <button
            onClick={() => handleAdjustTime(15)}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-brand-textPrimary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>15s</span>
          </button>
        </div>

        {/* Presets rápidos */}
        <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-gray-100">
          {[30, 45, 60, 90, 120, 180].map(preset => (
            <button
              key={preset}
              onClick={() => handleSelectPreset(preset)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                totalTime === preset
                  ? 'bg-blue-50 border-brand-blue text-brand-blue font-bold'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {preset >= 60 ? `${preset / 60}m` : `${preset}s`}
            </button>
          ))}
        </div>

        {/* Botón Saltar */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors"
        >
          Saltar Descanso y Continuar
        </button>
      </div>
    </div>
  );
}
