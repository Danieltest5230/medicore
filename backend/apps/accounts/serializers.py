from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, ProfessionalProfile


class ProfessionalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalProfile
        fields = ['id', 'national_license', 'provincial_license', 'specialty', 'digital_signature_stamp']


class UserSerializer(serializers.ModelSerializer):
    professional_profile = ProfessionalProfileSerializer(read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone_number', 'is_active', 'date_joined',
            'professional_profile'
        ]
        read_only_fields = ['id', 'date_joined']


class RegisterUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    national_license = serializers.CharField(write_only=True, required=False, allow_blank=True)
    provincial_license = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'role', 'phone_number', 'national_license', 'provincial_license']

    def create(self, validated_data):
        nat_license = validated_data.pop('national_license', '')
        prov_license = validated_data.pop('provincial_license', '')
        password = validated_data.pop('password')

        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        if user.role == User.Role.DOCTOR:
            ProfessionalProfile.objects.create(
                user=user,
                national_license=nat_license,
                provincial_license=prov_license,
                specialty='Clínica Médica',
                digital_signature_stamp=f"Dr/a. {user.get_full_name()} - Especialista en Clínica Médica"
            )

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
        }
        if hasattr(self.user, 'professional_profile'):
            data['user']['doctor_info'] = {
                'specialty': self.user.professional_profile.specialty,
                'national_license': self.user.professional_profile.national_license,
                'provincial_license': self.user.professional_profile.provincial_license,
            }
        return data
