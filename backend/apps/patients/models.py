import uuid
from django.db import models
from django.utils import timezone


class Patient(models.Model):
    class DocumentType(models.TextChoices):
        DNI = 'DNI', 'DNI - Documento Nacional de Identidad'
        PASSPORT = 'PAS', 'Pasaporte'
        CI = 'CI', 'Cédula de Identidad'
        LC = 'LC', 'Libreta Cívica'
        LE = 'LE', 'Libreta de Enrolamiento'

    class Gender(models.TextChoices):
        FEMALE = 'F', 'Femenino'
        MALE = 'M', 'Masculino'
        OTHER = 'X', 'Otro / No binario'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField('Nombres', max_length=150)
    last_name = models.CharField('Apellidos', max_length=150)
    document_type = models.CharField('Tipo de Documento', max_length=10, choices=DocumentType.choices, default=DocumentType.DNI)
    document_number = models.CharField('Número de Documento', max_length=30, unique=True, db_index=True)
    birth_date = models.DateField('Fecha de Nacimiento')
    gender = models.CharField('Género', max_length=10, choices=Gender.choices, default=Gender.OTHER)
    blood_type = models.CharField('Grupo y Factor Sanguíneo', max_length=10, blank=True, help_text='Ej: 0+, A+, B-, etc.')

    phone = models.CharField('Teléfono / Celular', max_length=50, blank=True)
    email = models.EmailField('Correo Electrónico', blank=True, null=True)
    address = models.CharField('Domicilio', max_length=255, blank=True)
    city = models.CharField('Localidad / Ciudad', max_length=100, default='Posadas')

    emergency_contact_name = models.CharField('Contacto de Emergencia', max_length=150, blank=True)
    emergency_contact_phone = models.CharField('Teléfono de Contacto de Emergencia', max_length=50, blank=True)

    health_insurance_name = models.CharField('Obra Social / Cobertura Médica', max_length=150, default='Particular')
    health_insurance_number = models.CharField('N° de Afiliado / Carnet', max_length=100, blank=True)

    observations = models.TextField('Observaciones Generales / Administrativas', blank=True)
    created_at = models.DateTimeField('Fecha de Alta', default=timezone.now)
    updated_at = models.DateTimeField('Última Actualización', auto_now=True)

    class Meta:
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.last_name}, {self.first_name} (DNI: {self.document_number})"

    @property
    def full_name(self):
        return f"{self.last_name}, {self.first_name}"

    @property
    def age(self):
        today = timezone.localdate()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))


class PatientRepresentative(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='representatives')
    full_name = models.CharField('Nombre y Apellido', max_length=200)
    relationship = models.CharField('Vínculo / Parentesco', max_length=100, help_text='Ej: Madre, Padre, Tutor Legal, Curador')
    document_number = models.CharField('DNI / Documento', max_length=30, blank=True)
    phone = models.CharField('Teléfono', max_length=50)
    email = models.EmailField('Correo electrónico', blank=True)

    class Meta:
        verbose_name = 'Tutor / Representante de Paciente'
        verbose_name_plural = 'Tutores y Representantes de Pacientes'

    def __str__(self):
        return f"{self.full_name} ({self.relationship} de {self.patient.full_name})"
