import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { MobileNavBar } from './components/MobileNavBar';
import { UserProfileModal } from './components/UserProfileModal';
import { LoginView } from './modules/auth/LoginView';
import { AgendaView } from './modules/agenda/AgendaView';
import { PatientListView } from './modules/patients/PatientListView';
import { ClinicalConsultationView } from './modules/clinical/ClinicalConsultationView';
import { PrescriptionsView } from './modules/documents/PrescriptionsView';
import { AuditView } from './modules/audit/AuditView';
import { User, Patient } from './types';
import { api } from './services/api';
import { ThemeProvider } from './theme/ThemeContext';

export function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('medicore_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('agenda');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | undefined>(undefined);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

  const handleUserUpdated = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={() => setActiveTab('agenda')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f8fb] dark:bg-[#070b13] text-slate-800 dark:text-slate-100 transition-colors">
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop / Tablet Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={currentUser.role}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Main Content View with mobile bottom padding */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 transition-colors">
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

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* User Profile, Photo & Theme Modal */}
      {isProfileModalOpen && (
        <UserProfileModal
          user={currentUser}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
}

export function App() {
  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('medicore_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  return (
    <ThemeProvider userThemePreference={currentUser?.theme_preference}>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
