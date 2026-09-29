import uuid
import hashlib
from django.db import models
from django.utils import timezone
from apps.accounts.models import User


class ClinicalAuditEvent(models.Model):
    class Action(models.TextChoices):
        LOGIN = 'LOGIN', 'Inicio de Sesión'
        LOGOUT = 'LOGOUT', 'Cierre de Sesión'
        VIEW_PATIENT = 'VIEW_PATIENT', 'Visualización de Datos de Paciente'
        VIEW_CLINICAL_RECORD = 'VIEW_RECORD', 'Lectura de Historia Clínica'
        CREATE_CLINICAL_RECORD = 'CREATE_RECORD', 'Creación de Consulta Clínica'
        SIGN_CLINICAL_RECORD = 'SIGN_RECORD', 'Firma Digital de Historia Clínica'
        AMEND_CLINICAL_RECORD = 'AMEND_RECORD', 'Enmienda de Historia Clínica'
        EXPORT_RECORD = 'EXPORT_RECORD', 'Exportación o Descarga de Documento'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_events')
    user_email = models.CharField(max_length=255, blank=True)
    action = models.CharField(max_length=30, choices=Action.choices)
    resource_type = models.CharField(max_length=100, help_text='Ej: ClinicalEncounter, Patient, Prescription')
    resource_id = models.CharField(max_length=100, blank=True)
    details = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(default=timezone.now, editable=False, db_index=True)
    checksum = models.CharField(max_length=64, editable=False)

    class Meta:
        verbose_name = 'Evento de Auditoría Clínica'
        verbose_name_plural = 'Eventos de Auditoría Clínica'
        ordering = ['-timestamp']

    def save(self, *args, **kwargs):
        if not self.checksum:
            if self.user and not self.user_email:
                self.user_email = self.user.email
            raw = f"{self.id}:{self.user_email}:{self.action}:{self.resource_type}:{self.resource_id}:{self.timestamp.isoformat()}"
            self.checksum = hashlib.sha256(raw.encode('utf-8')).hexdigest()
        super().save(*args, **kwargs)
