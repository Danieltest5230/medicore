from django.urls import path
from .views import (
    PrescriptionListCreateView, PrescriptionDetailView,
    StudyOrderListCreateView, StudyOrderDetailView,
    MedicalCertificateListCreateView, MedicalCertificateDetailView
)

urlpatterns = [
    path('prescriptions/', PrescriptionListCreateView.as_view(), name='prescription_list_create'),
    path('prescriptions/<uuid:pk>/', PrescriptionDetailView.as_view(), name='prescription_detail'),
    path('study-orders/', StudyOrderListCreateView.as_view(), name='study_order_list_create'),
    path('study-orders/<uuid:pk>/', StudyOrderDetailView.as_view(), name='study_order_detail'),
    path('certificates/', MedicalCertificateListCreateView.as_view(), name='certificate_list_create'),
    path('certificates/<uuid:pk>/', MedicalCertificateDetailView.as_view(), name='certificate_detail'),
]
