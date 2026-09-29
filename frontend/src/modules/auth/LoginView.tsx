import React, { useState } from 'react';
import { Stethoscope, Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('medico@medicore.ar');
  const [password, setPassword] = useState('AdminPassword123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.login({ email, password });
      onLoginSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Credenciales inválidas. Por favor verifique su correo y contraseña.');
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
    } catch (err: any) {
      setError('Error al iniciar sesión rápida.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-br from-sky-600 to-cyan-600 p-8 text-white text-center relative">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">MEDICORE</h2>
          <p className="text-sky-100 text-sm mt-1">Plataforma de Consultorio de Clínica Médica</p>
          <div className="mt-3 inline-block bg-white/10 px-3 py-1 rounded-full text-xs font-medium border border-white/20">
            Cumplimiento Ley 27.706 & 26.529
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-medium rounded-xl text-sm shadow-md shadow-sky-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>Ingresar al Sistema Clínico</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 font-medium mb-2.5 text-center">Acceso Rápido de Prueba (Demo):</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('medico@medicore.ar')}
                className="p-2.5 text-left border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 rounded-xl text-xs transition-colors"
              >
                <div className="font-semibold text-slate-800">Dr. Daniel Cairel</div>
                <div className="text-[11px] text-sky-600">Médico Clínico</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('recepcion@medicore.ar')}
                className="p-2.5 text-left border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 rounded-xl text-xs transition-colors"
              >
                <div className="font-semibold text-slate-800">Laura Gómez</div>
                <div className="text-[11px] text-emerald-600">Recepción / Turnos</div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
