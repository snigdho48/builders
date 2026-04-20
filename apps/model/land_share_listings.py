from decimal import Decimal

from django.conf import settings
from django.db import models

from .users import TimeStampedModel


class LandShareListing(TimeStampedModel):
    """
    Land-share listings: payment tiers (e.g. ৳2,000/month, ৳50,000/month) set by admin/agent.
    Separate from Property (plot / map listings). No plot geometry here.
    """

    class PropertyKind(models.TextChoices):
        APARTMENT = "apartment", "Apartment"
        VILLA = "villa", "Villa"
        COMMERCIAL = "commercial", "Commercial"
        LAND = "land", "Land"

    class ListingStatus(models.TextChoices):
        AVAILABLE = "available", "Available"
        SOLD = "sold", "Sold"
        BOOKED = "booked", "Booked"

    property_type = models.CharField(
        max_length=20,
        choices=PropertyKind.choices,
        default=PropertyKind.LAND,
    )
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(
        help_text="Primary listing copy; may contain HTML from staff UIs (sanitize before public display).",
    )
    description_secondary = models.TextField(blank=True)
    land_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("1.00"),
        help_text="Headline reference price (e.g. 'from' or parcel reference).",
    )
    payment_options = models.JSONField(
        default=list,
        blank=True,
        help_text='Tiers, e.g. [{"amount":"2000.00","billing_period":"monthly"},'
        '{"amount":"50000.00","billing_period":"monthly"}]. billing_period: monthly|yearly|one_time',
    )
    location_name = models.CharField(max_length=160)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    video_url = models.URLField(blank=True)
    top_view_image = models.URLField(blank=True)
    gallery_images = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    amenities = models.JSONField(default=list, blank=True)
    floor_plans = models.JSONField(default=list, blank=True)
    build_year = models.PositiveSmallIntegerField(null=True, blank=True)
    bedrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    bathrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    flat_label = models.CharField(max_length=120, blank=True)
    for_rent = models.BooleanField(default=False)
    contact_website = models.URLField(blank=True)
    land_area_sqft = models.PositiveIntegerField(null=True, blank=True)
    for_sale = models.BooleanField(default=True)
    rating_average = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    review_count = models.PositiveIntegerField(default=0)
    review_sample_author = models.CharField(max_length=120, blank=True)
    review_sample_date = models.DateField(null=True, blank=True)
    review_sample_text = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=ListingStatus.choices, default=ListingStatus.AVAILABLE)
    listing_active = models.BooleanField(
        default=True,
        help_text="When False, hidden from public listings; staff can still manage.",
    )
    assigned_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="managed_land_share_listings",
        help_text="Agent responsible for this land-share listing.",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title
