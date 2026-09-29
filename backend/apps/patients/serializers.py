from rest_framework import serializers
from .models import Patient, PatientRepresentative


class PatientRepresentativeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientRepresentative
        fields = '__all__'


class PatientSerializer(serializers.ModelSerializer):
    representatives = PatientRepresentativeSerializer(many=True, read_only=True)
    age = serializers.IntegerField(read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Patient
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'document_type',
            'document_number', 'birth_date', 'age', 'gender', 'blood_type',
            'phone', 'email', 'address', 'city', 'emergency_contact_name',
            'emergency_contact_phone', 'health_insurance_name',
            'health_insurance_number', 'observations', 'created_at',
            'updated_at', 'representatives'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
