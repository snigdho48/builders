from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.db import transaction
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.serializers.password_reset import ForgotPasswordSerializer, PasswordResetConfirmSerializer
from apps.services.account_emails import send_password_reset_email
from apps.utils.response_formatter import error_response, success_response

User = get_user_model()


class ForgotPasswordRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        raw_email = serializer.validated_data["email"].strip()

        user = User.objects.filter(email__iexact=raw_email).first()

        def _maybe_send_mail() -> None:
            if not user or not user.is_active:
                return
            if not (user.email or "").strip():
                return
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            base = settings.FRONTEND_PUBLIC_URL.rstrip("/")
            reset_link = f"{base}/auth/reset-password?uid={uid}&token={token}"
            send_password_reset_email(user=user, reset_link=reset_link)

        transaction.on_commit(_maybe_send_mail)

        return Response(
            success_response(
                message=(
                    "If an account exists for this email address, "
                    "you will receive password reset instructions shortly."
                ),
                data=None,
            ),
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid_b64 = serializer.validated_data["uid"].strip()
        raw_token = serializer.validated_data["token"].strip()
        new_password = serializer.validated_data["new_password"]

        try:
            pk = force_str(urlsafe_base64_decode(uid_b64))
            user = User.objects.get(pk=pk)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response(
                error_response(
                    status.HTTP_400_BAD_REQUEST,
                    "Invalid or expired reset link.",
                    {"uid": ["Invalid reset link."]},
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, raw_token):
            return Response(
                error_response(
                    status.HTTP_400_BAD_REQUEST,
                    "Invalid or expired reset link.",
                    {"token": ["This reset link has expired or was already used. Request a new one."]},
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response(
            success_response(message="Your password has been updated. You can sign in now."),
            status=status.HTTP_200_OK,
        )
