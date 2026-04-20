from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("apps", "0005_alter_investment_type"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="managed_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.SET_NULL,
                related_name="managed_advertiser_profiles",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name="userprofile",
            name="role",
            field=models.CharField(
                choices=[
                    ("admin", "Admin"),
                    ("investor", "Investor"),
                    ("representative", "Representative"),
                    ("advertiser", "Advertiser"),
                ],
                default="investor",
                max_length=20,
            ),
        ),
    ]
