import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  UserCheck,
  Plus,
  RefreshCw,
  Stethoscope,
  Users,
  Timer,
  CheckCircle2,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Appointment, Patient } from '../../types';
import { api } from '../../services/api';
import { useTheme } from '../../theme/ThemeContext';

interface AgendaViewProps {
  onStartConsultation: (patient: Patient, appointmentId?: string) => void;
  userRole?: string;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ onStartConsultation, userRole }) => {
  const { themeConfig } = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await api.getAppointments({ date: selectedDate });
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const handleCheckIn = async (appointmentId: string) => {
    try {
      await api.checkInAppointment(appointmentId);
      await fetchAppointments();
    } catch {
      alert('Error al registrar llegada a sala de espera.');
    }
  };

  const handleCallPatient = async (appt: Appointment) => {
    try {
      await api.callPatient(appt.id);
      if (appt.patient_details) {
        onStartConsultation(appt.patient_details, appt.id);
      }
    } catch {
      alert('Error al llamar al paciente a consulta.');
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (statusFilter === 'ALL') return true;
    return appt.status === statusFilter;
  });

  // Calculate statistics
  const countWaiting = appointments.filter((a) => a.status === 'WAITING_ROOM').length;
  const countInConsultation = appointments.filter((a) => a.status === 'IN_CONSULTATION').length;
  const countCompleted = appointments.filter((a) => a.status === 'COMPLETED').length;
  const countTotal = appointments.length;

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'WAITING_ROOM':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 badge-pulse" />
            <span>En Sala de Espera</span>
          </span>
        );
      case 'IN_CONSULTATION':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-300 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span>En Consulta Médica</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Atendido</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            <span>Confirmado</span>
          </span>
        );
      case 'SCHEDULED':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <span>Programado</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Header Card inspired by Integrando Salud */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Agenda & Sala de Espera
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              Clínica Médica
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gestión de turnos de la jornada, recepción en sala y llamado activo a consultorio
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 shadow-xs">
            <CalendarIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={fetchAppointments}
            className="p-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full transition-colors shadow-xs"
            title="Refrescar turnos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row (Integrando Salud style KPI cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
            statusFilter === 'ALL'
              ? 'bg-white dark:bg-slate-900 border-cyan-500 ring-2 ring-cyan-400/40 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Turnos
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{countTotal}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Programados hoy</p>
        </div>

        <div
          onClick={() => setStatusFilter('WAITING_ROOM')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
            statusFilter === 'WAITING_ROOM'
              ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-500 ring-2 ring-amber-400/40 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              En Sala
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 badge-pulse" />
          </div>
          <p className="text-2xl font-bold text-amber-800 dark:text-amber-300 mt-1">{countWaiting}</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">Esperando atención</p>
        </div>

        <div
          onClick={() => setStatusFilter('IN_CONSULTATION')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
            statusFilter === 'IN_CONSULTATION'
              ? 'bg-cyan-50/50 dark:bg-cyan-950/30 border-cyan-500 ring-2 ring-cyan-400/40 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
              En Consulta
            </span>
            <Stethoscope className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-800 dark:text-cyan-300 mt-1">{countInConsultation}</p>
          <p className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-0.5">Atención en curso</p>
        </div>

        <div
          onClick={() => setStatusFilter('COMPLETED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
            statusFilter === 'COMPLETED'
              ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-400/40 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Atendidos
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">{countCompleted}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Firmados y cerrados</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-medium border-b border-slate-200 dark:border-slate-800">
        {[
          { key: 'ALL', label: `Todos (${countTotal})` },
          { key: 'WAITING_ROOM', label: `En Espera (${countWaiting})` },
          { key: 'IN_CONSULTATION', label: `En Consulta (${countInConsultation})` },
          { key: 'COMPLETED', label: `Atendidos (${countCompleted})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              statusFilter === tab.key
                ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointment Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-600" />
          <p className="text-sm">Cargando turnos de la jornada...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">
            No hay turnos para los filtros seleccionados
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Seleccione otra fecha en el calendario o registre un nuevo turno para el paciente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredAppointments.map((appt) => {
            const timeStr = new Date(appt.scheduled_datetime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const patient = appt.patient_details;

            return (
              <div
                key={appt.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-800 flex flex-col items-center justify-center text-cyan-700 dark:text-cyan-300 shrink-0 shadow-xs">
                    <Clock className="w-4 h-4 mb-0.5 text-cyan-600 dark:text-cyan-400" />
                    <span className="text-xs font-bold">{timeStr}</span>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                        {patient ? patient.full_name : 'Paciente'}
                      </h3>
                      {getStatusBadge(appt.status)}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>
                        DNI: <strong className="text-slate-700 dark:text-slate-200">{patient?.document_number || '-'}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Edad: <strong className="text-slate-700 dark:text-slate-200">{patient?.age || '-'} años</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Obra Social: <strong className="text-slate-700 dark:text-slate-200">{patient?.health_insurance_name || 'Particular'}</strong>
                      </span>
                    </p>

                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-3 py-1 rounded-full inline-block border border-slate-100 dark:border-slate-700">
                      Motivo: <span className="font-semibold text-slate-800 dark:text-slate-100">{appt.reason || 'Consulta médica clínica'}</span>
                    </p>
                  </div>
                </div>

                {/* Actions (optimized for touch on mobile devices) */}
                <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-end md:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {appt.status !== 'WAITING_ROOM' &&
                    appt.status !== 'IN_CONSULTATION' &&
                    appt.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleCheckIn(appt.id)}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-full text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                      >
                        <UserCheck className="w-4 h-4 text-amber-600" />
                        <span>Llegó a Sala</span>
                      </button>
                    )}

                  {userRole !== 'RECEPTIONIST' && appt.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleCallPatient(appt)}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 active:scale-[0.98] text-white flex items-center justify-center space-x-2 shadow-md shadow-cyan-600/20 transition-all"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>
                        {appt.status === 'IN_CONSULTATION' ? 'Continuar Consulta' : 'Llamar a Consultorio'}
                      </span>
                    </button>
                  )}

                  {appt.status === 'COMPLETED' && patient && (
                    <button
                      onClick={() => onStartConsultation(patient, appt.id)}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      Ver HCE Firmada
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
