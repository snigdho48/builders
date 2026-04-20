from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from apps.models import UserProfile
from apps.services.account_emails import schedule_welcome_email_after_commit

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    ref = serializers.CharField(write_only=True, required=False, allow_blank=True)

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
            "ref",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        ref = attrs.pop("ref", "") or ""
        ref = ref.strip()
        if ref:
            referrer_profile = UserProfile.objects.filter(referral_code__iexact=ref).first()
            if not referrer_profile:
                raise serializers.ValidationError({"ref": "Invalid referral code."})
            attrs["_referred_by_id"] = referrer_profile.user_id
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            referred_by_id = validated_data.pop("_referred_by_id", None)
            phone = validated_data.pop("phone", "")
            user = User.objects.create_user(**validated_data)
            profile = user.profile
            profile.phone = phone
            profile.role = UserProfile.UserRole.INVESTOR
            if referred_by_id:
                profile.referred_by_id = referred_by_id
            profile.save(update_fields=["phone", "role", "referred_by"])
        schedule_welcome_email_after_commit(
            user_id=user.pk,
            plaintext_password=None,
            include_credentials=False,
            role_label="Investor",
        )
        return user
