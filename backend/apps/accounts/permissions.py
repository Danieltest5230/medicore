from rest_framework import permissions

class IsDoctor(permissions.BasePermission):
    """Permiso exclusivo para médicos clínicos."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'DOCTOR' or request.user.is_superuser))


class IsReceptionist(permissions.BasePermission):
    """Permiso para personal de recepción y secretaría médica."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role in ['RECEPTIONIST', 'DOCTOR', 'ADMIN'] or request.user.is_superuser))


class IsStaffOrDoctor(permissions.BasePermission):
    """Permiso para profesionales o personal administrativo."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role in ['DOCTOR', 'RECEPTIONIST', 'ADMIN'] or request.user.is_staff))
