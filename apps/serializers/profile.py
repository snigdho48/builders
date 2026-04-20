from django.conf import settings
from django.db import transaction
from rest_framework import serializers

from apps.models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["phone", "referral_code", "role", "profile_photo", "referral_commission_percent"]
        read_only_fields = ["referral_code", "referral_commission_percent"]


class MeSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField(allow_blank=True)
    role = serializers.CharField()
    referral_code = serializers.CharField()
    referral_link = serializers.CharField()
    referral_commission_percent = serializers.CharField()
    first_name = serializers.CharField(allow_blank=True)
    last_name = serializers.CharField(allow_blank=True)
    profile_photo = serializers.CharField(allow_blank=True)
    kyc_status = serializers.CharField()
    kyc_verified_at = serializers.CharField(allow_blank=True)
    kyc_requested_at = serializers.CharField(allow_blank=True)
    kyc_investor_notes = serializers.CharField(allow_blank=True)

    @staticmethod
    def build_payload(user):
        profile = user.profile
        base = getattr(settings, "FRONTEND_PUBLIC_URL", "http://127.0.0.1:5173").rstrip("/")
        referral_link = f"{base}/register?ref={profile.referral_code}"
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone": profile.phone,
            "role": profile.role,
            "referral_code": profile.referral_code,
            "referral_link": referral_link,
            "referral_commission_percent": str(profile.referral_commission_percent),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "profile_photo": profile.profile_photo.url if profile.profile_photo else "",
            "kyc_status": profile.kyc_status,
            "kyc_verified_at": profile.kyc_verified_at.isoformat() if profile.kyc_verified_at else "",
            "kyc_requested_at": profile.kyc_requested_at.isoformat() if profile.kyc_requested_at else "",
            "kyc_investor_notes": profile.kyc_investor_notes or "",
        }


class KycRequestSerializer(serializers.Serializer):
    """Investor-only: record a request for staff to perform KYC."""

    message = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    def create(self, validated_data):
        from django.utils import timezone

        user = self.context["request"].user
        profile = user.profile
        profile.kyc_requested_at = timezone.now()
        profile.kyc_investor_notes = (validated_data.get("message") or "").strip()
        profile.save(update_fields=["kyc_requested_at", "kyc_investor_notes", "updated_at"])
        return user


class ProfileUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True)
    profile_photo = serializers.ImageField(required=False, allow_null=True)
    current_password = serializers.CharField(required=False, write_only=True, allow_blank=True)
    new_password = serializers.CharField(required=False, write_only=True, allow_blank=True)

    def validate(self, attrs):
        new_pw = (attrs.get("new_password") or "").strip()
        cur_pw = (attrs.get("current_password") or "").strip()
        attrs["new_password"] = new_pw or None
        attrs["current_password"] = cur_pw or None
        if attrs["new_password"]:
            if len(attrs["new_password"]) < 8:
                raise serializers.ValidationError({"new_password": "Use at least 8 characters."})
            if not attrs["current_password"]:
                raise serializers.ValidationError(
                    {"current_password": "Enter your current password to set a new one."}
                )
        else:
            attrs["new_password"] = None
        return attrs

    def update(self, instance, validated_data):
        with transaction.atomic():
            profile = instance.profile
            new_password = validated_data.pop("new_password", None)
            current_password = validated_data.pop("current_password", None)
            if new_password:
                if not instance.check_password(current_password):
                    raise serializers.ValidationError({"current_password": "Current password is incorrect."})
                instance.set_password(new_password)

            first_name = validated_data.get("first_name")
            last_name = validated_data.get("last_name")
            email = validated_data.get("email")
            phone = validated_data.get("phone")

            if first_name is not None:
                instance.first_name = first_name
            if last_name is not None:
                instance.last_name = last_name
            if email is not None:
                instance.email = email
            user_update_fields: list[str] = []
            if first_name is not None:
                user_update_fields.append("first_name")
            if last_name is not None:
                user_update_fields.append("last_name")
            if email is not None:
                user_update_fields.append("email")
            if new_password:
                user_update_fields.append("password")
            if user_update_fields:
                instance.save(update_fields=user_update_fields)

            if phone is not None:
                profile.phone = phone
            if "profile_photo" in validated_data:
                profile.profile_photo = validated_data["profile_photo"]
            profile.save(update_fields=["phone", "profile_photo", "updated_at"])
        return instance
