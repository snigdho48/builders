from __future__ import annotations

from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.constants import ROLE_AGENT, ROLE_INVESTOR, is_staff_admin

User = get_user_model()
from apps.models import (
    InstallmentLedger,
    LandBooking,
    LandBookingAttachment,
    LandShareListing,
    Plot,
    Property,
    SiteSettings,
    UserProfile,
)


def _plot_buy_promo_limit() -> int:
    row = SiteSettings.objects.first()
    return row.plot_buy_installment_slot_limit if row else 100


def _plot_buy_promo_slots_used() -> int:
    return LandBooking.objects.filter(
        booking_kind=LandBooking.BookingKind.PLOT_BUY,
        plan_type__in=(
            LandBooking.PlanType.ONE_PERCENT_INSTALLMENT,
            LandBooking.PlanType.FIFTY_PERCENT_INSTALLMENT,
        ),
        status__in=(LandBooking.Status.PENDING, LandBooking.Status.ACCEPTED),
    ).count()


def _payment_tier_matches(ls: LandShareListing, amount: Decimal, billing_period: str) -> bool:
    opts = ls.payment_options or []
    if not isinstance(opts, list):
        return False
    bp_norm = (billing_period or "monthly").strip().lower()
    amt = amount.quantize(Decimal("0.01"))
    for o in opts:
        if not isinstance(o, dict):
            continue
        try:
            ta = Decimal(str(o.get("amount", "0"))).quantize(Decimal("0.01"))
            op = (o.get("billing_period") or "monthly").strip().lower()
        except (ArithmeticError, TypeError, ValueError):
            continue
        if ta == amt and op == bp_norm:
            return True
    return False


class LandBookingAttachmentSerializer(serializers.ModelSerializer):
    """Expose stored file URL (absolute when request is in serializer context)."""

    file = serializers.SerializerMethodField()

    class Meta:
        model = LandBookingAttachment
        fields = ["id", "kind", "file", "created_at"]

    def get_file(self, obj: LandBookingAttachment):
        if not obj.file:
            return None
        url = obj.file.url
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(url)
        return url


def _strip_client_application_reference(app: dict | None) -> dict | None:
    """IDs are server-generated; ignore client-sent form_id_no / form_file_no."""
    if app is None:
        return None
    if not isinstance(app, dict):
        return app
    out = dict(app)
    out.pop("form_id_no", None)
    out.pop("form_file_no", None)
    return out


def _stamp_application_reference_numbers(booking: LandBooking) -> None:
    """Eurostar-style Owner ID / File numbers after booking PK exists."""
    raw = booking.application_data
    app = dict(raw) if isinstance(raw, dict) else {}
    uid = booking.pk
    app["form_id_no"] = f"EGA-{uid:07d}"
    app["form_file_no"] = f"EGF-{uid:07d}"
    booking.application_data = app
    booking.save(update_fields=["application_data"])


def _validate_application_data(value):
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise serializers.ValidationError("application_data must be a JSON object.")
    # Soft limit to avoid abuse (approx 64KB serialized)
    try:
        from django.core.serializers.json import DjangoJSONEncoder
        import json

        raw = json.dumps(value, cls=DjangoJSONEncoder)
        if len(raw) > 65536:
            raise serializers.ValidationError("application_data is too large.")
    except serializers.ValidationError:
        raise
    except Exception as exc:
        raise serializers.ValidationError("Invalid application_data.") from exc
    return value


