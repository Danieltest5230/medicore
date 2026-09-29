from .models import ClinicalAuditEvent


class ClinicalAuditMiddleware:
    """
    Middleware que audita automáticamente accesos a historias clínicas
    y datos de pacientes según la Ley 27.706.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Audit only authenticated requests touching clinical endpoints
        if request.user and request.user.is_authenticated:
            path = request.path
            method = request.method

            if '/api/clinical/' in path or '/api/patients/' in path:
                ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', '127.0.0.1'))
                if ',' in ip:
                    ip = ip.split(',')[0].strip()

                user_agent = request.META.get('HTTP_USER_AGENT', '')[:250]

                action = ClinicalAuditEvent.Action.VIEW_CLINICAL_RECORD
                if method == 'POST':
                    action = ClinicalAuditEvent.Action.CREATE_CLINICAL_RECORD
                elif method in ['PUT', 'PATCH']:
                    action = ClinicalAuditEvent.Action.AMEND_CLINICAL_RECORD

                # Async or quick non-blocking logging
                try:
                    ClinicalAuditEvent.objects.create(
                        user=request.user,
                        user_email=request.user.email,
                        action=action,
                        resource_type='HTTP_ENDPOINT',
                        resource_id=path[:100],
                        details=f"{method} {path} - Status: {response.status_code}",
                        ip_address=ip if ip else None,
                        user_agent=user_agent
                    )
                except Exception:
                    pass

        return response
