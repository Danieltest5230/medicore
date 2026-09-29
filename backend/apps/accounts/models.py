import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El correo electrónico es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        DOCTOR = 'DOCTOR', 'Médico Clínico'
        RECEPTIONIST = 'RECEPTIONIST', 'Recepción'
        ADMIN = 'ADMIN', 'Administrador'
        PATIENT = 'PATIENT', 'Paciente'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField('Correo electrónico', unique=True, db_index=True)
    first_name = models.CharField('Nombre', max_length=150)
    last_name = models.CharField('Apellido', max_length=150)
    role = models.CharField('Rol en el sistema', max_length=20, choices=Role.choices, default=Role.PATIENT)
    phone_number = models.CharField('Teléfono', max_length=30, blank=True, null=True)

    is_active = models.BooleanField('Activo', default=True)
    is_staff = models.BooleanField('Acceso a panel administrativo', default=False)
    date_joined = models.DateTimeField('Fecha de registro', default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email

    @property
    def is_doctor(self):
        return self.role == self.Role.DOCTOR

    @property
    def is_receptionist(self):
        return self.role == self.Role.RECEPTIONIST


class ProfessionalProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='professional_profile')
    national_license = models.CharField('Matrícula Nacional (MN)', max_length=50, blank=True)
    provincial_license = models.CharField('Matrícula Provincial (MP)', max_length=50, blank=True)
    specialty = models.CharField('Especialidad Principal', max_length=100, default='Clínica Médica')
    digital_signature_stamp = models.CharField('Sello profesional / Texto de firma', max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Perfil Profesional'
        verbose_name_plural = 'Perfiles Profesionales'

    def __str__(self):
        return f"Dr/a. {self.user.get_full_name()} - {self.specialty} (MN: {self.national_license or '-'} / MP: {self.provincial_license or '-'})"
