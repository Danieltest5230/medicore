from rest_framework import serializers
from .models import AppointmentType, DoctorSchedule, Appointment, CheckIn
from apps.patients.serializers import PatientSerializer
from apps.accounts.serializers import UserSerializer


class AppointmentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentType
        fields = '__all__'


class DoctorScheduleSerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = DoctorSchedule
        fields = ['id', 'doctor', 'day_of_week', 'day_name', 'start_time', 'end_time', 'slot_interval_minutes', 'is_active']


class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = UserSerializer(source='doctor', read_only=True)
    appointment_type_details = AppointmentTypeSerializer(source='appointment_type', read_only=True)
    check_in_details = CheckInSerializer(source='check_in', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'doctor', 'patient_details', 'doctor_details',
            'appointment_type', 'appointment_type_details', 'scheduled_datetime',
            'end_datetime', 'status', 'reason', 'notes', 'check_in_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        # Validate overlapping appointments for the same doctor
        doctor = data.get('doctor')
        scheduled_datetime = data.get('scheduled_datetime')
        appointment_type = data.get('appointment_type')
        duration = appointment_type.duration_minutes if appointment_type else 30
        end_datetime = scheduled_datetime + serializers.timedelta(minutes=duration)

        overlapping = Appointment.objects.filter(
            doctor=doctor,
            scheduled_datetime__lt=end_datetime,
            end_datetime__gt=scheduled_datetime,
        ).exclude(status__in=[Appointment.Status.CANCELLED, Appointment.Status.NO_SHOW])

        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)

        if overlapping.exists():
            raise serializers.ValidationError('Ya existe un turno programado para este médico en el horario seleccionado.')

        return data
