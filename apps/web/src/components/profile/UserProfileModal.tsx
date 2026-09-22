'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  Scale, 
  Ruler, 
  Percent, 
  Activity, 
  Target, 
  Calendar, 
  LogOut, 
  Save, 
  CheckCircle2, 
  Clock, 
  TrendingUp 
} from 'lucide-react';
import type { User, BodyMeasurement } from '@gym/types';
import { AppStorage } from '../../lib/storage';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUserUpdated: (updatedUser: User) => void;
  onLogout: () => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  onLogout
}: UserProfileModalProps) {
  const [name, setName] = useState(currentUser.name);
  const [height, setHeight] = useState<number | ''>(currentUser.heightCm || '');
  const [weight, setWeight] = useState<number | ''>(currentUser.weightKg || '');
  const [bodyFat, setBodyFat] = useState<number | ''>(currentUser.bodyFatPercentage || '');
  const [experienceLevel, setExperienceLevel] = useState(currentUser.level || 'Intermedio');
  const [goal, setGoal] = useState(currentUser.targetGoal || 'Hipertrofia');

  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setHeight(currentUser.heightCm || '');
      setWeight(currentUser.weightKg || '');
      setBodyFat(currentUser.bodyFatPercentage || '');
      setExperienceLevel(currentUser.level || 'Intermedio');
      setGoal(currentUser.targetGoal || 'Hipertrofia');
      setSaveSuccess(false);

      // Cargar historial de medidas del usuario
      const history = AppStorage.getMeasurements();
      setMeasurements(history);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updatedUser = AppStorage.updateUserProfile(currentUser.id, {
        name: name.trim() || currentUser.name,
        heightCm: height ? Number(height) : undefined,
        weightKg: weight ? Number(weight) : undefined,
        bodyFatPercentage: bodyFat ? Number(bodyFat) : undefined,
        level: experienceLevel,
        targetGoal: goal
      });

      if (updatedUser) {
        onUserUpdated(updatedUser);
        setMeasurements(AppStorage.getMeasurements());
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutClick = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      AppStorage.logout();
      onLogout();
      onClose();
    }
  };

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con Banner de Perfil */}
        <div className="bg-gradient-to-r from-brand-darkBlue to-brand-blue text-white p-5 rounded-t-2xl relative">
          <button
            onClick={onClose}
            aria-label="Cerrar perfil"
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-brand-blue flex items-center justify-center font-black text-xl shadow-lg border-2 border-blue-200">
              {getInitials(name || currentUser.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold">{currentUser.name}</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Acceso Activo</span>
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 opacity-80" />
                <span>{currentUser.email}</span>
              </p>
              <div className="text-[11px] text-blue-200 mt-1 flex items-center gap-2">
                <span>Miembro desde: {new Date(currentUser.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido del Formulario */}
        <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-6 flex-1">
          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>¡Perfil y nueva medición guardados correctamente!</span>
            </div>
          )}

          {/* Información Personal y Objetivos */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-brand-blue" />
              <span>Datos Personales & Metas</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nivel de Experiencia
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue bg-white"
                >
                  <option value="Principiante">Principiante (&lt; 1 año)</option>
                  <option value="Intermedio">Intermedio (1-3 años)</option>
                  <option value="Avanzado">Avanzado (3-5 años)</option>
                  <option value="Atleta">Atleta / Competidor</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Objetivo Principal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue bg-white"
                >
                  <option value="Hipertrofia">Hipertrofia (Ganancia Muscular)</option>
                  <option value="Fuerza">Fuerza Máxima (Powerlifting / Básicos)</option>
                  <option value="Pérdida de Grasa">Definición / Pérdida de Grasa</option>
                  <option value="Resistencia">Resistencia & Acondicionamiento</option>
                  <option value="Salud General">Salud & Longevidad</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medidas Corporales Actuales */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Scale className="w-4 h-4 text-brand-blue" />
                <span>Medidas Corporales Actuales</span>
              </h3>
              <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                Se registra en tu historial
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <Ruler className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Altura</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    min="100"
                    max="250"
                    placeholder="175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-md px-2 py-1 text-sm font-bold text-gray-800 outline-none focus:border-brand-blue"
                  />
                  <span className="text-xs text-gray-500 font-semibold">cm</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-1.5 text-xs text-blue-700 mb-1">
                  <Scale className="w-3.5 h-3.5 text-brand-blue" />
                  <span className="font-semibold">Peso Actual</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    placeholder="78.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border border-blue-200 rounded-md px-2 py-1 text-sm font-bold text-brand-blue outline-none focus:border-brand-blue"
                  />
                  <span className="text-xs text-blue-700 font-semibold">kg</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <Percent className="w-3.5 h-3.5 text-brand-blue" />
                  <span>% Grasa</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="3"
                    max="60"
                    placeholder="15.0"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-md px-2 py-1 text-sm font-bold text-gray-800 outline-none focus:border-brand-blue"
                  />
                  <span className="text-xs text-gray-500 font-semibold">%</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-2">
              * Al modificar tu peso o porcentaje de grasa, se crea una nueva entrada en tu historial sin sobreescribir las anteriores.
            </p>
          </div>

          {/* Historial de Mediciones Guardadas */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Historial de Peso Registrado ({measurements.length})</span>
            </h3>

            {measurements.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500 border border-dashed border-gray-200">
                No hay mediciones registradas aún. Al guardar tu peso se creará tu primera medición histórica.
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                {measurements.slice().reverse().map((m, idx) => (
                  <div key={m.id || idx} className="p-2.5 px-3 flex items-center justify-between text-xs hover:bg-gray-50">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{new Date(m.measuredAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-brand-darkBlue">{m.weightKg} kg</span>
                      {m.bodyFatPercentage ? (
                        <span className="text-gray-500 font-medium">{m.bodyFatPercentage}% grasa</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleLogoutClick}
              className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-blue-600 disabled:opacity-50 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
