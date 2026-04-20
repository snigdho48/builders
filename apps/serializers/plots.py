from rest_framework import serializers

from apps.models import Plot


class PlotSerializer(serializers.ModelSerializer):
    property_id = serializers.IntegerField(source="property.id", read_only=True)

    class Meta:
        model = Plot
        fields = [
            "id",
            "property_id",
            "plot_id",
            "area_sqft",
            "price",
            "status",
            "coordinates",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

