import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("apps", "0025_userprofile_kyc_investor_request"),
    ]

    operations = [
        migrations.CreateModel(
            name="P2PListing",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.CharField(max_length=180)),
                ("slug", models.SlugField(max_length=220)),
                ("description", models.TextField()),
                ("location_name", models.CharField(max_length=160)),
                (
                    "asking_price_hint",
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        help_text="Optional guide price shown to buyers.",
                        max_digits=14,
                        null=True,
                    ),
                ),
                ("land_area_sqft", models.PositiveIntegerField(blank=True, null=True)),
                ("hero_image", models.URLField(blank=True)),
                ("gallery_images", models.JSONField(blank=True, default=list)),
                (
                    "status",
                    models.CharField(
                        choices=[("active", "Active"), ("sold", "Sold"), ("withdrawn", "Withdrawn")],
                        db_index=True,
                        default="active",
                        max_length=20,
                    ),
                ),
                (
                    "seller",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="p2p_listings",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="P2PBid",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("bid_price", models.DecimalField(decimal_places=2, max_digits=14)),
                ("message", models.TextField(blank=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pending"),
                            ("accepted", "Accepted"),
                            ("declined", "Declined"),
                        ],
                        db_index=True,
                        default="pending",
                        max_length=20,
                    ),
                ),
                (
                    "buyer",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="p2p_bids_placed",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "listing",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="bids",
                        to="apps.p2plisting",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddConstraint(
            model_name="p2plisting",
            constraint=models.UniqueConstraint(fields=("seller", "slug"), name="uniq_p2p_listing_seller_slug"),
        ),
    ]
