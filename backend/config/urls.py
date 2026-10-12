from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect

def root_landing_view(request):
    if 'text/html' in request.META.get('HTTP_ACCEPT', ''):
        html_content = """
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>MEDICORE - Servidor Backend API</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; border: 1px solid #334155; max-width: 540px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
                h1 { margin: 0 0 0.5rem 0; color: #38bdf8; font-size: 1.8rem; }
                p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
                .btn { display: inline-block; background: #0284c7; color: white; text-decoration: none; padding: 0.8rem 1.6rem; border-radius: 0.6rem; font-weight: 600; margin-top: 1.5rem; transition: background 0.2s; font-size: 0.95rem; }
                .btn:hover { background: #0369a1; }
                .links { margin-top: 1.5rem; display: flex; justify-content: center; gap: 1.2rem; font-size: 0.85rem; }
                .links a { color: #38bdf8; text-decoration: none; }
                .badge { background: #065f46; color: #6ee7b7; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; margin-bottom: 1rem; }
            </style>
        </head>
        <body>
            <div class="card">
                <span class="badge">API Backend Django Activa (Puerto 8000)</span>
                <h1>MEDICORE</h1>
                <p>Estás accediendo al <strong>servidor de la API REST</strong>. La interfaz visual interactiva del consultorio médico se encuentra en el <strong>puerto 5173</strong>.</p>
                
                <a href="http://localhost:5173" class="btn">🚀 Abrir Sistema Visual (http://localhost:5173)</a>
                
                <div class="links">
                    <a href="/admin/">Panel Django Admin</a>
                    <a href="/api/health/">Estado del Sistema</a>
                    <a href="/api/patients/">API Pacientes</a>
                </div>
            </div>
        </body>
        </html>
        """
        return HttpResponse(html_content)

    return JsonResponse({
        'system': 'MEDICORE',
        'role': 'REST API Backend',
        'status': 'online',
        'frontend_url': 'http://localhost:5173',
        'admin_url': 'http://127.0.0.1:8000/admin/',
        'specialty': 'Clínica Médica Exclusiva',
        'legal_compliance': ['Ley 27.706', 'Ley 26.529', 'Ley 25.326']
    })

def api_health_check(request):
    return JsonResponse({
        'system': 'MEDICORE',
        'status': 'healthy',
        'version': '1.0.0',
        'specialty': 'Clínica Médica Exclusiva',
        'compliance': ['Ley 27.706', 'Ley 26.529', 'Ley 25.326']
    })

urlpatterns = [
    path('', root_landing_view, name='root_landing'),
    path('admin/', admin.site.urls),
    path('api/health/', api_health_check, name='api_health'),
    path('api/', include('api.urls')),
]

from django.urls import re_path
from django.views.static import serve

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
