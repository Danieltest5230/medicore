import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from apps.patients.models import Patient
from apps.appointments.models import Appointment


class Payment(models.Model):
    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', 'Efectivo'
        TRANSFER = 'TRANSFER', 'Transferencia Bancaria / CBU / Alias'
        DEBIT_CARD = 'DEBIT', 'Tarjeta de Débito'
        CREDIT_CARD = 'CREDIT', 'Tarjeta de Crédito'
        MERCADOPAGO = 'MP', 'Mercado Pago / QR'
        INSURANCE_COPAY = 'COPAY', 'Copago Obra Social'

    class PaymentStatus(models.TextChoices):
        COMPLETED = 'COMPLETED', 'Cobrado / Completado'
        PENDING = 'PENDING', 'Pendiente de Pago'
        ANNULLED = 'ANNULLED', 'Anulado'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT, related_name='payments')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    concept = models.CharField('Concepto', max_length=150, default='Consulta Médica de Clínica Médica')
    amount = models.DecimalField('Monto Total ($)', max_digits=10, decimal_places=2)
    payment_method = models.CharField('Medio de Pago', max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH)
    status = models.CharField('Estado', max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.COMPLETED)
    receipt_number = models.CharField('N° de Recibo / Comprobante Interno', max_length=50, blank=True)
    notes = models.CharField('Observaciones', max_length=255, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = 'Pago / Cobro de Consulta'
        verbose_name_plural = 'Pagos y Cobros'
        ordering = ['-created_at']

    def __str__(self):
        return f"Pago ${self.amount} ({self.get_payment_method_display()}) - {self.patient.full_name}"


class DailyCashRegister(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField('Fecha de Caja', default=timezone.localdate, unique=True)
    opening_balance = models.DecimalField('Monto de Apertura ($)', max_digits=10, decimal_places=2, default=Decimal('0.00'))
    closing_balance = models.DecimalField('Monto de Cierre ($)', max_digits=10, decimal_places=2, null=True, blank=True)
    is_closed = models.BooleanField('Caja Cerrada', default=False)
    closed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField('Observaciones de Cierre', blank=True)

    class Meta:
        verbose_name = 'Caja Diaria'
        verbose_name_plural = 'Cajas Diarias'
