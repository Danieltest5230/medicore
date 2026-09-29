from datetime import date, time, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User, ProfessionalProfile
from apps.patients.models import Patient
from apps.appointments.models import AppointmentType, DoctorSchedule, Appointment, CheckIn
from apps.clinical_records.models import (
    ClinicalEncounter, VitalSigns, Anthropometry, PhysicalExamination,
    ClinicalDiagnosis, ClinicalEvolutionNote, PatientCondition, PatientAllergy, PatientMedication
)
from apps.billing.models import Payment


class Command(BaseCommand):
    help = 'Seeds initial test data for MEDICORE (Clínica Médica)'

    def handle(self, *args, **options):
        self.stdout.write('Iniciando carga de datos iniciales...')

        # 1. Crear Administrador
        admin_user, _ = User.objects.get_or_create(
            email='admin@medicore.ar',
            defaults={
                'first_name': 'Administrador',
                'last_name': 'Sistema',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('AdminPassword123!')
        admin_user.save()

        # 2. Crear Médico Clínico
        doctor_user, _ = User.objects.get_or_create(
            email='medico@medicore.ar',
            defaults={
                'first_name': 'Daniel',
                'last_name': 'Cairel',
                'role': User.Role.DOCTOR,
                'is_staff': True,
                'phone_number': '+54 9 376 4123456',
            }
        )
        doctor_user.set_password('AdminPassword123!')
        doctor_user.save()

        prof_profile, _ = ProfessionalProfile.objects.get_or_create(
            user=doctor_user,
            defaults={
                'national_license': '145892',
                'provincial_license': 'MP-6842',
                'specialty': 'Clínica Médica',
                'digital_signature_stamp': 'Dr. Daniel Cairel - Especialista en Medicina Interna y Clínica Médica - MP 6842',
            }
        )

        # 3. Crear Secretaria de Recepción
        receptionist_user, _ = User.objects.get_or_create(
            email='recepcion@medicore.ar',
            defaults={
                'first_name': 'Laura',
                'last_name': 'Gómez',
                'role': User.Role.RECEPTIONIST,
                'is_staff': False,
                'phone_number': '+54 9 376 4987654',
            }
        )
        receptionist_user.set_password('AdminPassword123!')
        receptionist_user.save()

        # 4. Tipos de turnos
        t_primera, _ = AppointmentType.objects.get_or_create(
            name='Primera Consulta Clínica',
            defaults={'duration_minutes': 45, 'color_hex': '#2563EB', 'description': 'Evaluación integral, apertura de historia clínica y anamnesis completa'}
        )
        t_control, _ = AppointmentType.objects.get_or_create(
            name='Control Periódico de Clínica Médica',
            defaults={'duration_minutes': 30, 'color_hex': '#10B981', 'description': 'Seguimiento de patologías crónicas, ajuste de medicación'}
        )
        t_estudios, _ = AppointmentType.objects.get_or_create(
            name='Lectura de Estudios / Laboratorio',
            defaults={'duration_minutes': 20, 'color_hex': '#8B5CF6', 'description': 'Revisión de resultados bioquímicos, imágenes y plan terapéutico'}
        )
        t_urgencia, _ = AppointmentType.objects.get_or_create(
            name='Sobreturno / Urgencia Menor',
            defaults={'duration_minutes': 20, 'color_hex': '#EF4444', 'description': 'Cuadro agudo sin compromiso vital'}
        )

        # 5. Horarios de atención del médico (Lunes a Viernes de 08:30 a 13:00)
        for day in range(5):
            DoctorSchedule.objects.get_or_create(
                doctor=doctor_user,
                day_of_week=day,
                defaults={
                    'start_time': time(8, 30),
                    'end_time': time(13, 0),
                    'slot_interval_minutes': 30,
                    'is_active': True,
                }
            )

        # 6. Pacientes de prueba
        p1, _ = Patient.objects.get_or_create(
            document_number='28456123',
            defaults={
                'first_name': 'Carlos Alberto',
                'last_name': 'Benítez',
                'document_type': Patient.DocumentType.DNI,
                'birth_date': date(1972, 5, 14),
                'gender': Patient.Gender.MALE,
                'blood_type': '0+',
                'phone': '+54 9 376 4501122',
                'email': 'carlos.benitez@ejemplo.com',
                'address': 'Av. Corrientes 1420',
                'city': 'Posadas',
                'health_insurance_name': 'OSDE 210',
                'health_insurance_number': '12-984512-0',
                'emergency_contact_name': 'Silvia Benítez (Esposa)',
                'emergency_contact_phone': '+54 9 376 4501123',
            }
        )

        p2, _ = Patient.objects.get_or_create(
            document_number='34112890',
            defaults={
                'first_name': 'Mariana Inés',
                'last_name': 'Ríos',
                'document_type': Patient.DocumentType.DNI,
                'birth_date': date(1988, 11, 3),
                'gender': Patient.Gender.FEMALE,
                'blood_type': 'A+',
                'phone': '+54 9 376 4882233',
                'email': 'mariana.rios@ejemplo.com',
                'address': 'Calle Junín 1890',
                'city': 'Posadas',
                'health_insurance_name': 'Swiss Medical',
                'health_insurance_number': 'SM-778841',
                'emergency_contact_name': 'Lucas Ríos (Hermano)',
                'emergency_contact_phone': '+54 9 376 4882234',
            }
        )

        p3, _ = Patient.objects.get_or_create(
            document_number='17204918',
            defaults={
                'first_name': 'Héctor Ramón',
                'last_name': 'Villalba',
                'document_type': Patient.DocumentType.DNI,
                'birth_date': date(1955, 3, 21),
                'gender': Patient.Gender.MALE,
                'blood_type': 'B+',
                'phone': '+54 9 376 4334455',
                'email': 'hector.villalba@ejemplo.com',
                'address': 'Bolívar 830',
                'city': 'Posadas',
                'health_insurance_name': 'Particular',
                'emergency_contact_name': 'Elena Villalba (Hija)',
                'emergency_contact_phone': '+54 9 376 4334456',
            }
        )

        # 7. Antecedentes y alergias de pacientes
        PatientCondition.objects.get_or_create(
            patient=p1,
            name='Hipertensión Arterial Primaria',
            defaults={'diagnosis_date': date(2018, 6, 1), 'is_active': True, 'notes': 'Buen control con inhibidor ECA'}
        )
        PatientCondition.objects.get_or_create(
            patient=p1,
            name='Dislipidemia mixta',
            defaults={'diagnosis_date': date(2021, 2, 10), 'is_active': True, 'notes': 'Tratamiento con Rosuvastatina'}
        )
        PatientAllergy.objects.get_or_create(
            patient=p1,
            allergen='Penicilina',
            defaults={'reaction': 'Exantema cutáneo maculopapular', 'severity': PatientAllergy.Severity.MODERATE}
        )
        PatientMedication.objects.get_or_create(
            patient=p1,
            drug_name='Enalapril',
            defaults={'dosage': '10 mg cada 12 hs vía oral', 'indication': 'Hipertensión Arterial', 'is_active': True}
        )
        PatientMedication.objects.get_or_create(
            patient=p1,
            drug_name='Rosuvastatina',
            defaults={'dosage': '10 mg por la noche', 'indication': 'Dislipidemia', 'is_active': True}
        )

        # 8. Turnos para el día de hoy
        today = timezone.localdate()
        t1_time = timezone.make_aware(timezone.datetime.combine(today, time(9, 0)))
        t2_time = timezone.make_aware(timezone.datetime.combine(today, time(9, 30)))
        t3_time = timezone.make_aware(timezone.datetime.combine(today, time(10, 15)))

        appt1, _ = Appointment.objects.get_or_create(
            patient=p1,
            doctor=doctor_user,
            scheduled_datetime=t1_time,
            defaults={
                'appointment_type': t_control,
                'status': Appointment.Status.IN_CONSULTATION,
                'reason': 'Control evolutivo de presión arterial y ajuste de laboratorio',
            }
        )
        CheckIn.objects.get_or_create(appointment=appt1, defaults={'arrival_time': t1_time - timedelta(minutes=15)})

        appt2, _ = Appointment.objects.get_or_create(
            patient=p2,
            doctor=doctor_user,
            scheduled_datetime=t2_time,
            defaults={
                'appointment_type': t_estudios,
                'status': Appointment.Status.WAITING_ROOM,
                'reason': 'Lectura de curva de glucemia e insulina',
            }
        )
        CheckIn.objects.get_or_create(appointment=appt2, defaults={'arrival_time': t2_time - timedelta(minutes=5)})

        appt3, _ = Appointment.objects.get_or_create(
            patient=p3,
            doctor=doctor_user,
            scheduled_datetime=t3_time,
            defaults={
                'appointment_type': t_primera,
                'status': Appointment.Status.CONFIRMED,
                'reason': 'Chequeo clínico general anual',
            }
        )

        # 9. Encuentro clínico previo para Carlos Benítez (Firmado, Ley 27.706)
        enc_prev, created = ClinicalEncounter.objects.get_or_create(
            patient=p1,
            doctor=doctor_user,
            encounter_date=timezone.make_aware(timezone.datetime.combine(today - timedelta(days=30), time(10, 0))),
            defaults={
                'reason_for_consultation': 'Control de tensión arterial y cefalea occipital esporádica',
                'current_illness': 'Refiere registros domiciliarios de PA 145/95 mmHg en horas de la tarde tras jornadas laborales de estrés. No refiere dolor precordial, disnea ni escotomas.',
            }
        )
        if created:
            VitalSigns.objects.create(
                encounter=enc_prev,
                systolic_bp=142,
                diastolic_bp=92,
                heart_rate=78,
                respiratory_rate=16,
                temperature_c=36.4,
                oxygen_saturation=98,
                blood_glucose=95
            )
            Anthropometry.objects.create(
                encounter=enc_prev,
                weight_kg=84.50,
                height_cm=176.0,
                waist_circumference_cm=98.0
            )
            PhysicalExamination.objects.create(
                encounter=enc_prev,
                general_appearance='Lúcido, orientado témporo-espacialmente. Normohidratado, afebril.',
                head_and_neck='Pulsos carotídeos simétricos sin soplos. Tiroides no palpable. No ingurgitación yugular.',
                respiratory_system='Buena entrada de aire bilateral, murmullo vesicular conservado, sin ruidos agregados.',
                cardiovascular_system='R1-R2 normofonéticos en 4 focos. Silencios libres. Sin edemas periféricos.',
                abdomen='Blando, depresible, indoloro a la palpación superficial y profunda. Ruidos hidroaéreos presentes.',
                neurological_system='Pares craneales conservados. Reflejos osteotendinosos simétricos. Sin foco neurológico.',
                extremities_and_skin='Piel tibia, pulsos periféricos distales presentes bilaterales.'
            )
            ClinicalDiagnosis.objects.create(
                encounter=enc_prev,
                cie10_code='I10',
                description='Hipertensión esencial (primaria) con control subóptimo',
                is_primary=True,
                is_presumptive=False
            )
            ClinicalEvolutionNote.objects.create(
                encounter=enc_prev,
                subjective='Paciente masculino de 54 años con antecedente de HTA refiere registros tensionales elevados vespertinos.',
                objective='PA 142/92 mmHg en reposo 10 min. Resto de examen físico dentro de límites normales.',
                assessment='HTA grado 1 con falta de adherencia al plan higiénico-dietético hiposódico.',
                treatment_plan='Se reitera pauta estricta de restricción de sodio en las comidas. Se ajusta Enalapril a 10 mg c/12 hs. Actividad aeróbica moderada 30 min diarios.',
                requested_studies='Laboratorio: Hemograma, ionograma plasmático, urea, creatinina, ácido úrico, perfil lipídico completo y microalbuminuria.',
                alarm_signs='Cefalea intensa refractaria, dolor opresivo de pecho, visión borrosa o disnea.',
                next_control='Control en 30 días con cuaderno de MAPA casero y estudios de sangre.'
            )
            enc_prev.sign_encounter(doctor_user)

        # 10. Pago inicial de consulta particular
        Payment.objects.get_or_create(
            patient=p3,
            concept='Consulta Médica de Clínica Médica (Particular)',
            defaults={
                'amount': 25000.00,
                'payment_method': Payment.PaymentMethod.TRANSFER,
                'receipt_number': 'REC-2026-0001',
                'status': Payment.PaymentStatus.COMPLETED
            }
        )

        self.stdout.write(self.style.SUCCESS('¡Datos iniciales de MEDICORE para Clínica Médica cargados exitosamente!'))
        self.stdout.write(self.style.SUCCESS('Usuario Médico: medico@medicore.ar / Clave: AdminPassword123!'))
        self.stdout.write(self.style.SUCCESS('Usuario Recepción: recepcion@medicore.ar / Clave: AdminPassword123!'))
        self.stdout.write(self.style.SUCCESS('Usuario Administrador: admin@medicore.ar / Clave: AdminPassword123!'))
