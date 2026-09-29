import uuid
import hashlib
from decimal import Decimal
from django.db import models
from django.utils import timezone
from apps.accounts.models import User
from apps.patients.models import Patient


class ClinicalEncounter(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Borrador / En curso'
        SIGNED = 'SIGNED', 'Firmado / Definitivo'
        AMENDED = 'AMENDED', 'Enmendado / Rectificado'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT, related_name='encounters')
    doctor = models.ForeignKey(User, on_delete=models.PROTECT, related_name='medical_encounters')
    encounter_date = models.DateTimeField('Fecha y Hora de Atención', default=timezone.now)

    # Anamnesis de Clínica Médica
    reason_for_consultation = models.TextField('Motivo de Consulta', help_text='Síntomas principales o motivo de la visita')
    current_illness = models.TextField('Enfermedad Actual', blank=True, help_text='Detalle de la evolución de los síntomas y cronología')

    status = models.CharField('Estado de la Consulta', max_length=20, choices=Status.choices, default=Status.DRAFT)
    signed_at = models.DateTimeField('Fecha y Hora de Firma', null=True, blank=True)
    signature_hash = models.CharField('Hash Criptográfico de Integridad (Ley 27.706)', max_length=64, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Consulta / Encuentro Clínico'
        verbose_name_plural = 'Consultas y Encuentros Clínicos'
        ordering = ['-encounter_date']

    def __str__(self):
        return f"Consulta {self.patient.full_name} - {self.encounter_date.strftime('%d/%m/%Y %H:%M')} (Dr/a. {self.doctor.get_full_name()})"

    def sign_encounter(self, doctor_user):
        """
        Firma inmutable conforme a la Ley 27.706 de Historia Clínica Electrónica.
        Calcula un hash SHA-256 sobre el contenido clínico garantizando integridad.
        """
        if self.status == self.Status.SIGNED:
            raise ValueError('Esta consulta ya fue firmada y no puede sobrescribirse.')
        
        self.doctor = doctor_user
        self.signed_at = timezone.now()
        self.status = self.Status.SIGNED

        # Hash integrity payload
        payload = f"{self.id}:{self.patient_id}:{self.doctor_id}:{self.encounter_date.isoformat()}:{self.reason_for_consultation}:{self.current_illness}"
        self.signature_hash = hashlib.sha256(payload.encode('utf-8')).hexdigest()
        self.save()


class VitalSigns(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    encounter = models.OneToOneField(ClinicalEncounter, on_delete=models.CASCADE, related_name='vital_signs')
    systolic_bp = models.PositiveSmallIntegerField('Presión Arterial Sistólica (mmHg)', null=True, blank=True)
    diastolic_bp = models.PositiveSmallIntegerField('Presión Arterial Diastólica (mmHg)', null=True, blank=True)
    heart_rate = models.PositiveSmallIntegerField('Frecuencia Cardíaca (lpm)', null=True, blank=True)
    respiratory_rate = models.PositiveSmallIntegerField('Frecuencia Respiratoria (rpm)', null=True, blank=True)
    temperature_c = models.DecimalField('Temperatura (°C)', max_digits=4, decimal_places=1, null=True, blank=True)
    oxygen_saturation = models.PositiveSmallIntegerField('Saturación de O2 (%)', null=True, blank=True)
    blood_glucose = models.PositiveSmallIntegerField('Glucemia Capilar (mg/dL)', null=True, blank=True)
    pain_scale = models.PositiveSmallIntegerField('Escala de Dolor EVA (0-10)', null=True, blank=True)
    recorded_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = 'Signos Vitales'
        verbose_name_plural = 'Signos Vitales'

    def __str__(self):
        bp = f"{self.systolic_bp}/{self.diastolic_bp} mmHg" if self.systolic_bp and self.diastolic_bp else "PA: -"
        return f"Signos: {bp}, FC: {self.heart_rate or '-'} lpm, Sat: {self.oxygen_saturation or '-'}%"


class Anthropometry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    encounter = models.OneToOneField(ClinicalEncounter, on_delete=models.CASCADE, related_name='anthropometry')
    weight_kg = models.DecimalField('Peso (kg)', max_digits=5, decimal_places=2, null=True, blank=True)
    height_cm = models.DecimalField('Talla / Altura (cm)', max_digits=5, decimal_places=1, null=True, blank=True)
    bmi = models.DecimalField('Índice de Masa Corporal (IMC)', max_digits=4, decimal_places=1, null=True, blank=True)
    waist_circumference_cm = models.DecimalField('Perímetro Abdominal (cm)', max_digits=5, decimal_places=1, null=True, blank=True)
    nutritional_status = models.CharField('Estado Nutricional', max_length=50, blank=True)

    class Meta:
        verbose_name = 'Antropometría'
        verbose_name_plural = 'Antropometría'

    def save(self, *args, **kwargs):
        # Cálculo automático del IMC y estado nutricional
        if self.weight_kg and self.height_cm and self.height_cm > 0:
            height_m = Decimal(self.height_cm) / Decimal(100)
            calculated_bmi = Decimal(self.weight_kg) / (height_m * height_m)
            self.bmi = round(calculated_bmi, 1)

            if self.bmi < Decimal('18.5'):
                self.nutritional_status = 'Bajo peso'
            elif self.bmi < Decimal('25.0'):
                self.nutritional_status = 'Normopeso'
            elif self.bmi < Decimal('30.0'):
                self.nutritional_status = 'Sobrepeso'
            elif self.bmi < Decimal('35.0'):
                self.nutritional_status = 'Obesidad Grado I'
            elif self.bmi < Decimal('40.0'):
                self.nutritional_status = 'Obesidad Grado II'
            else:
                self.nutritional_status = 'Obesidad Grado III (Mórbida)'
        super().save(*args, **kwargs)


class PhysicalExamination(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    encounter = models.OneToOneField(ClinicalEncounter, on_delete=models.CASCADE, related_name='physical_examination')
    general_appearance = models.TextField('Estado General', blank=True, help_text='Lúcido, orientado, regular/buen estado general')
    head_and_neck = models.TextField('Cabeza y Cuello', blank=True, help_text='Adenopatías, tiroides, pulsos carotídeos, ingurgitación yugular')
    respiratory_system = models.TextField('Aparato Respiratorio', blank=True, help_text='Murmullo vesicular, ruidos agregados')
    cardiovascular_system = models.TextField('Aparato Cardiovascular', blank=True, help_text='R1-R2 normofonéticos, soplos, edemas')
    abdomen = models.TextField('Abdomen', blank=True, help_text='Blando, depresible, no doloroso, visceromegalias')
    neurological_system = models.TextField('Sistema Nervioso', blank=True, help_text='Orientación, fuerza motora, sensibilidad, reflejos')
    extremities_and_skin = models.TextField('Miembros y Piel', blank=True, help_text='Perfusión, várices, lesiones cutáneas')

    class Meta:
        verbose_name = 'Examen Físico'
        verbose_name_plural = 'Exámenes Físicos'


class PatientCondition(models.Model):
    """Antecedentes y enfermedades crónicas del paciente."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='conditions')
    name = models.CharField('Patología / Antecedente', max_length=200, help_text='Ej: Hipertensión Arterial, Diabetes Mellitus tipo 2')
    diagnosis_date = models.DateField('Fecha aproximada de diagnóstico', null=True, blank=True)
    is_active = models.BooleanField('Condición Activa', default=True)
    notes = models.TextField('Observaciones', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Antecedente / Patología Crónica'
        verbose_name_plural = 'Antecedentes y Patologías Crónicas'


class PatientAllergy(models.Model):
    class Severity(models.TextChoices):
        MILD = 'MILD', 'Leve'
        MODERATE = 'MODERATE', 'Moderada'
        SEVERE = 'SEVERE', 'Severa / Anafilaxia'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='allergies')
    allergen = models.CharField('Sustancia / Alérgeno', max_length=150, help_text='Ej: Penicilina, Ibuprofeno, Maní, Látex')
    reaction = models.CharField('Reacción Observada', max_length=200, blank=True, help_text='Ej: Urticaria, Broncoespasmo, Angioedema')
    severity = models.CharField('Severidad', max_length=20, choices=Severity.choices, default=Severity.MODERATE)

    class Meta:
        verbose_name = 'Alergia Documentada'
        verbose_name_plural = 'Alergias Documentadas'


class PatientMedication(models.Model):
    """Medicación habitual del paciente en clínica médica."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='habitual_medications')
    drug_name = models.CharField('Fármaco / Principio Activo', max_length=150)
    dosage = models.CharField('Dosis', max_length=100, help_text='Ej: 10 mg cada 24 hs')
    indication = models.CharField('Indicación / Para qué lo toma', max_length=150, blank=True)
    is_active = models.BooleanField('Tratamiento Activo', default=True)

    class Meta:
        verbose_name = 'Medicación Habitual'
        verbose_name_plural = 'Medicaciones Habituales'


class ClinicalDiagnosis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    encounter = models.ForeignKey(ClinicalEncounter, on_delete=models.CASCADE, related_name='diagnoses')
    cie10_code = models.CharField('Código CIE-10', max_length=20, blank=True, help_text='Ej: I10, E11.9, J06.9')
    description = models.CharField('Descripción Diagnóstica', max_length=255)
    is_primary = models.BooleanField('Diagnóstico Principal', default=True)
    is_presumptive = models.BooleanField('Presuntivo', default=False)

    class Meta:
        verbose_name = 'Diagnóstico de Consulta'
        verbose_name_plural = 'Diagnósticos de Consulta'


class ClinicalEvolutionNote(models.Model):
    """Nota médica de evolución y plan de tratamiento."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    encounter = models.OneToOneField(ClinicalEncounter, on_delete=models.CASCADE, related_name='evolution_note')
    
    # Formato SOAP adaptado a Medicina Interna
    subjective = models.TextField('Subjetivo (S)', blank=True, help_text='Relato del paciente y evolución percibida')
    objective = models.TextField('Objetivo (O)', blank=True, help_text='Hallazgos relevantes observados y medidos')
    assessment = models.TextField('Apreciación / Juicio Clínico (A)', blank=True, help_text='Interpretación del estado actual')
    treatment_plan = models.TextField('Plan de Tratamiento (P)', help_text='Indicaciones farmacológicas, higiénico-dietéticas')

    requested_studies = models.TextField('Estudios Complementarios Solicitados', blank=True, help_text='Laboratorio, RX, ECG, etc.')
    alarm_signs = models.TextField('Pautas de Alarma', blank=True, help_text='Síntomas por los cuales consultar por guardia')
    next_control = models.CharField('Próximo Control', max_length=100, blank=True, help_text='Ej: En 15 días con resultados de laboratorio')

    class Meta:
        verbose_name = 'Nota de Evolución Clínica'
        verbose_name_plural = 'Notas de Evolución Clínica'


class ClinicalNoteVersion(models.Model):
    """
    Registro histórico inmutable (Ley 27.706).
    Almacena una copia de cualquier documento clínico firmado si fuera necesario enmendarlo.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    encounter = models.ForeignKey(ClinicalEncounter, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField(default=1)
    amendment_reason = models.TextField('Motivo de Enmienda / Rectificación')
    content_snapshot = models.JSONField('Instantánea del Contenido')
    amended_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Versión Histórica de Consulta'
        verbose_name_plural = 'Versiones Históricas de Consultas'
        ordering = ['version_number']
