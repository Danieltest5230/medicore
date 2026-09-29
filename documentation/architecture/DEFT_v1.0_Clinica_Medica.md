# MEDICORE - Documento de Especificación Funcional y Técnica (DEFT) v1.0

## Consultorio Exclusivo de Clínica Médica
**Versión:** 1.0  
**Fecha:** Septiembre 2026  
**Estado:** Aprobado para desarrollo e implementación  

---

## 1. Ficha del Proyecto

| Parámetro | Especificación |
|---|---|
| **Nombre del Sistema** | MEDICORE |
| **Tipo de Establecimiento** | Consultorio particular / individual |
| **Especialidad Única** | **Clínica Médica** (Medicina Interna) |
| **Usuarios Simultáneos** | 6 a 20 concurrentes |
| **Plataformas** | Web Administrativa y Médica (PWA) + App Móvil de Pacientes (Android/iOS) |
| **Arquitectura de Software** | Monolito Modular con API REST segura |
| **Backend** | Python 3.14+ / Django & Django REST Framework |
| **Base de Datos** | PostgreSQL (UUIDs, integridad referencial, auditoría inmutable) |
| **Frontend Web** | React 19 + TypeScript + Vite + Tailwind CSS |
| **Mobile (Portal Paciente)** | Flutter / PWA responsive |
| **Tareas Programadas** | Celery + Redis |
| **Almacenamiento de Archivos** | Almacenamiento privado S3 / Local cifrado |
| **Marco Legal Argentino** | Ley 27.706 (HCE), Ley 26.529 (Derechos del Paciente), Ley 25.326 (Protección de Datos Personales), Ley 27.553 (Recetas Electrónicas) |

---

## 2. Alcance y Objetivos

### 2.1. Alcance Incluido (Clínica Médica Exclusiva)
- **Historia Clínica Electrónica Especializada en Clínica Médica**: Anamnesis integral, motivo de consulta, enfermedad actual, antecedentes personales y patológicos, quirúrgicos, tóxicos, familiares y alergias.
- **Examen Físico y Signos Vitales**: Presión arterial (sistólica/diastólica), frecuencia cardíaca, frecuencia respiratoria, temperatura, saturación de O2.
- **Antropometría y Evolución Temporal**: Peso, talla, cálculo automático de Índice de Masa Corporal (IMC), superficie corporal, comparación y gráficas de evolución clínica a lo largo del tiempo.
- **Diagnósticos y Codificación**: Diagnósticos presuntivos y definitivos con compatibilidad para codificación clínica (CIE-10 / CIE-11 / SNOMED CT).
- **Planes Terapéuticos y Prescripciones**: Indicaciones clínicas, medicación farmacológica, dosis, vía de administración, duración, solicitud de estudios de laboratorio e imágenes.
- **Plantillas Clínicas Reutilizables**: Modelos de consulta rápida y evolución frecuente personalizables por el médico.
- **Agenda y Recepción**: Gestión de turnos, sobreturnos, estados de cita (Programado, Confirmado, En Espera, En Consulta, Atendido, Cancelado, Ausente) y check-in en sala de espera.
- **Portal del Paciente**: Consulta de turnos disponibles, reserva de citas, visualización de recetas autorizadas e indicaciones clínicas.
- **Auditoría e Inmutabilidad (Ley 27.706)**: Trazabilidad estricta de cada lectura, creación, modificación y firma de historias clínicas. Versionado inmutable: las notas firmadas no se sobrescriben ni eliminan, se crean anexos de enmienda vinculados.
- **Caja y Cobranzas Básicas**: Registro de consultas, medios de pago (efectivo, transferencia, tarjeta, obras sociales/prepagas) y recibos de atención.

### 2.2. Alcance Excluido
- **Módulo de Oftalmología**: Se excluyen totalmente refracción, agudeza visual, biomicroscopía, presión intraocular (tonometría), fondo de ojo, campimetría, paquimetría y recetas de anteojos.
- **Telemedicina por videollamada interactiva en tiempo real** (postergado para etapa 2).
- **Integraciones LIS (sistemas de laboratorio externo)** vía HL7/FHIR complejas (postergado para etapa 2).

---

## 3. Modelo de Datos y Dominios de la Base de Datos

### Dominio A — Identidad y Organización
- `organizations`: Configuración del consultorio o clínica médica.
- `users`: Usuarios del sistema con hash Argon2/BCrypt y soporte MFA.
- `roles` & `permissions`: RBAC (Médico, Recepción, Administrador, Paciente).
- `professionals`: Ficha del profesional médico (matrícula provincial/nacional, especialidad clínica médica, firma digital/electrónica).
- `patient_profiles`: Perfil de pacientes con datos filiatorios, DNI, fecha de nacimiento, obra social/prepaga, número de afiliado, contacto de emergencia.
- `patient_representatives`: Tutores o representantes legales de pacientes.

### Dominio B — Agenda y Recepción
- `appointment_types`: Primera vez, control clínico, urgencia, lectura de estudios.
- `professional_schedules`: Horarios semanales de atención y duración de turnos.
- `schedule_exceptions`: Feriados, licencias, congresos.
- `appointments`: Turnos asignados con fecha, hora, estado y canal de reserva.
- `appointment_status_history`: Historial de cambios de estado del turno con autor y timestamp.
- `check_ins`: Registro del momento de llegada del paciente a la sala de espera.

