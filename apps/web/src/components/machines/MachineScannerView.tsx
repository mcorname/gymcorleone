'use client';

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Shield,
  Sliders,
  Activity,
  ChevronRight,
  Layers,
  ArrowRight
} from 'lucide-react';
import type { Machine, AIScanResult, Exercise } from '@gym/types';
import { CANONICAL_MACHINES, scanGymMachine, findCompatibleExercises } from '@gym/ai';
import { getExerciseDisplayName, getLocalizedTaxonomy } from '@gym/i18n';
import { AppStorage } from '../../lib/storage';

interface MachineScannerViewProps {
  onAddExerciseToActiveWorkout?: (exercise: Exercise) => void;
  onNavigateToGym?: () => void;
}

export function MachineScannerView({
  onAddExerciseToActiveWorkout,
  onNavigateToGym
}: MachineScannerViewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<AIScanResult | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [compatibleExercises, setCompatibleExercises] = useState<Exercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);
  const [userConfirmed, setUserConfirmed] = useState(false);
  const [manualSelection, setManualSelection] = useState<string>('');

  useEffect(() => {
    fetch('/data/exercises_seed.json')
      .then(r => r.json())
      .then((data: Exercise[]) => setAllExercises(data))
      .catch(() => {});
  }, []);

  const handleSimulateScan = async (machineTag: string) => {
    setIsAnalyzing(true);
    setScanResult(null);
    setUserConfirmed(false);
    setSavedSuccessMessage(null);

    // Simular procesamiento del modelo de visión (1.2s)
    setTimeout(async () => {
      const result = await scanGymMachine(machineTag);
      setScanResult(result);
      setIsAnalyzing(false);

      // Encontrar ejercicios compatibles en el dataset de 1,300+
      const matches = findCompatibleExercises(result, allExercises, 6);
      setCompatibleExercises(matches);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSimulateScan(file.name);
    }
  };

  const handleConfirmMachine = (machineName: string) => {
    setUserConfirmed(true);
    // Buscar la máquina canónica si existe
    const found = CANONICAL_MACHINES.find(m => m.canonicalName.includes(machineName) || machineName.includes(m.canonicalName));
    if (found) {
      setSelectedMachine(found);
      const matches = findCompatibleExercises(found, allExercises, 6);
      setCompatibleExercises(matches);
    }
  };

  const handleSaveToMyGym = () => {
    if (!scanResult) return;
    const machineId = selectedMachine?.id || 'm-' + scanResult.detectedMachineName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    AppStorage.saveGymEquipment({
      id: 'eq-' + Date.now(),
      gymId: 'gym-1',
      machineId,
      customLabel: scanResult.detectedMachineName,
      equipmentType: scanResult.datasetEquipmentMapping,
      identifiedViaAi: true,
      isAvailable: true,
      machine: selectedMachine || undefined
    });

    setSavedSuccessMessage(`¡"${scanResult.detectedMachineName}" guardada con éxito en tu inventario de Mi Gimnasio!`);
    setTimeout(() => setSavedSuccessMessage(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Toast de confirmación guardado */}
      {savedSuccessMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#107C41] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-yellow-300" />
          <span className="text-xs font-bold">{savedSuccessMessage}</span>
        </div>
      )}

      {/* Cabecera del Módulo IA */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-card relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10 text-white pointer-events-none">
          <Sparkles className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Visión Artificial de Gimnasio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Escanea Cualquier Máquina
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-2">
            Apunta tu cámara o sube una fotografía. La IA identificará la máquina, te explicará la regulación biomecánica óptima, músculos activados y los ejercicios exactos que puedes ejecutar.
          </p>
        </div>
      </div>

      {/* Selector de Captura / Acciones Rápidas */}
      <div className="bg-white rounded-xl p-5 border border-brand-border shadow-subtle">
        <h3 className="text-sm font-bold text-brand-textPrimary mb-3">
          Selecciona cómo capturar la máquina:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Opción Tomar Foto / Simular Cámara */}
          <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-brand-purple/40 hover:border-brand-purple bg-purple-50/30 cursor-pointer transition-all">
            <div className="w-10 h-10 rounded-lg bg-brand-purple text-white flex items-center justify-center shadow-sm shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-brand-textPrimary">Abrir Cámara en Sala</div>
              <div className="text-[11px] text-brand-textSecondary mt-0.5">Captura la máquina frente a ti</div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </label>

          {/* Opción Subir Fotografía */}
          <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50/50 cursor-pointer transition-all">
            <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-brand-textPrimary">Subir Imagen de Galería</div>
              <div className="text-[11px] text-brand-textSecondary mt-0.5">JPG, PNG o WEBP</div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </label>
        </div>

        {/* Simulador rápido de demostración */}
        <div className="pt-4 border-t border-gray-100">
          <div className="text-[11px] font-semibold text-gray-500 mb-2">
            Prueba rápida con equipamiento canónico común:
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Chest Press', tag: 'chest press machine' },
              { label: 'Lat Pulldown (Jalón)', tag: 'lat pulldown cable' },
              { label: 'Leg Press (Prensa 45°)', tag: 'leg press plate-loaded' },
              { label: 'Smith Machine', tag: 'smith machine multipower' },
              { label: 'Polea Doble (Cable)', tag: 'cable crossover machine' },
              { label: 'Extensión Cuádriceps', tag: 'leg extension lever' }
            ].map(preset => (
              <button
                key={preset.label}
                onClick={() => handleSimulateScan(preset.tag)}
                disabled={isAnalyzing}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-purple-100 hover:text-brand-purple text-xs font-medium text-gray-700 transition-colors border border-gray-200"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Estado de Carga y Análisis IA */}
      {isAnalyzing && (
        <div className="bg-white rounded-xl p-8 border border-purple-200 text-center shadow-subtle animate-pulse">
          <div className="w-12 h-12 rounded-full bg-purple-100 text-brand-purple flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-brand-darkBlue">
            Analizando imagen con Visión Artificial...
          </h3>
          <p className="text-xs text-brand-textSecondary mt-1">
            Detectando estructura mecánica, poleas, biomecánica y mapeo de ejercicios.
          </p>
        </div>
      )}

      {/* Resultado del Escaneo Estructurado (Flow Diferencial) */}
      {scanResult && !isAnalyzing && (
        <div className="space-y-4 animate-fade-in">
          {/* Tarjeta de Reconocimiento y Confianza */}
          <div className="bg-white rounded-xl border border-brand-border p-5 shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-purple">
                    Máquina Detectada
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-brand-purple border border-purple-200">
                    {scanResult.confidence}% Confianza
                  </span>
                </div>
                <h2 className="text-xl font-black text-brand-darkBlue mt-1">
                  {scanResult.detectedMachineName}
                </h2>
                <div className="text-xs text-brand-textSecondary mt-0.5">
                  Categoría: <strong className="capitalize text-brand-textPrimary">{scanResult.machineCategory}</strong> • Movimiento: <strong className="text-brand-textPrimary">{scanResult.movementType}</strong>
                </div>
              </div>

              {/* Botones de acción clave: Mi Gimnasio & Entrenamiento */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToMyGym}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs font-bold text-brand-textPrimary transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Guardar en Mi Gimnasio</span>
                </button>
              </div>
            </div>

            {/* Advertencia si la confianza es media */}
            {scanResult.confidence < 75 && !userConfirmed && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>No estamos completamente seguros. Por favor confirma la máquina:</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {scanResult.possibleMatches.map(match => (
                    <button
                      key={match}
                      onClick={() => handleConfirmMachine(match)}
                      className="px-3 py-1 bg-white border border-amber-300 rounded text-xs font-semibold text-gray-800 hover:bg-amber-100 transition-colors"
                    >
                      {match}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Desglose Anatómico y Biomecánico */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div className="p-3.5 rounded-lg bg-blue-50/50 border border-blue-100">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-blue mb-1">
                  <Activity className="w-4 h-4" />
                  <span>Músculos Primarios (Agonistas)</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {scanResult.targetMuscles.map(m => (
                    <span key={m} className="px-2 py-0.5 rounded bg-white text-xs font-bold text-brand-darkBlue border border-blue-200">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1">
                  <Layers className="w-4 h-4" />
                  <span>Músculos Secundarios (Sinergistas)</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {scanResult.secondaryMuscles.map(m => (
                    <span key={m} className="px-2 py-0.5 rounded bg-white text-xs font-medium text-gray-700 border border-gray-200">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Guía Ergonómica de Ajustes (Ajustes de la máquina) */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary mb-3 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-brand-blue" />
                <span>Cómo Ajustar la Máquina Antes de Empezar</span>
              </h4>

              <div className="space-y-2.5 text-xs text-brand-textPrimary">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <strong className="text-brand-darkBlue block mb-0.5">Altura del Asiento:</strong>
                  <span>{scanResult.adjustmentGuide.seatHeight}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <strong className="text-brand-darkBlue block mb-0.5">Posición del Respaldo:</strong>
                  <span>{scanResult.adjustmentGuide.backrest}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <strong className="text-brand-darkBlue block mb-0.5">Agarre y Manerales:</strong>
                  <span>{scanResult.adjustmentGuide.handleGrip}</span>
                </div>
              </div>
            </div>

            {/* Puntos Clave de Ejecución y Errores Comunes */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <h5 className="font-bold text-[#107C41] mb-1.5">Técnica Correcta:</h5>
                <ul className="space-y-1 text-gray-700 list-disc list-inside">
                  <li>{scanResult.executionCues.startingPosition}</li>
                  <li>{scanResult.executionCues.rangeOfMotion}</li>
                  <li>{scanResult.executionCues.breathing}</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-lg bg-red-50/50 border border-red-100">
                <h5 className="font-bold text-[#D13438] mb-1.5">Errores Frecuentes a Evitar:</h5>
                <ul className="space-y-1 text-gray-700 list-disc list-inside">
                  {scanResult.commonMistakes.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Ejercicios Compatibles del Dataset de 1,300+ */}
          <div className="bg-white rounded-xl border border-brand-border p-5 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-brand-textPrimary flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-blue"></span>
                  Ejercicios Compatibles con esta Máquina
                </h3>
                <p className="text-xs text-brand-textSecondary mt-0.5">
                  Variaciones extraídas directamente del catálogo que puedes realizar ahora mismo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {compatibleExercises.map(ex => (
                <div
                  key={ex.id}
                  className="p-3 rounded-lg border border-gray-200 hover:border-brand-blue flex items-center justify-between transition-all bg-white"
                >
                  <div className="flex items-center gap-3">
                    {ex.image && (
                      <img
                        src={ex.image}
                        alt={getExerciseDisplayName(ex, 'es')}
                        className="w-11 h-11 rounded-md object-cover bg-gray-50 border border-gray-200"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    )}
                    <div>
                      <div className="text-xs font-bold text-brand-textPrimary">
                        {getExerciseDisplayName(ex, 'es')}
                      </div>
                      <div className="text-[11px] text-brand-textSecondary mt-0.5 capitalize">
                        {getLocalizedTaxonomy('targets', ex.target, 'es')} • {getLocalizedTaxonomy('equipments', ex.equipment, 'es')}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onAddExerciseToActiveWorkout) {
                        onAddExerciseToActiveWorkout(ex);
                        alert(`¡"${getExerciseDisplayName(ex, 'es')}" agregado a tu entrenamiento activo!`);
                      }
                    }}
                    className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-brand-blue text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
                    title="Agregar a sesión activa"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Agregar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
