import React, { useState, useEffect } from 'react';
import { Pill, Plus, Printer, CheckCircle, FileText, Activity, ShieldCheck, Search } from 'lucide-react';
import { Patient, Prescription, StudyOrder } from '../../types';
import { api } from '../../services/api';

interface PrescriptionsViewProps {
  currentPatient: Patient | null;
}

export const PrescriptionsView: React.FC<PrescriptionsViewProps> = ({ currentPatient }) => {
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'studies'>('prescriptions');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [studies, setStudies] = useState<StudyOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // New Prescription Modal
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxInstructions, setRxInstructions] = useState('');
  const [rxItems, setRxItems] = useState([
    { medication_name: 'Enalapril', concentration: '10 mg', form: 'Comprimidos', dosage_instructions: '1 comprimido cada 12 hs vía oral', quantity: '2 (dos) cajas' },
  ]);

  // New Study Order Modal
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [studyName, setStudyName] = useState('Laboratorio de rutina clínica: Hemograma, Uremia, Creatinina, Glucemia, Lipidograma');
  const [studyCategory, setStudyCategory] = useState<'LAB' | 'XRAY' | 'US' | 'CT' | 'MRI' | 'CARDIO'>('LAB');
  const [studyIndication, setStudyIndication] = useState('Evaluación clínica periódica');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rxs, stds] = await Promise.all([
        api.getPrescriptions(currentPatient?.id),
        api.getStudyOrders(currentPatient?.id),
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
  }, [currentPatient]);

  const handleAddRxItem = () => {
    setRxItems([
      ...rxItems,
      { medication_name: '', concentration: '', form: 'Comprimidos', dosage_instructions: '', quantity: '1 caja' },
    ]);
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) {
      alert('Seleccione un paciente primero.');
      return;
    }

    try {
      await api.createPrescription({
        patient: currentPatient.id,
        diagnosis: rxDiagnosis || 'Tratamiento clínico',
        general_instructions: rxInstructions,
        items: rxItems,
      });
      setShowRxModal(false);
      await fetchData();
      alert('Receta médica generada exitosamente.');
    } catch (err) {
      alert('Error al generar la receta.');
    }
  };

  const handleCreateStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) {
      alert('Seleccione un paciente primero.');
      return;
    }

    try {
      await api.createStudyOrder({
        patient: currentPatient.id,
        category: studyCategory,
        study_name: studyName,
        clinical_indication: studyIndication,
        is_urgent: false,
      });
      setShowStudyModal(false);
      await fetchData();
      alert('Orden de estudio emitida con éxito.');
    } catch (err) {
      alert('Error al emitir orden de estudio.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recetas y Solicitud de Estudios</h2>
          <p className="text-xs text-slate-500">
            {currentPatient ? (
              <>Paciente: <strong className="text-slate-800">{currentPatient.full_name}</strong> (DNI: {currentPatient.document_number})</>
            ) : (
              'Documentos médicos de Clínica Médica'
            )}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRxModal(true)}
            disabled={!currentPatient}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            <Pill className="w-4 h-4" />
            <span>Emitir Receta Farmacológica</span>
          </button>

          <button
            onClick={() => setShowStudyModal(true)}
            disabled={!currentPatient}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            <Activity className="w-4 h-4" />
            <span>Ordenar Estudio Clínico</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 text-xs font-medium">
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'prescriptions'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Recetas Médicas Emitidas ({prescriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('studies')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'studies'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Órdenes de Estudios Clínicos ({studies.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'prescriptions' ? (
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
              <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No hay recetas emitidas</p>
              <p className="text-xs text-slate-400 mt-1">Haga clic en "Emitir Receta Farmacológica" para prescribir medicación.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Receta Activa ({rx.validity_days} días de validez)
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-2">
                        {rx.patient_details?.full_name || 'Paciente'}
                      </h4>
                      <p className="text-xs text-slate-500">Fecha: {rx.issue_date} · Diagnóstico: {rx.diagnosis}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400">Token de verificación:</span>
                      <p className="font-mono text-xs font-bold text-slate-700">{rx.security_token.slice(0, 10)}...</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Medicamentos prescritos:</p>
                    {rx.items?.map((item, idx) => (
                      <div key={idx} className="text-xs text-slate-800 pb-1.5 border-b border-slate-200 last:border-0 last:pb-0">
                        <div className="font-bold text-slate-900">
                          {item.medication_name} {item.concentration} ({item.quantity})
                        </div>
                        <div className="text-slate-600 mt-0.5">{item.dosage_instructions}</div>
                      </div>
                    ))}
                  </div>

                  {rx.general_instructions && (
                    <p className="text-xs text-slate-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      Indicaciones: {rx.general_instructions}
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
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No hay órdenes de estudio emitidas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studies.map((st) => (
                <div key={st.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                        {st.category} · {st.issue_date}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-2">{st.study_name}</h4>
                      <p className="text-xs text-slate-500 mt-1">Paciente: {st.patient_details?.full_name}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-600">Justificación clínica: </span>
                    <span className="text-slate-800">{st.clinical_indication}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Rx Modal */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Nueva Receta Farmacológica</h3>
            <p className="text-xs text-slate-500">Prescripción médica para {currentPatient?.full_name}</p>

            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnóstico</label>
                <input
                  type="text"
                  required
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                  placeholder="Ej: Hipertensión arterial esencial..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Medicamentos prescritos</label>
                  <button
                    type="button"
                    onClick={handleAddRxItem}
                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar fármaco</span>
                  </button>
                </div>

                {rxItems.map((item, index) => (
                  <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Nombre droga / fármaco"
                        value={item.medication_name}
                        onChange={(e) => {
                          const updated = [...rxItems];
                          updated[index].medication_name = e.target.value;
                          setRxItems(updated);
                        }}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Concentración (ej: 10 mg)"
                        value={item.concentration}
                        onChange={(e) => {
                          const updated = [...rxItems];
                          updated[index].concentration = e.target.value;
                          setRxItems(updated);
                        }}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Posología (ej: 1 comp c/12 hs)"
                        value={item.dosage_instructions}
                        onChange={(e) => {
                          const updated = [...rxItems];
                          updated[index].dosage_instructions = e.target.value;
                          setRxItems(updated);
                        }}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Cantidad (ej: 2 cajas)"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...rxItems];
                          updated[index].quantity = e.target.value;
                          setRxItems(updated);
                        }}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Indicaciones generales</label>
                <input
                  type="text"
                  value={rxInstructions}
                  onChange={(e) => setRxInstructions(e.target.value)}
                  placeholder="Tomar después de las comidas..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-medium rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  Emitir y Firmar Receta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Study Order Modal */}
      {showStudyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Solicitud de Estudio Complementario</h3>
            <p className="text-xs text-slate-500">Emisión para {currentPatient?.full_name}</p>

            <form onSubmit={handleCreateStudy} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Estudio</label>
                <select
                  value={studyCategory}
                  onChange={(e: any) => setStudyCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
                >
                  <option value="LAB">Laboratorio Bioquímico</option>
                  <option value="XRAY">Radiología / Rayos X</option>
                  <option value="US">Ecografía</option>
                  <option value="CARDIO">Cardiología (ECG / Ergometría / Holter)</option>
                  <option value="CT">Tomografía Computada (TC)</option>
                  <option value="MRI">Resonancia Magnética (RMN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estudio Solicitado</label>
                <textarea
                  rows={2}
                  required
                  value={studyName}
                  onChange={(e) => setStudyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnóstico / Justificación Clínica</label>
                <input
                  type="text"
                  required
                  value={studyIndication}
                  onChange={(e) => setStudyIndication(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStudyModal(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-medium rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  Emitir Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
