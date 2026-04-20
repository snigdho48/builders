from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("apps", "0028_landbooking_selected_plot_fields"),
    ]

    operations = [
        migrations.CreateModel(
            name="Plot",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("plot_id", models.CharField(max_length=40)),
                ("area_sqft", models.PositiveIntegerField()),
                ("price", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                (
                    "status",
                    models.CharField(
                        choices=[("available", "Available"), ("booked", "Booked"), ("sold", "Sold")],
                        default="available",
                        max_length=20,
                    ),
                ),
                ("coordinates", models.JSONField(blank=True, default=list)),
                (
                    "property",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="plots", to="apps.property"),
                ),
            ],
            options={
                "ordering": ["property_id", "plot_id"],
            },
        ),
        migrations.AddField(
            model_name="landbooking",
            name="selected_plot",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="bookings", to="apps.plot"
            ),
        ),
        migrations.AddConstraint(
            model_name="plot",
            constraint=models.UniqueConstraint(fields=("property", "plot_id"), name="uniq_plot_per_property"),
        ),
    ]

