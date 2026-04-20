# Generated manually — split land-share into LandShareListing; migrate fractional Property rows.

import django.db.models.deletion
from decimal import Decimal

from django.conf import settings
from django.db import migrations, models
from django.db.models import Q


def migrate_fractional_to_land_share(apps, schema_editor):
    Property = apps.get_model("apps", "Property")
    LandShareListing = apps.get_model("apps", "LandShareListing")
    LandBooking = apps.get_model("apps", "LandBooking")

    fractional = Property.objects.filter(land_sale_mode="fractional_share")
    for p in fractional:
        raw_opts = p.share_investment_options or []
        payment_options = []
        if isinstance(raw_opts, list):
            for o in raw_opts:
                if not isinstance(o, dict):
                    continue
                amt = o.get("amount", "0")
                years = int(o.get("duration_years") or 0)
                payment_options.append(
                    {
                        "amount": str(amt),
                        "billing_period": "monthly",
                        "commitment_months": (years * 12) if years > 0 else None,
                    }
                )
        ls = LandShareListing.objects.create(
            property_type=p.property_type,
            title=p.title,
            slug=p.slug,
            description=p.description,
            description_secondary=p.description_secondary or "",
            land_price=p.land_price,
            payment_options=payment_options,
            location_name=p.location_name,
            latitude=p.latitude,
            longitude=p.longitude,
            video_url=p.video_url or "",
            top_view_image=p.top_view_image or "",
            gallery_images=list(p.gallery_images or []),
            tags=list(p.tags or []),
            amenities=list(p.amenities or []),
            floor_plans=list(p.floor_plans or []),
            build_year=p.build_year,
            bedrooms=p.bedrooms,
            bathrooms=p.bathrooms,
            flat_label=p.flat_label or "",
            for_rent=p.for_rent,
            contact_website=p.contact_website or "",
            land_area_sqft=p.land_area_sqft,
            for_sale=p.for_sale,
            rating_average=p.rating_average,
            review_count=p.review_count or 0,
            review_sample_author=p.review_sample_author or "",
            review_sample_date=p.review_sample_date,
            review_sample_text=p.review_sample_text or "",
            status=p.status,
            listing_active=p.listing_active,
            assigned_agent_id=p.assigned_agent_id,
        )
        LandBooking.objects.filter(property_id=p.pk).update(
            land_share_listing_id=ls.id,
            property_id=None,
        )
        Property.objects.filter(pk=p.pk).delete()


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("apps", "0033_property_land_share_landbooking_investment_tier"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="LandShareListing",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "property_type",
                    models.CharField(
                        choices=[
                            ("apartment", "Apartment"),
                            ("villa", "Villa"),
                            ("commercial", "Commercial"),
                            ("land", "Land"),
                        ],
                        default="land",
                        max_length=20,
                    ),
                ),
                ("title", models.CharField(max_length=180)),
                ("slug", models.SlugField(max_length=200, unique=True)),
                (
                    "description",
                    models.TextField(
                        help_text="Primary listing copy; may contain HTML from staff UIs (sanitize before public display)."
                    ),
                ),
                ("description_secondary", models.TextField(blank=True)),
                (
                    "land_price",
                    models.DecimalField(
                        decimal_places=2,
                        default=Decimal("1.00"),
                        help_text="Headline reference price (e.g. 'from' or parcel reference).",
                        max_digits=14,
                    ),
                ),
                (
                    "payment_options",
                    models.JSONField(
                        blank=True,
                        default=list,
                        help_text='Tiers, e.g. [{"amount":"2000.00","billing_period":"monthly"}]. '
                        "billing_period: monthly|yearly|one_time",
                    ),
                ),
                ("location_name", models.CharField(max_length=160)),
                ("latitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("longitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("video_url", models.URLField(blank=True)),
                ("top_view_image", models.URLField(blank=True)),
                ("gallery_images", models.JSONField(blank=True, default=list)),
                ("tags", models.JSONField(blank=True, default=list)),
                ("amenities", models.JSONField(blank=True, default=list)),
                ("floor_plans", models.JSONField(blank=True, default=list)),
                ("build_year", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("bedrooms", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("bathrooms", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("flat_label", models.CharField(blank=True, max_length=120)),
                ("for_rent", models.BooleanField(default=False)),
                ("contact_website", models.URLField(blank=True)),
                ("land_area_sqft", models.PositiveIntegerField(blank=True, null=True)),
                ("for_sale", models.BooleanField(default=True)),
                ("rating_average", models.DecimalField(blank=True, decimal_places=1, max_digits=3, null=True)),
                ("review_count", models.PositiveIntegerField(default=0)),
                ("review_sample_author", models.CharField(blank=True, max_length=120)),
                ("review_sample_date", models.DateField(blank=True, null=True)),
                ("review_sample_text", models.TextField(blank=True)),
                (
                    "status",
                    models.CharField(
                        choices=[("available", "Available"), ("sold", "Sold"), ("booked", "Booked")],
                        default="available",
                        max_length=20,
                    ),
                ),
                (
                    "listing_active",
                    models.BooleanField(
                        default=True,
                        help_text="When False, hidden from public listings; staff can still manage.",
                    ),
                ),
                (
                    "assigned_agent",
                    models.ForeignKey(
                        blank=True,
                        help_text="Agent responsible for this land-share listing.",
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="managed_land_share_listings",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddField(
            model_name="landbooking",
            name="land_share_listing",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="bookings",
                to="apps.landsharelisting",
            ),
        ),
        migrations.AddField(
            model_name="landbooking",
            name="investment_option_billing_period",
            field=models.CharField(
                blank=True,
                help_text="Land-share tier billing_period: monthly, yearly, or one_time (must match listing tier).",
                max_length=16,
            ),
        ),
        migrations.AlterField(
            model_name="landbooking",
            name="investment_option_duration_years",
            field=models.PositiveSmallIntegerField(
                blank=True,
                help_text="Legacy: tier duration in years when migrated from old share_investment_options.",
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name="landbooking",
            name="property",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="bookings",
                to="apps.property",
            ),
        ),
        migrations.RunPython(migrate_fractional_to_land_share, noop_reverse),
        migrations.RemoveField(model_name="property", name="land_sale_mode"),
        migrations.RemoveField(model_name="property", name="share_investment_options"),
        migrations.AddConstraint(
            model_name="landbooking",
            constraint=models.CheckConstraint(
                condition=(
                    Q(property__isnull=False, land_share_listing__isnull=True)
                    | Q(property__isnull=True, land_share_listing__isnull=False)
                ),
                name="booking_exactly_one_listing",
            ),
        ),
    ]
