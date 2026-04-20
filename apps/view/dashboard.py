from datetime import date

from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.constants import ROLE_AGENT, ROLE_INVESTOR, is_staff_admin
from apps.models import LandBooking, LandShareListing, Property
from apps.permissions import IsAuthenticatedAndKnownRole
from apps.serializers.dashboard import AdminDashboardSerializer, AgentDashboardSerializer, InvestorDashboardSerializer
from apps.utils.response_formatter import success_response

User = get_user_model()


def _last_month_starts(months: int = 6) -> list[date]:
    """Return first day of each month for the trailing window, oldest -> newest."""
    now = timezone.localdate()
    starts: list[date] = []
    year = now.year
    month = now.month
    for i in range(months - 1, -1, -1):
        m = month - i
        y = year
        while m <= 0:
            m += 12
            y -= 1
        starts.append(date(y, m, 1))
    return starts


def _month_label(month_start: date) -> str:
    return month_start.strftime("%b")


class DashboardView(APIView):
    permission_classes = [IsAuthenticatedAndKnownRole]

    def get(self, request):
        role = request.user.profile.role

        if is_staff_admin(role):
            month_starts = _last_month_starts(6)
            month_index = {m: _month_label(m) for m in month_starts}

            booking_month_rows = (
                LandBooking.objects.filter(created_at__date__gte=month_starts[0])
                .annotate(month=TruncMonth("created_at"))
                .values("month")
                .annotate(
                    total=Count("id"),
                    pending=Count("id", filter=Q(status=LandBooking.Status.PENDING)),
                )
                .order_by("month")
            )
            booking_counts = {
                row["month"].date().replace(day=1): {
                    "total": row["total"],
                    "pending": row["pending"],
                }
                for row in booking_month_rows
                if row.get("month")
            }
            booking_trend = [
                {
                    "label": month_index[m],
                    "total": booking_counts.get(m, {}).get("total", 0),
                    "pending": booking_counts.get(m, {}).get("pending", 0),
                }
                for m in month_starts
            ]

            users_month_rows = (
                User.objects.filter(date_joined__date__gte=month_starts[0])
                .annotate(month=TruncMonth("date_joined"))
                .values("month")
                .annotate(total=Count("id"))
                .order_by("month")
            )
            props_month_rows = (
                Property.objects.filter(created_at__date__gte=month_starts[0])
                .annotate(month=TruncMonth("created_at"))
                .values("month")
                .annotate(total=Count("id"))
                .order_by("month")
            )
            users_counts = {
                row["month"].date().replace(day=1): row["total"]
                for row in users_month_rows
                if row.get("month")
            }
            props_counts = {
                row["month"].date().replace(day=1): row["total"]
                for row in props_month_rows
                if row.get("month")
            }
            asset_trend = [
                {
                    "label": month_index[m],
                    "users": users_counts.get(m, 0),
                    "properties": props_counts.get(m, 0),
                }
                for m in month_starts
            ]

            payload = {
                "total_users": User.objects.count(),
                "total_properties": Property.objects.count() + LandShareListing.objects.count(),
                "total_bookings": LandBooking.objects.count(),
                "pending_bookings": LandBooking.objects.filter(status=LandBooking.Status.PENDING).count(),
                "booking_trend": booking_trend,
                "asset_trend": asset_trend,
            }
            return Response(success_response(data=AdminDashboardSerializer(payload).data))

        if role == ROLE_AGENT:
            month_starts = _last_month_starts(6)
            month_index = {m: _month_label(m) for m in month_starts}
            managed = Property.objects.filter(assigned_agent=request.user)
            managed_ls = LandShareListing.objects.filter(assigned_agent=request.user)
            pending = LandBooking.objects.filter(
                status=LandBooking.Status.PENDING,
            ).filter(
                Q(property__assigned_agent=request.user) | Q(land_share_listing__assigned_agent=request.user)
            )
            managed_month_rows = (
                managed.filter(created_at__date__gte=month_starts[0])
                .annotate(month=TruncMonth("created_at"))
                .values("month")
                .annotate(total=Count("id"))
                .order_by("month")
            )
            managed_ls_month_rows = (
                managed_ls.filter(created_at__date__gte=month_starts[0])
                .annotate(month=TruncMonth("created_at"))
                .values("month")
                .annotate(total=Count("id"))
                .order_by("month")
            )
            pending_month_rows = (
                LandBooking.objects.filter(
                    created_at__date__gte=month_starts[0],
                )
                .filter(
                    Q(property__assigned_agent=request.user) | Q(land_share_listing__assigned_agent=request.user)
                )
                .annotate(month=TruncMonth("created_at"))
                .values("month")
                .annotate(total=Count("id", filter=Q(status=LandBooking.Status.PENDING)))
                .order_by("month")
            )
            managed_counts: dict = {}
            for row in managed_month_rows:
                if row.get("month"):
                    k = row["month"].date().replace(day=1)
                    managed_counts[k] = managed_counts.get(k, 0) + row["total"]
            for row in managed_ls_month_rows:
                if row.get("month"):
                    k = row["month"].date().replace(day=1)
                    managed_counts[k] = managed_counts.get(k, 0) + row["total"]
            pending_counts = {
                row["month"].date().replace(day=1): row["total"]
                for row in pending_month_rows
                if row.get("month")
            }
            workload_trend = [
                {
                    "label": month_index[m],
                    "managed": managed_counts.get(m, 0),
                    "pending": pending_counts.get(m, 0),
                }
                for m in month_starts
            ]
            payload = {
                "managed_properties": managed.count() + managed_ls.count(),
                "pending_bookings": pending.count(),
                "workload_trend": workload_trend,
            }
            return Response(success_response(data=AgentDashboardSerializer(payload).data))

        if role == ROLE_INVESTOR:
            mine = LandBooking.objects.filter(investor=request.user)
            prof = request.user.profile
            payload = {
                "my_pending_bookings": mine.filter(status=LandBooking.Status.PENDING).count(),
                "my_accepted_bookings": mine.filter(status=LandBooking.Status.ACCEPTED).count(),
                "my_rejected_bookings": mine.filter(status=LandBooking.Status.REJECTED).count(),
                "kyc_status": prof.kyc_status,
                "kyc_requested_at": prof.kyc_requested_at.isoformat() if prof.kyc_requested_at else "",
            }
            return Response(success_response(data=InvestorDashboardSerializer(payload).data))

        return Response(success_response(data={}))
