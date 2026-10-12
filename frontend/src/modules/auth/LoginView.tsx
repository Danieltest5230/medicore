import React, { useState } from 'react';
import { Stethoscope, Lock, Mail, ShieldAlert, ArrowRight, ShieldCheck, Sparkles, Server, Settings, Globe, Check, X, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('medico@medicore.ar');
  const [password, setPassword] = useState('AdminPassword123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [currentServerUrl, setCurrentServerUrl] = useState(api.getApiBaseUrl());
  const [customUrlInput, setCustomUrlInput] = useState(api.getApiBaseUrl());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.login({ email, password });
      onLoginSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Credenciales inválidas. Por favor verifique su correo y contraseña.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('AdminPassword123!');
    setError(null);
    setLoading(true);
    try {
      await api.login({ email: quickEmail, password: 'AdminPassword123!' });
      onLoginSuccess();
    } catch {
      setError('Error al iniciar sesión rápida.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071a2f] via-[#0b2b4e] to-[#041224] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative background glow circles inspired by modern medical SaaS */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100/50 animate-fade-in-up relative z-10">
        {/* Integrando Salud style header */}
        <div className="bg-gradient-to-tr from-[#071e3d] via-[#0096c7] to-[#00b4d8] p-7 sm:p-8 text-white text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3.5 border border-white/30 shadow-lg transform hover:scale-105 transition-transform animate-float">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>

          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">MEDICORE</h2>
          </div>
          <p className="text-cyan-100 text-xs sm:text-sm mt-1 font-medium">
            Software Clínico & HCE Integral
          </p>

          <div className="mt-3.5 inline-flex items-center space-x-1.5 bg-white/15 backdrop-blur-sm px-3.5 py-1 rounded-full text-[11px] font-semibold text-cyan-50 border border-white/25">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-200" />
            <span>Exclusivo Medicina Interna · Ley 27.706</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-rose-700 text-xs animate-fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@medicore.ar"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 via-sky-600 to-cyan-600 hover:from-cyan-700 hover:to-sky-700 active:scale-[0.99] text-white font-semibold rounded-full text-sm shadow-md shadow-cyan-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Iniciando sesión...</span>
            ) : (
              <>
                <span>Ingresar al Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-semibold mb-2.5 text-center">
              Acceso Rápido de Demostración:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('medico@medicore.ar')}
                className="p-2.5 text-left border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50 rounded-2xl text-xs transition-all hover:-translate-y-0.5"
              >
                <div className="font-bold text-slate-800">Dr. Daniel Cairel</div>
                <div className="text-[11px] text-cyan-700 font-medium">Médico Clínico</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('dra.piccoli@medicore.ar')}
                className="p-2.5 text-left border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50 rounded-2xl text-xs transition-all hover:-translate-y-0.5"
              >
                <div className="font-bold text-slate-800">Dra. M. Lilia Piccoli</div>
                <div className="text-[11px] text-cyan-700 font-medium">Clínica · MP 05064</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('recepcion@medicore.ar')}
                className="sm:col-span-2 p-2.5 text-left border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 rounded-2xl text-xs transition-all hover:-translate-y-0.5"
              >
                <div className="font-bold text-slate-800">Laura Gómez</div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  Recepción & Admisión de Turnos
                </div>
              </button>
            </div>
          </div>
        </form>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Consultorio médico · Arg</span>
          <button
            type="button"
            onClick={() => {
              setCustomUrlInput(api.getApiBaseUrl());
              setShowServerModal(true);
            }}
            className="inline-flex items-center space-x-1.5 text-cyan-700 hover:text-cyan-900 font-semibold hover:underline"
          >
            <Server className="w-3.5 h-3.5 text-cyan-600" />
            <span>Servidor: {currentServerUrl === '/api' ? 'Local / Nube Auto' : currentServerUrl.replace(/^https?:\/\//, '')}</span>
          </button>
        </div>
      </div>

      {/* Server URL Config Modal for Mobile APK / Remote Deployment */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-zoom-in">
            <div className="bg-gradient-to-r from-slate-900 to-cyan-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Conexión de Servidor API</h3>
                  <p className="text-xs text-slate-400">Configuración para App Móvil APK y Nube</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowServerModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Si utiliza la <strong>APK en su teléfono celular</strong>, especifique la URL del servidor backend donde MEDICORE está alojado (ej. su dominio en la nube o IP de su red local).
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  URL Base del Backend API
                </label>
                <input
                  type="text"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://su-servidor.com/api o /api"
                  className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Opciones rápidas:</span>
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setCustomUrlInput('/api')}
                    className="p-2 text-left border rounded-xl hover:bg-slate-50 border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">Local / Nube Automático</span>
                      <p className="text-[10px] text-slate-500">Usa ruta relativa (/api) - Ideal para navegador web</p>
                    </div>
                    {customUrlInput === '/api' && <Check className="w-4 h-4 text-cyan-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomUrlInput('http://192.168.1.100:8000/api')}
                    className="p-2 text-left border rounded-xl hover:bg-slate-50 border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">Wi-Fi Local (PC del consultorio)</span>
                      <p className="text-[10px] text-slate-500">http://192.168.1.100:8000/api</p>
                    </div>
                    {customUrlInput.includes('192.168.') && <Check className="w-4 h-4 text-cyan-600" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    api.setApiBaseUrl('/api');
                    setCurrentServerUrl('/api');
                    setShowServerModal(false);
                  }}
                  className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowServerModal(false)}
                    className="px-3.5 py-1.5 text-xs border border-slate-300 text-slate-600 rounded-full hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      api.setApiBaseUrl(customUrlInput);
                      setCurrentServerUrl(api.getApiBaseUrl());
                      setShowServerModal(false);
                    }}
                    className="px-4 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-full shadow-sm"
                  >
                    Guardar y Conectar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
