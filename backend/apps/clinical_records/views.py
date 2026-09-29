from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import (
    ClinicalEncounter, PatientCondition, PatientAllergy,
    PatientMedication, ClinicalNoteVersion, VitalSigns, Anthropometry
)
from .serializers import (
    ClinicalEncounterSerializer, PatientConditionSerializer,
    PatientAllergySerializer, PatientMedicationSerializer
)
from apps.accounts.permissions import IsDoctor


class ClinicalEncounterListCreateView(generics.ListCreateAPIView):
    queryset = ClinicalEncounter.objects.all().select_related('patient', 'doctor').prefetch_related(
        'vital_signs', 'anthropometry', 'physical_examination', 'evolution_note', 'diagnoses', 'versions'
    )
    serializer_class = ClinicalEncounterSerializer
    permission_classes = [IsAuthenticated, IsDoctor]

    def get_queryset(self):
        qs = super().get_queryset()
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs


class ClinicalEncounterDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ClinicalEncounter.objects.all().select_related('patient', 'doctor').prefetch_related(
        'vital_signs', 'anthropometry', 'physical_examination', 'evolution_note', 'diagnoses', 'versions'
    )
    serializer_class = ClinicalEncounterSerializer
    permission_classes = [IsAuthenticated, IsDoctor]


class SignEncounterView(views.APIView):
    """
    Firma digital de la consulta médica (Ley 27.706).
    Bloquea la consulta como inmutable y genera su hash criptográfico.
    """
    permission_classes = [IsAuthenticated, IsDoctor]

    def post(self, request, pk):
        encounter = get_object_or_404(ClinicalEncounter, pk=pk)
        if encounter.status == ClinicalEncounter.Status.SIGNED:
            return Response({'error': 'La consulta ya está firmada.'}, status=status.HTTP_400_BAD_REQUEST)
        
        encounter.sign_encounter(doctor_user=request.user)
        serializer = ClinicalEncounterSerializer(encounter, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AmendEncounterView(views.APIView):
    """
    Enmienda de una consulta previamente firmada (Ley 27.706).
    Guarda una copia histórica inmutable de la versión previa antes de aplicar modificaciones.
    """
    permission_classes = [IsAuthenticated, IsDoctor]

    @transaction.atomic
    def post(self, request, pk):
        encounter = get_object_or_404(ClinicalEncounter, pk=pk)
        if encounter.status != ClinicalEncounter.Status.SIGNED:
            return Response({'error': 'Solo se pueden enmendar consultas firmadas.'}, status=status.HTTP_400_BAD_REQUEST)

        amendment_reason = request.data.get('amendment_reason', '').strip()
        if not amendment_reason:
            return Response({'error': 'El motivo de enmienda o rectificación es obligatorio por normativa legal.'}, status=status.HTTP_400_BAD_REQUEST)

        # Snapshot current content
        current_snapshot = ClinicalEncounterSerializer(encounter).data
        next_version_num = encounter.versions.count() + 1

        ClinicalNoteVersion.objects.create(
            encounter=encounter,
            version_number=next_version_num,
            amendment_reason=amendment_reason,
            content_snapshot=current_snapshot,
            amended_by=request.user
        )

        encounter.status = ClinicalEncounter.Status.AMENDED
        encounter.save()

        serializer = ClinicalEncounterSerializer(encounter, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class PatientEvolutionHistoryView(views.APIView):
    """
    Retorna la serie temporal de parámetros clínicos (presión arterial, FC, peso, IMC)
    para graficar la evolución médica a lo largo del tiempo.
    """
    permission_classes = [IsAuthenticated, IsDoctor]

    def get(self, request, patient_id):
        encounters = ClinicalEncounter.objects.filter(
            patient_id=patient_id
        ).select_related('vital_signs', 'anthropometry').order_by('encounter_date')

        history = []
        for enc in encounters:
            point = {
                'encounter_id': str(enc.id),
                'date': enc.encounter_date.strftime('%Y-%m-%d %H:%M'),
                'systolic_bp': enc.vital_signs.systolic_bp if hasattr(enc, 'vital_signs') else None,
                'diastolic_bp': enc.vital_signs.diastolic_bp if hasattr(enc, 'vital_signs') else None,
                'heart_rate': enc.vital_signs.heart_rate if hasattr(enc, 'vital_signs') else None,
                'weight_kg': float(enc.anthropometry.weight_kg) if hasattr(enc, 'anthropometry') and enc.anthropometry.weight_kg else None,
                'bmi': float(enc.anthropometry.bmi) if hasattr(enc, 'anthropometry') and enc.anthropometry.bmi else None,
                'blood_glucose': enc.vital_signs.blood_glucose if hasattr(enc, 'vital_signs') else None,
            }
            history.append(point)

        return Response(history)


class PatientConditionListCreateView(generics.ListCreateAPIView):
    queryset = PatientCondition.objects.all()
    serializer_class = PatientConditionSerializer
    permission_classes = [IsAuthenticated, IsDoctor]

    def get_queryset(self):
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            return self.queryset.filter(patient_id=patient_id)
        return self.queryset


class PatientAllergyListCreateView(generics.ListCreateAPIView):
    queryset = PatientAllergy.objects.all()
    serializer_class = PatientAllergySerializer
    permission_classes = [IsAuthenticated, IsDoctor]

    def get_queryset(self):
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            return self.queryset.filter(patient_id=patient_id)
        return self.queryset


class PatientMedicationListCreateView(generics.ListCreateAPIView):
    queryset = PatientMedication.objects.all()
    serializer_class = PatientMedicationSerializer
    permission_classes = [IsAuthenticated, IsDoctor]

    def get_queryset(self):
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            return self.queryset.filter(patient_id=patient_id)
        return self.queryset
