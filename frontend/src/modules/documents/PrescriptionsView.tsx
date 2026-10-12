import React, { useState, useEffect } from 'react';
import {
  Pill,
  Plus,
  Printer,
  CheckCircle,
  FileText,
  Activity,
  ShieldCheck,
  Search,
  X,
  Sparkles,
  ChevronDown,
  Trash2,
  FilePlus,
  Stethoscope,
  Info,
  Clock
} from 'lucide-react';
import { Patient, Prescription, StudyOrder } from '../../types';
import { api } from '../../services/api';
import { PRELOADED_MEDICATIONS, PRELOADED_STUDIES, PreloadedMedication, PreloadedStudy } from '../../data/medicalCatalog';

interface PrescriptionsViewProps {
  currentPatient: Patient | null;
}

export const PrescriptionsView: React.FC<PrescriptionsViewProps> = ({ currentPatient }) => {
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'studies'>('prescriptions');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [studies, setStudies] = useState<StudyOrder[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(currentPatient?.id || '');
  const [loading, setLoading] = useState(false);

  // New Prescription Modal
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxDiagnosis, setRxDiagnosis] = useState('Tratamiento de patología clínica ambulatoria');
  const [rxInstructions, setRxInstructions] = useState('Tomar con abundante agua según horarios indicados. No suspender sin indicación médica.');
  const [rxItems, setRxItems] = useState([
    {
      medication_name: 'Enalapril',
      concentration: '10 mg',
      form: 'Comprimidos',
      dosage_instructions: '1 comprimido cada 12 hs vía oral',
      quantity: '2 (dos) cajas x 30 comp.',
    },
  ]);
  const [medSearch, setMedSearch] = useState('');

  // New Study Order Modal
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [studyName, setStudyName] = useState('Laboratorio de Rutina Clínica Completo: Hemograma, Glucemia, Uremia, Creatinina, Ionograma, Hepatograma, Lipidograma');
  const [studyCategory, setStudyCategory] = useState<'LAB' | 'XRAY' | 'US' | 'CARDIO' | 'CT' | 'MRI' | 'OTHER'>('LAB');
  const [studyIndication, setStudyIndication] = useState('Evaluación y control clínico periódico integral');
  const [studySearch, setStudySearch] = useState('');

  // Fetch all patients for selection if needed
  useEffect(() => {
    api.getPatients().then((data) => setAllPatients(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (currentPatient) {
      setSelectedPatientId(currentPatient.id);
    }
  }, [currentPatient]);

  const activePatient =
    allPatients.find((p) => p.id === selectedPatientId) || currentPatient;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rxs, stds] = await Promise.all([
        api.getPrescriptions(selectedPatientId || undefined),
        api.getStudyOrders(selectedPatientId || undefined),
      ]);
      setPrescriptions(rxs);
      setStudies(stds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPatientId]);

  // Drug Catalog helpers
  const handleSelectPreloadedMed = (med: PreloadedMedication, indexToReplace?: number) => {
    const newItem = {
      medication_name: med.name,
      concentration: med.defaultConcentration,
      form: med.defaultForm,
      dosage_instructions: med.defaultDosage,
      quantity: med.defaultQuantity,
    };

    if (typeof indexToReplace === 'number') {
      const updated = [...rxItems];
      updated[indexToReplace] = newItem;
      setRxItems(updated);
    } else {
      setRxItems([...rxItems, newItem]);
    }
    setMedSearch('');
  };

  const handleAddCustomRxItem = () => {
    setRxItems([
      ...rxItems,
      {
        medication_name: '',
        concentration: '',
        form: 'Comprimidos',
        dosage_instructions: '',
        quantity: '1 caja',
      },
    ]);
  };

  const handleRemoveRxItem = (index: number) => {
    if (rxItems.length <= 1) return;
    setRxItems(rxItems.filter((_, i) => i !== index));
  };

  // Study Catalog helpers
  const handleSelectPreloadedStudy = (study: PreloadedStudy) => {
    setStudyCategory(study.category);
    setStudyName(`${study.title}: ${study.description}`);
    setStudyIndication(study.defaultIndication);
    setStudySearch('');
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) {
      alert('Por favor seleccione un paciente para emitir la receta.');
      return;
    }

    try {
      await api.createPrescription({
        patient: activePatient.id,
        diagnosis: rxDiagnosis || 'Tratamiento clínico',
        general_instructions: rxInstructions,
        items: rxItems,
      });
      setShowRxModal(false);
      await fetchData();
      alert('¡Receta médica oficial emitida y firmada digitalmente con éxito!');
    } catch {
      alert('Error al generar la receta médica.');
    }
  };

  const handleCreateStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) {
      alert('Por favor seleccione un paciente para la orden médica.');
      return;
    }

    try {
      await api.createStudyOrder({
        patient: activePatient.id,
        category: studyCategory,
        study_name: studyName,
        clinical_indication: studyIndication,
        is_urgent: false,
      });
      setShowStudyModal(false);
      await fetchData();
      alert('¡Orden de estudio complementario emitida con éxito!');
    } catch {
      alert('Error al emitir orden de estudio.');
    }
  };

  const filteredMeds = PRELOADED_MEDICATIONS.filter(
    (m) =>
      m.name.toLowerCase().includes(medSearch.toLowerCase()) ||
      m.genericName.toLowerCase().includes(medSearch.toLowerCase()) ||
      m.drugClass.toLowerCase().includes(medSearch.toLowerCase())
  );

  const filteredStudies = PRELOADED_STUDIES.filter(
    (s) =>
      s.title.toLowerCase().includes(studySearch.toLowerCase()) ||
      s.description.toLowerCase().includes(studySearch.toLowerCase()) ||
      s.categoryLabel.toLowerCase().includes(studySearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Recetas y Solicitud de Estudios
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              Conforme Ley 27.706
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Paciente seleccionado:</span>
            {activePatient ? (
              <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                {activePatient.full_name} (DNI: {activePatient.document_number})
              </span>
            ) : (
              <span className="text-amber-600 font-medium">Ningún paciente seleccionado</span>
            )}
          </div>
        </div>

        {/* Patient Switcher & Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Patient Quick Selector */}
          <div className="relative">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="px-3.5 py-2 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="">-- Todos los pacientes --</option>
              {allPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.document_number})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowRxModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Pill className="w-4 h-4" />
            <span>Emitir Receta Farmacológica</span>
          </button>

          <button
            onClick={() => setShowStudyModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 active:scale-[0.98] text-white rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-cyan-600/20 transition-all"
          >
            <Activity className="w-4 h-4" />
            <span>Ordenar Estudio Clínico</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2 rounded-full transition-all ${
            activeTab === 'prescriptions'
              ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          Recetas Médicas Emitidas ({prescriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('studies')}
          className={`px-4 py-2 rounded-full transition-all ${
            activeTab === 'studies'
              ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          Órdenes de Estudios Clínicos ({studies.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'prescriptions' ? (
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
              <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                No hay recetas médicas emitidas
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Haga clic en "Emitir Receta Farmacológica" para seleccionar medicamentos precargados o ingresarlos manualmente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Receta Activa ({rx.validity_days} días de validez)
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                        {rx.patient_details?.full_name || 'Paciente'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Fecha: <strong>{rx.issue_date}</strong> · Diagnóstico:{' '}
                        <strong>{rx.diagnosis}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block">
                        Firma Digital:
                      </span>
                      <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        {rx.security_token.slice(0, 10)}...
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Fármacos Prescritos:
                    </p>
                    {rx.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0"
                      >
                        <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>
                            {item.medication_name} {item.concentration} ({item.form})
                          </span>
                          <span className="text-cyan-700 dark:text-cyan-400 font-semibold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                          Posología: {item.dosage_instructions}
                        </div>
                      </div>
                    ))}
                  </div>

                  {rx.general_instructions && (
                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
                      <strong>Indicaciones generales:</strong> {rx.general_instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {studies.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                No hay órdenes de estudio emitidas
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Haga clic en "Ordenar Estudio Clínico" para emitir solicitudes de laboratorio, imágenes o cardiología.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studies.map((st) => (
                <div
                  key={st.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                        {st.category} · {st.issue_date}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                        {st.study_name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Paciente: <strong>{st.patient_details?.full_name}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Justificación / Diagnóstico clínico:{' '}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">{st.clinical_indication}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: NUEVA RECETA FARMACOLÓGICA CON MEDICAMENTOS PRECARGADOS Y MANUAL */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-zoom-in my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Nueva Receta Farmacológica
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paciente: <strong className="text-slate-800 dark:text-slate-200">{activePatient?.full_name || 'Seleccione paciente'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRxModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SECCIÓN CATÁLOGO RÁPIDO DE FÁRMACOS PRECARGADOS */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Catálogo de Fármacos Precargados (Clínica Médica)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Haga clic para agregar automáticamente o escriba abajo
                </span>
              </div>

              {/* Medication Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={medSearch}
                  onChange={(e) => setMedSearch(e.target.value)}
                  placeholder="Filtrar por droga (ej: Enalapril, Metformina, Levotiroxina, Amoxi, Omeprazol...)"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              {/* Preloaded Pills (Scrollable / Grid) */}
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1 pr-1">
                {filteredMeds.map((med) => (
                  <button
                    key={med.id}
                    type="button"
                    onClick={() => handleSelectPreloadedMed(med)}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 transition-colors group shadow-2xs"
                  >
                    <Plus className="w-3 h-3 text-cyan-600 group-hover:scale-125 transition-transform" />
                    <span>{med.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({med.defaultConcentration})</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-4">
              {/* Diagnóstico */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Diagnóstico / Indicación de Tratamiento
                </label>
                <input
                  type="text"
                  required
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                  placeholder="Ej: Hipertensión arterial esencial / Diabetes Mellitus tipo 2..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              {/* LISTADO DE MEDICAMENTOS (EDITABLES MANUALMENTE) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Medicamentos a Prescribir ({rxItems.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCustomRxItem}
                    className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 font-bold flex items-center space-x-1 px-2.5 py-1 rounded-full hover:bg-cyan-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Fármaco Manual</span>
                  </button>
                </div>

                {rxItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Fármaco #{index + 1}
                      </span>
                      {rxItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRxItem(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Eliminar este fármaco"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                          Nombre Droga / Comercial
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Enalapril / Losartán"
                          value={item.medication_name}
                          onChange={(e) => {
                            const updated = [...rxItems];
                            updated[index].medication_name = e.target.value;
                            setRxItems(updated);
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                          Concentración
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: 10 mg / 500 mg"
                          value={item.concentration}
                          onChange={(e) => {
                            const updated = [...rxItems];
                            updated[index].concentration = e.target.value;
                            setRxItems(updated);
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                          Forma Farmacéutica
                        </label>
                        <input
                          type="text"
                          placeholder="Comprimidos / Gotas"
                          value={item.form}
                          onChange={(e) => {
                            const updated = [...rxItems];
                            updated[index].form = e.target.value;
                            setRxItems(updated);
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                          Posología / Modo de Toma
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: 1 comprimido cada 12 hs vía oral con desayuno"
                          value={item.dosage_instructions}
                          onChange={(e) => {
                            const updated = [...rxItems];
                            updated[index].dosage_instructions = e.target.value;
                            setRxItems(updated);
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                          Cantidad a Dispensar
                        </label>
                        <input
                          type="text"
                          placeholder="2 (dos) cajas x 30"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...rxItems];
                            updated[index].quantity = e.target.value;
                            setRxItems(updated);
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Indicaciones Generales */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Indicaciones Adicionales / Cuidados Generales
                </label>
                <textarea
                  rows={2}
                  value={rxInstructions}
                  onChange={(e) => setRxInstructions(e.target.value)}
                  placeholder="Recomendaciones higiénico-dietéticas, signos de alarma, pautas de alarma..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white rounded-full text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
                >
                  <Pill className="w-4 h-4" />
                  <span>Emitir y Firmar Receta Oficial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ORDEN DE ESTUDIOS CLÍNICOS CON CATÁLOGO PRECARGADO Y MANUAL */}
      {showStudyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-zoom-in my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Solicitud de Estudio Complementario
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paciente: <strong className="text-slate-800 dark:text-slate-200">{activePatient?.full_name || 'Seleccione paciente'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStudyModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SECCIÓN CATÁLOGO RÁPIDO DE ESTUDIOS PRECARGADOS */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Estudios Clínicos Frecuentes (Haga clic para autocompletar)
                  </span>
                </div>
              </div>

              {/* Study Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={studySearch}
                  onChange={(e) => setStudySearch(e.target.value)}
                  placeholder="Buscar estudio (ej: Rutina, Glucemia, ECG, Doppler, Tórax, Ecografía, TC...)"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              {/* Preloaded Studies Pills */}
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1 pr-1">
                {filteredStudies.map((study) => (
                  <button
                    key={study.id}
                    type="button"
                    onClick={() => handleSelectPreloadedStudy(study)}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 transition-colors group shadow-2xs"
                  >
                    <Plus className="w-3 h-3 text-cyan-600 group-hover:scale-125 transition-transform" />
                    <span>{study.title}</span>
                    <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold">[{study.category}]</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateStudy} className="space-y-4">
              {/* Categoría */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Categoría de la Práctica
                </label>
                <select
                  value={studyCategory}
                  onChange={(e: any) => setStudyCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="LAB">Laboratorio Bioquímico</option>
                  <option value="CARDIO">Cardiología (ECG, Ecocardiograma, Ergometría, Holter, MAPA)</option>
                  <option value="XRAY">Radiología / Rayos X</option>
                  <option value="US">Ecografía / Ultrasonido</option>
                  <option value="CT">Tomografía Computada (TC)</option>
                  <option value="MRI">Resonancia Magnética (RMN)</option>
                  <option value="OTHER">Otras Prácticas Especializadas</option>
                </select>
              </div>

              {/* Estudio Solicitado (Texto Libre / Manual) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Práctica / Estudio Solicitado (Editable libremente)
                </label>
                <textarea
                  rows={3}
                  required
                  value={studyName}
                  onChange={(e) => setStudyName(e.target.value)}
                  placeholder="Detalle de los análisis bioquímicos o estudios solicitados..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              {/* Justificación Clínica */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Diagnóstico / Justificación Clínica Presuntiva
                </label>
                <input
                  type="text"
                  required
                  value={studyIndication}
                  onChange={(e) => setStudyIndication(e.target.value)}
                  placeholder="Ej: Evaluación clínica periódica / Sospecha de nefropatía / Control HTA..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStudyModal(false)}
                  className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 active:scale-[0.98] text-white rounded-full text-xs font-bold shadow-md shadow-cyan-600/20 transition-all flex items-center space-x-1.5"
                >
                  <Activity className="w-4 h-4" />
                  <span>Emitir Orden Médica</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
