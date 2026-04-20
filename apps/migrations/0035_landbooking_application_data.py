from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("apps", "0034_land_share_listing_split"),
    ]

    operations = [
        migrations.AddField(
            model_name="landbooking",
            name="application_data",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
