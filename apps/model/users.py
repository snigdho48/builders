from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UserProfile(TimeStampedModel):
    class UserRole(models.TextChoices):
        ADMIN = "admin", "Admin"
        AGENT = "agent", "Agent"
        INVESTOR = "investor", "Investor"

    class KycStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=30, blank=True)
    referral_code = models.CharField(max_length=20, unique=True, db_index=True)
    profile_photo = models.ImageField(upload_to="profiles/", null=True, blank=True)
    referral_commission_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("5.00"),
        help_text="Reserved for future referral rewards when a referred user books land.",
    )
    role = models.CharField(
        max_length=20, choices=UserRole.choices, default=UserRole.INVESTOR
    )
    referred_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="referred_profiles",
    )
    kyc_status = models.CharField(
        max_length=20,
        choices=KycStatus.choices,
        default=KycStatus.PENDING,
        db_index=True,
    )
    kyc_notes = models.TextField(
        blank=True,
        help_text="Internal verification notes (staff only; not shown to the investor).",
    )
    kyc_verified_at = models.DateTimeField(null=True, blank=True)
    kyc_verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="kyc_verifications_recorded",
    )
    kyc_requested_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Last time the investor asked for KYC review (in-app request).",
    )
    kyc_investor_notes = models.TextField(
        blank=True,
        help_text="Optional message from the investor with their KYC request.",
    )

    def __str__(self) -> str:
        return f"{self.user.username} profile"
