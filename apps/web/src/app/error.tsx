'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Registro defensivo del error en consola
    console.error('[GYM PROGRESS ERROR BOUNDARY]:', error);
  }, [error]);

  const handleClearSession = () => {
    try {
      localStorage.removeItem('gym_workout_active_session');
      window.location.href = '/';
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center space-y-5">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-xl font-black text-brand-darkBlue tracking-tight">
            Algo no salió como esperábamos
          </h1>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            Se produjo un error inesperado al procesar los datos de tu sesión. No te preocupes, tus récords e historial están a salvo.
          </p>
        </div>

        {error?.message && (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-left">
            <p className="text-[11px] font-mono text-gray-600 break-words line-clamp-3">
              {error.message}
            </p>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar operación
          </button>

          <button
            onClick={handleClearSession}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            Restablecer sesión en curso y volver al inicio
          </button>

          <button
            onClick={() => { window.location.href = '/'; }}
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 font-medium py-2 text-xs transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            Ir a la pantalla principal
          </button>
        </div>
      </div>
    </div>
  );
}
