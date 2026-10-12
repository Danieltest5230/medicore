import React from 'react';
import { ShieldCheck, Stethoscope, LogOut, User as UserIcon, Sparkles, Palette, Settings } from 'lucide-react';
import { User } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onOpenProfile }) => {
  const { theme, themeConfig } = useTheme();

  const userPhoto = currentUser?.avatar || currentUser?.avatar_url;

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm transition-colors">
      {/* Brand Identity inspired by Integrando Salud */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 transform hover:scale-105 transition-transform cursor-pointer">
          <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>MEDICORE</span>
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800">
              Clínica Médica
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            Software Clínico & HCE Integral · Conforme Ley 27.706 & 26.529
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Legal & Security Status Tag */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">Firma SHA-256 & Auditoría Legal Activa</span>
        </div>

        {/* Theme Switcher Quick Trigger */}
        <button
          onClick={onOpenProfile}
          title={`Tema activo: ${themeConfig.name}. Clic para cambiar estilo visual.`}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all hover:shadow-xs group"
        >
          <Palette className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline font-medium text-slate-600 dark:text-slate-300">
            {themeConfig.shortName}
          </span>
          <div className="flex -space-x-1">
            {themeConfig.colors.dotPreview.slice(0, 2).map((hex, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-white dark:border-slate-800"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </button>

        {/* User Card & Profile Trigger */}
        {currentUser && (
          <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={onOpenProfile}
              className="flex items-center space-x-2.5 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
              title="Ver y editar perfil, foto o estilo"
            >
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-cyan-500/80 group-hover:border-cyan-600 shadow-sm flex items-center justify-center text-slate-600 transition-colors">
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt={currentUser.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 text-cyan-700 dark:text-cyan-400" />
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>

              <div className="hidden md:block text-left">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors leading-tight">
                  {currentUser.full_name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {currentUser.role === 'DOCTOR' ? (
                    <>
                      Clínica Médica · {currentUser.professional_profile?.provincial_license || 'MP Activa'}
                    </>
                  ) : (
                    currentUser.role
                  )}
                </p>
              </div>
            </button>

            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
