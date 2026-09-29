from rest_framework import serializers, generics, permissions
from .models import Payment, DailyCashRegister
from apps.patients.serializers import PatientSerializer


class PaymentSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'patient', 'patient_details', 'appointment', 'concept',
            'amount', 'payment_method', 'payment_method_display', 'status',
            'receipt_number', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DailyCashRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyCashRegister
        fields = '__all__'


class PaymentListCreateView(generics.ListCreateAPIView):
    queryset = Payment.objects.all().select_related('patient', 'appointment')
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        patient_id = self.request.query_params.get('patient_id')
        date_str = self.request.query_params.get('date')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        if date_str:
            qs = qs.filter(created_at__date=date_str)
        return qs


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Payment.objects.all().select_related('patient', 'appointment')
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
