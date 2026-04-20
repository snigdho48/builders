from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("apps", "0017_kyctemplate_required_for_checkout"),
    ]

    operations = [
        migrations.AddField(
            model_name="kycfielddefinition",
            name="enabled",
            field=models.BooleanField(
                default=True,
                help_text="When off, investors do not see this field and it is not validated.",
            ),
        ),
    ]
