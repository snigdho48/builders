from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("apps", "0031_site_settings_booking_kind"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitesettings",
            name="plot_buy_installment_promo_enabled",
            field=models.BooleanField(
                default=True,
                help_text="When off, 1% and 50% plot-buy plans are hidden and treated as unavailable site-wide (hero promos, booking flow, slot counter). Independent of slot limit.",
            ),
        ),
    ]
