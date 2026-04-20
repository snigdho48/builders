# Generated manually for joint applicant document slots

from django.db import migrations, models


_JOINT_ATTACHMENT_KIND_CHOICES = (
    ("passport_photo_1", "Passport photo 1"),
    ("nid_or_id", "NID or valid ID copy"),
    ("booking_money_receipt", "Booking money receipt / proof"),
    ("joint_applicant_01_passport_photo", "Joint applicant 1 — passport-size photo"),
    ("joint_applicant_01_nid_or_id", "Joint applicant 1 — NID or valid ID"),
    ("joint_applicant_02_passport_photo", "Joint applicant 2 — passport-size photo"),
    ("joint_applicant_02_nid_or_id", "Joint applicant 2 — NID or valid ID"),
    ("joint_applicant_03_passport_photo", "Joint applicant 3 — passport-size photo"),
    ("joint_applicant_03_nid_or_id", "Joint applicant 3 — NID or valid ID"),
    ("joint_applicant_04_passport_photo", "Joint applicant 4 — passport-size photo"),
    ("joint_applicant_04_nid_or_id", "Joint applicant 4 — NID or valid ID"),
    ("joint_applicant_05_passport_photo", "Joint applicant 5 — passport-size photo"),
    ("joint_applicant_05_nid_or_id", "Joint applicant 5 — NID or valid ID"),
)


class Migration(migrations.Migration):

    dependencies = [
        ("apps", "0037_land_booking_attachment_kind_trim"),
    ]

    operations = [
        migrations.AlterField(
            model_name="landbookingattachment",
            name="kind",
            field=models.CharField(choices=_JOINT_ATTACHMENT_KIND_CHOICES, max_length=40),
        ),
    ]
