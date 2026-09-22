'use client';

import React, { useState } from 'react';
import { Dumbbell, Lock, Mail, User as UserIcon, KeyRound, AlertCircle, CheckCircle2, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import type { User } from '@gym/types';
import { AppStorage } from '../../lib/storage';

interface AuthViewProps {
  initialMode?: 'login' | 'register' | 'activate';
  currentUser?: User | null;
  onAuthSuccess: (user: User) => void;
  onActivationSuccess: (user: User) => void;
  onLogout?: () => void;
}

export function AuthView({
  initialMode = 'login',
  currentUser,
  onAuthSuccess,
  onActivationSuccess,
  onLogout
}: AuthViewProps) {
  const [tab, setTab] = useState<'login' | 'register'>(
    initialMode === 'register' ? 'register' : 'login'
  );
  const [activeUser, setActiveUser] = useState<User | null>(currentUser || null);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [accessCodeInput, setAccessCodeInput] = useState('');

  // UI status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isActivationMode = activeUser && activeUser.status === 'PENDING_ACCESS';

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const res = await AppStorage.loginUser(loginEmail.trim(), loginPassword);
      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Credenciales no válidas.');
        setLoading(false);
        return;
      }

      setActiveUser(res.user);
      if (res.user.status === 'ACTIVE') {
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await AppStorage.registerUser(regName.trim(), regEmail.trim(), regPassword);
      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Error al registrar la cuenta.');
        setLoading(false);
        return;
      }

      // Registration successful -> User starts in PENDING_ACCESS
      setActiveUser(res.user);
      setSuccessMessage('¡Cuenta creada con éxito! Ingresa tu código de acceso para continuar.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Code Activation
  const handleActivationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!activeUser) {
      setErrorMessage('Sesión no encontrada. Por favor inicia sesión nuevamente.');
      return;
    }

    if (!accessCodeInput.trim()) {
      setErrorMessage('Por favor ingresa tu código de acceso.');
      return;
    }

    setLoading(true);
    try {
      const res = await AppStorage.activateAccessCode(activeUser.id, accessCodeInput.trim());
      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Código de acceso no válido.');
        setLoading(false);
        return;
      }

      setActiveUser(res.user);
      setSuccessMessage('¡Código verificado exitosamente! Bienvenido a GYM PROGRESS.');
      setTimeout(() => {
        onActivationSuccess(res.user!);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Código de acceso no válido.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout / Switch account
  const handleLogoutAction = () => {
    AppStorage.logout();
    setActiveUser(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setTab('login');
    if (onLogout) onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900 to-black pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-blue text-white shadow-xl shadow-blue-500/20 mb-3 transform transition-transform hover:scale-105">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            GYM PROGRESS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Entrenamiento Inteligente & Seguimiento de Fuerza
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          {/* ACTIVATION SCREEN (PENDING ACCESS) */}
          {isActivationMode ? (
            <div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-6 text-blue-400 text-xs">
                <ShieldCheck className="w-5 h-5 text-brand-blue shrink-0" />
                <div>
                  <span className="font-bold block text-white text-sm">Acceso Exclusivo Requerido</span>
                  Hola <strong className="text-blue-300">{activeUser.name}</strong>, tu cuenta está casi lista. Ingresa tu código de invitación para activar tu acceso.
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4 text-red-400 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleActivationSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Código de Invitación / Acceso
                  </label>
                  <div className="relative">
                    <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="GYM-XXXX-XXXX"
                      value={accessCodeInput}
                      onChange={(e) => setAccessCodeInput(e.target.value.toUpperCase())}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-600 rounded-xl text-white font-mono text-center text-base tracking-widest outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/40 transition-all uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-500"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Ingresa el código proporcionado para desbloquear la Biblioteca, Rutinas y Entrenamientos.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-brand-blue hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <span>Validando código...</span>
                  ) : (
                    <>
                      <span>Activar mi cuenta</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">{activeUser.email}</span>
                <button
                  onClick={handleLogoutAction}
                  className="text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Usar otra cuenta</span>
                </button>
              </div>
            </div>
          ) : (
            /* LOGIN / REGISTER TABS */
            <div>
              <div className="grid grid-cols-2 gap-1 bg-slate-900/60 p-1 rounded-xl mb-6 border border-slate-700/40">
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrorMessage(null); setSuccessMessage(null); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    tab === 'login'
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrorMessage(null); setSuccessMessage(null); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    tab === 'register'
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {tab === 'login' ? (
                /* FORM LOGIN */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="tu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-600 rounded-xl text-white text-xs outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-600 rounded-xl text-white text-xs outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 mt-2 bg-brand-blue hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    {loading ? 'Iniciando sesión...' : 'Entrar a GYM PROGRESS'}
                  </button>
                </form>
              ) : (
                /* FORM REGISTER (SIN MEDIDAS CORPORALES) */
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tu nombre y apellido"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-600 rounded-xl text-white text-xs outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="tu@email.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-600 rounded-xl text-white text-xs outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Contraseña (mínimo 6 caracteres)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-600 rounded-xl text-white text-xs outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-600 rounded-xl text-white text-xs outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                        required
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 pt-1">
                    * Al registrarte se te solicitará un código de invitación de acceso.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 mt-2 bg-brand-blue hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta y Continuar'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-slate-500">
          GYM PROGRESS • Sistema de Entrenamiento Privado
        </div>
      </div>
    </div>
  );
}
