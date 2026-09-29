from rest_framework import generics, filters
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from .models import Patient, PatientRepresentative
from .serializers import PatientSerializer, PatientRepresentativeSerializer
from apps.accounts.permissions import IsStaffOrDoctor


class PatientListCreateView(generics.ListCreateAPIView):
    queryset = Patient.objects.all().prefetch_related('representatives')
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated, IsStaffOrDoctor]

    def get_queryset(self):
        qs = super().get_queryset()
        query = self.request.query_params.get('search', '').strip()
        if query:
            qs = qs.filter(
                Q(document_number__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(phone__icontains=query) |
                Q(health_insurance_number__icontains=query)
            )
        return qs


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Patient.objects.all().prefetch_related('representatives')
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated, IsStaffOrDoctor]


class PatientRepresentativeListCreateView(generics.ListCreateAPIView):
    queryset = PatientRepresentative.objects.all()
    serializer_class = PatientRepresentativeSerializer
    permission_classes = [IsAuthenticated, IsStaffOrDoctor]

    def get_queryset(self):
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            return self.queryset.filter(patient_id=patient_id)
        return self.queryset
