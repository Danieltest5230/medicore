import React, { useEffect, useState } from 'react';
import { Search, UserPlus, FileText, Phone, Mail, Shield, AlertTriangle, Activity, Stethoscope } from 'lucide-react';
import { Patient } from '../../types';
import { api } from '../../services/api';

interface PatientListViewProps {
  onSelectPatient: (patient: Patient) => void;
  onStartConsultation: (patient: Patient) => void;
}

export const PatientListView: React.FC<PatientListViewProps> = ({ onSelectPatient, onStartConsultation }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New patient form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    document_number: '',
    birth_date: '1985-06-15',
    gender: 'F',
    blood_type: '0+',
    phone: '',
    email: '',
    address: '',
    city: 'Posadas',
    health_insurance_name: 'Particular',
    health_insurance_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const fetchPatients = async (query?: string) => {
    setLoading(true);
    try {
      const data = await api.getPatients(query);
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createPatient(formData as any);
      setShowAddModal(false);
      setSearch('');
      await fetchPatients();
      onSelectPatient(created);
    } catch (err: any) {
      alert(err.response?.data?.document_number?.[0] || 'Error al guardar el paciente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Padrón de Pacientes</h2>
          <p className="text-xs text-slate-500">Búsqueda rápida por DNI, apellido, obra social o teléfono</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por DNI o apellido..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm shadow-sky-600/20 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Paciente</span>
          </button>
        </div>
      </div>

      {/* Patients Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <p className="text-sm">Buscando registros...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          <p className="text-base font-medium text-slate-700">No se encontraron pacientes</p>
          <p className="text-xs text-slate-400 mt-1">Haga clic en "Nuevo Paciente" para dar de alta en el sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((pat) => (
            <div
              key={pat.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {pat.full_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      DNI: <span className="font-semibold text-slate-700">{pat.document_number}</span> · {pat.age} años
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {pat.gender === 'F' ? 'Fem' : pat.gender === 'M' ? 'Masc' : 'Otro'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cobertura:</span>
                    <span className="font-medium text-slate-800">{pat.health_insurance_name}</span>
                  </div>
                  {pat.health_insurance_number && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">N° Carnet:</span>
                      <span className="font-mono text-slate-700">{pat.health_insurance_number}</span>
                    </div>
                  )}
                  {pat.blood_type && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Grupo/Factor:</span>
                      <span className="font-bold text-rose-600">{pat.blood_type}</span>
                    </div>
                  )}
                  {pat.phone && (
                    <div className="flex items-center space-x-1.5 pt-1 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pat.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center space-x-2">
                <button
                  onClick={() => onStartConsultation(pat)}
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-medium rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm shadow-sky-600/10 transition-colors"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Atender / Evolucionar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Alta de Paciente</h3>
            <p className="text-xs text-slate-500 mb-4">Registro filiatorio para consultorio de clínica médica</p>

            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">DNI / Documento</label>
                  <input
                    type="text"
                    required
                    value={formData.document_number}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                    placeholder="Sin puntos"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    required
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Obra Social / Prepaga</label>
                  <input
                    type="text"
                    value={formData.health_insurance_name}
                    onChange={(e) => setFormData({ ...formData, health_insurance_name: e.target.value })}
                    placeholder="OSDE, Swiss Medical, Particular..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">N° Carnet / Afiliado</label>
                  <input
                    type="text"
                    value={formData.health_insurance_number}
                    onChange={(e) => setFormData({ ...formData, health_insurance_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+54 9 ..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-medium text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Registrar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
