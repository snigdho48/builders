from decimal import Decimal

from rest_framework import serializers

from apps.constants import ROLE_AGENT, is_staff_admin
from apps.models import Property, UserProfile


class PropertySerializer(serializers.ModelSerializer):
    """Plot / map land listings only (buy plots, parcel installments). Land-share uses LandShareListing."""

    listing_kind = serializers.SerializerMethodField(read_only=True)
    assigned_agent_name = serializers.SerializerMethodField(read_only=True)
    property_channel = serializers.SerializerMethodField(read_only=True)
    size_sqft = serializers.SerializerMethodField(read_only=True)
    total_blocks = serializers.SerializerMethodField(read_only=True)
    available_blocks = serializers.SerializerMethodField(read_only=True)
    price_per_block = serializers.SerializerMethodField(read_only=True)
    whole_land_price = serializers.SerializerMethodField(read_only=True)
    share_price = serializers.SerializerMethodField(read_only=True)
    total_shares = serializers.SerializerMethodField(read_only=True)
    available_shares = serializers.SerializerMethodField(read_only=True)
    min_shares_per_order = serializers.SerializerMethodField(read_only=True)
    representative = serializers.SerializerMethodField(read_only=True)
    representative_name = serializers.SerializerMethodField(read_only=True)
    representative_email = serializers.SerializerMethodField(read_only=True)
    representative_phone = serializers.SerializerMethodField(read_only=True)
    managed_by = serializers.SerializerMethodField(read_only=True)
    managed_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "listing_kind",
            "title",
            "slug",
            "description",
            "description_secondary",
            "property_type",
            "sale_type",
            "property_channel",
            "land_price",
            "whole_land_price",
            "installment_years",
            "total_blocks",
            "available_blocks",
            "price_per_block",
            "share_price",
            "total_shares",
            "available_shares",
            "min_shares_per_order",
            "location_name",
            "latitude",
            "longitude",
            "video_url",
            "top_view_image",
            "gallery_images",
            "tags",
            "amenities",
            "floor_plans",
            "build_year",
            "bedrooms",
            "bathrooms",
            "flat_label",
            "size_sqft",
            "land_area_sqft",
            "for_rent",
            "for_sale",
            "contact_website",
            "rating_average",
            "review_count",
            "review_sample_author",
            "review_sample_date",
            "review_sample_text",
            "status",
            "listing_active",
            "assigned_agent",
            "assigned_agent_name",
            "representative",
            "representative_name",
            "representative_email",
            "representative_phone",
            "managed_by",
            "managed_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "created_at",
            "updated_at",
            "assigned_agent_name",
            "listing_kind",
            "property_channel",
            "size_sqft",
            "total_blocks",
            "available_blocks",
            "price_per_block",
            "whole_land_price",
            "share_price",
            "total_shares",
            "available_shares",
            "min_shares_per_order",
            "representative",
            "representative_name",
            "representative_email",
            "representative_phone",
            "managed_by",
            "managed_by_name",
        ]

    def get_listing_kind(self, obj):
        return "plot_listing"

    def get_property_channel(self, obj):
        if obj.sale_type == Property.SaleType.INSTALLMENT:
            return "installment"
        return "plot_buy"

    def get_size_sqft(self, obj):
        return obj.land_area_sqft

    def get_total_blocks(self, obj):
        return 0

    def get_available_blocks(self, obj):
        return 0

    def get_price_per_block(self, obj):
        return "0.00"

    def get_whole_land_price(self, obj):
        return str(obj.land_price)

    def get_share_price(self, obj):
        return None

    def get_total_shares(self, obj):
        return None

    def get_available_shares(self, obj):
        return None

    def get_min_shares_per_order(self, obj):
        return 1

    def get_representative(self, obj):
        return obj.assigned_agent_id

    def get_representative_name(self, obj):
        return self.get_assigned_agent_name(obj)

    def get_representative_email(self, obj):
        u = obj.assigned_agent
        return u.email if u else None

    def get_representative_phone(self, obj):
        u = obj.assigned_agent
        if not u:
            return None
        phone = (getattr(u.profile, "phone", None) or "").strip()
        return phone or None

    def get_managed_by(self, obj):
        return None

    def get_managed_by_name(self, obj):
        return None

    def get_assigned_agent_name(self, obj):
        u = obj.assigned_agent
        if not u:
            return None
        name = u.get_full_name().strip()
        return name or u.username

    def validate_assigned_agent(self, value):
        if value is None:
            return value
        profile = UserProfile.objects.filter(user=value).first()
        if not profile or profile.role != ROLE_AGENT:
            raise serializers.ValidationError("Assigned user must have agent role.")
        return value

    def validate(self, attrs):
        sale = attrs.get("sale_type")
        if sale is None and self.instance:
            sale = self.instance.sale_type
        years = attrs.get("installment_years")
        if years is None and self.instance:
            years = self.instance.installment_years
        if sale == Property.SaleType.INSTALLMENT:
            if not years or years < 1:
                raise serializers.ValidationError(
                    {"installment_years": "Required positive term in years for installment listings."}
                )
        land_price = attrs.get("land_price")
        if land_price is None and self.instance:
            land_price = self.instance.land_price
        if land_price is not None and Decimal(str(land_price)) <= 0:
            raise serializers.ValidationError({"land_price": "Must be greater than zero."})
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            role = getattr(request.user.profile, "role", None)
            if not is_staff_admin(role):
                raise serializers.ValidationError("Only admins can create listings.")
        return super().create(validated_data)
