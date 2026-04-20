import uuid

from django.utils.text import slugify
from rest_framework import serializers

from apps.models import P2PBid, P2PListing


def _gallery_list(value):
    if value is None:
        return []
    if isinstance(value, list):
        return [str(u).strip() for u in value if str(u).strip()][:24]
    return []

def _string_list(value):
    if value is None:
        return []
    if isinstance(value, list):
        return [str(u).strip() for u in value if str(u).strip()][:40]
    return []


class P2PListingSerializer(serializers.ModelSerializer):
    """Full listing for owner and public (seller_* only for owner via context)."""

    seller_id = serializers.IntegerField(read_only=True)
    bid_count = serializers.SerializerMethodField()

    class Meta:
        model = P2PListing
        fields = [
            "id",
            "seller_id",
            "title",
            "slug",
            "description",
            "location_name",
            "asking_price_hint",
            "land_area_sqft",
            "latitude",
            "longitude",
            "contact_email",
            "contact_phone",
            "features",
            "hero_image",
            "gallery_images",
            "status",
            "bid_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "seller_id", "slug", "created_at", "updated_at", "bid_count"]

    @staticmethod
    def get_bid_count(obj: P2PListing) -> int:
        return obj.bids.filter(status=P2PBid.Status.PENDING).count()


class P2PListingWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = P2PListing
        fields = [
            "title",
            "description",
            "location_name",
            "asking_price_hint",
            "land_area_sqft",
            "latitude",
            "longitude",
            "contact_email",
            "contact_phone",
            "features",
            "hero_image",
            "gallery_images",
            "status",
        ]

    def validate_gallery_images(self, value):
        return _gallery_list(value)

    def validate_asking_price_hint(self, value):
        if value in (None, ""):
            return None
        return value

    def validate_features(self, value):
        return _string_list(value)

    def validate_status(self, value):
        if value not in dict(P2PListing.Status.choices):
            raise serializers.ValidationError("Invalid status.")
        return value

    def create(self, validated_data):
        seller = self.context["request"].user
        base = slugify(validated_data["title"])[:80] or "listing"
        validated_data["slug"] = f"{base}-{uuid.uuid4().hex[:10]}"
        validated_data["seller"] = seller
        return P2PListing.objects.create(**validated_data)


class P2PBidSubmitSerializer(serializers.Serializer):
    bid_price = serializers.DecimalField(max_digits=14, decimal_places=2)
    message = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    def validate_bid_price(self, value):
        from decimal import Decimal

        if value < Decimal("0.01"):
            raise serializers.ValidationError("Bid must be at least 0.01.")
        return value

    def create(self, validated_data):
        listing: P2PListing = self.context["listing"]
        buyer = self.context["request"].user
        return P2PBid.objects.create(
            listing=listing,
            buyer=buyer,
            bid_price=validated_data["bid_price"],
            message=(validated_data.get("message") or "").strip(),
        )


class P2PBidSerializer(serializers.ModelSerializer):
    listing_id = serializers.IntegerField(read_only=True)
    listing_title = serializers.CharField(source="listing.title", read_only=True)
    buyer_id = serializers.IntegerField(read_only=True)
    buyer_username = serializers.CharField(source="buyer.username", read_only=True)
    buyer_email = serializers.SerializerMethodField()
    buyer_phone = serializers.SerializerMethodField()
    buyer_full_name = serializers.SerializerMethodField()

    class Meta:
        model = P2PBid
        fields = [
            "id",
            "listing_id",
            "listing_title",
            "buyer_id",
            "buyer_username",
            "buyer_email",
            "buyer_phone",
            "buyer_full_name",
            "bid_price",
            "message",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    @staticmethod
    def get_buyer_email(obj: P2PBid) -> str:
        return (obj.buyer.email or "").strip()

    @staticmethod
    def get_buyer_phone(obj: P2PBid) -> str:
        return (getattr(obj.buyer, "profile", None) and (obj.buyer.profile.phone or "")) or ""

    @staticmethod
    def get_buyer_full_name(obj: P2PBid) -> str:
        parts = [obj.buyer.first_name or "", obj.buyer.last_name or ""]
        return " ".join(p for p in parts if p).strip() or obj.buyer.username


class P2PBidStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[P2PBid.Status.ACCEPTED, P2PBid.Status.DECLINED])


class P2PBidBuyerSerializer(serializers.ModelSerializer):
    listing_id = serializers.IntegerField(read_only=True)
    listing_title = serializers.CharField(source="listing.title", read_only=True)

    class Meta:
        model = P2PBid
        fields = [
            "id",
            "listing_id",
            "listing_title",
            "bid_price",
            "message",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
