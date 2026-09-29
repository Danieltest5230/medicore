import React from 'react';
import { Calendar, Users, FileText, Pill, Shield, Activity } from 'lucide-react';

export type NavTab = 'agenda' | 'patients' | 'clinical' | 'documents' | 'audit';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, userRole }) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; doctorOnly?: boolean }[] = [
    { id: 'agenda', label: 'Agenda & Sala de Espera', icon: Calendar },
    { id: 'patients', label: 'Padrón de Pacientes', icon: Users },
    { id: 'clinical', label: 'Consulta Médica', icon: Activity, doctorOnly: true },
    { id: 'documents', label: 'Recetas y Órdenes', icon: Pill, doctorOnly: true },
    { id: 'audit', label: 'Auditoría Legal (Ley 27.706)', icon: Shield },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-61px)]">
      <div className="p-4 border-b border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Módulos Asistenciales</p>
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
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-500 space-y-1">
        <p className="font-medium text-slate-400">MEDICORE v1.0</p>
        <p>Especialidad: Clínica Médica</p>
        <p className="text-[11px] text-slate-500">Misiones / Argentina</p>
      </div>
    </aside>
  );
};
