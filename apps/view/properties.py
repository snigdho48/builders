from django.db.models import Q
from rest_framework import permissions

from apps.constants import ROLE_AGENT, is_staff_admin
from apps.models import Property
from apps.permissions import CanAccessProperties
from apps.serializers import PropertySerializer
from apps.view.base import StandardModelViewSet


def _property_role(user):
    if not user.is_authenticated:
        return None
    return getattr(user.profile, "role", None)


class PropertyViewSet(StandardModelViewSet):
    serializer_class = PropertySerializer
    queryset = (
        Property.objects.select_related("assigned_agent", "assigned_agent__profile").all().order_by("-created_at")
    )

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [CanAccessProperties()]
        return [permissions.IsAuthenticated(), CanAccessProperties()]

    @staticmethod
    def _apply_list_filters(queryset, params):
        sale_type = params.get("sale_type")
        status_value = params.get("status")
        min_price = params.get("min_price")
        max_price = params.get("max_price")
        location = params.get("location")
        search = params.get("search") or params.get("q")

        if sale_type:
            queryset = queryset.filter(sale_type=sale_type)
        if status_value:
            queryset = queryset.filter(status=status_value)
        if min_price:
            queryset = queryset.filter(land_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(land_price__lte=max_price)
        if location:
            queryset = queryset.filter(location_name__icontains=location)
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(location_name__icontains=search))
        return queryset

    @staticmethod
    def _apply_listing_visibility(queryset, user, params):
        if params.get("include_inactive") == "1" and user.is_authenticated:
            role = _property_role(user)
            if is_staff_admin(role) or role == ROLE_AGENT:
                return queryset
        return queryset.filter(listing_active=True)

    def _queryset_for_request_role(self, queryset, user, params):
        role = _property_role(user)

        if params.get("managed_by_me") == "1":
            if not user.is_authenticated:
                return Property.objects.none()
            if is_staff_admin(role):
                return queryset
            if role == ROLE_AGENT:
                return queryset.filter(assigned_agent=user)
            return Property.objects.none()

        if user.is_authenticated and role == ROLE_AGENT:
            return queryset.filter(assigned_agent=user)

        if user.is_authenticated and is_staff_admin(role):
            agent = params.get("assigned_agent")
            if agent:
                return queryset.filter(assigned_agent_id=agent)
            return queryset

        return queryset

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params
        user = self.request.user

        queryset = self._queryset_for_request_role(queryset, user, params)
        queryset = self._apply_list_filters(queryset, params)
        if getattr(self, "action", None) == "list":
            queryset = self._apply_listing_visibility(queryset, user, params)
        return queryset
