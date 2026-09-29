from django.urls import path
from .views import PatientListCreateView, PatientDetailView, PatientRepresentativeListCreateView

urlpatterns = [
    path('', PatientListCreateView.as_view(), name='patient_list_create'),
    path('<uuid:pk>/', PatientDetailView.as_view(), name='patient_detail'),
    path('representatives/', PatientRepresentativeListCreateView.as_view(), name='patient_representative_list_create'),
]
