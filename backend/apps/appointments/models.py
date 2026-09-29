import uuid
from datetime import timedelta
from django.db import models
from django.utils import timezone
from apps.accounts.models import User
from apps.patients.models import Patient


class AppointmentType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField('Tipo de Consulta / Turno', max_length=100)
    duration_minutes = models.PositiveSmallIntegerField('Duración estimada (minutos)', default=30)
    color_hex = models.CharField('Color Identificador', max_length=7, default='#3B82F6')
    description = models.TextField('Descripción', blank=True)

    class Meta:
        verbose_name = 'Tipo de Turno'
        verbose_name_plural = 'Tipos de Turnos'

    def __str__(self):
        return f"{self.name} ({self.duration_minutes} min)"


class DoctorSchedule(models.Model):
    DAYS_OF_WEEK = [
        (0, 'Lunes'),
        (1, 'Martes'),
        (2, 'Miércoles'),
        (3, 'Jueves'),
        (4, 'Viernes'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.PositiveSmallIntegerField('Día de la Semana', choices=DAYS_OF_WEEK)
    start_time = models.TimeField('Hora de Inicio')
    end_time = models.TimeField('Hora de Fin')
    slot_interval_minutes = models.PositiveSmallIntegerField('Intervalo entre turnos (minutos)', default=30)
    is_active = models.BooleanField('Activo', default=True)

    class Meta:
        verbose_name = 'Horario de Atención de Consultorio'
        verbose_name_plural = 'Horarios de Atención de Consultorio'
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return f"{self.get_day_of_week_display()}: {self.start_time.strftime('%H:%M')} a {self.end_time.strftime('%H:%M')}"


class Appointment(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Programado'
        CONFIRMED = 'CONFIRMED', 'Confirmado'
        WAITING_ROOM = 'WAITING_ROOM', 'En Sala de Espera'
        IN_CONSULTATION = 'IN_CONSULTATION', 'En Consulta Médica'
        COMPLETED = 'COMPLETED', 'Atendido / Completado'
        CANCELLED = 'CANCELLED', 'Cancelado'
        NO_SHOW = 'NO_SHOW', 'Ausente / No asistió'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT, related_name='appointments')
    doctor = models.ForeignKey(User, on_delete=models.PROTECT, related_name='doctor_appointments')
    appointment_type = models.ForeignKey(AppointmentType, on_delete=models.SET_NULL, null=True, blank=True)
    scheduled_datetime = models.DateTimeField('Fecha y Hora del Turno')
    end_datetime = models.DateTimeField('Hora estimada de fin', blank=True, null=True)
    status = models.CharField('Estado del Turno', max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    reason = models.CharField('Motivo referido', max_length=255, blank=True)
    notes = models.TextField('Notas de Recepción', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Turno'
        verbose_name_plural = 'Turnos'
        ordering = ['scheduled_datetime']

    def __str__(self):
        return f"Turno {self.patient.full_name} con Dr/a. {self.doctor.get_full_name()} el {self.scheduled_datetime.strftime('%d/%m/%Y %H:%M')}"

    def save(self, *args, **kwargs):
        if not self.end_datetime:
            duration = self.appointment_type.duration_minutes if self.appointment_type else 30
            self.end_datetime = self.scheduled_datetime + timedelta(minutes=duration)
        super().save(*args, **kwargs)


class CheckIn(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='check_in')
    arrival_time = models.DateTimeField('Hora de Llegada', default=timezone.now)
    called_to_office_time = models.DateTimeField('Llamado al Consultorio', null=True, blank=True)

    class Meta:
        verbose_name = 'Recepción / Check-in'
        verbose_name_plural = 'Recepciones / Check-ins'
