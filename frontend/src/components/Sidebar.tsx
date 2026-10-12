import React from 'react';
import { Calendar, Users, Activity, Pill, Shield, Sparkles, ChevronRight } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

export type NavTab = 'agenda' | 'patients' | 'clinical' | 'documents' | 'audit';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userRole?: string;
  onOpenProfile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  onOpenProfile,
}) => {
  const { themeConfig } = useTheme();

  const navItems: {
    id: NavTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    doctorOnly?: boolean;
  }[] = [
    {
      id: 'agenda',
      label: 'Agenda & Sala',
      description: 'Turnos y sala de espera',
      icon: Calendar,
    },
    {
      id: 'patients',
      label: 'Padrón Pacientes',
      description: 'Historias y empadronamiento',
      icon: Users,
    },
    {
      id: 'clinical',
      label: 'Consulta Activa',
      description: 'Examen clínico y evolución',
      icon: Activity,
      doctorOnly: true,
    },
    {
      id: 'documents',
      label: 'Recetas & Órdenes',
      description: 'Prescripción y estudios',
      icon: Pill,
      doctorOnly: true,
    },
    {
      id: 'audit',
      label: 'Auditoría Legal',
      description: 'Registro inmutable Ley 27.706',
      icon: Shield,
    },
  ];

  return (
    <aside
      className={`hidden md:flex w-64 lg:w-72 ${themeConfig.colors.sidebarBg} ${themeConfig.colors.sidebarText} flex-col shrink-0 min-h-[calc(100vh-61px)] transition-colors border-r border-slate-800/60`}
    >
      <div className="p-4 lg:p-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
            Módulos Médicos
          </p>
          <p className="text-xs text-slate-400">Atención Ambulatoria</p>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Sistema Online" />
      </div>

      <nav className="p-3 space-y-1.5 flex-1">
        {navItems.map((item) => {
          if (item.doctorOnly && userRole === 'RECEPTIONIST') return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left text-sm font-medium transition-all group ${
                isActive
                  ? themeConfig.colors.sidebarActive
                  : `${themeConfig.colors.sidebarHover} text-slate-300`
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                <div className="truncate">
                  <span className="block leading-tight text-xs font-semibold">{item.label}</span>
                  <span
                    className={`block text-[10px] truncate ${
                      isActive ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </span>
                </div>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                  isActive ? 'text-white translate-x-0.5' : 'text-slate-500 opacity-0 group-hover:opacity-100'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* Theme & Profile quick bar in sidebar */}
      <div className="p-3 border-t border-white/10 bg-black/20">
        <button
          onClick={onOpenProfile}
          className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs text-slate-300 transition-colors group"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
            <div className="text-left">
              <span className="block font-medium text-[11px] text-white">Estilo de Sesión</span>
              <span className="block text-[10px] text-slate-400">{themeConfig.shortName}</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            Cambiar
          </span>
        </button>
      </div>

      <div className="p-4 border-t border-white/10 bg-black/40 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-300">MEDICORE · v1.2</p>
          <span className="text-[10px] text-cyan-400 font-mono">AR-27706</span>
        </div>
        <p className="text-[10px]">Clínica Médica Exclusiva</p>
        <p className="text-[10px] text-slate-400">Misiones, República Argentina</p>
      </div>
    </aside>
  );
};
