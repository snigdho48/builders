import uuid
from pathlib import Path

from django.conf import settings
from django.db import models
from django.db.models import Q

from .land_share_listings import LandShareListing
from .properties import Property
from .plots import Plot
from .users import TimeStampedModel


class LandBooking(TimeStampedModel):
    """Investor booking request for a land listing (staff approve/reject)."""

    class BookingKind(models.TextChoices):
        PLOT_BUY = "plot_buy", "Plot buy"
        INVESTMENT = "investment", "Investment"

    class PlanType(models.TextChoices):
        ONE_PERCENT_INSTALLMENT = "one_percent_installment", "1% installment"
        FIFTY_PERCENT_INSTALLMENT = "fifty_percent_installment", "50% installment"
        INVESTMENT = "investment", "Investment (non-installment)"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="bookings",
        null=True,
        blank=True,
    )
    land_share_listing = models.ForeignKey(
        LandShareListing,
        on_delete=models.CASCADE,
        related_name="bookings",
        null=True,
        blank=True,
    )
    investor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="land_bookings",
    )
    booking_kind = models.CharField(
        max_length=20,
        choices=BookingKind.choices,
        default=BookingKind.PLOT_BUY,
    )
    plan_type = models.CharField(max_length=40, choices=PlanType.choices)
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    contact_notes = models.TextField(blank=True)
    referral_code_used = models.CharField(max_length=40, blank=True)
    selected_plot = models.ForeignKey(Plot, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings")
    selected_plot_code = models.CharField(max_length=40, blank=True)
    selected_plot_area_sqft = models.PositiveIntegerField(null=True, blank=True)
    selected_plot_price = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    investment_option_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Land-share tier amount chosen by the investor (must match property tiers when set).",
    )
    investment_option_duration_years = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Legacy: tier duration in years when migrated from old share_investment_options.",
    )
    investment_option_billing_period = models.CharField(
        max_length=16,
        blank=True,
        help_text="Land-share tier billing_period: monthly, yearly, or one_time (must match listing tier).",
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_land_bookings",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    application_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Extended plot-booking application (structured form answers).",
    )

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(property__isnull=False, land_share_listing__isnull=True)
                    | Q(property__isnull=True, land_share_listing__isnull=False)
                ),
                name="booking_exactly_one_listing",
            ),
        ]

    def __str__(self) -> str:
        lid = self.property_id or self.land_share_listing_id
        return f"Booking #{self.pk} — listing {lid} ({self.status})"


