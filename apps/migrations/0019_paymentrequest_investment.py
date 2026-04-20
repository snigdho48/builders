from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("apps", "0018_kycfielddefinition_enabled"),
    ]

    operations = [
        migrations.AddField(
            model_name="paymentrequest",
            name="investment",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="payment_requests",
                to="apps.investment",
            ),
        ),
    ]
