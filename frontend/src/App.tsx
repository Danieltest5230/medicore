import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { LoginView } from './modules/auth/LoginView';
import { AgendaView } from './modules/agenda/AgendaView';
import { PatientListView } from './modules/patients/PatientListView';
import { ClinicalConsultationView } from './modules/clinical/ClinicalConsultationView';
import { PrescriptionsView } from './modules/documents/PrescriptionsView';
import { AuditView } from './modules/audit/AuditView';
import { User, Patient } from './types';
import { api } from './services/api';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('medicore_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('agenda');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleAuthChange = () => {
      const saved = localStorage.getItem('medicore_user');
      setCurrentUser(saved ? JSON.parse(saved) : null);
    };

    window.addEventListener('medicore-auth-change', handleAuthChange);
    return () => window.removeEventListener('medicore-auth-change', handleAuthChange);
  }, []);

  const handleLogout = () => {
    api.logout();
  };

  const handleStartConsultation = (patient: Patient, appointmentId?: string) => {
    setSelectedPatient(patient);
    setActiveAppointmentId(appointmentId);
    setActiveTab('clinical');
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={() => setActiveTab('agenda')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} userRole={currentUser.role} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'agenda' && (
              <AgendaView
                onStartConsultation={handleStartConsultation}
                userRole={currentUser.role}
              />
            )}

            {activeTab === 'patients' && (
              <PatientListView
                onSelectPatient={handleSelectPatient}
                onStartConsultation={handleStartConsultation}
              />
            )}

            {activeTab === 'clinical' && (
              <ClinicalConsultationView
                patient={selectedPatient}
                appointmentId={activeAppointmentId}
                onFinish={() => setActiveTab('agenda')}
              />
            )}

            {activeTab === 'documents' && (
              <PrescriptionsView currentPatient={selectedPatient} />
            )}

            {activeTab === 'audit' && (
              <AuditView />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
