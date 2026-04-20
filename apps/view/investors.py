from django.contrib.auth import get_user_model

from rest_framework.permissions import IsAuthenticated

from apps.constants import ROLE_INVESTOR
from apps.permissions import CanAccessInvestors
from apps.serializers.investors import (
    RetailInvestorCreateSerializer,
    RetailInvestorKycUpdateSerializer,
    RetailInvestorListSerializer,
)
from apps.view.base import StandardModelViewSet

User = get_user_model()


class InvestorViewSet(StandardModelViewSet):
    """Investor directory + create (admin). Admin/agent can set KYC approval on profiles."""

    permission_classes = [IsAuthenticated, CanAccessInvestors]
    serializer_class = RetailInvestorListSerializer
    http_method_names = ["get", "post", "patch", "head", "options"]
    queryset = (
        User.objects.select_related("profile", "profile__kyc_verified_by")
        .filter(profile__role=ROLE_INVESTOR)
        .order_by("-id")
    )

    def get_serializer_class(self):
        if self.action == "create":
            return RetailInvestorCreateSerializer
        if self.action == "partial_update":
            return RetailInvestorKycUpdateSerializer
        return RetailInvestorListSerializer

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = RetailInvestorKycUpdateSerializer(
            instance,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        instance.refresh_from_db()
        out = RetailInvestorListSerializer(instance, context={"request": request})
        return self.respond(data=out.data, message="Updated")
