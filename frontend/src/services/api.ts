import axios from 'axios';
import {
  User, Patient, Appointment, ClinicalEncounter,
  PatientCondition, PatientAllergy, PatientMedication,
  Prescription, StudyOrder, AuditEvent
} from '../types';

export const getApiBaseUrl = (): string => {
  const custom = localStorage.getItem('medicore_api_base_url');
  if (custom) return custom.replace(/\/+$/, '');
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  return '/api';
};

export const setApiBaseUrl = (url: string) => {
  const clean = url.trim().replace(/\/+$/, '');
  if (!clean || clean === '/api') {
    localStorage.removeItem('medicore_api_base_url');
  } else {
    localStorage.setItem('medicore_api_base_url', clean);
  }
  apiClient.defaults.baseURL = getApiBaseUrl();
  window.dispatchEvent(new CustomEvent('medicore-server-changed', { detail: getApiBaseUrl() }));
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token and dynamic baseURL
apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = localStorage.getItem('medicore_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('medicore_token');
      localStorage.removeItem('medicore_user');
      window.dispatchEvent(new Event('medicore-auth-change'));
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<{ access: string; refresh: string; user: User }>('/auth/login/', credentials);
    localStorage.setItem('medicore_token', res.data.access);
    localStorage.setItem('medicore_user', JSON.stringify(res.data.user));
    window.dispatchEvent(new Event('medicore-auth-change'));
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('medicore_token');
    localStorage.removeItem('medicore_user');
    window.dispatchEvent(new Event('medicore-auth-change'));
  },
  getCurrentUser: async () => {
    const res = await apiClient.get<User>('/auth/me/');
    return res.data;
  },
  updateProfile: async (data: Partial<User> | FormData) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const res = await apiClient.patch<User>('/auth/me/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    const current = localStorage.getItem('medicore_user');
    const parsed = current ? JSON.parse(current) : {};
    const updated = { ...parsed, ...res.data };
    localStorage.setItem('medicore_user', JSON.stringify(updated));
    window.dispatchEvent(new Event('medicore-auth-change'));
    return res.data;
  },
  updateThemePreference: async (theme: string) => {
    localStorage.setItem('medicore_theme', theme);
    window.dispatchEvent(new CustomEvent('medicore-theme-change', { detail: theme }));
    try {
      const res = await apiClient.patch<User>('/auth/me/', { theme_preference: theme });
      const current = localStorage.getItem('medicore_user');
      if (current) {
        const parsed = JSON.parse(current);
        localStorage.setItem('medicore_user', JSON.stringify({ ...parsed, theme_preference: theme }));
      }
      return res.data;
    } catch {
      return null;
    }
  },

  // Patients
  getPatients: async (search?: string) => {
    const res = await apiClient.get<{ results: Patient[] } | Patient[]>('/patients/', {
      params: search ? { search } : {},
    });
    return Array.isArray(res.data) ? res.data : res.data.results;
  },
  getPatient: async (id: string) => {
    const res = await apiClient.get<Patient>(`/patients/${id}/`);
    return res.data;
  },
  createPatient: async (data: Partial<Patient>) => {
    const res = await apiClient.post<Patient>('/patients/', data);
    return res.data;
  },
  updatePatient: async (id: string, data: Partial<Patient>) => {
    const res = await apiClient.patch<Patient>(`/patients/${id}/`, data);
    return res.data;
  },

  // Appointments / Agenda
  getAppointments: async (params?: { date?: string; status?: string; doctor_id?: string }) => {
    const res = await apiClient.get<{ results: Appointment[] } | Appointment[]>('/appointments/', { params });
    return Array.isArray(res.data) ? res.data : res.data.results;
  },
  checkInAppointment: async (id: string) => {
    const res = await apiClient.post(`/appointments/${id}/check-in/`);
    return res.data;
  },
  callPatient: async (id: string) => {
    const res = await apiClient.post(`/appointments/${id}/call/`);
    return res.data;
  },
  updateAppointmentStatus: async (id: string, status: string) => {
    const res = await apiClient.patch<Appointment>(`/appointments/${id}/`, { status });
    return res.data;
  },

  // Clinical Records (Clínica Médica)
  getClinicalEncounters: async (patientId?: string) => {
    const res = await apiClient.get<{ results: ClinicalEncounter[] } | ClinicalEncounter[]>('/clinical/encounters/', {
      params: patientId ? { patient_id: patientId } : {},
    });
    return Array.isArray(res.data) ? res.data : res.data.results;
  },
  getClinicalEncounter: async (id: string) => {
    const res = await apiClient.get<ClinicalEncounter>(`/clinical/encounters/${id}/`);
    return res.data;
  },
  createClinicalEncounter: async (data: any) => {
    const res = await apiClient.post<ClinicalEncounter>('/clinical/encounters/', data);
    return res.data;
  },
  updateClinicalEncounter: async (id: string, data: any) => {
    const res = await apiClient.put<ClinicalEncounter>(`/clinical/encounters/${id}/`, data);
    return res.data;
  },
  signClinicalEncounter: async (id: string) => {
    const res = await apiClient.post<ClinicalEncounter>(`/clinical/encounters/${id}/sign/`);
    return res.data;
  },
  downloadClinicalHistoryPdf: async (id: string, patientDoc: string) => {
    const res = await apiClient.get(`/clinical/encounters/${id}/pdf/`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Historia_Clinica_${patientDoc}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
  openClinicalHistoryPdf: async (id: string) => {
    const res = await apiClient.get(`/clinical/encounters/${id}/pdf/`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  },
  amendClinicalEncounter: async (id: string, amendment_reason: string) => {
    const res = await apiClient.post<ClinicalEncounter>(`/clinical/encounters/${id}/amend/`, { amendment_reason });
    return res.data;
  },
  getPatientEvolutionHistory: async (patientId: string) => {
    const res = await apiClient.get<any[]>(`/clinical/patients/${patientId}/evolution/`);
    return res.data;
  },
  getPatientConditions: async (patientId: string) => {
    const res = await apiClient.get<{ results: PatientCondition[] } | PatientCondition[]>('/clinical/conditions/', {
      params: { patient_id: patientId },
    });
    return Array.isArray(res.data) ? res.data : res.data.results;
  },
  getPatientAllergies: async (patientId: string) => {
    const res = await apiClient.get<{ results: PatientAllergy[] } | PatientAllergy[]>('/clinical/allergies/', {
      params: { patient_id: patientId },
    });
    return Array.isArray(res.data) ? res.data : res.data.results;
  },
  getPatientMedications: async (patientId: string) => {
    const res = await apiClient.get<{ results: PatientMedication[] } | PatientMedication[]>('/clinical/medications/', {
      params: { patient_id: patientId },
    });
    return Array.isArray(res.data) ? res.data : res.data.results;
  },

  // Documents
  getPrescriptions: async (patientId?: string) => {
    const res = await apiClient.get<{ results: Prescription[] } | Prescription[]>('/documents/prescriptions/', {
      params: patientId ? { patient_id: patientId } : {},
    });
    return Array.isArray(res.data) ? res.data : res.data.results;
  },
  createPrescription: async (data: any) => {
    const res = await apiClient.post<Prescription>('/documents/prescriptions/', data);
    return res.data;
  },
  getStudyOrders: async (patientId?: string) => {
    const res = await apiClient.get<{ results: StudyOrder[] } | StudyOrder[]>('/documents/study-orders/', {
      params: patientId ? { patient_id: patientId } : {},
    });
    return Array.isArray(res.data) ? res.data : res.data.results;
  },
  createStudyOrder: async (data: any) => {
    const res = await apiClient.post<StudyOrder>('/documents/study-orders/', data);
    return res.data;
  },

  // Audit
  getAuditEvents: async () => {
    const res = await apiClient.get<{ results: AuditEvent[] } | AuditEvent[]>('/audit/events/');
    return Array.isArray(res.data) ? res.data : res.data.results;
  },

  // Server configuration
  getApiBaseUrl,
  setApiBaseUrl,
};
