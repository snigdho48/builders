from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("apps", "0024_userprofile_investor_kyc"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="kyc_investor_notes",
            field=models.TextField(
                blank=True,
                help_text="Optional message from the investor with their KYC request.",
            ),
        ),
        migrations.AddField(
            model_name="userprofile",
            name="kyc_requested_at",
            field=models.DateTimeField(
                blank=True,
                help_text="Last time the investor asked for KYC review (in-app request).",
                null=True,
            ),
        ),
    ]
