'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Ruler, 
  Trophy, 
  Camera, 
  Plus, 
  Calendar, 
  Sliders,
  CheckCircle2
} from 'lucide-react';
import type { BodyMeasurement, PersonalRecord } from '@gym/types';
import { calculateBMI } from '@gym/calculations';
import { AppStorage } from '../../lib/storage';

export function ProgressView() {
  const [activeTab, setActiveTab] = useState<'body' | 'records' | 'photos'>('body');
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(() => AppStorage.getMeasurements());
  const [prs, setPRs] = useState<PersonalRecord[]>(() => AppStorage.getPRs());

  // Formulario nuevo registro corporal
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [newWeight, setNewWeight] = useState<string>('76.5');
  const [newHeight, setNewHeight] = useState<string>('178');
  const [newBodyFat, setNewBodyFat] = useState<string>('15.0');
  const [newWaist, setNewWaist] = useState<string>('82');
  const [newChest, setNewChest] = useState<string>('103');
  const [newBicep, setNewBicep] = useState<string>('38');
  const [newNotes, setNewNotes] = useState<string>('');

  // Slider de comparación Antes / Después
  const [sliderPosition, setSliderPosition] = useState(50);

  const latest = measurements[0] || { weightKg: 76.8, heightCm: 178, bodyFatPercentage: 15.2 };
  const initial = measurements[measurements.length - 1] || latest;
  const bmiInfo = calculateBMI(latest.weightKg, latest.heightCm || 178);

  const handleSaveNewMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = Number(newWeight);
    const height = Number(newHeight);
    if (isNaN(weight) || weight <= 0) return;

    const entry: BodyMeasurement = {
      id: 'bm-' + Date.now(),
      measuredAt: new Date().toISOString().split('T')[0],
      weightKg: weight,
      heightCm: isNaN(height) || height <= 0 ? undefined : height,
      bodyFatPercentage: newBodyFat && !isNaN(Number(newBodyFat)) ? Number(newBodyFat) : undefined,
      waistCm: newWaist && !isNaN(Number(newWaist)) ? Number(newWaist) : undefined,
      chestCm: newChest && !isNaN(Number(newChest)) ? Number(newChest) : undefined,
      bicepRightCm: newBicep && !isNaN(Number(newBicep)) ? Number(newBicep) : undefined,
      notes: newNotes.trim() || undefined
    };

    AppStorage.saveMeasurement(entry);
    setMeasurements(AppStorage.getMeasurements());
    setShowAddMeasurement(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Cabecera de Progreso */}
      <div className="bg-white rounded-xl p-6 border border-brand-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-darkBlue flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-blue" />
            Evolución y Progreso
          </h1>
          <p className="text-xs text-brand-textSecondary mt-0.5">
            Seguimiento de composición corporal, marcas personales y fotos privadas
          </p>
        </div>

        {/* Tabs de Navegación Interna */}
        <div className="inline-flex rounded-lg p-1 bg-gray-100 border border-gray-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('body')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'body' ? 'bg-white text-brand-darkBlue shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mi Cuerpo & Medidas
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'records' ? 'bg-white text-brand-darkBlue shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Récords (PRs)
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'photos' ? 'bg-white text-brand-darkBlue shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Comparación Visual
          </button>
        </div>
      </div>

      {/* TAB 1: MI CUERPO Y MEDIDAS */}
      {activeTab === 'body' && (
        <div className="space-y-6 animate-fade-in">
          {/* Métricas Principales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-brand-border shadow-subtle">
              <span className="text-xs font-semibold text-brand-textSecondary">Peso Actual</span>
              <div className="text-2xl font-black text-brand-darkBlue tabular-data mt-1">
                {latest.weightKg} <span className="text-xs font-normal text-gray-500">kg</span>
              </div>
              <div className="text-[11px] text-[#107C41] font-bold mt-1">
                {latest.weightKg <= initial.weightKg ? '↓' : '↑'} {Math.abs(latest.weightKg - initial.weightKg).toFixed(1)} kg desde inicio
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-brand-border shadow-subtle">
              <span className="text-xs font-semibold text-brand-textSecondary">Grasa Corporal</span>
              <div className="text-2xl font-black text-brand-darkBlue tabular-data mt-1">
                {latest.bodyFatPercentage ?? 15.2}%
              </div>
              <div className="text-[11px] text-[#107C41] font-bold mt-1">
                -1.3% cambio estimado
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-brand-border shadow-subtle">
              <span className="text-xs font-semibold text-brand-textSecondary">IMC Informativo</span>
              <div className="text-2xl font-black text-brand-darkBlue tabular-data mt-1">
                {bmiInfo.bmi}
              </div>
              <div className="text-[11px] text-gray-600 font-medium mt-1">
                Rango: <strong className="text-brand-textPrimary">{bmiInfo.classification}</strong>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-brand-border shadow-subtle flex flex-col justify-between">
              <span className="text-xs font-semibold text-brand-textSecondary">Acción</span>
              <button
                onClick={() => setShowAddMeasurement(true)}
                className="w-full py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Medidas</span>
              </button>
            </div>
          </div>

          {/* Historial de Mediciones */}
          <div className="bg-white rounded-xl border border-brand-border p-5 shadow-subtle">
            <h3 className="text-sm font-bold text-brand-textPrimary mb-3">
              Historial Antropométrico
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Peso (kg)</th>
                    <th className="py-2.5 px-3">Grasa %</th>
                    <th className="py-2.5 px-3">Cintura</th>
                    <th className="py-2.5 px-3">Pecho</th>
                    <th className="py-2.5 px-3">Brazo</th>
                    <th className="py-2.5 px-3">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {measurements.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-3 font-semibold text-brand-darkBlue whitespace-nowrap">
                        {m.measuredAt}
                      </td>
                      <td className="py-3 px-3 tabular-data font-bold text-brand-textPrimary">
                        {m.weightKg} kg
                      </td>
                      <td className="py-3 px-3 tabular-data">
                        {m.bodyFatPercentage ? `${m.bodyFatPercentage}%` : '—'}
                      </td>
                      <td className="py-3 px-3 tabular-data">
                        {m.waistCm ? `${m.waistCm} cm` : '—'}
                      </td>
                      <td className="py-3 px-3 tabular-data">
                        {m.chestCm ? `${m.chestCm} cm` : '—'}
                      </td>
                      <td className="py-3 px-3 tabular-data">
                        {m.bicepRightCm ? `${m.bicepRightCm} cm` : '—'}
                      </td>
                      <td className="py-3 px-3 text-gray-500 italic max-w-xs truncate">
                        {m.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RÉCORDS PERSONALES (PRs) */}
      {activeTab === 'records' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white rounded-xl border border-brand-border p-5 shadow-subtle">
            <h3 className="text-sm font-bold text-brand-textPrimary mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Tus Récords Personales Vigentes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prs.map(pr => (
                <div key={pr.id} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#107C41]">
                      {pr.recordType === 'max_weight' ? 'Peso Máximo' : '1RM Estimado'}
                    </div>
                    <div className="text-sm font-bold text-brand-darkBlue mt-0.5">
                      {pr.exerciseName}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      Conseguido el {new Date(pr.achievedAt).toLocaleDateString('es-ES')}
                    </div>
                  </div>

                  <div className="text-2xl font-black text-[#107C41] tabular-data">
                    {pr.recordValue} <span className="text-xs font-normal text-gray-600">kg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FOTOS Y COMPARACIÓN ANTES / DESPUÉS */}
      {activeTab === 'photos' && (
        <div className="bg-white rounded-xl border border-brand-border p-6 shadow-subtle space-y-6 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-brand-textPrimary">
              Comparador Interactivo: Antes vs Ahora
            </h3>
            <p className="text-xs text-brand-textSecondary mt-0.5">
              Arrastra el control deslizante para comparar visualmente la transformación física. Fotos 100% privadas.
            </p>
          </div>

          {/* Slider Interactivo de Comparación */}
          <div className="relative w-full max-w-lg mx-auto h-80 rounded-2xl overflow-hidden shadow-card border border-gray-200 select-none">
            {/* Imagen "DESPUÉS" (Fondo completo) */}
            <div className="absolute inset-0 bg-blue-900 flex flex-col items-center justify-center text-white">
              <div className="text-lg font-black tracking-wider uppercase">Después (Mes Actual)</div>
              <div className="text-xs text-blue-200 mt-1">76.8 kg • 15.2% Grasa</div>
              <div className="w-32 h-44 rounded-xl border-2 border-dashed border-blue-400 mt-3 flex items-center justify-center opacity-60">
                <Camera className="w-8 h-8" />
              </div>
            </div>

            {/* Imagen "ANTES" (Recortada según el slider) */}
            <div 
              className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center text-white border-r-2 border-white"
              style={{ width: `${sliderPosition}%`, overflow: 'hidden' }}
            >
              <div className="w-[500px] flex flex-col items-center justify-center">
                <div className="text-lg font-black tracking-wider uppercase">Antes (Inicio)</div>
                <div className="text-xs text-gray-300 mt-1">78.2 kg • 16.5% Grasa</div>
                <div className="w-32 h-44 rounded-xl border-2 border-dashed border-gray-400 mt-3 flex items-center justify-center opacity-60">
                  <Camera className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Línea divisoria del slider */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-lg"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-7 h-7 rounded-full bg-white text-brand-darkBlue font-bold text-[10px] flex items-center justify-center shadow-md border border-gray-200">
                ⇄
              </div>
            </div>
          </div>

          {/* Control input de rango */}
          <div className="max-w-xs mx-auto">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
            />
          </div>
        </div>
      )}

      {/* Modal Formulario de Registro Corporal */}
      {showAddMeasurement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-modal border border-brand-border">
            <h3 className="text-base font-bold text-brand-darkBlue mb-1">
              Nuevo Registro de Medidas
            </h3>
            <p className="text-xs text-brand-textSecondary mb-4">
              Mantén un registro regular para evaluar masa muscular y pérdida de grasa.
            </p>

            <form onSubmit={handleSaveNewMeasurement} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-brand-textPrimary block mb-1">Peso (kg)*</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-brand-textPrimary block mb-1">Altura (cm)</label>
                  <input
                    type="number"
                    value={newHeight}
                    onChange={(e) => setNewHeight(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-brand-textPrimary block mb-1">Grasa %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newBodyFat}
                    onChange={(e) => setNewBodyFat(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-brand-textPrimary block mb-1">Cintura (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newWaist}
                    onChange={(e) => setNewWaist(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-brand-textPrimary block mb-1">Brazo (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newBicep}
                    onChange={(e) => setNewBicep(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-brand-textPrimary block mb-1">Notas u observaciones</label>
                <input
                  type="text"
                  placeholder="Ej: Pesaje en ayunas tras descanso..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMeasurement(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Guardar Medidas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
