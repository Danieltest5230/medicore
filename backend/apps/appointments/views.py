from datetime import datetime, time, timedelta
from django.utils import timezone
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import AppointmentType, DoctorSchedule, Appointment, CheckIn
from .serializers import (
    AppointmentTypeSerializer, DoctorScheduleSerializer,
    AppointmentSerializer, CheckInSerializer
)
from apps.accounts.permissions import IsStaffOrDoctor


class AppointmentTypeListCreateView(generics.ListCreateAPIView):
    queryset = AppointmentType.objects.all()
    serializer_class = AppointmentTypeSerializer
    permission_classes = [IsAuthenticated, IsStaffOrDoctor]


class DoctorScheduleListCreateView(generics.ListCreateAPIView):
    queryset = DoctorSchedule.objects.all()
    serializer_class = DoctorScheduleSerializer
    permission_classes = [IsAuthenticated, IsStaffOrDoctor]

    def get_queryset(self):
        doctor_id = self.request.query_params.get('doctor_id')
        if doctor_id:
            return self.queryset.filter(doctor_id=doctor_id)
        return self.queryset


class AppointmentListCreateView(generics.ListCreateAPIView):
    queryset = Appointment.objects.all().select_related(
        'patient', 'doctor', 'appointment_type', 'check_in'
    )
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsStaffOrDoctor]

    def get_queryset(self):
        qs = super().get_queryset()
        date_str = self.request.query_params.get('date')
        status_param = self.request.query_params.get('status')
        doctor_id = self.request.query_params.get('doctor_id')
        patient_id = self.request.query_params.get('patient_id')

        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                qs = qs.filter(scheduled_datetime__date=target_date)
            except ValueError:
                pass

        if status_param:
            qs = qs.filter(status=status_param)

        if doctor_id:
            qs = qs.filter(doctor_id=doctor_id)

        if patient_id:
            qs = qs.filter(patient_id=patient_id)

        return qs


class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Appointment.objects.all().select_related(
        'patient', 'doctor', 'appointment_type', 'check_in'
    )
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsStaffOrDoctor]


class CheckInView(views.APIView):
    """Registra la llegada del paciente a la sala de espera."""
    permission_classes = [IsAuthenticated, IsStaffOrDoctor]

    def post(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        appointment.status = Appointment.Status.WAITING_ROOM
        appointment.save()

        check_in, created = CheckIn.objects.get_or_create(
            appointment=appointment,
            defaults={'arrival_time': timezone.now()}
        )
        return Response({
            'status': 'success',
            'appointment_id': str(appointment.id),
            'appointment_status': appointment.status,
            'arrival_time': check_in.arrival_time
        }, status=status.HTTP_200_OK)


class CallPatientView(views.APIView):
    """El médico llama al paciente a consulta."""
    permission_classes = [IsAuthenticated, IsStaffOrDoctor]

    def post(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        appointment.status = Appointment.Status.IN_CONSULTATION
        appointment.save()

        if hasattr(appointment, 'check_in'):
            appointment.check_in.called_to_office_time = timezone.now()
            appointment.check_in.save()

        return Response({
            'status': 'success',
            'appointment_id': str(appointment.id),
            'appointment_status': appointment.status
        }, status=status.HTTP_200_OK)
