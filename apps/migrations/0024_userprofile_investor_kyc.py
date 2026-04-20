import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("apps", "0023_property_detail_display_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="kyc_notes",
            field=models.TextField(
                blank=True,
                help_text="Internal verification notes (staff only; not shown to the investor).",
            ),
        ),
        migrations.AddField(
            model_name="userprofile",
            name="kyc_status",
            field=models.CharField(
                choices=[("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")],
                db_index=True,
                default="pending",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="userprofile",
            name="kyc_verified_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="userprofile",
            name="kyc_verified_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="kyc_verifications_recorded",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
