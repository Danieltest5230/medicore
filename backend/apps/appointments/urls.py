from django.urls import path
from .views import (
    AppointmentTypeListCreateView, DoctorScheduleListCreateView,
    AppointmentListCreateView, AppointmentDetailView, CheckInView, CallPatientView
)

urlpatterns = [
    path('types/', AppointmentTypeListCreateView.as_view(), name='appointment_types'),
    path('schedules/', DoctorScheduleListCreateView.as_view(), name='doctor_schedules'),
    path('', AppointmentListCreateView.as_view(), name='appointment_list_create'),
    path('<uuid:pk>/', AppointmentDetailView.as_view(), name='appointment_detail'),
    path('<uuid:pk>/check-in/', CheckInView.as_view(), name='appointment_check_in'),
    path('<uuid:pk>/call/', CallPatientView.as_view(), name='appointment_call'),
]
