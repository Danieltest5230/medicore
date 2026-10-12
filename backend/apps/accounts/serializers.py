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
    
    # Optional fields for updating professional profile
    national_license = serializers.CharField(write_only=True, required=False, allow_blank=True)
    provincial_license = serializers.CharField(write_only=True, required=False, allow_blank=True)
    specialty = serializers.CharField(write_only=True, required=False, allow_blank=True)
    digital_signature_stamp = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone_number', 'avatar', 'avatar_url', 'theme_preference',
            'is_active', 'date_joined', 'professional_profile',
            'national_license', 'provincial_license', 'specialty', 'digital_signature_stamp'
        ]
        read_only_fields = ['id', 'date_joined', 'email', 'role']

    def update(self, instance, validated_data):
        nat_lic = validated_data.pop('national_license', None)
        prov_lic = validated_data.pop('provincial_license', None)
        spec = validated_data.pop('specialty', None)
        stamp = validated_data.pop('digital_signature_stamp', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update or create professional profile if any doctor fields are provided
        if instance.role == User.Role.DOCTOR or nat_lic is not None or prov_lic is not None:
            prof, _ = ProfessionalProfile.objects.get_or_create(user=instance)
            if nat_lic is not None:
                prof.national_license = nat_lic
            if prov_lic is not None:
                prof.provincial_license = prov_lic
            if spec is not None:
                prof.specialty = spec
            if stamp is not None:
                prof.digital_signature_stamp = stamp
            prof.save()

        return instance


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
        avatar = ''
        if self.user.avatar:
            try:
                avatar = self.user.avatar.url
            except Exception:
                avatar = ''
        elif self.user.avatar_url:
            avatar = self.user.avatar_url

        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'full_name': self.user.get_full_name(),
            'role': self.user.role,
            'phone_number': self.user.phone_number or '',
            'avatar': avatar,
            'avatar_url': self.user.avatar_url or '',
            'theme_preference': self.user.theme_preference or 'integrando-cyan',
        }
        if hasattr(self.user, 'professional_profile'):
            data['user']['doctor_info'] = {
                'specialty': self.user.professional_profile.specialty,
                'national_license': self.user.professional_profile.national_license,
                'provincial_license': self.user.professional_profile.provincial_license,
                'digital_signature_stamp': self.user.professional_profile.digital_signature_stamp,
            }
            data['user']['professional_profile'] = {
                'id': str(self.user.professional_profile.id),
                'specialty': self.user.professional_profile.specialty,
                'national_license': self.user.professional_profile.national_license,
                'provincial_license': self.user.professional_profile.provincial_license,
                'digital_signature_stamp': self.user.professional_profile.digital_signature_stamp,
            }
        return data
