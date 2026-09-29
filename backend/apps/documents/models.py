import uuid
import hashlib
from django.db import models
from django.utils import timezone
from apps.accounts.models import User
from apps.patients.models import Patient
from apps.clinical_records.models import ClinicalEncounter


class Prescription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT, related_name='prescriptions')
    doctor = models.ForeignKey(User, on_delete=models.PROTECT, related_name='issued_prescriptions')
    encounter = models.ForeignKey(ClinicalEncounter, on_delete=models.SET_NULL, null=True, blank=True, related_name='prescriptions')
    
    issue_date = models.DateField('Fecha de Emisión', default=timezone.now)
    diagnosis = models.CharField('Diagnóstico', max_length=255, blank=True)
    general_instructions = models.TextField('Indicaciones Generales', blank=True)
    validity_days = models.PositiveSmallIntegerField('Días de Validez', default=30)
    
    security_token = models.CharField('Token Único de Verificación', max_length=64, unique=True, editable=False)
    is_active = models.BooleanField('Activa', default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Receta Electrónica'
        verbose_name_plural = 'Recetas Electrónicas'
        ordering = ['-issue_date']

    def save(self, *args, **kwargs):
        if not self.security_token:
            payload = f"{self.id}:{self.patient_id}:{self.doctor_id}:{timezone.now().timestamp()}"
            self.security_token = hashlib.sha256(payload.encode('utf-8')).hexdigest()[:32]
        super().save(*args, **kwargs)


class PrescriptionItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='items')
    medication_name = models.CharField('Nombre del Medicamento / Droga', max_length=150)
    concentration = models.CharField('Concentración', max_length=50, blank=True, help_text='Ej: 500 mg, 10 mg/ml')
    form = models.CharField('Forma Farmacéutica', max_length=50, blank=True, help_text='Ej: Comprimidos, Jarabe, Gotas')
    dosage_instructions = models.CharField('Posología / Modo de Toma', max_length=255, help_text='Ej: 1 comp cada 8 hs por 7 días')
    quantity = models.CharField('Cantidad de envases', max_length=50, default='1 (un) envase')

    class Meta:
        verbose_name = 'Ítem de Receta'
        verbose_name_plural = 'Ítems de Receta'


class StudyOrder(models.Model):
    class StudyCategory(models.TextChoices):
        LABORATORY = 'LAB', 'Laboratorio Bioquímico'
        XRAY = 'XRAY', 'Radiología / Rayos X'
        ULTRASOUND = 'US', 'Ecografía'
        CT_SCAN = 'CT', 'Tomografía Computada (TC)'
        MRI = 'MRI', 'Resonancia Magnética (RMN)'
        CARDIOLOGY = 'CARDIO', 'Cardiología (ECG / Ergometría / Holter)'
        ENDOSCOPY = 'ENDO', 'Endoscopía'
        OTHER = 'OTHER', 'Otro estudio'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT, related_name='study_orders')
    doctor = models.ForeignKey(User, on_delete=models.PROTECT, related_name='issued_study_orders')
    encounter = models.ForeignKey(ClinicalEncounter, on_delete=models.SET_NULL, null=True, blank=True, related_name='study_orders')

    category = models.CharField('Categoría', max_length=10, choices=StudyCategory.choices, default=StudyCategory.LABORATORY)
    study_name = models.CharField('Estudio Solicitado', max_length=200, help_text='Ej: Hemograma completo, Hepatograma, Perfil Lipídico, Rx Tórax frente')
    clinical_indication = models.TextField('Diagnóstico presuntivo / Justificación clínica')
    is_urgent = models.BooleanField('Carácter Urgente', default=False)
    issue_date = models.DateField(default=timezone.now)

    class Meta:
        verbose_name = 'Orden de Estudio Clínico'
        verbose_name_plural = 'Órdenes de Estudios Clínicos'
        ordering = ['-issue_date']


class MedicalCertificate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT, related_name='certificates')
    doctor = models.ForeignKey(User, on_delete=models.PROTECT, related_name='issued_certificates')
    encounter = models.ForeignKey(ClinicalEncounter, on_delete=models.SET_NULL, null=True, blank=True)

    certificate_type = models.CharField('Tipo de Certificado', max_length=100, default='Reposo laboral / escolar')
    diagnosis_statement = models.TextField('Certifico que el paciente presenta...')
    rest_days = models.PositiveSmallIntegerField('Días de reposo sugeridos', default=0)
    observations = models.TextField('Observaciones adicionales', blank=True)
    issue_date = models.DateField(default=timezone.now)

    class Meta:
        verbose_name = 'Certificado Médico'
        verbose_name_plural = 'Certificados Médicos'
