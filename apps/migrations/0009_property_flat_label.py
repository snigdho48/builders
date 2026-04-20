from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("apps", "0008_property_property_channel"),
    ]

    operations = [
        migrations.AddField(
            model_name="property",
            name="flat_label",
            field=models.CharField(
                blank=True,
                help_text="Unit / flat number or label shown on the public listing overview.",
                max_length=120,
            ),
        ),
    ]
