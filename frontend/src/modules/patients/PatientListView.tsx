import React, { useEffect, useState } from 'react';
import {
  Search,
  UserPlus,
  Phone,
  Mail,
  Shield,
  Stethoscope,
  Edit3,
  X,
  Save,
  UserCheck,
  AlertCircle,
  MapPin,
  Heart
} from 'lucide-react';
import { Patient } from '../../types';
import { api } from '../../services/api';

interface PatientListViewProps {
  onSelectPatient: (patient: Patient) => void;
  onStartConsultation: (patient: Patient) => void;
}

export const PatientListView: React.FC<PatientListViewProps> = ({
  onSelectPatient,
  onStartConsultation,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const defaultFormData = {
    first_name: '',
    last_name: '',
    document_type: 'DNI',
    document_number: '',
    birth_date: '1985-06-15',
    gender: 'F' as 'F' | 'M' | 'X',
    blood_type: '0+',
    phone: '',
    email: '',
    address: '',
    city: 'Posadas',
    health_insurance_name: 'Particular',
    health_insurance_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    observations: '',
  };

  const [formData, setFormData] = useState(defaultFormData);

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

  const handleOpenNew = () => {
    setEditingPatient(null);
    setFormData(defaultFormData);
    setErrorMessage(null);
    setShowModal(true);
  };

  const handleOpenEdit = (pat: Patient, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPatient(pat);
    setFormData({
      first_name: pat.first_name || '',
      last_name: pat.last_name || '',
      document_type: pat.document_type || 'DNI',
      document_number: pat.document_number || '',
      birth_date: pat.birth_date || '1985-06-15',
      gender: (pat.gender as 'F' | 'M' | 'X') || 'F',
      blood_type: pat.blood_type || '0+',
      phone: pat.phone || '',
      email: pat.email || '',
      address: pat.address || '',
      city: pat.city || 'Posadas',
      health_insurance_name: pat.health_insurance_name || 'Particular',
      health_insurance_number: pat.health_insurance_number || '',
      emergency_contact_name: pat.emergency_contact_name || '',
      emergency_contact_phone: pat.emergency_contact_phone || '',
      observations: pat.observations || '',
    });
    setErrorMessage(null);
    setShowModal(true);
  };

  const handleSubmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingPatient) {
        // Edit existing patient
        const updated = await api.updatePatient(editingPatient.id, formData as any);
        await fetchPatients(search);
        onSelectPatient(updated);
        setShowModal(false);
      } else {
        // Create new patient
        const created = await api.createPatient(formData as any);
        setSearch('');
        await fetchPatients();
        onSelectPatient(created);
        setShowModal(false);
      }
    } catch (err: any) {
      console.error('Error saving patient:', err);
      const detail =
        err.response?.data?.document_number?.[0] ||
        err.response?.data?.detail ||
        'Error al procesar la información del paciente. Verifique los datos.';
      setErrorMessage(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Search & Actions */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Padrón de Pacientes
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              {patients.length} Registrados
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Búsqueda instantánea por DNI, apellido, obra social o número de historia clínica
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por DNI o apellido..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
          </div>

          <button
            onClick={handleOpenNew}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 active:scale-[0.98] text-white rounded-full text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-600/20 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Paciente</span>
          </button>
        </div>
      </div>

      {/* Patients Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <p className="text-sm">Buscando registros en el padrón...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">
            No se encontraron pacientes
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Haga clic en "Nuevo Paciente" para dar de alta en el sistema.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((pat) => (
            <div
              key={pat.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                      {pat.full_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      DNI: <span className="font-semibold text-slate-700 dark:text-slate-200">{pat.document_number}</span> · {pat.age} años
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                    {pat.gender === 'F' ? 'Fem' : pat.gender === 'M' ? 'Masc' : 'Otro'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cobertura:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">{pat.health_insurance_name}</span>
                  </div>
                  {pat.health_insurance_number && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">N° Carnet:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-200">{pat.health_insurance_number}</span>
                    </div>
                  )}
                  {pat.blood_type && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Grupo/Factor:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{pat.blood_type}</span>
                    </div>
                  )}
                  {pat.phone && (
                    <div className="flex items-center space-x-1.5 pt-1 text-slate-500 dark:text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pat.phone}</span>
                    </div>
                  )}
                  {pat.address && (
                    <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{pat.address} ({pat.city})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons: Edit Patient & Start Consultation */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => handleOpenEdit(pat, e)}
                  className="px-3.5 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                  title="Editar datos del paciente"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onStartConsultation(pat)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 active:scale-[0.98] text-white font-bold rounded-full text-xs flex items-center justify-center space-x-1.5 shadow-sm shadow-cyan-600/20 transition-all"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Atender / Evolucionar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-zoom-in my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {editingPatient ? 'Editar Ficha del Paciente' : 'Alta de Nuevo Paciente'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {editingPatient
                    ? `Modificando datos de ${editingPatient.full_name} (DNI ${editingPatient.document_number})`
                    : 'Registro filiatorio para consultorio médico de medicina interna'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPatient} className="space-y-4">
              {/* Datos Filiatorios Básicos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Ej. Nélida Haydee"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Ej. Foley"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* DNI, Fecha Nacimiento, Sexo y Grupo Sanguíneo */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    DNI / Documento
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.document_number}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                    placeholder="Número sin puntos"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Fecha Nacimiento
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Sexo / Género
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none"
                  >
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                    <option value="X">Otro / X</option>
                  </select>
                </div>
              </div>

              {/* Obra Social y Carnet */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Obra Social / Prepaga
                  </label>
                  <input
                    type="text"
                    value={formData.health_insurance_name}
                    onChange={(e) => setFormData({ ...formData, health_insurance_name: e.target.value })}
                    placeholder="IPS, OSDE, Swiss Medical, Particular..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    N° Carnet / Afiliado
                  </label>
                  <input
                    type="text"
                    value={formData.health_insurance_number}
                    onChange={(e) => setFormData({ ...formData, health_insurance_number: e.target.value })}
                    placeholder="Ej. 2328955-01"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Contacto: Teléfono y Correo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+54 9 376 4..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="paciente@correo.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Grupo / Factor
                  </label>
                  <select
                    value={formData.blood_type}
                    onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none font-bold"
                  >
                    <option value="0+">0 Rh Positivo (0+)</option>
                    <option value="0-">0 Rh Negativo (0-)</option>
                    <option value="A+">A Rh Positivo (A+)</option>
                    <option value="A-">A Rh Negativo (A-)</option>
                    <option value="B+">B Rh Positivo (B+)</option>
                    <option value="B-">B Rh Negativo (B-)</option>
                    <option value="AB+">AB Rh Positivo (AB+)</option>
                    <option value="AB-">AB Rh Negativo (AB-)</option>
                  </select>
                </div>
              </div>

              {/* Domicilio y Ciudad */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Dirección / Domicilio
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle, número, piso/depto..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Localidad / Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Posadas"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Contacto de Emergencia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Nombre Contacto de Emergencia
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    placeholder="Familiar / Acompañante"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Teléfono Contacto de Emergencia
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    placeholder="+54 9 ..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 active:scale-[0.98] text-white rounded-full text-xs font-bold shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Guardando...'
                      : editingPatient
                      ? 'Guardar Modificaciones'
                      : 'Registrar Paciente'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
