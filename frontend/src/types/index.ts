export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN' | 'PATIENT';
  phone_number?: string;
  professional_profile?: {
    national_license: string;
    provincial_license: string;
    specialty: string;
    digital_signature_stamp: string;
  };
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  document_type: string;
  document_number: string;
  birth_date: string;
  age: number;
  gender: 'F' | 'M' | 'X';
  blood_type: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  health_insurance_name: string;
  health_insurance_number: string;
  observations: string;
  created_at: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  duration_minutes: number;
  color_hex: string;
  description: string;
}

export interface Appointment {
  id: string;
  patient: string;
  patient_details?: Patient;
  doctor: string;
  doctor_details?: User;
  appointment_type?: string;
  appointment_type_details?: AppointmentType;
  scheduled_datetime: string;
  end_datetime?: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'WAITING_ROOM' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  reason: string;
  notes: string;
  check_in_details?: {
    arrival_time: string;
    called_to_office_time?: string;
  };
}

export interface VitalSigns {
  id?: string;
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  temperature_c?: number;
  oxygen_saturation?: number;
  blood_glucose?: number;
  pain_scale?: number;
  recorded_at?: string;
}

export interface Anthropometry {
  id?: string;
  weight_kg?: number;
  height_cm?: number;
  bmi?: number;
  waist_circumference_cm?: number;
  nutritional_status?: string;
}

export interface PhysicalExamination {
  id?: string;
  general_appearance?: string;
  head_and_neck?: string;
  respiratory_system?: string;
  cardiovascular_system?: string;
  abdomen?: string;
  neurological_system?: string;
  extremities_and_skin?: string;
}

export interface ClinicalDiagnosis {
  id?: string;
  cie10_code: string;
  description: string;
  is_primary: boolean;
  is_presumptive: boolean;
}

export interface ClinicalEvolutionNote {
  id?: string;
  subjective: string;
  objective: string;
  assessment: string;
  treatment_plan: string;
  requested_studies?: string;
  alarm_signs?: string;
  next_control?: string;
}

export interface ClinicalNoteVersion {
  id: string;
  version_number: number;
  amendment_reason: string;
  amended_by_name: string;
  created_at: string;
}

export interface ClinicalEncounter {
  id: string;
  patient: string;
  patient_details?: Patient;
  doctor: string;
  doctor_details?: User;
  encounter_date: string;
  reason_for_consultation: string;
  current_illness: string;
  status: 'DRAFT' | 'SIGNED' | 'AMENDED';
  signed_at?: string;
  signature_hash?: string;
  vital_signs?: VitalSigns;
  anthropometry?: Anthropometry;
  physical_examination?: PhysicalExamination;
  evolution_note?: ClinicalEvolutionNote;
  diagnoses?: ClinicalDiagnosis[];
  versions?: ClinicalNoteVersion[];
  created_at: string;
}

export interface PatientCondition {
  id: string;
  name: string;
  diagnosis_date?: string;
  is_active: boolean;
  notes: string;
}

export interface PatientAllergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
}

export interface PatientMedication {
  id: string;
  drug_name: string;
  dosage: string;
  indication: string;
  is_active: boolean;
}

export interface PrescriptionItem {
  id?: string;
  medication_name: string;
  concentration: string;
  form: string;
  dosage_instructions: string;
  quantity: string;
}

export interface Prescription {
  id: string;
  patient: string;
  patient_details?: Patient;
  doctor: string;
  doctor_details?: User;
  issue_date: string;
  diagnosis: string;
  general_instructions: string;
  validity_days: number;
  security_token: string;
  items: PrescriptionItem[];
}

export interface StudyOrder {
  id: string;
  patient: string;
  patient_details?: Patient;
  doctor: string;
  doctor_details?: User;
  category: 'LAB' | 'XRAY' | 'US' | 'CT' | 'MRI' | 'CARDIO' | 'ENDO' | 'OTHER';
  study_name: string;
  clinical_indication: string;
  is_urgent: boolean;
  issue_date: string;
}

export interface AuditEvent {
  id: string;
  user_email: string;
  action: string;
  action_display: string;
  resource_type: string;
  resource_id: string;
  details: string;
  ip_address: string;
  timestamp: string;
  checksum: string;
}
