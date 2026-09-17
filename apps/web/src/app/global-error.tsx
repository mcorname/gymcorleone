'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[CRITICAL GLOBAL ERROR]:', error);
  }, [error]);

  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f8fafc', color: '#0F172A' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ maxWidth: '420px', width: '100%', background: '#fff', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px', color: '#0F172A' }}>GYM PROGRESS</h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
              Ha ocurrido un problema crítico en la aplicación. Puedes reiniciar el estado para continuar.
            </p>
            <button
              onClick={() => reset()}
              style={{ width: '100%', background: '#D83B01', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}
            >
              Reiniciar Aplicación
            </button>
            <button
              onClick={() => { localStorage.clear(); window.location.href = '/'; }}
              style={{ width: '100%', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '12px', cursor: 'pointer' }}
            >
              Limpiar Almacenamiento Local
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
