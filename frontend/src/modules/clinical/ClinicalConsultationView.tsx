import React, { useState, useEffect } from 'react';
import {
  Activity, ShieldCheck, Heart, AlertTriangle, FileCheck, Lock,
  Plus, History, TrendingUp, Save, CheckCircle2, ChevronRight,
  Stethoscope, Clock, ShieldAlert, Pill, FileText
} from 'lucide-react';
import {
  Patient, ClinicalEncounter, VitalSigns, Anthropometry,
  PhysicalExamination, ClinicalDiagnosis, ClinicalEvolutionNote,
  PatientCondition, PatientAllergy, PatientMedication
} from '../../types';
import { api } from '../../services/api';

interface ClinicalConsultationViewProps {
  patient: Patient | null;
  appointmentId?: string;
  onFinish?: () => void;
}

export const ClinicalConsultationView: React.FC<ClinicalConsultationViewProps> = ({
  patient,
  appointmentId,
  onFinish,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'consultation' | 'history'>('consultation');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentEncounter, setCurrentEncounter] = useState<ClinicalEncounter | null>(null);

  // Background patient medical history
  const [conditions, setConditions] = useState<PatientCondition[]>([]);
  const [allergies, setAllergies] = useState<PatientAllergy[]>([]);
  const [medications, setMedications] = useState<PatientMedication[]>([]);
  const [evolutionHistory, setEvolutionHistory] = useState<any[]>([]);

  // Form State
  const [reason, setReason] = useState('');
  const [illness, setIllness] = useState('');

  // Vital Signs
  const [vitals, setVitals] = useState<VitalSigns>({
    systolic_bp: 120,
    diastolic_bp: 80,
    heart_rate: 72,
    respiratory_rate: 16,
    temperature_c: 36.5,
    oxygen_saturation: 98,
    blood_glucose: 90,
  });

  // Anthropometry
  const [weight, setWeight] = useState<number | undefined>(75);
  const [height, setHeight] = useState<number | undefined>(172);

  // Physical Exam
  const [exam, setExam] = useState<PhysicalExamination>({
    general_appearance: 'Paciente vigil, orientado en tiempo, espacio y persona. Buen estado general.',
    head_and_neck: 'Cuello simétrico, sin ingurgitación yugular ni adenopatías palpables.',
    respiratory_system: 'Buena mecánica ventilatoria, murmullo vesicular conservado bilateral sin ruidos sobreagregados.',
    cardiovascular_system: 'Ruidos cardíacos rítmicos y normofonéticos. Silencios libres, sin soplos. Sin edemas periféricos.',
    abdomen: 'Blando, depresible, indoloro a la palpación, ruidos hidroaéreos conservados.',
    neurological_system: 'Sin déficit motor ni sensitivo aparente. Reflejos normales.',
    extremities_and_skin: 'Pulsos periféricos palpables y simétricos. Piel elástica y normocoloreada.',
  });

  // Diagnoses
  const [cieCode, setCieCode] = useState('I10');
  const [cieDesc, setCieDesc] = useState('Hipertensión esencial (primaria)');

  // SOAP Note
  const [soap, setSoap] = useState<ClinicalEvolutionNote>({
    subjective: '',
    objective: '',
    assessment: '',
    treatment_plan: '',
    requested_studies: '',
    alarm_signs: 'Consultar por guardia ante cefalea intensa, dolor torácico, disnea o pérdida de conocimiento.',
    next_control: 'Control en 30 días',
  });

  // Amendment modal
  const [showAmendModal, setShowAmendModal] = useState(false);
  const [amendReason, setAmendReason] = useState('');

  // Auto-calculated BMI
  const calculateBmi = (w?: number, h?: number) => {
    if (!w || !h || h <= 0) return { bmi: undefined, status: '' };
    const hm = h / 100;
    const bmiVal = Number((w / (hm * hm)).toFixed(1));
    let status = 'Normopeso';
    if (bmiVal < 18.5) status = 'Bajo peso';
    else if (bmiVal >= 25 && bmiVal < 30) status = 'Sobrepeso';
    else if (bmiVal >= 30 && bmiVal < 35) status = 'Obesidad I';
    else if (bmiVal >= 35 && bmiVal < 40) status = 'Obesidad II';
    else if (bmiVal >= 40) status = 'Obesidad III (Mórbida)';
    return { bmi: bmiVal, status };
  };

  const { bmi, status: bmiStatus } = calculateBmi(weight, height);

  // Load patient context data
  useEffect(() => {
    if (!patient) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [conds, alls, meds, history, prevEncs] = await Promise.all([
          api.getPatientConditions(patient.id),
          api.getPatientAllergies(patient.id),
          api.getPatientMedications(patient.id),
          api.getPatientEvolutionHistory(patient.id),
          api.getClinicalEncounters(patient.id),
        ]);
        setConditions(conds);
        setAllergies(alls);
        setMedications(meds);
        setEvolutionHistory(history);

        // If there is an encounter for today or in draft, load it
        if (prevEncs.length > 0) {
          const latest = prevEncs[0];
          // If it was created recently or is draft, preview it
          if (latest.status === 'DRAFT') {
            setCurrentEncounter(latest);
            setReason(latest.reason_for_consultation);
            setIllness(latest.current_illness);
            if (latest.vital_signs) setVitals(latest.vital_signs);
            if (latest.anthropometry) {
              setWeight(latest.anthropometry.weight_kg);
              setHeight(latest.anthropometry.height_cm);
            }
            if (latest.physical_examination) setExam(latest.physical_examination);
            if (latest.evolution_note) setSoap(latest.evolution_note);
          }
        }
      } catch (err) {
        console.error('Error loading patient context:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [patient]);

  if (!patient) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
        <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Ningún paciente seleccionado</h3>
        <p className="text-xs text-slate-500 mt-1">
          Por favor seleccione un paciente desde la Agenda o el Padrón de Pacientes para iniciar la consulta médica.
        </p>
      </div>
    );
  }

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload = {
        patient: patient.id,
        reason_for_consultation: reason || 'Consulta de rutina clínica',
        current_illness: illness,
        vital_signs: vitals,
        anthropometry: {
          weight_kg: weight,
          height_cm: height,
        },
        physical_examination: exam,
        evolution_note: soap,
        diagnoses: [
          {
            cie10_code: cieCode,
            description: cieDesc,
            is_primary: true,
            is_presumptive: false,
          },
        ],
      };

      const res = await api.createClinicalEncounter(payload);
      setCurrentEncounter(res);
      alert('Borrador de consulta guardado exitosamente.');
    } catch (err) {
      alert('Error al guardar la consulta.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignEncounter = async () => {
    if (!currentEncounter) {
      alert('Primero guarde los datos de la consulta antes de firmar.');
      return;
    }
    const confirm = window.confirm(
      '¿Desea firmar digitalmente esta consulta médica?\n\nConforme a la Ley 27.706, una vez firmada adquirirá validez legal inmutable y se generará su hash criptográfico SHA-256. No podrá modificarse sin generar una enmienda auditada.'
    );
    if (!confirm) return;

    try {
      const signed = await api.signClinicalEncounter(currentEncounter.id);
      setCurrentEncounter(signed);
      if (appointmentId) {
        await api.updateAppointmentStatus(appointmentId, 'COMPLETED');
      }
      alert('¡Consulta firmada exitosamente con Hash Criptográfico de Integridad!');
    } catch (err) {
      alert('Error al firmar la consulta.');
    }
  };

  const handleAmendSubmit = async () => {
    if (!currentEncounter || !amendReason.trim()) return;
    try {
      const amended = await api.amendClinicalEncounter(currentEncounter.id, amendReason);
      setCurrentEncounter(amended);
      setShowAmendModal(false);
      setAmendReason('');
      alert('Enmienda legal registrada con éxito (Ley 27.706). Se conservó la versión histórica.');
    } catch (err) {
      alert('Error al procesar la enmienda.');
    }
  };

  const isSigned = currentEncounter?.status === 'SIGNED';

  return (
    <div className="space-y-6">
      {/* Patient Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-sky-100">
              {patient.first_name[0]}{patient.last_name[0]}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-slate-900">{patient.full_name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                  {patient.gender === 'F' ? 'Femenino' : 'Masculino'} · {patient.age} años
                </span>
                {isSigned && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Firmada (Ley 27.706)</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>DNI: <strong className="text-slate-700">{patient.document_number}</strong></span>
                <span>·</span>
                <span>Cobertura: <strong className="text-slate-700">{patient.health_insurance_name}</strong> {patient.health_insurance_number ? `(${patient.health_insurance_number})` : ''}</span>
                <span>·</span>
                <span>Grupo: <strong className="text-rose-600">{patient.blood_type || '-'}</strong></span>
                <span>·</span>
                <span>Ciudad: <strong className="text-slate-700">{patient.city}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveSubTab('consultation')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeSubTab === 'consultation'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Consulta Actual</span>
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeSubTab === 'history'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Evolución Histórica</span>
            </button>
          </div>
        </div>

        {/* Clinical alerts banner (allergies and chronic conditions) */}
        {(allergies.length > 0 || conditions.length > 0) && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            {allergies.map((all) => (
              <span
                key={all.id}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Alergia: {all.allergen} ({all.severity === 'SEVERE' ? 'Severa' : 'Moderada'})</span>
              </span>
            ))}
            {conditions.map((cond) => (
              <span
                key={cond.id}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200"
              >
                <Activity className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{cond.name}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {activeSubTab === 'history' ? (
        /* Historical Trends View */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              <span>Evolución Temporal de Parámetros Clínicos</span>
            </h3>
            <span className="text-xs text-slate-500">Trazabilidad histórica de consultas</span>
          </div>

          {evolutionHistory.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No hay registros evolutivos previos para este paciente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Presión Arterial (PA)</th>
                    <th className="p-3">Frec. Cardíaca</th>
                    <th className="p-3">Peso</th>
                    <th className="p-3">IMC Calculado</th>
                    <th className="p-3">Glucemia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evolutionHistory.map((pt, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">{pt.date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          pt.systolic_bp >= 140 || pt.diastolic_bp >= 90
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {pt.systolic_bp && pt.diastolic_bp ? `${pt.systolic_bp}/${pt.diastolic_bp} mmHg` : '-'}
                        </span>
                      </td>
                      <td className="p-3">{pt.heart_rate ? `${pt.heart_rate} lpm` : '-'}</td>
                      <td className="p-3 font-medium">{pt.weight_kg ? `${pt.weight_kg} kg` : '-'}</td>
                      <td className="p-3 font-semibold text-sky-700">{pt.bmi ? `${pt.bmi} kg/m²` : '-'}</td>
                      <td className="p-3">{pt.blood_glucose ? `${pt.blood_glucose} mg/dL` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Clinical Consultation Form */
        <div className="space-y-6">
          {/* Status Alert if Signed */}
          {isSigned && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Esta consulta se encuentra firmada con valor probatorio (Ley 27.706).</p>
                  <p className="font-mono text-[11px] text-emerald-700 mt-0.5">
                    Hash SHA-256: {currentEncounter.signature_hash}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAmendModal(true)}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs transition-colors shrink-0"
              >
                Enmendar Consulta (Anexo Legal)
              </button>
            </div>
          )}

          {/* Section 1: Anamnesis */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>1. Anamnesis de Clínica Médica</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo de Consulta y Síntomas Referidos
                </label>
                <input
                  type="text"
                  disabled={isSigned}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: Control de hipertensión, astenia, chequeo general, disnea..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enfermedad Actual y Cronología de Síntomas
                </label>
                <textarea
                  rows={3}
                  disabled={isSigned}
                  value={illness}
                  onChange={(e) => setIllness(e.target.value)}
                  placeholder="Detalle de inicio, evolución, intensidad, factores atenuantes o desencadenantes..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Signos Vitales & Antropometría */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>2. Signos Vitales y Antropometría</span>
              </h3>
              {bmi && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">IMC Calculado:</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-200">
                    {bmi} kg/m² ({bmiStatus})
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-semibold text-slate-500">PA Sistólica</label>
                <div className="flex items-center space-x-1 mt-1">
                  <input
                    type="number"
                    disabled={isSigned}
                    value={vitals.systolic_bp || ''}
                    onChange={(e) => setVitals({ ...vitals, systolic_bp: Number(e.target.value) })}
                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">mmHg</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-semibold text-slate-500">PA Diastólica</label>
                <div className="flex items-center space-x-1 mt-1">
                  <input
                    type="number"
                    disabled={isSigned}
                    value={vitals.diastolic_bp || ''}
                    onChange={(e) => setVitals({ ...vitals, diastolic_bp: Number(e.target.value) })}
                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">mmHg</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-semibold text-slate-500">Frec. Cardíaca</label>
                <div className="flex items-center space-x-1 mt-1">
                  <input
                    type="number"
                    disabled={isSigned}
                    value={vitals.heart_rate || ''}
                    onChange={(e) => setVitals({ ...vitals, heart_rate: Number(e.target.value) })}
                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">lpm</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-semibold text-slate-500">Sat. O2</label>
                <div className="flex items-center space-x-1 mt-1">
                  <input
                    type="number"
                    disabled={isSigned}
                    value={vitals.oxygen_saturation || ''}
                    onChange={(e) => setVitals({ ...vitals, oxygen_saturation: Number(e.target.value) })}
                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm font-bold text-emerald-700"
                  />
                  <span className="text-[10px] text-slate-400">%</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-semibold text-slate-500">Temperatura</label>
                <div className="flex items-center space-x-1 mt-1">
                  <input
                    type="number"
                    step="0.1"
                    disabled={isSigned}
                    value={vitals.temperature_c || ''}
                    onChange={(e) => setVitals({ ...vitals, temperature_c: Number(e.target.value) })}
                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">°C</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-semibold text-slate-500">Peso Corporal</label>
                <div className="flex items-center space-x-1 mt-1">
                  <input
                    type="number"
                    step="0.5"
                    disabled={isSigned}
                    value={weight || ''}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-800"
                  />
                  <span className="text-[10px] text-slate-400">kg</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-semibold text-slate-500">Talla / Altura</label>
                <div className="flex items-center space-x-1 mt-1">
                  <input
                    type="number"
                    disabled={isSigned}
                    value={height || ''}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-800"
                  />
                  <span className="text-[10px] text-slate-400">cm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Examen Físico Segmentado */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Stethoscope className="w-4 h-4 text-sky-600" />
              <span>3. Examen Físico Especializado</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Aparato Cardiovascular</label>
                <textarea
                  rows={2}
                  disabled={isSigned}
                  value={exam.cardiovascular_system}
                  onChange={(e) => setExam({ ...exam, cardiovascular_system: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Aparato Respiratorio</label>
                <textarea
                  rows={2}
                  disabled={isSigned}
                  value={exam.respiratory_system}
                  onChange={(e) => setExam({ ...exam, respiratory_system: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Abdomen y Digestivo</label>
                <textarea
                  rows={2}
                  disabled={isSigned}
                  value={exam.abdomen}
                  onChange={(e) => setExam({ ...exam, abdomen: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Neurológico & Extremidades</label>
                <textarea
                  rows={2}
                  disabled={isSigned}
                  value={exam.neurological_system}
                  onChange={(e) => setExam({ ...exam, neurological_system: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Diagnóstico y Plan Terapéutico (SOAP) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>4. Diagnóstico Codificado y Plan Terapéutico (SOAP)</span>
            </h3>

            {/* Diagnóstico CIE-10 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <div>
                <label className="block text-xs font-semibold text-emerald-900 mb-1">Código CIE-10</label>
                <input
                  type="text"
                  disabled={isSigned}
                  value={cieCode}
                  onChange={(e) => setCieCode(e.target.value)}
                  placeholder="Ej: I10, E11.9..."
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-mono font-bold text-emerald-900"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-emerald-900 mb-1">Descripción Diagnóstica</label>
                <input
                  type="text"
                  disabled={isSigned}
                  value={cieDesc}
                  onChange={(e) => setCieDesc(e.target.value)}
                  placeholder="Ej: Hipertensión arterial esencial / Diabetes mellitus..."
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Plan de Tratamiento y SOAP */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plan de Tratamiento e Indicaciones Médicas (Farmacológicas e Higiénico-Dietéticas)
                </label>
                <textarea
                  rows={3}
                  disabled={isSigned}
                  value={soap.treatment_plan}
                  onChange={(e) => setSoap({ ...soap, treatment_plan: e.target.value })}
                  placeholder="Medicación prescrita con dosis y duración, dieta hiposódica, pautas de ejercicio físico..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estudios Solicitados
                  </label>
                  <input
                    type="text"
                    disabled={isSigned}
                    value={soap.requested_studies}
                    onChange={(e) => setSoap({ ...soap, requested_studies: e.target.value })}
                    placeholder="Ej: Laboratorio perfil lipídico, ECG, Rx Tórax..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Próximo Control / Cita Evolutiva
                  </label>
                  <input
                    type="text"
                    disabled={isSigned}
                    value={soap.next_control}
                    onChange={(e) => setSoap({ ...soap, next_control: e.target.value })}
                    placeholder="Ej: En 15 días con resultados de laboratorio..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pautas de Alarma para el Paciente
                </label>
                <input
                  type="text"
                  disabled={isSigned}
                  value={soap.alarm_signs}
                  onChange={(e) => setSoap({ ...soap, alarm_signs: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                />
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Garantía de inmutabilidad y trazabilidad legal de historia clínica</span>
            </div>

            <div className="flex items-center space-x-3">
              {!isSigned && (
                <>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Guardando...' : 'Guardar Borrador'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSignEncounter}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Firmar Consulta Médica (Ley 27.706)</span>
                  </button>
                </>
              )}

              {isSigned && (
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Actuación clínica completada y registrada.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Amendment Modal */}
      {showAmendModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-amber-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Enmienda de Historia Clínica</h3>
            </div>
            <p className="text-xs text-slate-600">
              Conforme a la Ley 27.706, no se permite borrar ni sobrescribir una evolución firmada. Debe documentar el motivo formal de la rectificación o anexo.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo / Justificación de la Enmienda
              </label>
              <textarea
                rows={3}
                required
                value={amendReason}
                onChange={(e) => setAmendReason(e.target.value)}
                placeholder="Ej: Se agrega resultado de ionograma plasmático no disponible en el momento de la consulta..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAmendModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAmendSubmit}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm"
              >
                Confirmar y Registrar Enmienda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
