from django.urls import path
from .views import PaymentListCreateView, PaymentDetailView

urlpatterns = [
    path('payments/', PaymentListCreateView.as_view(), name='payment_list_create'),
    path('payments/<uuid:pk>/', PaymentDetailView.as_view(), name='payment_detail'),
]
