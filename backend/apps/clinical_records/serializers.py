from rest_framework import serializers
from django.db import transaction
from .models import (
    ClinicalEncounter, VitalSigns, Anthropometry, PhysicalExamination,
    PatientCondition, PatientAllergy, PatientMedication, ClinicalDiagnosis,
    ClinicalEvolutionNote, ClinicalNoteVersion
)
from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer
from apps.patients.serializers import PatientSerializer


class VitalSignsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSigns
        fields = [
            'id', 'systolic_bp', 'diastolic_bp', 'heart_rate',
            'respiratory_rate', 'temperature_c', 'oxygen_saturation',
            'blood_glucose', 'pain_scale', 'recorded_at'
        ]
        read_only_fields = ['id']


class AnthropometrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Anthropometry
        fields = [
            'id', 'weight_kg', 'height_cm', 'bmi',
            'waist_circumference_cm', 'nutritional_status'
        ]
        read_only_fields = ['id', 'bmi', 'nutritional_status']


class PhysicalExaminationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalExamination
        fields = [
            'id', 'general_appearance', 'skin_and_mucosa', 'head_and_neck',
            'respiratory_system', 'cardiovascular_system',
            'abdomen', 'genitourinary_system', 'neurological_system', 'extremities_and_skin'
        ]
        read_only_fields = ['id']


class ClinicalDiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicalDiagnosis
        fields = ['id', 'cie10_code', 'description', 'is_primary', 'is_presumptive']
        read_only_fields = ['id']


class ClinicalEvolutionNoteSerializer(serializers.ModelSerializer):
    treatment_plan = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = ClinicalEvolutionNote
        fields = [
            'id', 'subjective', 'objective', 'assessment',
            'treatment_plan', 'requested_studies', 'alarm_signs', 'next_control'
        ]
        read_only_fields = ['id']


class ClinicalNoteVersionSerializer(serializers.ModelSerializer):
    amended_by_name = serializers.CharField(source='amended_by.get_full_name', read_only=True)

    class Meta:
        model = ClinicalNoteVersion
        fields = ['id', 'version_number', 'amendment_reason', 'content_snapshot', 'amended_by_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class ClinicalEncounterSerializer(serializers.ModelSerializer):
    doctor = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    vital_signs = VitalSignsSerializer(required=False)
    anthropometry = AnthropometrySerializer(required=False)
    physical_examination = PhysicalExaminationSerializer(required=False)
    evolution_note = ClinicalEvolutionNoteSerializer(required=False)
    diagnoses = ClinicalDiagnosisSerializer(many=True, required=False)
    versions = ClinicalNoteVersionSerializer(many=True, read_only=True)
    doctor_details = UserSerializer(source='doctor', read_only=True)
    patient_details = PatientSerializer(source='patient', read_only=True)

    class Meta:
        model = ClinicalEncounter
        fields = [
            'id', 'patient', 'doctor', 'doctor_details', 'patient_details',
            'encounter_date', 'reason_for_consultation', 'current_illness',
            'disease_history', 'pathological_history', 'medication_history',
            'surgical_history', 'complementary_studies',
            'status', 'signed_at', 'signature_hash', 'vital_signs',
            'anthropometry', 'physical_examination', 'evolution_note',
            'diagnoses', 'versions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'signed_at', 'signature_hash', 'created_at', 'updated_at']

    @transaction.atomic
    def create(self, validated_data):
        vital_signs_data = validated_data.pop('vital_signs', None)
        anthropometry_data = validated_data.pop('anthropometry', None)
        physical_exam_data = validated_data.pop('physical_examination', None)
        evolution_note_data = validated_data.pop('evolution_note', None)
        diagnoses_data = validated_data.pop('diagnoses', [])

        # Assign logged-in doctor if not specified
        request = self.context.get('request')
        if not validated_data.get('doctor'):
            if request and request.user and request.user.is_authenticated:
                validated_data['doctor'] = request.user
            else:
                fallback_doctor = User.objects.filter(role=User.Role.DOCTOR).first() or User.objects.first()
                validated_data['doctor'] = fallback_doctor

        encounter = ClinicalEncounter.objects.create(**validated_data)

        if vital_signs_data:
            VitalSigns.objects.create(encounter=encounter, **vital_signs_data)
        if anthropometry_data:
            Anthropometry.objects.create(encounter=encounter, **anthropometry_data)
        if physical_exam_data:
            PhysicalExamination.objects.create(encounter=encounter, **physical_exam_data)
        if evolution_note_data:
            ClinicalEvolutionNote.objects.create(encounter=encounter, **evolution_note_data)
        for diag_data in diagnoses_data:
            ClinicalDiagnosis.objects.create(encounter=encounter, **diag_data)

        return encounter

    @transaction.atomic
    def update(self, instance, validated_data):
        if instance.status == ClinicalEncounter.Status.SIGNED:
            raise serializers.ValidationError({'detail': 'No se puede modificar directamente una consulta firmada. Utilice la función de enmienda clínica (Ley 27.706).'})

        vital_signs_data = validated_data.pop('vital_signs', None)
        anthropometry_data = validated_data.pop('anthropometry', None)
        physical_exam_data = validated_data.pop('physical_examination', None)
        evolution_note_data = validated_data.pop('evolution_note', None)
        diagnoses_data = validated_data.pop('diagnoses', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if vital_signs_data is not None:
            VitalSigns.objects.update_or_create(encounter=instance, defaults=vital_signs_data)

        if anthropometry_data is not None:
            Anthropometry.objects.update_or_create(encounter=instance, defaults=anthropometry_data)

        if physical_exam_data is not None:
            PhysicalExamination.objects.update_or_create(encounter=instance, defaults=physical_exam_data)

        if evolution_note_data is not None:
            ClinicalEvolutionNote.objects.update_or_create(encounter=instance, defaults=evolution_note_data)

        if diagnoses_data is not None:
            instance.diagnoses.all().delete()
            for diag_data in diagnoses_data:
                ClinicalDiagnosis.objects.create(encounter=instance, **diag_data)

        return instance


class PatientConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientCondition
        fields = '__all__'


class PatientAllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientAllergy
        fields = '__all__'


class PatientMedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientMedication
        fields = '__all__'
