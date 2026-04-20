from django.db import migrations, models


def seed_site_settings(apps, schema_editor):
    SiteSettings = apps.get_model("apps", "SiteSettings")
    if not SiteSettings.objects.exists():
        SiteSettings.objects.create(plot_buy_installment_slot_limit=100)


class Migration(migrations.Migration):

    dependencies = [
        ("apps", "0030_p2p_listing_extra_fields"),
    ]

    operations = [
        migrations.CreateModel(
            name="SiteSettings",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "plot_buy_installment_slot_limit",
                    models.PositiveIntegerField(
                        default=100,
                        help_text="1% and 50% installment plans are only for plot buy. Counts pending + accepted plot-buy bookings using those plans; increase to allow more.",
                    ),
                ),
            ],
            options={
                "verbose_name": "Site settings",
                "verbose_name_plural": "Site settings",
            },
        ),
        migrations.AddField(
            model_name="landbooking",
            name="booking_kind",
            field=models.CharField(
                choices=[("plot_buy", "Plot buy"), ("investment", "Investment")],
                default="plot_buy",
                max_length=20,
            ),
        ),
        migrations.RunPython(seed_site_settings, migrations.RunPython.noop),
    ]
