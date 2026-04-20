import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("apps", "0026_p2p_listing_and_bid"),
    ]

    operations = [
        migrations.CreateModel(
            name="InstallmentLedger",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("installment_no", models.PositiveIntegerField()),
                ("due_date", models.DateField(db_index=True)),
                ("amount_due", models.DecimalField(decimal_places=2, max_digits=14)),
                ("amount_paid", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("unpaid", "Unpaid"),
                            ("paid", "Paid"),
                            ("overdue", "Overdue"),
                            ("partial", "Partial"),
                        ],
                        db_index=True,
                        default="unpaid",
                        max_length=20,
                    ),
                ),
                ("paid_at", models.DateTimeField(blank=True, null=True)),
                ("reminder_sent_at", models.DateTimeField(blank=True, null=True)),
                ("reminder_note", models.CharField(blank=True, max_length=120)),
                ("payment_reference", models.CharField(blank=True, max_length=120)),
                (
                    "booking",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="installments",
                        to="apps.landbooking",
                    ),
                ),
                (
                    "investor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="installment_ledgers",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["due_date", "installment_no"],
            },
        ),
        migrations.AddConstraint(
            model_name="installmentledger",
            constraint=models.UniqueConstraint(fields=("booking", "installment_no"), name="uniq_installment_per_booking_no"),
        ),
    ]

