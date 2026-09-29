from rest_framework import serializers
from .models import Prescription, PrescriptionItem, StudyOrder, MedicalCertificate
from apps.patients.serializers import PatientSerializer
from apps.accounts.serializers import UserSerializer


class PrescriptionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionItem
        fields = ['id', 'medication_name', 'concentration', 'form', 'dosage_instructions', 'quantity']
        read_only_fields = ['id']


class PrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True, required=False)
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = UserSerializer(source='doctor', read_only=True)

    class Meta:
        model = Prescription
        fields = [
            'id', 'patient', 'doctor', 'patient_details', 'doctor_details',
            'encounter', 'issue_date', 'diagnosis', 'general_instructions',
            'validity_days', 'security_token', 'is_active', 'items', 'created_at'
        ]
        read_only_fields = ['id', 'security_token', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        request = self.context.get('request')
        if request and request.user and not validated_data.get('doctor'):
            validated_data['doctor'] = request.user

        prescription = Prescription.objects.create(**validated_data)
        for item_data in items_data:
            PrescriptionItem.objects.create(prescription=prescription, **item_data)
        return prescription


class StudyOrderSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = UserSerializer(source='doctor', read_only=True)

    class Meta:
        model = StudyOrder
        fields = [
            'id', 'patient', 'doctor', 'patient_details', 'doctor_details',
            'encounter', 'category', 'study_name', 'clinical_indication',
            'is_urgent', 'issue_date'
        ]
        read_only_fields = ['id']


class MedicalCertificateSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = UserSerializer(source='doctor', read_only=True)

    class Meta:
        model = MedicalCertificate
        fields = [
            'id', 'patient', 'doctor', 'patient_details', 'doctor_details',
            'encounter', 'certificate_type', 'diagnosis_statement',
            'rest_days', 'observations', 'issue_date'
        ]
        read_only_fields = ['id']
