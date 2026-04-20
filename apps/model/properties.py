from decimal import Decimal

from django.conf import settings
from django.db import models

from .users import TimeStampedModel


class Property(TimeStampedModel):
    """Land listing only: direct land buy or full-land installment plan."""

    class PropertyKind(models.TextChoices):
        APARTMENT = "apartment", "Apartment"
        VILLA = "villa", "Villa"
        COMMERCIAL = "commercial", "Commercial"
        LAND = "land", "Land"

    class PropertyStatus(models.TextChoices):
        AVAILABLE = "available", "Available"
        SOLD = "sold", "Sold"
        BOOKED = "booked", "Booked"

    class SaleType(models.TextChoices):
        LAND_BUY = "land_buy", "Land buy (full payment)"
        INSTALLMENT = "installment", "Installment (whole land, fixed term)"

    property_type = models.CharField(
        max_length=20,
        choices=PropertyKind.choices,
        default=PropertyKind.LAND,
        help_text="Display category on the public detail page (defaults to land).",
    )
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(
        help_text="Primary listing copy; may contain HTML from staff UIs (sanitize before public display).",
    )
    description_secondary = models.TextField(
        blank=True,
        help_text="Optional secondary copy; may contain HTML from staff UIs (sanitize before public display).",
    )
    sale_type = models.CharField(
        max_length=20,
        choices=SaleType.choices,
        default=SaleType.LAND_BUY,
    )
    land_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("1.00"),
        help_text="Total price for the entire land parcel.",
    )
    installment_years = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Required when sale_type is installment: fixed repayment term in years.",
    )
    location_name = models.CharField(max_length=160)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    video_url = models.URLField(blank=True)
    top_view_image = models.URLField(blank=True)
    gallery_images = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    amenities = models.JSONField(
        default=list,
        blank=True,
        help_text='List of strings, e.g. ["Road access", "Electricity"].',
    )
    floor_plans = models.JSONField(
        default=list,
        blank=True,
        help_text='List of {title, image_url, description?} for detail page floor plan tabs.',
    )
    build_year = models.PositiveSmallIntegerField(null=True, blank=True)
    bedrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    bathrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    flat_label = models.CharField(max_length=120, blank=True)
    for_rent = models.BooleanField(default=False)
    contact_website = models.URLField(blank=True)
    land_area_sqft = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Land area in square feet (optional).",
    )
    for_sale = models.BooleanField(default=True)
    rating_average = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    review_count = models.PositiveIntegerField(default=0)
    review_sample_author = models.CharField(max_length=120, blank=True)
    review_sample_date = models.DateField(null=True, blank=True)
    review_sample_text = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=PropertyStatus.choices, default=PropertyStatus.AVAILABLE
    )
    listing_active = models.BooleanField(
        default=True,
        help_text="When False, hidden from public listings; staff can still manage.",
    )
    assigned_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="managed_land_listings",
        help_text="Agent responsible for this land listing.",
    )

    def __str__(self) -> str:
        return self.title
