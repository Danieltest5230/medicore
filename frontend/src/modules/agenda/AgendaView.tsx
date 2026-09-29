import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, UserCheck, AlertCircle, Plus, Search, RefreshCw, Stethoscope } from 'lucide-react';
import { Appointment, Patient } from '../../types';
import { api } from '../../services/api';

interface AgendaViewProps {
  onStartConsultation: (patient: Patient, appointmentId?: string) => void;
  userRole?: string;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ onStartConsultation, userRole }) => {
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
    } catch (err) {
      alert('Error al registrar llegada a sala de espera.');
    }
  };

  const handleCallPatient = async (appt: Appointment) => {
    try {
      await api.callPatient(appt.id);
      if (appt.patient_details) {
        onStartConsultation(appt.patient_details, appt.id);
      }
    } catch (err) {
      alert('Error al llamar al paciente a consulta.');
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (statusFilter === 'ALL') return true;
    return appt.status === statusFilter;
  });

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'WAITING_ROOM':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 badge-pulse" />
            <span>En Sala de Espera</span>
          </span>
        );
      case 'IN_CONSULTATION':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>En Consulta Médica</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Atendido</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <span>Confirmado</span>
          </span>
        );
      case 'SCHEDULED':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <span>Programado</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Agenda del Consultorio y Sala de Espera</h2>
          <p className="text-xs text-slate-500">Gestión de citas programadas, recepción de pacientes y pase a consulta</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
            <CalendarIcon className="w-4 h-4 text-sky-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-medium focus:outline-none"
            />
          </div>

          <button
            onClick={fetchAppointments}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
            title="Refrescar agenda"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center space-x-2 text-xs font-medium border-b border-slate-200 pb-3">
        {[
          { key: 'ALL', label: 'Todos los turnos' },
          { key: 'WAITING_ROOM', label: 'En Espera (Check-in)' },
          { key: 'IN_CONSULTATION', label: 'En Consulta' },
          { key: 'COMPLETED', label: 'Atendidos' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              statusFilter === tab.key
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointment Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-sky-600" />
          <p className="text-sm">Cargando turnos de la jornada...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-medium text-slate-700">No hay turnos para los filtros seleccionados</p>
          <p className="text-xs text-slate-400 mt-1">Seleccione otra fecha o registre un nuevo turno para el paciente.</p>
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
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex flex-col items-center justify-center text-sky-700 shrink-0">
                    <Clock className="w-4 h-4 mb-0.5 text-sky-600" />
                    <span className="text-xs font-bold">{timeStr}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {patient ? patient.full_name : 'Paciente'}
                      </h3>
                      {getStatusBadge(appt.status)}
                    </div>

                    <p className="text-xs text-slate-500 flex items-center space-x-2">
                      <span>DNI: <strong className="text-slate-700">{patient?.document_number || '-'}</strong></span>
                      <span>·</span>
                      <span>Edad: <strong className="text-slate-700">{patient?.age || '-'} años</strong></span>
                      <span>·</span>
                      <span>Cobertura: <strong className="text-slate-700">{patient?.health_insurance_name || 'Particular'}</strong></span>
                    </p>

                    <p className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md inline-block border border-slate-100">
                      Motivo: <span className="font-medium text-slate-800">{appt.reason || 'Consulta médica'}</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2.5 self-end md:self-center shrink-0">
                  {appt.status !== 'WAITING_ROOM' && appt.status !== 'IN_CONSULTATION' && appt.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleCheckIn(appt.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1.5 transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      <span>Check-in (Llegó)</span>
                    </button>
                  )}

                  {userRole !== 'RECEPTIONIST' && appt.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleCallPatient(appt)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white flex items-center space-x-1.5 shadow-sm shadow-sky-600/20 transition-all"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>{appt.status === 'IN_CONSULTATION' ? 'Continuar Consulta' : 'Llamar a Consulta'}</span>
                    </button>
                  )}

                  {appt.status === 'COMPLETED' && patient && (
                    <button
                      onClick={() => onStartConsultation(patient, appt.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                    >
                      Ver Consulta Firmada
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
