from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.serializers import RegisterSerializer
from apps.utils.response_formatter import error_response
from apps.utils.response_formatter import success_response


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.profile.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["role"] = self.user.profile.role
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(
            success_response(data=serializer.validated_data, message="Login successful"),
            status=status.HTTP_200_OK,
        )


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except (InvalidToken, TokenError) as exc:
            return Response(
                error_response(
                    error_code=status.HTTP_401_UNAUTHORIZED,
                    error_message="Invalid refresh token",
                    details=str(exc),
                ),
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response(
            success_response(data=serializer.validated_data, message="Token refreshed"),
            status=status.HTTP_200_OK,
        )


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            success_response(data=serializer.data, message="Registration successful"),
            status=status.HTTP_201_CREATED,
        )
