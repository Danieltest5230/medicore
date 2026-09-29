import React from 'react';
import { ShieldCheck, Stethoscope, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-100">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">MEDICORE</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
              Clínica Médica
            </span>
          </div>
          <p className="text-xs text-slate-500">Sistema Clínico e Historia Electrónica (Ley 27.706)</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Firma Digital & Auditoría Inmutable Habilitada</span>
        </div>

        {currentUser && (
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{currentUser.full_name}</p>
              <p className="text-xs text-slate-500">
                {currentUser.role === 'DOCTOR' ? (
                  <>
                    Dr. Clínico · {currentUser.professional_profile?.provincial_license || 'MP-6842'}
                  </>
                ) : (
                  currentUser.role
                )}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600">
              <UserIcon className="w-5 h-5" />
            </div>
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
