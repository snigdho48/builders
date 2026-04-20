from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from apps.models import Property, UserProfile
from apps.services.account_emails import schedule_welcome_email_after_commit

User = get_user_model()


class AgentSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(required=False, allow_blank=True, source="profile.phone")
    role = serializers.CharField(source="profile.role", read_only=True)
    referral_commission_percent = serializers.DecimalField(
        source="profile.referral_commission_percent",
        max_digits=5,
        decimal_places=2,
        required=False,
        default=Decimal("5.00"),
    )
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    property_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "phone",
            "role",
            "referral_commission_percent",
            "property_count",
            "password",
            "date_joined",
        ]
        read_only_fields = ["id", "role", "date_joined", "property_count"]

    def get_property_count(self, obj):
        n = getattr(obj, "property_count", None)
        if n is not None:
            return int(n)
        return Property.objects.filter(assigned_agent_id=obj.id).count()

    def validate_email(self, value):
        qs = User.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError("Email is already in use.")
        return value

    def create(self, validated_data):
        profile_data = validated_data.pop("profile", {})
        phone = profile_data.get("phone", "")
        commission = profile_data.get("referral_commission_percent", Decimal("5.00"))
        password = validated_data.pop("password")
        with transaction.atomic():
            user = User.objects.create_user(password=password, **validated_data)
            profile = user.profile
            profile.role = UserProfile.UserRole.AGENT
            profile.phone = phone
            profile.referral_commission_percent = commission
            profile.save(update_fields=["role", "phone", "referral_commission_percent", "updated_at"])
        schedule_welcome_email_after_commit(
            user_id=user.pk,
            plaintext_password=password,
            include_credentials=True,
            role_label="Agent",
        )
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})
        password = validated_data.pop("password", None)
        with transaction.atomic():
            for field, value in validated_data.items():
                setattr(instance, field, value)
            if password:
                instance.set_password(password)
            instance.save()

            profile = instance.profile
            profile.role = UserProfile.UserRole.AGENT
            if "phone" in profile_data:
                profile.phone = profile_data["phone"]
            if "referral_commission_percent" in profile_data:
                profile.referral_commission_percent = profile_data["referral_commission_percent"]
            profile.save(update_fields=["role", "phone", "referral_commission_percent", "updated_at"])
        return instance