def _booking_attachment_upload_to(instance: "LandBookingAttachment", filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext not in (".jpg", ".jpeg", ".png", ".webp", ".pdf", ".heic", ".heif"):
        ext = ".bin"
    safe = f"{instance.kind}_{uuid.uuid4().hex[:12]}{ext}"
    return f"booking_attachments/{instance.booking_id}/{safe}"


class LandBookingAttachment(TimeStampedModel):
    """Files submitted with a plot-booking application (photos, NID, booking receipt)."""

    class Kind(models.TextChoices):
        PASSPORT_PHOTO_1 = "passport_photo_1", "Passport photo 1"
        NID_OR_ID = "nid_or_id", "NID or valid ID copy"
        BOOKING_MONEY_RECEIPT = "booking_money_receipt", "Booking money receipt / proof"
        JOINT_APPLICANT_01_PASSPORT_PHOTO = (
            "joint_applicant_01_passport_photo",
            "Joint applicant 1 — passport-size photo",
        )
        JOINT_APPLICANT_01_NID_OR_ID = (
            "joint_applicant_01_nid_or_id",
            "Joint applicant 1 — NID or valid ID",
        )
        JOINT_APPLICANT_02_PASSPORT_PHOTO = (
            "joint_applicant_02_passport_photo",
            "Joint applicant 2 — passport-size photo",
        )
        JOINT_APPLICANT_02_NID_OR_ID = (
            "joint_applicant_02_nid_or_id",
            "Joint applicant 2 — NID or valid ID",
        )
        JOINT_APPLICANT_03_PASSPORT_PHOTO = (
            "joint_applicant_03_passport_photo",
            "Joint applicant 3 — passport-size photo",
        )
        JOINT_APPLICANT_03_NID_OR_ID = (
            "joint_applicant_03_nid_or_id",
            "Joint applicant 3 — NID or valid ID",
        )
        JOINT_APPLICANT_04_PASSPORT_PHOTO = (
            "joint_applicant_04_passport_photo",
            "Joint applicant 4 — passport-size photo",
        )
        JOINT_APPLICANT_04_NID_OR_ID = (
            "joint_applicant_04_nid_or_id",
            "Joint applicant 4 — NID or valid ID",
        )
        JOINT_APPLICANT_05_PASSPORT_PHOTO = (
            "joint_applicant_05_passport_photo",
            "Joint applicant 5 — passport-size photo",
        )
        JOINT_APPLICANT_05_NID_OR_ID = (
            "joint_applicant_05_nid_or_id",
            "Joint applicant 5 — NID or valid ID",
        )
        NOMINEE_01_PASSPORT_PHOTO = "nominee_01_passport_photo", "Nominee 1 — passport-size photo"
        NOMINEE_01_NID_OR_ID = "nominee_01_nid_or_id", "Nominee 1 — NID or valid ID"
        NOMINEE_02_PASSPORT_PHOTO = "nominee_02_passport_photo", "Nominee 2 — passport-size photo"
        NOMINEE_02_NID_OR_ID = "nominee_02_nid_or_id", "Nominee 2 — NID or valid ID"
        NOMINEE_03_PASSPORT_PHOTO = "nominee_03_passport_photo", "Nominee 3 — passport-size photo"
        NOMINEE_03_NID_OR_ID = "nominee_03_nid_or_id", "Nominee 3 — NID or valid ID"
        NOMINEE_04_PASSPORT_PHOTO = "nominee_04_passport_photo", "Nominee 4 — passport-size photo"
        NOMINEE_04_NID_OR_ID = "nominee_04_nid_or_id", "Nominee 4 — NID or valid ID"
        NOMINEE_05_PASSPORT_PHOTO = "nominee_05_passport_photo", "Nominee 5 — passport-size photo"
        NOMINEE_05_NID_OR_ID = "nominee_05_nid_or_id", "Nominee 5 — NID or valid ID"

    booking = models.ForeignKey(
        LandBooking,
        on_delete=models.CASCADE,
        related_name="application_attachments",
    )
    kind = models.CharField(max_length=40, choices=Kind.choices)
    file = models.FileField(upload_to=_booking_attachment_upload_to)

    class Meta:
        ordering = ["kind"]
        constraints = [
            models.UniqueConstraint(fields=["booking", "kind"], name="uniq_booking_attachment_kind"),
        ]

    def __str__(self) -> str:
        return f"Booking {self.booking_id} — {self.kind}"


class InstallmentLedger(TimeStampedModel):
    """Single source of installment truth for accepted land bookings."""

    class Status(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"
        PARTIAL = "partial", "Partial"

    booking = models.ForeignKey(
        LandBooking,
        on_delete=models.CASCADE,
        related_name="installments",
    )
    investor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="installment_ledgers",
    )
    installment_no = models.PositiveIntegerField()
    due_date = models.DateField(db_index=True)
    amount_due = models.DecimalField(max_digits=14, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UNPAID, db_index=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    reminder_sent_at = models.DateTimeField(null=True, blank=True)
    reminder_note = models.CharField(max_length=120, blank=True)
    payment_reference = models.CharField(max_length=120, blank=True)

    class Meta:
        ordering = ["due_date", "installment_no"]
        constraints = [
            models.UniqueConstraint(fields=["booking", "installment_no"], name="uniq_installment_per_booking_no"),
        ]

    def __str__(self) -> str:
        return f"Installment #{self.installment_no} for booking {self.booking_id}"
