import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GYM PROGRESS — Tu Asistente Inteligente de Entrenamiento',
  description: 'Aplicación profesional de gimnasio: registro rápido en segundos, sobrecarga progresiva, análisis anatómico, 1,300+ ejercicios e IA para escaneo y biomecánica de máquinas.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#2563EB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>" />
      </head>
      <body className="min-h-screen bg-brand-bg text-brand-textPrimary font-sans antialiased selection:bg-blue-100 selection:text-brand-darkBlue">
        {children}
      </body>
    </html>
  );
}
