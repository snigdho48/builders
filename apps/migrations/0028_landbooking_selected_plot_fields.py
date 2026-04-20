from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("apps", "0027_installment_ledger"),
    ]

    operations = [
        migrations.AddField(
            model_name="landbooking",
            name="selected_plot_area_sqft",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="landbooking",
            name="selected_plot_code",
            field=models.CharField(blank=True, max_length=40),
        ),
        migrations.AddField(
            model_name="landbooking",
            name="selected_plot_price",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=14, null=True),
        ),
    ]

