from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_health_check(request):
    return JsonResponse({
        'system': 'MEDICORE',
        'status': 'healthy',
        'version': '1.0.0',
        'specialty': 'Clínica Médica Exclusiva',
        'compliance': ['Ley 27.706', 'Ley 26.529', 'Ley 25.326']
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', api_health_check, name='api_health'),
    path('api/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
