# Nominee document slots (passport + NID per nominee 1–5)

from django.db import migrations, models


_KIND_CHOICES = (
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
    ("nominee_01_passport_photo", "Nominee 1 — passport-size photo"),
    ("nominee_01_nid_or_id", "Nominee 1 — NID or valid ID"),
    ("nominee_02_passport_photo", "Nominee 2 — passport-size photo"),
    ("nominee_02_nid_or_id", "Nominee 2 — NID or valid ID"),
    ("nominee_03_passport_photo", "Nominee 3 — passport-size photo"),
    ("nominee_03_nid_or_id", "Nominee 3 — NID or valid ID"),
    ("nominee_04_passport_photo", "Nominee 4 — passport-size photo"),
    ("nominee_04_nid_or_id", "Nominee 4 — NID or valid ID"),
    ("nominee_05_passport_photo", "Nominee 5 — passport-size photo"),
    ("nominee_05_nid_or_id", "Nominee 5 — NID or valid ID"),
)


class Migration(migrations.Migration):

    dependencies = [
        ("apps", "0038_joint_applicant_attachment_kinds"),
    ]

    operations = [
        migrations.AlterField(
            model_name="landbookingattachment",
            name="kind",
            field=models.CharField(choices=_KIND_CHOICES, max_length=40),
        ),
    ]
