import React, { useState, useRef } from 'react';
import { X, User as UserIcon, Camera, Check, Sparkles, Shield, Stethoscope, Phone, Mail, Award, Save, Loader2, Upload } from 'lucide-react';
import { User, ThemeId } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { api } from '../services/api';

interface UserProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (updatedUser: User) => void;
}

const PRESET_AVATARS = [
  {
    id: 'avatar-dr-m',
    name: 'Dr. Clínico (Masculino)',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-dr-f',
    name: 'Dra. Clínica (Femenino)',
    url: 'https://images.unsplash.com/photo-1594824813511-20a8453e8d13?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-dr-senior',
    name: 'Especialista Senior',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-nurse',
    name: 'Equipo Asistencial',
    url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&auto=format&fit=crop&q=80',
  },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdated,
}) => {
  const { theme, setTheme, themes, themeConfig } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'photo' | 'theme'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState(user.first_name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number || '');
  const [provincialLicense, setProvincialLicense] = useState(
    user.professional_profile?.provincial_license || ''
  );
  const [nationalLicense, setNationalLicense] = useState(
    user.professional_profile?.national_license || ''
  );
  const [specialty, setSpecialty] = useState(
    user.professional_profile?.specialty || 'Clínica Médica'
  );
  const [digitalStamp, setDigitalStamp] = useState(
    user.professional_profile?.digital_signature_stamp || ''
  );

  // Photo state
  const [previewPhoto, setPreviewPhoto] = useState<string>(
    user.avatar || user.avatar_url || ''
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('La imagen no debe superar los 5MB.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (url: string) => {
    setSelectedFile(null);
    setPreviewPhoto(url);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      let updatedUser: User;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('phone_number', phoneNumber);
        formData.append('avatar', selectedFile);
        if (user.role === 'DOCTOR') {
          formData.append('provincial_license', provincialLicense);
          formData.append('national_license', nationalLicense);
          formData.append('specialty', specialty);
          formData.append('digital_signature_stamp', digitalStamp);
        }
        updatedUser = await api.updateProfile(formData);
      } else {
        const payload: Record<string, unknown> = {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          avatar_url: previewPhoto,
        };
        if (user.role === 'DOCTOR') {
          payload.provincial_license = provincialLicense;
          payload.national_license = nationalLicense;
          payload.specialty = specialty;
          payload.digital_signature_stamp = digitalStamp;
        }
        updatedUser = await api.updateProfile(payload);
      }

      onUserUpdated(updatedUser);
      setSuccessMessage('¡Datos y perfil actualizados exitosamente!');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: unknown) {
      console.error('Error saving profile:', err);
      setErrorMessage('Error al actualizar el perfil. Verifique su conexión.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectTheme = async (themeId: ThemeId) => {
    await setTheme(themeId);
    setSuccessMessage(`Tema '${themeConfig.name}' activado para su sesión.`);
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-zoom-in my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#071a2f] to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-slate-800 border-2 border-cyan-400 shadow-md flex items-center justify-center text-slate-300">
                {previewPhoto ? (
                  <img
                    src={previewPhoto}
                    alt={user.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-7 h-7 text-cyan-400" />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Mi Perfil & Preferencias
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {user.role === 'DOCTOR' ? 'Médico Clínico' : user.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-cyan-600 text-cyan-700 bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Datos Personales</span>
          </button>

          <button
            onClick={() => setActiveTab('photo')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'photo'
                ? 'border-cyan-600 text-cyan-700 bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Fotografía & Avatar</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'theme'
                ? 'border-cyan-600 text-cyan-700 bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Estilo de Sesión</span>
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-center space-x-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm flex items-center space-x-2 animate-fade-in">
            <X className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: Profile & Professional Data */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    placeholder="Ej. Daniel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                  placeholder="Ej. Cairel"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teléfono / Móvil de Contacto
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    placeholder="+54 9 376 4123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo Electrónico (Identificador)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 bg-slate-100 text-slate-500 rounded-xl cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Doctor specific fields */}
            {user.role === 'DOCTOR' && (
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center space-x-2 text-sky-800">
                  <Stethoscope className="w-4 h-4 text-cyan-600" />
                  <h3 className="text-sm font-bold">Datos Profesionales & Matrículas Médicas</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Matrícula Provincial (MP)
                    </label>
                    <input
                      type="text"
                      value={provincialLicense}
                      onChange={(e) => setProvincialLicense(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none font-mono"
                      placeholder="Ej. MP 05064 / MP 6842"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Matrícula Nacional (MN)
                    </label>
                    <input
                      type="text"
                      value={nationalLicense}
                      onChange={(e) => setNationalLicense(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none font-mono"
                      placeholder="Ej. MN 142055"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Especialidad Principal
                    </label>
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                      placeholder="Clínica Médica / Medicina Interna"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Sello Profesional para Recetas & Certificados
                    </label>
                    <input
                      type="text"
                      value={digitalStamp}
                      onChange={(e) => setDigitalStamp(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                      placeholder="Dr/a. Nombre y Apellido - Especialista en Clínica Médica"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 text-white font-medium text-sm shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando cambios...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Datos Personales</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Photo / Avatar */}
        {activeTab === 'photo' && (
          <div className="p-5 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-200 border-2 border-cyan-500 shadow-md flex items-center justify-center text-slate-500 shrink-0">
                {previewPhoto ? (
                  <img
                    src={previewPhoto}
                    alt="Previsualización"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-slate-400" />
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <h3 className="text-sm font-bold text-slate-800">
                  Fotografía Oficial del Profesional
                </h3>
                <p className="text-xs text-slate-500">
                  Suba una fotografía nítida o elija un avatar predefinido para personalizar su sesión y sus firmas clínicas en MEDICORE.
                </p>

                <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir desde dispositivo</span>
                  </button>

                  {previewPhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewPhoto('');
                        setSelectedFile(null);
                      }}
                      className="px-3 py-1.5 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors"
                    >
                      Quitar foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Presets */}
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                O seleccione un avatar clínico predeterminado:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = previewPhoto === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`flex flex-col items-center p-3 rounded-2xl border transition-all text-center group ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50/60 ring-2 ring-cyan-400'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-300 mb-2 relative">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-cyan-600/30 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-slate-700">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 text-white font-medium text-sm shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando fotografía...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Aplicar Fotografía</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Themes & Session Style */}
        {activeTab === 'theme' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Selección de Estilo Visual para su Sesión Privada
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Cada profesional puede elegir el entorno gráfico que más se adapte a su comodidad visual durante la jornada clínica. Se guardará de manera permanente en su cuenta.
              </p>
            </div>

            <div className="space-y-3">
              {themes.map((t) => {
                const isCurrent = theme === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTheme(t.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                      isCurrent
                        ? 'border-cyan-600 bg-cyan-50/40 shadow-md ring-1 ring-cyan-400'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      {/* Dots preview */}
                      <div className="flex -space-x-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
                        {t.colors.dotPreview.map((hex, i) => (
                          <span
                            key={i}
                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                            {t.name}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-600 text-white">
                              Activo
                            </span>
                          )}
                          {t.id === 'integrando-cyan' && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                              Estilo Integrando Salud
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{t.tagline}</p>
                      </div>
                    </div>

                    <div className="shrink-0 pl-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isCurrent
                            ? 'border-cyan-600 bg-cyan-600 text-white'
                            : 'border-slate-300 group-hover:border-slate-400'
                        }`}
                      >
                        {isCurrent && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-600" />
            <span>Perfil protegido bajo Ley 25.326 de Protección de Datos Personales</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-200 font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
