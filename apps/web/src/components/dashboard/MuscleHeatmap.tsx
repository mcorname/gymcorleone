'use client';

import React, { useState } from 'react';

interface MuscleHeatmapProps {
  volumeByMuscle?: Record<string, number>;
}

export function MuscleHeatmap({ volumeByMuscle = {} }: MuscleHeatmapProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [view, setView] = useState<'front' | 'back'>('front');

  // Músculos principales con su estado de carga semanal
  const muscles = [
    { id: 'chest', name: 'Pecho', key: 'chest', view: 'front', volume: volumeByMuscle['chest'] || 1890, sets: 12 },
    { id: 'shoulders', name: 'Hombros', key: 'shoulders', view: 'front', volume: volumeByMuscle['shoulders'] || 1240, sets: 8 },
    { id: 'biceps', name: 'Bíceps', key: 'upper arms', view: 'front', volume: volumeByMuscle['upper arms'] || 960, sets: 6 },
    { id: 'abs', name: 'Abdomen / Core', key: 'waist', view: 'front', volume: volumeByMuscle['waist'] || 820, sets: 6 },
    { id: 'quads', name: 'Cuádriceps', key: 'upper legs', view: 'front', volume: volumeByMuscle['upper legs'] || 3200, sets: 14 },
    { id: 'calves_front', name: 'Pantorrillas', key: 'lower legs', view: 'front', volume: volumeByMuscle['lower legs'] || 640, sets: 4 },

    { id: 'back', name: 'Espalda / Dorsales', key: 'back', view: 'back', volume: volumeByMuscle['back'] || 2850, sets: 15 },
    { id: 'triceps', name: 'Tríceps', key: 'upper arms', view: 'back', volume: volumeByMuscle['upper arms'] || 1150, sets: 8 },
    { id: 'glutes', name: 'Glúteos', key: 'glutes', view: 'back', volume: 1800, sets: 10 },
    { id: 'hamstrings', name: 'Isquiotibiales (Femoral)', key: 'upper legs', view: 'back', volume: 1450, sets: 8 },
    { id: 'calves_back', name: 'Pantorrillas', key: 'lower legs', view: 'back', volume: 640, sets: 4 }
  ];

  // Helper de color según volumen (estilo azul M365 a verde Excel)
  const getMuscleColor = (vol: number) => {
    if (vol >= 2500) return 'bg-[#107C41] text-white border-[#107C41]'; // Verde Excel (Objetivo óptimo)
    if (vol >= 1200) return 'bg-[#2563EB] text-white border-[#2563EB]'; // Azul Principal (Entrenamiento moderado)
    if (vol > 0) return 'bg-[#93C5FD] text-[#1E3A8A] border-[#60A5FA]'; // Azul claro (Poco entrenamiento)
    return 'bg-gray-100 text-gray-400 border-gray-200'; // Descuidado / Sin volumen
  };

  const currentMuscles = muscles.filter(m => m.view === view);

  return (
    <div className="bg-white rounded-xl p-5 border border-brand-border shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-brand-textPrimary flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-blue"></span>
            Mapa de Carga Muscular Semanal
          </h3>
          <p className="text-xs text-brand-textSecondary mt-0.5">
            Distribución del volumen de entrenamiento (últimos 7 días)
          </p>
        </div>

        {/* Selector de vista Frontal / Posterior */}
        <div className="inline-flex rounded-lg p-1 bg-gray-100 border border-gray-200">
          <button
            onClick={() => setView('front')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              view === 'front' ? 'bg-white text-brand-darkBlue shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Frontal
          </button>
          <button
            onClick={() => setView('back')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              view === 'back' ? 'bg-white text-brand-darkBlue shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Posterior
          </button>
        </div>
      </div>

      {/* Representación anatómica visual con tarjetas interactivas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {currentMuscles.map(m => {
          const isSelected = selectedMuscle === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setSelectedMuscle(isSelected ? null : m.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected ? 'ring-2 ring-brand-blue border-brand-blue shadow-sm' : 'hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-brand-textPrimary truncate">{m.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${getMuscleColor(m.volume)}`}>
                  {m.volume >= 2500 ? 'Óptimo' : m.volume >= 1200 ? 'Moderado' : 'Bajo'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold tabular-data text-brand-darkBlue">
                  {m.volume.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">kg</span>
                </span>
                <span className="text-xs text-brand-textSecondary">{m.sets} series</span>
              </div>
              {/* Barra de progreso de volumen semanal */}
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (m.volume / 3000) * 100)}%`,
                    backgroundColor: m.volume >= 2500 ? '#107C41' : m.volume >= 1200 ? '#2563EB' : '#60A5FA'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda de colores explicativa */}
      <div className="flex flex-wrap items-center justify-between pt-4 mt-4 border-t border-gray-100 text-xs text-brand-textSecondary">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#107C41]"></span>
            <span>Objetivo semanal óptimo (&gt;2,500 kg)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#2563EB]"></span>
            <span>Volumen moderado (&gt;1,200 kg)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#93C5FD]"></span>
            <span>Poco estímulo / En recuperación</span>
          </div>
        </div>
      </div>
    </div>
  );
}
