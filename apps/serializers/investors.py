from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from rest_framework import serializers

from apps.models import UserProfile
from apps.services.account_emails import schedule_welcome_email_after_commit

User = get_user_model()


class RetailInvestorListSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source="profile.phone", read_only=True)
    referral_code = serializers.CharField(source="profile.referral_code", read_only=True)
    kyc_status = serializers.CharField(source="profile.kyc_status", read_only=True)
    kyc_notes = serializers.CharField(source="profile.kyc_notes", read_only=True)
    kyc_verified_at = serializers.DateTimeField(source="profile.kyc_verified_at", read_only=True)
    kyc_verified_by_username = serializers.SerializerMethodField()
    kyc_requested_at = serializers.DateTimeField(source="profile.kyc_requested_at", read_only=True)
    kyc_investor_notes = serializers.CharField(source="profile.kyc_investor_notes", read_only=True)

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
            "referral_code",
            "date_joined",
            "kyc_status",
            "kyc_notes",
            "kyc_verified_at",
            "kyc_verified_by_username",
            "kyc_requested_at",
            "kyc_investor_notes",
        ]
        read_only_fields = fields

    @staticmethod
    def get_kyc_verified_by_username(obj: User) -> str:
        vb = obj.profile.kyc_verified_by
        return vb.username if vb else ""


class RetailInvestorKycUpdateSerializer(serializers.Serializer):
    kyc_status = serializers.ChoiceField(choices=UserProfile.KycStatus.choices)
    kyc_notes = serializers.CharField(required=False, allow_blank=True)

    def update(self, instance: User, validated_data: dict) -> User:
        profile = instance.profile
        new_status = validated_data["kyc_status"]
        profile.kyc_status = new_status
        if "kyc_notes" in validated_data:
            profile.kyc_notes = (validated_data.get("kyc_notes") or "").strip()
        if new_status in (UserProfile.KycStatus.APPROVED, UserProfile.KycStatus.REJECTED):
            profile.kyc_verified_at = timezone.now()
            profile.kyc_verified_by = self.context["request"].user
        else:
            profile.kyc_verified_at = None
            profile.kyc_verified_by = None
        profile.save(
            update_fields=[
                "kyc_status",
                "kyc_notes",
                "kyc_verified_at",
                "kyc_verified_by",
                "updated_at",
            ]
        )
        return instance


class RetailInvestorCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False, default=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "phone",
            "is_active",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        with transaction.atomic():
            phone = validated_data.pop("phone", "") or ""
            is_active = validated_data.pop("is_active", True)
            plain_password = validated_data["password"]
            user = User.objects.create_user(**validated_data)
            if user.is_active != is_active:
                user.is_active = is_active
                user.save(update_fields=["is_active"])
            profile = user.profile
            profile.phone = phone
            profile.role = UserProfile.UserRole.INVESTOR
            profile.save(update_fields=["phone", "role", "updated_at"])
        schedule_welcome_email_after_commit(
            user_id=user.pk,
            plaintext_password=plain_password,
            include_credentials=True,
            role_label="Investor",
        )
        return user