class LandBookingSerializer(serializers.ModelSerializer):
    property_title = serializers.SerializerMethodField(read_only=True)
    property_sale_type = serializers.SerializerMethodField(read_only=True)
    investor_username = serializers.CharField(source="investor.username", read_only=True)
    investor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
    )
    reviewed_by_username = serializers.SerializerMethodField(read_only=True)
    workflow_state = serializers.SerializerMethodField(read_only=True)
    application_attachments = LandBookingAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = LandBooking
        fields = [
            "id",
            "property",
            "land_share_listing",
            "property_title",
            "property_sale_type",
            "investor",
            "investor_username",
            "booking_kind",
            "plan_type",
            "full_name",
            "email",
            "phone",
            "contact_notes",
            "referral_code_used",
            "selected_plot_code",
            "selected_plot_area_sqft",
            "selected_plot_price",
            "investment_option_amount",
            "investment_option_duration_years",
            "investment_option_billing_period",
            "status",
            "workflow_state",
            "reviewed_by",
            "reviewed_by_username",
            "reviewed_at",
            "rejection_reason",
            "application_data",
            "application_attachments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "status",
            "reviewed_by",
            "reviewed_at",
            "rejection_reason",
            "created_at",
            "updated_at",
            "property_title",
            "property_sale_type",
            "investor_username",
            "reviewed_by_username",
        ]

    application_data = serializers.JSONField(required=False, default=dict)

    def validate_application_data(self, value):
        return _validate_application_data(value)

    def get_reviewed_by_username(self, obj):
        if not obj.reviewed_by_id:
            return None
        u = obj.reviewed_by
        return u.get_full_name().strip() or u.username

    def get_workflow_state(self, obj):
        """
        Lightweight API state for UI workflows:
        - investor_submitted: intake submitted, awaiting staff processing
        - processed: accepted and installment generation done
        - rejected: rejected by staff
        """
        if obj.status == LandBooking.Status.ACCEPTED:
            return "processed"
        if obj.status == LandBooking.Status.REJECTED:
            return "rejected"
        return "investor_submitted"

    def get_property_title(self, obj):
        if obj.property_id:
            return obj.property.title
        if obj.land_share_listing_id:
            return obj.land_share_listing.title
        return None

    def get_property_sale_type(self, obj):
        if obj.property_id:
            return obj.property.sale_type
        return "installment"

    def validate_property(self, prop: Property):
        if prop is None:
            return prop
        if not prop.listing_active or prop.status != Property.PropertyStatus.AVAILABLE:
            raise serializers.ValidationError("This land is not available for booking.")
        return prop

    def validate_land_share_listing(self, ls: LandShareListing):
        if ls is None:
            return ls
        if not ls.listing_active or ls.status != LandShareListing.ListingStatus.AVAILABLE:
            raise serializers.ValidationError("This land-share listing is not available for booking.")
        return ls

    def validate_investor(self, inv):
        """Optional on create: staff may book for another user (must be an investor)."""
        if inv is None:
            return inv
        role = getattr(getattr(inv, "profile", None), "role", None)
        if role != ROLE_INVESTOR:
            raise serializers.ValidationError("The selected user must have the investor role.")
        return inv

    def validate_referral_code_used(self, value):
        v = (value or "").strip()
        if not v:
            return ""
        if not UserProfile.objects.filter(referral_code__iexact=v).exists():
            raise serializers.ValidationError("Invalid referral code.")
        return v

    def validate(self, attrs):
        prop = attrs.get("property")
        ls = attrs.get("land_share_listing")
        plot_code = (attrs.get("selected_plot_code") or "").strip()
        booking_kind = attrs.get("booking_kind", LandBooking.BookingKind.PLOT_BUY)
        plan_type = attrs.get("plan_type")

        if booking_kind == LandBooking.BookingKind.PLOT_BUY:
            if not prop or ls:
                raise serializers.ValidationError("Plot buy requires a plot listing (property) only.")
            if not plot_code:
                raise serializers.ValidationError({"selected_plot_code": "Selecting a plot is required."})
            if not Plot.objects.filter(property=prop, plot_id__iexact=plot_code).exists():
                raise serializers.ValidationError(
                    {"selected_plot_code": "Selected plot does not exist for this property."}
                )
            if plan_type not in (
                LandBooking.PlanType.ONE_PERCENT_INSTALLMENT,
                LandBooking.PlanType.FIFTY_PERCENT_INSTALLMENT,
            ):
                raise serializers.ValidationError(
                    {"plan_type": "Plot buy requires the 1% or 50% installment plan."}
                )
            limit = _plot_buy_promo_limit()
            if _plot_buy_promo_slots_used() >= limit:
                raise serializers.ValidationError(
                    "Plot-buy 1% and 50% installment slots are full. Choose Investment or contact support."
                )
        elif booking_kind == LandBooking.BookingKind.INVESTMENT:
            if plan_type != LandBooking.PlanType.INVESTMENT:
                raise serializers.ValidationError(
                    {"plan_type": "Investment bookings must use the investment plan option."}
                )
            if ls:
                if prop:
                    raise serializers.ValidationError("Use either property or land_share_listing, not both.")
                if plot_code:
                    raise serializers.ValidationError(
                        {"selected_plot_code": "Land-share bookings do not use plot selection."}
                    )
                opts = ls.payment_options or []
                if not isinstance(opts, list):
                    opts = []
                if opts:
                    amt_raw = attrs.get("investment_option_amount")
                    per_raw = attrs.get("investment_option_billing_period")
                    if amt_raw is None or not (per_raw and str(per_raw).strip()):
                        raise serializers.ValidationError(
                            {
                                "investment_option_amount": "Select a payment tier (amount and billing period) for this listing."
                            }
                        )
                    try:
                        amt_dec = Decimal(str(amt_raw)).quantize(Decimal("0.01"))
                        per_norm = str(per_raw).strip().lower()
                    except (ArithmeticError, TypeError, ValueError) as exc:
                        raise serializers.ValidationError(
                            {"investment_option_amount": "Invalid investment amount or billing period."}
                        ) from exc
                    if per_norm != "monthly":
                        raise serializers.ValidationError(
                            {"investment_option_billing_period": "Land-share investment tiers must be monthly."}
                        )
                    if not _payment_tier_matches(ls, amt_dec, per_norm):
                        raise serializers.ValidationError(
                            {
                                "investment_option_amount": "Selected amount and billing period must match a tier on the listing."
                            }
                        )
            elif prop:
                if not plot_code:
                    raise serializers.ValidationError({"selected_plot_code": "Selecting a plot is required."})
                if not Plot.objects.filter(property=prop, plot_id__iexact=plot_code).exists():
                    raise serializers.ValidationError(
                        {"selected_plot_code": "Selected plot does not exist for this property."}
                    )
            else:
                raise serializers.ValidationError(
                    {"property": "Investment booking requires a plot listing or a land-share listing."}
                )
        else:
            raise serializers.ValidationError({"booking_kind": "Invalid booking type."})

        request = self.context.get("request")
        actor = request.user if request and request.user.is_authenticated else None
        actor_role = getattr(getattr(actor, "profile", None), "role", None) if actor else None
        target_investor = attrs.get("investor")
        if target_investor is not None:
            if not (is_staff_admin(actor_role) or actor_role == ROLE_AGENT):
                raise serializers.ValidationError(
                    {"investor": "Only admin or agent can create a booking for another investor."}
                )
            if actor_role == ROLE_AGENT:
                if prop and getattr(prop, "assigned_agent_id", None) != actor.id:
                    raise serializers.ValidationError(
                        {"investor": "You can only create bookings for plot listings assigned to you."}
                    )
                if ls and getattr(ls, "assigned_agent_id", None) != actor.id:
                    raise serializers.ValidationError(
                        {"investor": "You can only create bookings for land-share listings assigned to you."}
                    )
        elif actor_role == ROLE_AGENT or is_staff_admin(actor_role):
            raise serializers.ValidationError(
                {
                    "investor": "Select which investor this booking is for (complete the booking flow with an investor assigned)."
                }
            )
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user if request and request.user.is_authenticated else None
        if not user:
            raise serializers.ValidationError("Authentication required.")
        # Default: investor books for themselves. Staff may pass `investor` (PK) for proxy booking.
        investor_user = validated_data.pop("investor", None) or user
        plot_code = (validated_data.pop("selected_plot_code", "") or "").strip()
        validated_data.pop("selected_plot_area_sqft", None)
        validated_data.pop("selected_plot_price", None)
        prop = validated_data.pop("property", None)
        ls = validated_data.pop("land_share_listing", None)
        booking_kind = validated_data.get("booking_kind", LandBooking.BookingKind.PLOT_BUY)
        per = validated_data.get("investment_option_billing_period")
        if per:
            validated_data["investment_option_billing_period"] = str(per).strip().lower()

        app_raw = validated_data.get("application_data")
        if isinstance(app_raw, dict):
            stripped = _strip_client_application_reference(app_raw)
            validated_data["application_data"] = stripped

        with transaction.atomic():
            if booking_kind == LandBooking.BookingKind.PLOT_BUY:
                plot = (
                    Plot.objects.select_for_update()
                    .filter(property=prop, plot_id__iexact=plot_code)
                    .first()
                )
                if not plot:
                    raise serializers.ValidationError({"selected_plot_code": "Plot not found."})
                if plot.status != Plot.PlotStatus.AVAILABLE:
                    raise serializers.ValidationError({"selected_plot_code": "Plot is not available anymore."})

                booking = LandBooking.objects.create(
                    investor=investor_user,
                    status=LandBooking.Status.PENDING,
                    property=prop,
                    land_share_listing=None,
                    selected_plot=plot,
                    selected_plot_code=plot.plot_id,
                    selected_plot_area_sqft=plot.area_sqft,
                    selected_plot_price=plot.price,
                    **validated_data,
                )
                plot.status = Plot.PlotStatus.BOOKED
                plot.save(update_fields=["status", "updated_at"])
                _sync_property_status_from_plots(prop)
                _stamp_application_reference_numbers(booking)
                return booking

            if ls:
                booking_ls = LandBooking.objects.create(
                    investor=investor_user,
                    status=LandBooking.Status.PENDING,
                    property=None,
                    land_share_listing=ls,
                    selected_plot=None,
                    selected_plot_code="",
                    selected_plot_area_sqft=None,
                    selected_plot_price=None,
                    **validated_data,
                )
                _stamp_application_reference_numbers(booking_ls)
                return booking_ls

            plot = (
                Plot.objects.select_for_update()
                .filter(property=prop, plot_id__iexact=plot_code)
                .first()
            )
            if not plot:
                raise serializers.ValidationError({"selected_plot_code": "Plot not found."})
            if plot.status != Plot.PlotStatus.AVAILABLE:
                raise serializers.ValidationError({"selected_plot_code": "Plot is not available anymore."})

            booking = LandBooking.objects.create(
                investor=investor_user,
                status=LandBooking.Status.PENDING,
                property=prop,
                land_share_listing=None,
                selected_plot=plot,
                selected_plot_code=plot.plot_id,
                selected_plot_area_sqft=plot.area_sqft,
                selected_plot_price=plot.price,
                **validated_data,
            )
            plot.status = Plot.PlotStatus.BOOKED
            plot.save(update_fields=["status", "updated_at"])
            _sync_property_status_from_plots(prop)
            _stamp_application_reference_numbers(booking)
            return booking


class LandBookingReviewSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField(required=False, allow_blank=True, default="")


class LandBookingProcessSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=False, allow_blank=False, max_length=200)
    email = serializers.EmailField(required=False, allow_blank=False)
    phone = serializers.CharField(required=False, allow_blank=False, max_length=30)
    contact_notes = serializers.CharField(required=False, allow_blank=True)
    referral_code_used = serializers.CharField(required=False, allow_blank=True, max_length=40)
    application_data = serializers.JSONField(required=False)

    def validate_application_data(self, value):
        return _validate_application_data(value)

    def validate_referral_code_used(self, value):
        v = (value or "").strip()
        if not v:
            return ""
        if not UserProfile.objects.filter(referral_code__iexact=v).exists():
            raise serializers.ValidationError("Invalid referral code.")
        return v


def _add_months(d: date, months: int) -> date:
    month = d.month - 1 + months
    year = d.year + month // 12
    month = month % 12 + 1
    day = min(d.day, [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
    return date(year, month, day)


def _create_installment_schedule(booking: LandBooking) -> None:
    if booking.installments.exists():
        return
    if booking.plan_type not in (
        LandBooking.PlanType.ONE_PERCENT_INSTALLMENT,
        LandBooking.PlanType.FIFTY_PERCENT_INSTALLMENT,
    ):
        return
    if not booking.property_id:
        return
    prop = booking.property
    total = Decimal(str(prop.land_price or "0")).quantize(Decimal("0.01"))
    if total <= 0:
        return

    if booking.plan_type == LandBooking.PlanType.ONE_PERCENT_INSTALLMENT:
        down_pct = Decimal("0.01")
    else:
        down_pct = Decimal("0.50")

    down_payment = (total * down_pct).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    remaining = (total - down_payment).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    months = int((prop.installment_years or 1) * 12)
    months = max(months, 1)
    monthly = (remaining / Decimal(months)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    due = timezone.now().date()
    InstallmentLedger.objects.create(
        booking=booking,
        investor=booking.investor,
        installment_no=1,
        due_date=due,
        amount_due=down_payment,
        amount_paid=Decimal("0.00"),
        status=InstallmentLedger.Status.UNPAID,
        reminder_note="upfront",
    )

    consumed = Decimal("0.00")
    for idx in range(1, months + 1):
        amount = monthly
        if idx == months:
            amount = (remaining - consumed).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        consumed += amount
        InstallmentLedger.objects.create(
            booking=booking,
            investor=booking.investor,
            installment_no=idx + 1,
            due_date=_add_months(due, idx),
            amount_due=amount,
            amount_paid=Decimal("0.00"),
            status=InstallmentLedger.Status.UNPAID,
        )


# Land-share tiers are recurring payments; materialize a finite schedule for ledger / dashboard demos.
_LAND_SHARE_MONTHLY_PERIODS = 24
_LAND_SHARE_YEARLY_PERIODS = 10


def _create_land_share_installment_schedule(booking: LandBooking) -> None:
    """Recurring payments for accepted land-share (investment) bookings — one row per billing period."""
    if booking.installments.exists():
        return
    if not booking.land_share_listing_id:
        return
    if booking.plan_type != LandBooking.PlanType.INVESTMENT:
        return
    amt = booking.investment_option_amount
    if amt is None or amt <= 0:
        return
    per = (booking.investment_option_billing_period or "monthly").strip().lower()
    if per not in ("monthly", "yearly", "one_time"):
        per = "monthly"
    start = timezone.now().date()

    if per == "one_time":
        InstallmentLedger.objects.create(
            booking=booking,
            investor=booking.investor,
            installment_no=1,
            due_date=start,
            amount_due=amt.quantize(Decimal("0.01")),
            amount_paid=Decimal("0.00"),
            status=InstallmentLedger.Status.UNPAID,
            reminder_note="land_share_tier",
        )
        return

    count = _LAND_SHARE_MONTHLY_PERIODS if per == "monthly" else _LAND_SHARE_YEARLY_PERIODS
    step_months = 1 if per == "monthly" else 12
    amt_q = amt.quantize(Decimal("0.01"))
    for i in range(1, count + 1):
        InstallmentLedger.objects.create(
            booking=booking,
            investor=booking.investor,
            installment_no=i,
            due_date=_add_months(start, step_months * (i - 1)),
            amount_due=amt_q,
            amount_paid=Decimal("0.00"),
            status=InstallmentLedger.Status.UNPAID,
            reminder_note="land_share_tier",
        )


def _sync_property_status_from_plots(prop: Property) -> None:
    """
    Property remains available while at least one plot is available/booked.
    It becomes sold only when every plot is sold.
    """
    stats = prop.plots.values("status")
    if not stats.exists():
        return
    has_available = stats.filter(status=Plot.PlotStatus.AVAILABLE).exists()
    has_booked = stats.filter(status=Plot.PlotStatus.BOOKED).exists()
    desired = Property.PropertyStatus.AVAILABLE if (has_available or has_booked) else Property.PropertyStatus.SOLD
    if prop.status != desired:
        prop.status = desired
        prop.save(update_fields=["status", "updated_at"])


def apply_accept(booking: LandBooking, reviewer) -> None:
    booking.status = LandBooking.Status.ACCEPTED
    booking.reviewed_by = reviewer
    booking.reviewed_at = timezone.now()
    booking.rejection_reason = ""
    booking.save(update_fields=["status", "reviewed_by", "reviewed_at", "rejection_reason", "updated_at"])
    if booking.selected_plot_id:
        Plot.objects.filter(id=booking.selected_plot_id).update(status=Plot.PlotStatus.SOLD)
    if booking.property_id:
        _sync_property_status_from_plots(booking.property)
    if booking.plan_type in (
        LandBooking.PlanType.ONE_PERCENT_INSTALLMENT,
        LandBooking.PlanType.FIFTY_PERCENT_INSTALLMENT,
    ):
        _create_installment_schedule(booking)
    elif booking.plan_type == LandBooking.PlanType.INVESTMENT and booking.land_share_listing_id:
        _create_land_share_installment_schedule(booking)


def apply_reject(booking: LandBooking, reviewer, reason: str) -> None:
    booking.status = LandBooking.Status.REJECTED
    booking.reviewed_by = reviewer
    booking.reviewed_at = timezone.now()
    booking.rejection_reason = (reason or "").strip()
    booking.save(
        update_fields=["status", "reviewed_by", "reviewed_at", "rejection_reason", "updated_at"]
    )
    if booking.selected_plot_id:
        Plot.objects.filter(id=booking.selected_plot_id).update(status=Plot.PlotStatus.AVAILABLE)
    if booking.property_id:
        _sync_property_status_from_plots(booking.property)
