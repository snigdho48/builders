from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("apps", "0029_plot_and_booking_plot_link"),
    ]

    operations = [
        migrations.AddField(
            model_name="p2plisting",
            name="contact_email",
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name="p2plisting",
            name="contact_phone",
            field=models.CharField(blank=True, max_length=40),
        ),
        migrations.AddField(
            model_name="p2plisting",
            name="features",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="p2plisting",
            name="latitude",
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name="p2plisting",
            name="longitude",
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
    ]

