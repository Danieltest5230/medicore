import React, { useState, useEffect } from 'react';
import {
  Activity, ShieldCheck, Heart, AlertTriangle, FileCheck, Lock,
  Plus, History, TrendingUp, Save, CheckCircle2, ChevronRight,
  Stethoscope, Clock, ShieldAlert, Pill, FileText, Download, Printer, Sparkles
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

  // 1. Anamnesis y Antecedentes (Muestra PDF)
  const [reason, setReason] = useState('');
  const [illness, setIllness] = useState('');
  const [diseaseHistory, setDiseaseHistory] = useState('');
  const [pathologicalHistory, setPathologicalHistory] = useState('');
  const [medicationHistory, setMedicationHistory] = useState('');
  const [surgicalHistory, setSurgicalHistory] = useState('');

  // 2. Examen Físico Segmentado (Muestra PDF)
  const [exam, setExam] = useState<PhysicalExamination>({
    skin_and_mucosa: 'humedad conservada, elasticidad normal, no presenta edemas, ni circulación colateral',
    cardiovascular_system: 'R1 R2 normofonéticos. Silencios impresionan libres. Pulsos periféricos permeables simétricos y regulares.',
    respiratory_system: 'Reba sin ruidos patológicos agregados.',
    abdomen: 'Abdomen blando, depresible, indoloro, flatos positivos, alimentación por vía oral, catarsis positiva',
    genitourinary_system: 'Puño percusión lumbar bilateral negativa. Puntos Ureterales (-). Diuresis +.',
    neurological_system: 'Glasgow 15/15. Signos meníngeos ausentes. Reflejos Osteotendinosos conservados.',
    general_appearance: 'Paciente en regular a buen estado general, vigil, orientado témporo-espacialmente.',
  });

  // 3. Signos Vitales
  const [vitals, setVitals] = useState<VitalSigns>({
    systolic_bp: 120,
    diastolic_bp: 80,
    heart_rate: 72,
    respiratory_rate: 16,
    temperature_c: 36.5,
    oxygen_saturation: 95,
    blood_glucose: 90,
  });

  // 4. Antropometría
  const [weight, setWeight] = useState<number | undefined>(75);
  const [height, setHeight] = useState<number | undefined>(172);

  // 5. Diagnósticos
  const [cieCode, setCieCode] = useState('I10');
  const [cieDesc, setCieDesc] = useState('Hipertensión esencial (primaria)');

  // 6. Estudios Complementarios / Laboratorio (Muestra PDF)
  const [complementaryStudies, setComplementaryStudies] = useState('');

  // 7. Plan Terapéutico (Muestra PDF)
  const [soap, setSoap] = useState<ClinicalEvolutionNote>({
    subjective: '',
    objective: '',
    assessment: '',
    treatment_plan: '',
    requested_studies: '',
    alarm_signs: 'Consultar por guardia ante cefalea intensa, dolor torácico o disnea.',
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

        // If encounters exist, load the latest one
        if (prevEncs.length > 0) {
          const latest = prevEncs[0];
          setCurrentEncounter(latest);
          setReason(latest.reason_for_consultation || '');
          setIllness(latest.current_illness || '');
          setDiseaseHistory(latest.disease_history || '');
          setPathologicalHistory(latest.pathological_history || '');
          setMedicationHistory(latest.medication_history || '');
          setSurgicalHistory(latest.surgical_history || '');
          setComplementaryStudies(latest.complementary_studies || '');

          if (latest.vital_signs) setVitals(latest.vital_signs);
          if (latest.anthropometry) {
            setWeight(latest.anthropometry.weight_kg);
            setHeight(latest.anthropometry.height_cm);
          }
          if (latest.physical_examination) {
            setExam({
              ...exam,
              ...latest.physical_examination
            });
          }
          if (latest.evolution_note) setSoap(latest.evolution_note);
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

  // Preload clinical sample matching the PDF
  const handleApplySampleTemplate = () => {
    setReason('Control evolutivo y evaluación clínica integral');
    setIllness('Paciente en seguimiento clínico ambulatorio.');
    setDiseaseHistory('Paciente con antecedentes de cardiopatía isquémica con colocación de 2 stent, Colon irritable, HTA, Colecistectomía, Osteoartrosis severa generalizada');
    setPathologicalHistory('HTA, Cardiopatía isquémica con colocación de 2 stent');
    setMedicationHistory('Valsartan 160 mg/d, Aspirina 100 mg/d, Hidroclorotiazida 12.5 mg/d (susp), zolpidem 12.5 mg/d, omeprazol 20 mg/d');
    setSurgicalHistory('Colecistectomía');
    setExam({
      skin_and_mucosa: 'humedad conservada, elasticidad normal, no presenta edemas, ni circulación colateral',
      cardiovascular_system: 'R1 R2 normofonéticos. Silencios impresionan libres. Pulsos periféricos permeables simétricos y regulares.',
      respiratory_system: 'Reba sin ruidos patológicos agregados.',
      abdomen: 'Abdomen blando, depresible, indoloro, flatos positivos, alimentación por vía oral, catarsis positiva diarreicas',
      genitourinary_system: 'Puño percusión lumbar bilateral negativa. Puntos Ureterales (-). Diuresis +.',
      neurological_system: 'Glasgow 15/15. Signos meníngeos ausentes. Reflejos Osteotendinosos conservados.',
      general_appearance: 'Lúcido, orientado témporo-espacialmente. Normohidratado.',
    });
    setComplementaryStudies(`21/09/26: ferritina 219 gluc 0.88 hgb a 1c 5.70 feremia 22 transferrina 174 % sat transferrina 13 fosfor 2.53 na 129 k 4.5 cl 92 alb 3.80 prot tot 7.06\n24/08/26: hto 35 % hgb 11.42 gb 10230 plaq 235.200 vsg 26 tp 101 kptt 23 gluc 0.84 ur 0.51 cr 7.44 calcemia 8.84 na 131 k 4.8 cl 92 bd 0.12 bcta 0.18 bt 0.30 gpt 14 gor 22 fal 144 col tot 147 trig 130 dh 118 orina color amarillo aspecto ligeramente turbio sedimento escaso ph 5 densidad 1010 proteina no contiene glucosa no contiene cuerpos cetónicos no contiene bilirrubina no contiene urobilinogeno normal hemoglobina no contiene células epiteliales escasas leucocitos 1 a 3 x campo proetinograma electroforético prot tot 6.78 alb 3.53 alfa 1 glob 0.22 alfa 2 glob 0.76 beta glob 0.83 gamma gob 1.44`);
    setSoap({
      ...soap,
      treatment_plan: 'Solicito alimentacion enteral Ensure 800 mg polvo x 3 latas\nKinesiologia motora 2 veces x semana',
    });
    alert('Plantilla médica modelo cargada exitosamente.');
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload: any = {
        patient: patient.id,
        reason_for_consultation: reason || 'Consulta de rutina clínica',
        current_illness: illness || '',
        disease_history: diseaseHistory,
        pathological_history: pathologicalHistory,
        medication_history: medicationHistory,
        surgical_history: surgicalHistory,
        complementary_studies: complementaryStudies,
        vital_signs: vitals,
        anthropometry: {
          weight_kg: weight || null,
          height_cm: height || null,
        },
        physical_examination: exam,
        evolution_note: {
          ...soap,
          treatment_plan: soap.treatment_plan || 'Plan de seguimiento clínico habitual.',
        },
        diagnoses: [
          {
            cie10_code: cieCode || 'I10',
            description: cieDesc || 'Evaluación clínica general',
            is_primary: true,
            is_presumptive: false,
          },
        ],
      };

      let res: ClinicalEncounter;
      if (currentEncounter && currentEncounter.status === 'DRAFT') {
        res = await api.updateClinicalEncounter(currentEncounter.id, payload);
      } else {
        res = await api.createClinicalEncounter(payload);
      }
      setCurrentEncounter(res);
      alert('¡Borrador de consulta guardado exitosamente!');
    } catch (err: any) {
      console.error('Error al guardar consulta:', err);
      const detail = err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message;
      alert(`Error al guardar la consulta:\n${detail}`);
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
      '¿Desea firmar digitalmente esta historia clínica?\n\nConforme a la Ley 27.706, una vez firmada adquirirá validez legal inmutable y se generará su hash criptográfico SHA-256.'
    );
    if (!confirm) return;

    try {
      const signed = await api.signClinicalEncounter(currentEncounter.id);
      setCurrentEncounter(signed);
      if (appointmentId) {
        await api.updateAppointmentStatus(appointmentId, 'COMPLETED');
      }
      alert('¡Consulta firmada exitosamente con Hash Criptográfico de Integridad!');
    } catch (err: any) {
      const detail = err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message;
      alert(`Error al firmar la consulta:\n${detail}`);
    }
  };

  const handleDownloadPdf = async () => {
    if (!currentEncounter) {
      alert('Guarde la consulta primero para generar su PDF.');
      return;
    }
    try {
      await api.downloadClinicalHistoryPdf(currentEncounter.id, patient.document_number);
    } catch (err) {
      alert('Error al descargar el PDF.');
    }
  };

  const handleOpenPdf = async () => {
    if (!currentEncounter) {
      alert('Guarde la consulta primero para previsualizar el PDF.');
      return;
    }
    try {
      await api.openClinicalHistoryPdf(currentEncounter.id);
    } catch (err) {
      alert('Error al abrir el PDF.');
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
                <span>Fecha Nac: <strong className="text-slate-700">{patient.birth_date}</strong></span>
                <span>·</span>
                <span>Obra Social: <strong className="text-slate-700">{patient.health_insurance_name}</strong> {patient.health_insurance_number ? `(Afiliado: ${patient.health_insurance_number})` : ''}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isSigned && (
              <button
                type="button"
                onClick={handleApplySampleTemplate}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 flex items-center space-x-1.5 transition-colors"
                title="Carga los textos clínicos idénticos al PDF muestra para probar en 1 clic"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Cargar Plantilla Muestra</span>
              </button>
            )}

            {currentEncounter && (
              <>
                <button
                  type="button"
                  onClick={handleOpenPdf}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1.5 transition-colors"
                  title="Abrir o Imprimir PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 flex items-center space-x-1.5 transition-colors"
                  title="Descargar archivo PDF oficial"
                >
                  <Download className="w-4 h-4 text-sky-600" />
                  <span>Descargar PDF</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveSubTab('consultation')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeSubTab === 'consultation'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Historia Clínica</span>
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
              <span>Evolución</span>
            </button>
          </div>
        </div>

        {/* Clinical alerts banner */}
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
        /* Clinical Consultation Form - Structuring EXACTLY as the PDF Sample */
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

          {/* 1. ANTECEDENTES DE LA ENFERMEDAD & ANTECEDENTES */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Antecedentes de la Enfermedad y Personales</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Antecedentes de la Enfermedad
                </label>
                <textarea
                  rows={2}
                  disabled={isSigned}
                  value={diseaseHistory}
                  onChange={(e) => setDiseaseHistory(e.target.value)}
                  placeholder="Ej: Paciente femenino con antecedentes de cardiopatía isquémica con colocación de 2 stent, Colon irritable, HTA, Colecistectomía..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1. Patológicos
                  </label>
                  <textarea
                    rows={2}
                    disabled={isSigned}
                    value={pathologicalHistory}
                    onChange={(e) => setPathologicalHistory(e.target.value)}
                    placeholder="HTA, Cardiopatía isquémica con colocación de 2 stent..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    2. Medicamentos
                  </label>
                  <textarea
                    rows={2}
                    disabled={isSigned}
                    value={medicationHistory}
                    onChange={(e) => setMedicationHistory(e.target.value)}
                    placeholder="Valsartan 160 mg/d, Aspirina 100 mg/d, Hidroclorotiazida..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    3. Quirúrgicos
                  </label>
                  <textarea
                    rows={2}
                    disabled={isSigned}
                    value={surgicalHistory}
                    onChange={(e) => setSurgicalHistory(e.target.value)}
                    placeholder="Colecistectomía, apendicectomía..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. EXAMEN FÍSICO SEGMENTADO (Idéntico a la muestra PDF) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-sky-600" />
                <span>Examen Físico (Estructura Clínica Oficial)</span>
              </h3>
              <span className="text-xs text-slate-400">Piel, CVC, Respiratorio, Abdomen, GU, SNC</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  - Piel y Mucosas
                </label>
                <input
                  type="text"
                  disabled={isSigned}
                  value={exam.skin_and_mucosa || ''}
                  onChange={(e) => setExam({ ...exam, skin_and_mucosa: e.target.value })}
                  placeholder="humedad conservada, elasticidad normal, no presenta edemas..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  - Ap. CVC (Cardiovascular)
                </label>
                <input
                  type="text"
                  disabled={isSigned}
                  value={exam.cardiovascular_system || ''}
                  onChange={(e) => setExam({ ...exam, cardiovascular_system: e.target.value })}
                  placeholder="R1 R2 normofonéticos. Silencios impresionan libres. Pulsos periféricos..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  - Ap. Respiratorio
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    disabled={isSigned}
                    value={exam.respiratory_system || ''}
                    onChange={(e) => setExam({ ...exam, respiratory_system: e.target.value })}
                    placeholder="Reba sin ruidos patológicos agregados."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                  />
                  <div className="flex items-center space-x-1 shrink-0 bg-slate-50 px-2 py-1.5 border border-slate-200 rounded-xl text-xs">
                    <span className="text-slate-400">Sat:</span>
                    <input
                      type="number"
                      disabled={isSigned}
                      value={vitals.oxygen_saturation || ''}
                      onChange={(e) => setVitals({ ...vitals, oxygen_saturation: Number(e.target.value) })}
                      className="w-12 bg-white px-1.5 py-0.5 border border-slate-200 rounded text-center font-bold text-sky-700"
                    />
                    <span className="text-slate-500">% aa</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  - Abdomen
                </label>
                <input
                  type="text"
                  disabled={isSigned}
                  value={exam.abdomen || ''}
                  onChange={(e) => setExam({ ...exam, abdomen: e.target.value })}
                  placeholder="Abdomen blando, depresible, indoloro, flatos positivos, alimentación..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  - Ap. Genitourinario
                </label>
                <input
                  type="text"
                  disabled={isSigned}
                  value={exam.genitourinary_system || ''}
                  onChange={(e) => setExam({ ...exam, genitourinary_system: e.target.value })}
                  placeholder="Puño percusión lumbar bilateral negativa. Puntos Ureterales (-). Diuresis +."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  - SNC (Sistema Nervioso Central)
                </label>
                <input
                  type="text"
                  disabled={isSigned}
                  value={exam.neurological_system || ''}
                  onChange={(e) => setExam({ ...exam, neurological_system: e.target.value })}
                  placeholder="Glasgow 15/15. Signos meníngeos ausentes. Reflejos Osteotendinosos conservados."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
                />
              </div>
            </div>

            {/* Quick Vital Signs & BMI Strip */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Tensión Arterial</span>
                <div className="flex items-center space-x-1 mt-0.5">
                  <input
                    type="number"
                    disabled={isSigned}
                    value={vitals.systolic_bp || ''}
                    onChange={(e) => setVitals({ ...vitals, systolic_bp: Number(e.target.value) })}
                    className="w-12 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-bold text-center"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    disabled={isSigned}
                    value={vitals.diastolic_bp || ''}
                    onChange={(e) => setVitals({ ...vitals, diastolic_bp: Number(e.target.value) })}
                    className="w-12 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-bold text-center"
                  />
                  <span className="text-[10px] text-slate-400">mmHg</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Frec. Cardíaca</span>
                <div className="flex items-center space-x-1 mt-0.5">
                  <input
                    type="number"
                    disabled={isSigned}
                    value={vitals.heart_rate || ''}
                    onChange={(e) => setVitals({ ...vitals, heart_rate: Number(e.target.value) })}
                    className="w-14 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-bold text-center"
                  />
                  <span className="text-[10px] text-slate-400">lpm</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Peso</span>
                <div className="flex items-center space-x-1 mt-0.5">
                  <input
                    type="number"
                    step="0.5"
                    disabled={isSigned}
                    value={weight || ''}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-14 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-bold text-center"
                  />
                  <span className="text-[10px] text-slate-400">kg</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Talla</span>
                <div className="flex items-center space-x-1 mt-0.5">
                  <input
                    type="number"
                    disabled={isSigned}
                    value={height || ''}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-14 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-bold text-center"
                  />
                  <span className="text-[10px] text-slate-400">cm</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">IMC</span>
                <div className="mt-0.5">
                  <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                    {bmi ? `${bmi} kg/m²` : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. ESTUDIOS COMPLEMENTARIOS (Laboratorio cronológico) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Activity className="w-4 h-4 text-purple-600" />
              <span>Estudios Complementarios (Laboratorio e Imágenes)</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Laboratorio por Fechas
              </label>
              <textarea
                rows={4}
                disabled={isSigned}
                value={complementaryStudies}
                onChange={(e) => setComplementaryStudies(e.target.value)}
                placeholder="21/09/26: ferritina 219 gluc 0.88 hgb a 1c 5.70 feremia 22 transferrina 174 % sat transferrina 13 fosfor 2.53 na 129 k 4.5 cl 92 alb 3.80 prot tot 7.06&#10;24/08/26: hto 35 % hgb 11.42 gb 10230 plaq 235.200 vsg 26 tp 101 kptt 23 gluc 0.84 ur 0.51 cr 7.44 calcemia 8.84 na 131 k 4.8..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
              />
            </div>
          </div>

          {/* 4. PLAN TERAPÉUTICO (Muestra PDF) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>Plan Terapéutico y Conducta Médica</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Plan (Indicaciones, Nutrición, Kinesiología, Fármacos)
              </label>
              <textarea
                rows={3}
                disabled={isSigned}
                value={soap.treatment_plan}
                onChange={(e) => setSoap({ ...soap, treatment_plan: e.target.value })}
                placeholder="Solicito alimentación enteral Ensure 800 mg polvo x 3 latas&#10;Kinesiología motora 2 veces x semana&#10;Continuar medicación habitual..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:opacity-75"
              />
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Conforme a la Ley 27.706 de Historia Clínica Electrónica</span>
            </div>

            <div className="flex items-center space-x-2.5 self-end sm:self-auto">
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
                    <span>Firmar Historia Clínica</span>
                  </button>
                </>
              )}

              {currentEncounter && (
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </button>
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
