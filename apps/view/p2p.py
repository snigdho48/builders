from django.db.models import Q
from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.constants import ROLE_INVESTOR
from apps.models import P2PBid, P2PListing
from apps.serializers.p2p import (
    P2PBidBuyerSerializer,
    P2PBidSerializer,
    P2PBidStatusSerializer,
    P2PBidSubmitSerializer,
    P2PListingSerializer,
    P2PListingWriteSerializer,
)
from apps.view.base import StandardModelViewSet


class P2PListingViewSet(StandardModelViewSet):
    """Public browse + investor sellers manage their listings."""

    permission_classes = [permissions.AllowAny]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ["create", "partial_update"]:
            return P2PListingWriteSerializer
        return P2PListingSerializer

    def get_queryset(self):
        user = self.request.user
        role = getattr(user.profile, "role", None) if user.is_authenticated else None
        base = P2PListing.objects.select_related("seller").prefetch_related("bids")

        if self.action == "list":
            if user.is_authenticated and role == ROLE_INVESTOR and self.request.query_params.get("mine") == "1":
                qs = base.filter(seller=user)
            else:
                qs = base.filter(status=P2PListing.Status.ACTIVE)
            search = (self.request.query_params.get("search") or "").strip()
            if search:
                qs = qs.filter(
                    Q(title__icontains=search)
                    | Q(location_name__icontains=search)
                    | Q(description__icontains=search)
                )
            return qs.order_by("-created_at")

        if user.is_authenticated and role == ROLE_INVESTOR:
            return base.filter(Q(status=P2PListing.Status.ACTIVE) | Q(seller=user)).order_by("-created_at")
        return base.filter(status=P2PListing.Status.ACTIVE).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        if getattr(request.user.profile, "role", None) != ROLE_INVESTOR:
            return Response(
                {"detail": "Only investors can create P2P listings."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        listing = self.get_object()
        if listing.seller_id != request.user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)
        if getattr(request.user.profile, "role", None) != ROLE_INVESTOR:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        listing = self.get_object()
        if listing.seller_id != request.user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)
        listing.status = P2PListing.Status.WITHDRAWN
        listing.save(update_fields=["status", "updated_at"])
        return self.respond(data=P2PListingSerializer(listing).data, message="Listing withdrawn")

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated],
        url_path="submit-bid",
    )
    def submit_bid(self, request, pk=None):
        listing = self.get_object()
        if getattr(request.user.profile, "role", None) != ROLE_INVESTOR:
            return Response(
                {"detail": "Only investors can place bids."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if listing.status != P2PListing.Status.ACTIVE:
            return Response(
                {"detail": "This listing is not accepting bids."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if listing.seller_id == request.user.id:
            return Response(
                {"detail": "You cannot bid on your own listing."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = P2PBidSubmitSerializer(
            data=request.data,
            context={"request": request, "listing": listing},
        )
        serializer.is_valid(raise_exception=True)
        bid = serializer.save()
        return self.respond(
            data=P2PBidBuyerSerializer(bid).data,
            message="Bid submitted",
            status_code=status.HTTP_201_CREATED,
        )


class P2PBidViewSet(StandardModelViewSet):
    """Investor: incoming bids on own listings, or own submitted bids (scope=sent)."""

    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_serializer_class(self):
        if self.request.query_params.get("scope") == "sent":
            return P2PBidBuyerSerializer
        return P2PBidSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(user.profile, "role", None) != ROLE_INVESTOR:
            return P2PBid.objects.none()
        base = P2PBid.objects.select_related("listing", "buyer", "buyer__profile")
        if self.action == "list":
            if self.request.query_params.get("scope") == "sent":
                return base.filter(buyer=user).order_by("-created_at")
            return base.filter(listing__seller=user).order_by("-created_at")
        return base.filter(Q(buyer=user) | Q(listing__seller=user)).order_by("-created_at")

    def partial_update(self, request, *args, **kwargs):
        bid = self.get_object()
        if bid.listing.seller_id != request.user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)
        if bid.status != P2PBid.Status.PENDING:
            return Response(
                {"detail": "Only pending bids can be updated."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ser = P2PBidStatusSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        bid.status = ser.validated_data["status"]
        bid.save(update_fields=["status", "updated_at"])
        out = P2PBidSerializer(bid, context={"request": request})
        return self.respond(data=out.data, message="Bid updated")
