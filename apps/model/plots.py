from decimal import Decimal

from django.db import models

from .properties import Property
from .users import TimeStampedModel


class Plot(TimeStampedModel):
    class PlotStatus(models.TextChoices):
        AVAILABLE = "available", "Available"
        BOOKED = "booked", "Booked"
        SOLD = "sold", "Sold"

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="plots")
    plot_id = models.CharField(max_length=40)
    area_sqft = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    status = models.CharField(max_length=20, choices=PlotStatus.choices, default=PlotStatus.AVAILABLE)
    # GeoJSON Polygon ring: [[lng, lat], ...]
    coordinates = models.JSONField(default=list, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["property", "plot_id"], name="uniq_plot_per_property"),
        ]
        ordering = ["property_id", "plot_id"]

    def __str__(self) -> str:
        return f"{self.property_id}:{self.plot_id}"

