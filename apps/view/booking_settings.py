from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.models import LandBooking, SiteSettings
from apps.utils.response_formatter import success_response


class BookingPromoSettingsView(APIView):
    """Public: slot usage for plot-buy 1% / 50% plans (admin-configurable cap)."""

    permission_classes = [AllowAny]

    def get(self, request):
        row = SiteSettings.objects.first()
        enabled = row.plot_buy_installment_promo_enabled if row else True
        limit = row.plot_buy_installment_slot_limit if row else 100
        used = LandBooking.objects.filter(
            booking_kind=LandBooking.BookingKind.PLOT_BUY,
            plan_type__in=(
                LandBooking.PlanType.ONE_PERCENT_INSTALLMENT,
                LandBooking.PlanType.FIFTY_PERCENT_INSTALLMENT,
            ),
            status__in=(LandBooking.Status.PENDING, LandBooking.Status.ACCEPTED),
        ).count()
        if not enabled:
            available = 0
        else:
            available = max(0, limit - used)
        return Response(
            success_response(
                data={
                    "plot_buy_installment_promo_enabled": enabled,
                    "plot_buy_installment_slot_limit": limit,
                    "plot_buy_installment_slots_used": used,
                    "plot_buy_installment_slots_available": available,
                }
            )
        )
