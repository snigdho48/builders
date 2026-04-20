from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework.permissions import IsAuthenticated

from apps.constants import is_staff_admin
from apps.permissions import CanManageAgents
from apps.serializers import AgentSerializer
from apps.view.base import StandardModelViewSet

User = get_user_model()


class AgentViewSet(StandardModelViewSet):
    permission_classes = [IsAuthenticated, CanManageAgents]
    serializer_class = AgentSerializer
    queryset = (
        User.objects.select_related("profile")
        .filter(profile__role="agent")
        .annotate(property_count=Count("managed_land_listings", distinct=True))
        .order_by("-id")
    )

    def get_queryset(self):
        qs = super().get_queryset()
        role = getattr(self.request.user.profile, "role", None)
        if is_staff_admin(role):
            return qs
        return qs.none()
