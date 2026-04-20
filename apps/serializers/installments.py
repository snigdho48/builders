from django.utils import timezone
from rest_framework import serializers

from apps.models import InstallmentLedger


class InstallmentLedgerSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(read_only=True)
    property_title = serializers.CharField(source="booking.property.title", read_only=True)
    plan_type = serializers.CharField(source="booking.plan_type", read_only=True)
    status = serializers.SerializerMethodField()
    notification = serializers.SerializerMethodField()

    class Meta:
        model = InstallmentLedger
        fields = [
            "id",
            "booking_id",
            "property_title",
            "plan_type",
            "installment_no",
            "due_date",
            "amount_due",
            "amount_paid",
            "status",
            "paid_at",
            "notification",
            "reminder_sent_at",
            "reminder_note",
            "payment_reference",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def _effective_status(self, obj: InstallmentLedger) -> str:
        today = timezone.now().date()
        if obj.amount_paid >= obj.amount_due and obj.amount_due > 0:
            return "paid"
        if obj.amount_paid > 0:
            return "partial"
        if obj.due_date < today:
            return "overdue"
        return "unpaid"

    def get_status(self, obj: InstallmentLedger) -> str:
        return self._effective_status(obj)

    def get_notification(self, obj: InstallmentLedger) -> str:
        today = timezone.now().date()
        status = self._effective_status(obj)
        if status == "paid":
            return "paid"
        if status == "overdue":
            return "overdue"
        if (obj.due_date - today).days <= 3:
            return "due_soon"
        return "upcoming"


class InstallmentCompleteSerializer(serializers.Serializer):
    payment_reference = serializers.CharField(required=False, allow_blank=True, max_length=120, default="")

