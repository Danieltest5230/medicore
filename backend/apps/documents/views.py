from rest_framework import generics, permissions
from .models import Prescription, StudyOrder, MedicalCertificate
from .serializers import PrescriptionSerializer, StudyOrderSerializer, MedicalCertificateSerializer
from apps.accounts.permissions import IsStaffOrDoctor, IsDoctor


class PrescriptionListCreateView(generics.ListCreateAPIView):
    queryset = Prescription.objects.all().select_related('patient', 'doctor').prefetch_related('items')
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffOrDoctor]

    def get_queryset(self):
        qs = super().get_queryset()
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs


class PrescriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Prescription.objects.all().select_related('patient', 'doctor').prefetch_related('items')
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffOrDoctor]


class StudyOrderListCreateView(generics.ListCreateAPIView):
    queryset = StudyOrder.objects.all().select_related('patient', 'doctor')
    serializer_class = StudyOrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffOrDoctor]

    def get_queryset(self):
        qs = super().get_queryset()
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs


class StudyOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudyOrder.objects.all().select_related('patient', 'doctor')
    serializer_class = StudyOrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffOrDoctor]


class MedicalCertificateListCreateView(generics.ListCreateAPIView):
    queryset = MedicalCertificate.objects.all().select_related('patient', 'doctor')
    serializer_class = MedicalCertificateSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get_queryset(self):
        qs = super().get_queryset()
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs


class MedicalCertificateDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MedicalCertificate.objects.all().select_related('patient', 'doctor')
    serializer_class = MedicalCertificateSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]
