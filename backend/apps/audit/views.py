from rest_framework import serializers, generics, permissions
from .models import ClinicalAuditEvent


class ClinicalAuditEventSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = ClinicalAuditEvent
        fields = '__all__'
        read_only_fields = ['id', 'timestamp', 'checksum']


class ClinicalAuditEventListView(generics.ListAPIView):
    queryset = ClinicalAuditEvent.objects.all().select_related('user')
    serializer_class = ClinicalAuditEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user_id = self.request.query_params.get('user_id')
        action = self.request.query_params.get('action')
        if user_id:
            qs = qs.filter(user_id=user_id)
        if action:
            qs = qs.filter(action=action)
        return qs