### Dominio C — Historia Clínica de Clínica Médica (General)
- `clinical_encounters`: Encuentros o consultas médicas vinculadas al turno y al paciente.
- `clinical_notes`: Nota de evolución médica (SOAP: Subjetivo, Objetivo, Apreciación, Plan).
- `clinical_note_versions`: Versiones inmutables de notas firmadas.
- `vital_signs`: Registro de signos vitales (PA sistólica/diastólica, FC, FR, Temp, SatO2).
- `anthropometry`: Peso (kg), talla (cm), IMC calculado, score de riesgo cardiovascular.
- `patient_conditions`: Problemas crónicos y patologías activas/resueltas.
- `patient_allergies`: Alergias documentadas (fármacos, alimentos, etc.) con nivel de severidad.
- `patient_medications`: Medicación habitual y tratamientos en curso.
- `diagnoses`: Catálogo de diagnósticos clínicos (CIE-10).
- `encounter_diagnoses`: Diagnósticos vinculados a la consulta (principal, secundario, presuntivo/definitivo).
- `treatment_plans`: Plan de indicaciones, cuidados generales y prescripciones.
- `prescriptions`: Recetas de medicamentos generadas en la consulta.
- `study_orders`: Solicitudes de estudios complementarios (laboratorio, radiografía, ecografía, TAC/RMN, electrocardiograma).
- `clinical_templates`: Plantillas de consulta y examen físico frecuente.

### Dominio D — Archivos y Auditoría Legal (Leyes 27.706 y 26.529)
- `file_objects`: Metadatos de archivos adjuntos (estudios aportados, certificados).
- `file_access_grants`: Autorizaciones de acceso temporal seguro a documentos.
- `audit_events`: Trazabilidad inmutable: usuario, IP, acción (`CREATE`, `READ`, `UPDATE`, `SIGN`, `EXPORT`), entidad afectada, payload hash.
- `login_sessions`: Sesiones activas, expiración y revocación remota.

### Dominio E — Administración y Caja
- `invoices_receipts`: Recibos y comprobantes de cobro de consulta.
- `payments`: Pagos recibidos (efectivo, transferencia, tarjeta).
- `cash_registers` & `cash_movements`: Apertura, cierre y movimientos de caja diaria.
- `insurance_plans`: Coberturas médicas y planes aceptados.

---

## 4. Estructura Física del Proyecto

```
MEDICORE/
├── backend/
│   ├── config/              # Configuración Django, settings, urls, wsgi/asgi
│   ├── apps/
│   │   ├── accounts/        # Usuarios, roles, profesionales, autenticación JWT
│   │   ├── patients/        # Pacientes, perfiles, tutores, cobertura
│   │   ├── appointments/    # Agenda médica, turnos, disponibilidad, check-in
│   │   ├── clinical_records/# HCE: Evoluciones, signos vitales, IMC, diagnósticos CIE-10
│   │   ├── documents/       # Prescripciones, órdenes de estudio, certificados
│   │   ├── billing/         # Caja, comprobantes de pago, aranceles
│   │   └── audit/           # Bitácora inmutable de auditoría (Ley 27.706)
│   ├── api/                 # Enrutadores principales y documentación OpenAPI
│   ├── tests/               # Pruebas unitarias e integrales
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── modules/         # Módulos: clinical, patients, agenda, billing, auth
│   │   ├── components/      # UI components (Clean UI, Glassmorphism, Tailwind)
│   │   ├── layouts/         # Layout principal médico y administrativo
│   │   ├── services/        # Clientes API Axios / Fetch con interceptores JWT
│   │   ├── types/           # Interfaces TypeScript estrictas
│   │   └── App.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── infrastructure/
│   ├── docker/              # Dockerfile backend, frontend, docker-compose
│   ├── nginx/               # Configuración Nginx proxy reverso y SSL
│   └── backups/             # Scripts de backup de PostgreSQL cifrados
└── documentation/
    ├── architecture/        # DEFT v1.0 y diagramas
    ├── database/            # Diccionario de datos y scripts DDL
    ├── security/            # Políticas de seguridad y cumplimiento normativo
    └── user_manuals/        # Manuales de usuario (Médico, Recepción)
```

---

## 5. Criterios de Aceptación para Clínica Médica

1. **Seguridad y Confidencialidad**: Ningún usuario sin rol médico puede acceder ni visualizar notas de evolución clínica.
2. **Inmutabilidad de la HCE**: Una nota clínica firmada por el médico no puede ser modificada ni eliminada; cualquier corrección genera una adenda/versión vinculada con autor y timestamp (Ley 27.706).
3. **Cálculo de Parámetros Clínicos**: El sistema calcula automáticamente el IMC a partir del peso y la talla, clasificando el estado nutricional y alertando sobre signos vitales fuera de rango.
4. **Historial y Tendencias**: El médico puede visualizar el histórico de evolución de presión arterial, frecuencia cardíaca, peso e IMC en gráficos temporales claros.
5. **Agendamiento sin Solapamiento**: El sistema impide la reserva concurrente de turnos en el mismo horario para el mismo médico.
6. **Auditoría Integral**: Toda visualización de historia clínica deja registro forense con usuario, fecha, hora, IP y paciente consultado.
