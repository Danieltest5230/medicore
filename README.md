# MEDICORE — Plataforma de Consultorio de Clínica Médica

Sistema integral de gestión clínica y administrativa diseñado **exclusivamente para consultorio de Clínica Médica (Medicina Interna)**, con estricto apego al marco regulatorio argentino en materia de salud digital.

---

## 🏛️ Marco Legal y Normativo de Argentina Integrado

1. **Ley 27.706 (Historia Clínica Electrónica)**:
   - Firma de actuaciones clínicas con hashing criptográfico (SHA-256).
   - Inmutabilidad estricta: los documentos y evoluciones firmadas **nunca se sobrescriben ni eliminan**.
   - Procedimiento de **Enmienda Auditada** con versionado histórico sucesivo.
   - Auditoría legal automática de accesos, lecturas y modificaciones.
2. **Ley 26.529 (Derechos del Paciente)**:
   - Resguardo de la autonomía de la voluntad, confidencialidad y retención documental obligatoria mínima de 10 años.
3. **Ley 25.326 (Protección de Datos Personales / Habeas Data)**:
   - Tratamiento de datos sensibles de salud con control de acceso por roles (RBAC) y cifrado.
4. **Ley 27.553 & Disposición 1/2024 MinSalud (Recetas Electrónicas)**:
   - Emisión de recetas farmacológicas con token único de validación y control de vencimiento.

---

## 🏗️ Arquitectura Técnica

- **Backend**: Python 3.14 / Django 6 & Django REST Framework.
  - Autenticación segura mediante **JWT (JSON Web Tokens)** con SimpleJWT y rotación de tokens.
  - Middleware de auditoría clínica forense (`ClinicalAuditMiddleware`).
  - Base de datos dual: SQLite para desarrollo rápido local / PostgreSQL 16 para producción y Docker.
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS.
  - Interfaz orientada al acto médico (Clean UI, badges de alerta de tensión arterial, cálculo dinámico de IMC, antecedentes clínicos visibles en un clic).
  - Comunicación fluida mediante cliente Axios con interceptores JWT.
- **Infraestructura**: Docker & Docker Compose (PostgreSQL 16, Redis 7, Backend Gunicorn y Frontend Nginx).

---

## 📂 Estructura del Repositorio

```
MEDICORE/
├── backend/
│   ├── config/              # Settings, URLs principales, WSGI/ASGI
│   ├── apps/
│   │   ├── accounts/        # Usuarios, roles (Médico, Recepción, Admin, Paciente) y perfil profesional
│   │   ├── patients/        # Padrón de pacientes, datos filiatorios, obras sociales, tutores
│   │   ├── appointments/    # Agenda médica, turnos, salas de espera, check-in
│   │   ├── clinical_records/# HCE Clínica Médica (SOAP, Signos vitales, IMC, Diagnósticos CIE-10)
│   │   ├── documents/       # Recetas farmacológicas, órdenes de estudio, certificados
│   │   ├── billing/         # Caja diaria, recibos y cobros de consulta
│   │   └── audit/           # Bitácora inmutable de auditoría (Ley 27.706)
│   ├── api/                 # Enrutamiento unificado de endpoints REST
│   └── tests/               # Pruebas automatizadas de sanidad y endpoints
├── frontend/
│   ├── src/
│   │   ├── modules/         # Módulos: auth, agenda, patients, clinical, documents, audit
│   │   ├── components/      # UI components (Header, Sidebar)
│   │   ├── services/        # Cliente API Axios y métodos tipados
│   │   └── types/           # Interfaces TypeScript estrictas
├── infrastructure/
│   ├── docker/              # docker-compose.yml con PostgreSQL y Redis
│   ├── nginx/               # Configuraciones de servidor proxy
│   └── backups/             # Resguardos de base de datos
└── documentation/
    └── architecture/        # DEFT v1.0 (Documento de Especificación Funcional y Técnica)
```

---

## 🚀 Puesta en Marcha Rápida (Entorno Local)

### 1. Iniciar todo en 1 clic (Windows PowerShell)
Ejecute en la raíz del proyecto:
```powershell
.\iniciar_medicore.ps1
```

O ejecútelo manualmente en dos terminales:

### 2. Manual - Backend
```powershell
cd D:\MEDICORE\backend
& .\.venv\Scripts\python.exe manage.py runserver 8000
```

### 3. Manual - Frontend
```powershell
cd D:\MEDICORE\frontend
npm run dev
```
Abra el navegador en: **`http://localhost:5173`**

---

## 🔑 Cuentas de Demostración Configuradas

| Rol | Correo Electrónico | Contraseña |
|---|---|---|
| **Médico Clínico** | `medico@medicore.ar` | `AdminPassword123!` |
| **Recepción / Turnos** | `recepcion@medicore.ar` | `AdminPassword123!` |
| **Administrador** | `admin@medicore.ar` | `AdminPassword123!` |

---

## 🩺 Funcionalidades Clave de Clínica Médica

1. **Gestión de Turnos y Sala de Espera**:
   - Registro de check-in en recepción con horario exacto de llegada.
   - Botón *"Llamar a Consulta"* que traslada al paciente a la estación del médico en tiempo real.
2. **Historia Clínica Especializada (SOAP)**:
   - Registro de anamnesis, motivo y enfermedad actual.
   - Panel de signos vitales (PA sistólica/diastólica, FC, FR, Temp, SatO2, Glucemia).
   - Antropometría con cálculo instantáneo de **IMC** y clasificación automática del estado nutricional.
   - Examen físico segmentado por aparatos (Cardiovascular, Respiratorio, Abdomen, Neurológico).
   - Diagnósticos codificados en **CIE-10** (ej: *I10 Hipertensión Esencial*, *E11 Diabetes Mellitus*).
   - Firma digital inmutable que genera el **hash SHA-256** de integridad legal.
   - Pestaña de **Evolución Histórica** para seguir la curva de tensión arterial y peso en el tiempo.
3. **Prescripción de Medicamentos y Órdenes**:
   - Recetas con dosis, posología y token de seguridad.
   - Solicitudes de laboratorio, radiografías, ecografías y electrocardiogramas.
4. **Auditoría Legal (Ley 27.706)**:
   - Bitácora inmutable con usuario, acción, timestamp, IP y verificación checksum.
