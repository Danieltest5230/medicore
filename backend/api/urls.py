from django.urls import path, include

urlpatterns = [
    path('auth/', include('apps.accounts.urls')),
    path('patients/', include('apps.patients.urls')),
    path('appointments/', include('apps.appointments.urls')),
    path('clinical/', include('apps.clinical_records.urls')),
    path('documents/', include('apps.documents.urls')),
    path('billing/', include('apps.billing.urls')),
    path('audit/', include('apps.audit.urls')),
]
