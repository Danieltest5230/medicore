from django.urls import path
from .views import ClinicalAuditEventListView

urlpatterns = [
    path('events/', ClinicalAuditEventListView.as_view(), name='audit_event_list'),
]
