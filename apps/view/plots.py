from rest_framework import permissions

from apps.models import Plot
from apps.permissions import CanAccessPlots
from apps.serializers.plots import PlotSerializer
from apps.view.base import StandardModelViewSet


class PlotViewSet(StandardModelViewSet):
    serializer_class = PlotSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, CanAccessPlots]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    queryset = Plot.objects.select_related("property").order_by("property_id", "plot_id")

    def get_queryset(self):
        qs = super().get_queryset()
        qp = self.request.query_params
        property_id = qp.get("property")
        if property_id:
            qs = qs.filter(property_id=property_id)
        status = qp.get("status")
        if status in [Plot.PlotStatus.AVAILABLE, Plot.PlotStatus.BOOKED, Plot.PlotStatus.SOLD]:
            qs = qs.filter(status=status)
        available_only = qp.get("available_only")
        if available_only in ["1", "true", "yes"]:
            qs = qs.filter(status=Plot.PlotStatus.AVAILABLE)
        search = (qp.get("search") or "").strip()
        if search:
            qs = qs.filter(plot_id__icontains=search)
        return qs

