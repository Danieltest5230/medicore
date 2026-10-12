import React from 'react';
import { Calendar, Users, Activity, Pill, User as UserIcon, Shield } from 'lucide-react';
import { NavTab } from './Sidebar';
import { User } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface MobileNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: User | null;
  onOpenProfile: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onOpenProfile,
}) => {
  const { themeConfig } = useTheme();

  const isDoctor = currentUser?.role === 'DOCTOR';

  const navItems = [
    { id: 'agenda' as NavTab, label: 'Agenda', icon: Calendar },
    { id: 'patients' as NavTab, label: 'Pacientes', icon: Users },
    ...(isDoctor
      ? [
          { id: 'clinical' as NavTab, label: 'Consulta', icon: Activity },
          { id: 'documents' as NavTab, label: 'Recetas', icon: Pill },
        ]
      : [{ id: 'audit' as NavTab, label: 'Auditoría', icon: Shield }]),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe transition-colors">
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-cyan-50 dark:bg-slate-800 scale-110 shadow-sm'
                    : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}

        {/* Profile Button */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl text-slate-400 hover:text-slate-700 transition-all"
        >
          <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-cyan-500/70 p-0.5 shadow-sm">
            {currentUser?.avatar || currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar || currentUser.avatar_url}
                alt="Perfil"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 rounded-full">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 text-slate-500 dark:text-slate-400 font-medium">
            Mi Perfil
          </span>
        </button>
      </div>
    </nav>
  );
};
