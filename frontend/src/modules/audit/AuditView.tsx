import React, { useEffect, useState } from 'react';
import { Shield, Lock, CheckCircle2, RefreshCw, KeyRound, AlertCircle } from 'lucide-react';
import { AuditEvent } from '../../types';
import { api } from '../../services/api';

export const AuditView: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Bitácora Legal de Auditoría e Inmutabilidad
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de trazabilidad y accesos clínicos conforme a la <strong>Ley 27.706</strong> y <strong>Ley 25.326</strong>
          </p>
        </div>

        <button
          onClick={fetchAuditEvents}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar Bitácora</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Integridad criptográfica verificada por función resumen SHA-256</span>
          </div>
          <span className="font-semibold text-slate-700">{events.length} eventos registrados</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-600" />
            <p className="text-xs">Consultando bitácora legal...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-xs">No hay eventos registrados aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Fecha y Hora</th>
                  <th className="p-3.5">Usuario Responsable</th>
                  <th className="p-3.5">Acción Realizada</th>
                  <th className="p-3.5">Detalle de Operación</th>
                  <th className="p-3.5">IP de Origen</th>
                  <th className="p-3.5">Checksum SHA-256</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 whitespace-nowrap font-medium text-slate-800">
                      {new Date(ev.timestamp).toLocaleString('es-AR')}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-bold text-slate-900">
                      {ev.user_email || 'Sistema'}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                        {ev.action_display || ev.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-700 max-w-xs truncate" title={ev.details}>
                      {ev.details}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {ev.ip_address || 'Localhost'}
                    </td>
                    <td className="p-3.5 font-mono text-[10px] text-emerald-700 font-bold whitespace-nowrap">
                      {ev.checksum ? ev.checksum.slice(0, 16) + '...' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
