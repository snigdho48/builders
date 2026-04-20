from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.constants import ROLE_AGENT, ROLE_INVESTOR, is_staff_admin
from apps.models import InstallmentLedger
from apps.view.base import StandardReadOnlyModelViewSet
from apps.serializers.installments import InstallmentCompleteSerializer, InstallmentLedgerSerializer


class InstallmentLedgerViewSet(StandardReadOnlyModelViewSet):
    serializer_class = InstallmentLedgerSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]
    queryset = InstallmentLedger.objects.select_related("booking", "booking__property", "investor").order_by(
        "due_date", "installment_no"
    )

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        role = getattr(user.profile, "role", None)
        if role == ROLE_INVESTOR:
            return qs.filter(investor=user)
        if is_staff_admin(role):
            return qs
        if role == ROLE_AGENT:
            return qs.filter(booking__property__assigned_agent=user)
        return InstallmentLedger.objects.none()

    def _can_manage_installment(self, obj: InstallmentLedger) -> bool:
        user = self.request.user
        role = getattr(user.profile, "role", None)
        if is_staff_admin(role):
            return True
        if role == ROLE_AGENT:
            return obj.booking.property.assigned_agent_id == user.id
        return False

    @action(detail=True, methods=["post"], url_path="mark-complete")
    def mark_complete(self, request, pk=None):
        row = self.get_object()
        if not self._can_manage_installment(row):
            return Response(status=status.HTTP_403_FORBIDDEN)
        ser = InstallmentCompleteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        row.amount_paid = row.amount_due
        row.status = InstallmentLedger.Status.PAID
        row.paid_at = timezone.now()
        row.payment_reference = ser.validated_data.get("payment_reference", "").strip()
        row.save(update_fields=["amount_paid", "status", "paid_at", "payment_reference", "updated_at"])
        out = InstallmentLedgerSerializer(row, context={"request": request})
        return self.respond(data=out.data, message="Installment marked as paid")

