'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Dumbbell, 
  X, 
  Plus, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import type { Exercise } from '@gym/types';
import { 
  matchesExercise, 
  getExerciseDisplayName, 
  getLocalizedTaxonomy 
} from '@gym/i18n';
import { ExerciseTechniqueModal } from './ExerciseTechniqueModal';

interface ExerciseCatalogViewProps {
  onSelectExerciseForWorkout?: (exercise: Exercise) => void;
}

export function ExerciseCatalogView({ onSelectExerciseForWorkout }: ExerciseCatalogViewProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [activeExerciseDetail, setActiveExerciseDetail] = useState<Exercise | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    fetch('/data/exercises_seed.json')
      .then(res => res.json())
      .then((data: Exercise[]) => {
        setExercises(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Soporte de accesibilidad: Cerrar modal con tecla Escape
  useEffect(() => {
    if (!activeExerciseDetail) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveExerciseDetail(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeExerciseDetail]);

  // Filtro memoizado de alto rendimiento con búsqueda bilingüe y normalización diacrítica
  const filtered = useMemo(() => {
    return exercises.filter(ex => {
      const matchText = !search.trim() || matchesExercise(ex, search);

      const matchBodyPart = selectedBodyPart === 'all' || ex.bodyPart.toLowerCase() === selectedBodyPart.toLowerCase();
      const matchEquipment = selectedEquipment === 'all' || ex.equipment.toLowerCase() === selectedEquipment.toLowerCase();

      return matchText && matchBodyPart && matchEquipment;
    });
  }, [exercises, search, selectedBodyPart, selectedEquipment]);

  const bodyParts = [
    { id: 'all', label: 'Todos los Músculos' },
    { id: 'chest', label: 'Pecho' },
    { id: 'back', label: 'Espalda' },
    { id: 'upper arms', label: 'Brazos' },
    { id: 'upper legs', label: 'Piernas' },
    { id: 'shoulders', label: 'Hombros' },
    { id: 'waist', label: 'Core / Abdomen' }
  ];

  const equipments = [
    { id: 'all', label: 'Cualquier Equipo' },
    { id: 'barbell', label: 'Barra' },
    { id: 'dumbbell', label: 'Mancuernas' },
    { id: 'cable', label: 'Polea / Cable' },
    { id: 'leverage machine', label: 'Máquinas' },
    { id: 'body weight', label: 'Peso Corporal' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Cabecera y Buscador */}
      <div className="bg-white rounded-xl p-6 border border-brand-border shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-brand-darkBlue flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-blue" />
              Biblioteca de Ejercicios ({exercises.length.toLocaleString()})
            </h1>
            <p className="text-xs text-brand-textSecondary mt-0.5">
              Catálogo completo normalizado con instrucciones paso a paso en español
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ejercicio, músculo o equipo..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(24);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            />
          </div>
        </div>

        {/* Barra de Filtros Rápidos */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
            {bodyParts.map(bp => (
              <button
                key={bp.id}
                onClick={() => {
                  setSelectedBodyPart(bp.id);
                  setVisibleCount(24);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedBodyPart === bp.id
                    ? 'bg-brand-blue text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {bp.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto sm:ml-auto">
            {equipments.map(eq => (
              <button
                key={eq.id}
                onClick={() => {
                  setSelectedEquipment(eq.id);
                  setVisibleCount(24);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap border transition-colors ${
                  selectedEquipment === eq.id
                    ? 'border-brand-blue bg-blue-50 text-brand-blue font-bold'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {eq.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Ejercicios */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 h-32 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-brand-border">
          <Dumbbell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-600">No se encontraron ejercicios coincidentes</p>
          <button
            onClick={() => { setSearch(''); setSelectedBodyPart('all'); setSelectedEquipment('all'); }}
            className="mt-3 text-xs text-brand-blue font-bold hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.slice(0, visibleCount).map(ex => (
              <div
                key={ex.id}
                onClick={() => setActiveExerciseDetail(ex)}
                className="bg-white rounded-xl border border-brand-border p-4 hover:border-brand-blue hover:shadow-card cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-3.5">
                  {ex.image ? (
                    <img
                      src={ex.image}
                      alt={ex.nameEs || ex.name}
                      loading="lazy"
                      className="w-20 h-20 sm:w-[88px] sm:h-[88px] lg:w-24 lg:h-24 rounded-xl object-contain bg-slate-50 border border-gray-200 p-1 shrink-0"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-[88px] sm:h-[88px] lg:w-24 lg:h-24 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
                      <Dumbbell className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-brand-textPrimary line-clamp-2">
                      {getExerciseDisplayName(ex, 'es')}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-brand-textSecondary mt-1">
                      <span className="capitalize font-semibold text-brand-blue">
                        {getLocalizedTaxonomy('bodyParts', ex.bodyPart, 'es')}
                      </span>
                      <span>•</span>
                      <span className="truncate">{getLocalizedTaxonomy('equipments', ex.equipment, 'es')}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1 capitalize">
                      Objetivo: <strong className="text-gray-700">{getLocalizedTaxonomy('targets', ex.target, 'es')}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-brand-blue font-medium flex items-center gap-1">
                    Ver técnica y pasos <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                  {onSelectExerciseForWorkout && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectExerciseForWorkout(ex);
                        alert(`¡"${getExerciseDisplayName(ex, 'es')}" agregado a tu entrenamiento activo!`);
                      }}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-brand-blue font-bold rounded-lg text-xs transition-colors"
                    >
                      + Entrenar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Botón Cargar Más para fluidez */}
          {visibleCount < filtered.length && (
            <div className="text-center pt-4">
              <button
                onClick={() => setVisibleCount(prev => prev + 24)}
                className="px-6 py-2.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-xs font-bold text-brand-darkBlue shadow-xs transition-colors"
              >
                Cargar más ejercicios ({filtered.length - visibleCount} restantes)
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Reutilizable de Técnica y Pasos */}
      <ExerciseTechniqueModal
        exercise={activeExerciseDetail}
        isOpen={!!activeExerciseDetail}
        onClose={() => setActiveExerciseDetail(null)}
        onSelectForWorkout={onSelectExerciseForWorkout ? (ex) => {
          onSelectExerciseForWorkout(ex);
          alert(`¡"${getExerciseDisplayName(ex, 'es')}" agregado a tu sesión activa!`);
        } : undefined}
      />
    </div>
  );
}
