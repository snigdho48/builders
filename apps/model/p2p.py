from decimal import Decimal

from django.conf import settings
from django.db import models

from .users import TimeStampedModel


class P2PListing(TimeStampedModel):
    """Investor-owned resale listing on the peer-to-peer marketplace."""

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        SOLD = "sold", "Sold"
        WITHDRAWN = "withdrawn", "Withdrawn"

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="p2p_listings",
    )
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=220, db_index=True)
    description = models.TextField()
    location_name = models.CharField(max_length=160)
    asking_price_hint = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Optional guide price shown to buyers.",
    )
    land_area_sqft = models.PositiveIntegerField(null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=40, blank=True)
    features = models.JSONField(default=list, blank=True)
    hero_image = models.URLField(blank=True)
    gallery_images = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
    )

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["seller", "slug"], name="uniq_p2p_listing_seller_slug"),
        ]

    def __str__(self) -> str:
        return f"P2P #{self.pk} — {self.title[:40]}"


class P2PBid(TimeStampedModel):
    """Buyer offer on a P2P listing."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"

    listing = models.ForeignKey(
        P2PListing,
        on_delete=models.CASCADE,
        related_name="bids",
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="p2p_bids_placed",
    )
    bid_price = models.DecimalField(max_digits=14, decimal_places=2)
    message = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Bid #{self.pk} on listing {self.listing_id}"
