from django.urls import path
from .views import (
    ClinicalEncounterListCreateView, ClinicalEncounterDetailView,
    SignEncounterView, AmendEncounterView, PatientEvolutionHistoryView,
    PatientConditionListCreateView, PatientAllergyListCreateView,
    PatientMedicationListCreateView, DownloadClinicalHistoryPdfView
)

urlpatterns = [
    path('encounters/', ClinicalEncounterListCreateView.as_view(), name='encounter_list_create'),
    path('encounters/<uuid:pk>/', ClinicalEncounterDetailView.as_view(), name='encounter_detail'),
    path('encounters/<uuid:pk>/sign/', SignEncounterView.as_view(), name='encounter_sign'),
    path('encounters/<uuid:pk>/amend/', AmendEncounterView.as_view(), name='encounter_amend'),
    path('encounters/<uuid:pk>/pdf/', DownloadClinicalHistoryPdfView.as_view(), name='encounter_pdf'),
    path('patients/<uuid:patient_id>/evolution/', PatientEvolutionHistoryView.as_view(), name='patient_evolution'),
    path('conditions/', PatientConditionListCreateView.as_view(), name='patient_conditions'),
    path('allergies/', PatientAllergyListCreateView.as_view(), name='patient_allergies'),
    path('medications/', PatientMedicationListCreateView.as_view(), name='patient_medications'),
]
