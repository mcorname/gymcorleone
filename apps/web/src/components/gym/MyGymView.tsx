'use client';

import React, { useState } from 'react';
import { 
  Building2,
  Scan,
  Check,
  Plus, 
  ShieldCheck, 
  Sparkles, 
  Dumbbell, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import type { Gym, GymEquipmentItem, Machine } from '@gym/types';
import { CANONICAL_MACHINES } from '@gym/ai';
import { getLocalizedTaxonomy } from '@gym/i18n';
import { AppStorage } from '../../lib/storage';

interface MyGymViewProps {
  onNavigateToScanner: () => void;
}

export function MyGymView({ onNavigateToScanner }: MyGymViewProps) {
  const [gym, setGym] = useState<Gym>(() => AppStorage.getMyGym());
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterOnlyAvailable, setFilterOnlyAvailable] = useState(true);

  // Toggle estado disponible de una máquina
  const handleToggleAvailable = (equipmentId: string) => {
    const updated = { ...gym };
    const item = updated.equipment.find(e => e.id === equipmentId);
    if (item) {
      item.isAvailable = !item.isAvailable;
      setGym(updated);
      AppStorage.saveGymEquipment(item);
    }
  };

  // Agregar máquina desde el catálogo canónico
  const handleAddCanonicalMachine = (machine: Machine) => {
    const newItem: GymEquipmentItem = {
      id: 'eq-' + Date.now(),
      gymId: gym.id,
      machineId: machine.id,
      customLabel: machine.canonicalName,
      equipmentType: machine.datasetEquipmentTag,
      identifiedViaAi: false,
      isAvailable: true,
      machine
    };

    const updated = { ...gym, equipment: [newItem, ...gym.equipment] };
    setGym(updated);
    AppStorage.saveGymEquipment(newItem);
    setShowAddModal(false);
  };

  const displayedEquipment = filterOnlyAvailable 
    ? gym.equipment.filter(e => e.isAvailable) 
    : gym.equipment;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Cabecera de Mi Gimnasio */}
      <div className="bg-white rounded-xl p-6 border border-brand-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-brand-darkBlue">{gym.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#107C41]">
                Activo
              </span>
            </div>
            <p className="text-xs text-brand-textSecondary mt-0.5">
              {gym.equipment.length} equipamientos inventariados en esta sede
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToScanner}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-brand-purple text-xs font-bold border border-purple-200 transition-colors"
          >
            <Scan className="w-4 h-4" />
            <span>Escanear y Añadir (IA)</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Manual</span>
          </button>
        </div>
      </div>

      {/* Regla inteligente informativa */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-brand-darkBlue flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Filtro Inteligente de Equipamiento Activado:</strong>
          <p className="text-gray-600 mt-0.5">
            Cuando generes o consultes rutinas, la aplicación priorizará automáticamente únicamente los ejercicios que tienen máquinas disponibles en <strong>{gym.name}</strong>, evitando sugerirte ejercicios con máquinas que tu gimnasio no tiene.
          </p>
        </div>
      </div>

      {/* Inventario de Equipamiento */}
      <div className="bg-white rounded-xl border border-brand-border p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-brand-textPrimary">
            Equipamiento Registrado
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilterOnlyAvailable(!filterOnlyAvailable)}
              className={`px-3 py-1 rounded-md border text-xs font-medium transition-colors ${
                filterOnlyAvailable ? 'bg-blue-50 border-brand-blue text-brand-blue font-bold' : 'border-gray-200 text-gray-600'
              }`}
            >
              Solo Disponibles ({gym.equipment.filter(e => e.isAvailable).length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayedEquipment.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.isAvailable 
                  ? 'border-gray-200 bg-white hover:border-brand-blue shadow-xs' 
                  : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                    item.identifiedViaAi ? 'bg-purple-100 text-brand-purple' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {item.identifiedViaAi ? <Sparkles className="w-4 h-4" /> : <Dumbbell className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-textPrimary">
                      {item.customLabel}
                    </h4>
                    <div className="text-[11px] text-brand-textSecondary mt-0.5 capitalize">
                      Tipo: {getLocalizedTaxonomy('equipments', item.equipmentType, 'es')}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleAvailable(item.id)}
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                    item.isAvailable ? 'bg-[#107C41] text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                  title={item.isAvailable ? 'Disponible (clic para marcar como averiada/no disponible)' : 'No disponible'}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

              {item.identifiedViaAi && (
                <div className="mt-2 text-[10px] text-brand-purple font-semibold flex items-center gap-1">
                  <span>✓ Verificado por Reconocimiento Vision AI</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal para Añadir Máquina Manual */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-5 shadow-modal max-h-[80vh] flex flex-col">
            <h3 className="text-sm font-bold text-brand-textPrimary pb-3 border-b border-gray-100">
              Seleccionar Máquina del Catálogo Canónico
            </h3>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 my-3 pr-1">
              {CANONICAL_MACHINES.map(m => (
                <div
                  key={m.id}
                  onClick={() => handleAddCanonicalMachine(m)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-blue-50/60 rounded-lg cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-brand-textPrimary">{m.canonicalName}</div>
                    <div className="text-[11px] text-brand-textSecondary mt-0.5">
                      {m.primaryMuscleGroup} • {m.category}
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-brand-blue bg-blue-50 px-2.5 py-1 rounded-md">
                    + Añadir
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAddModal(false)}
              className="w-full py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
