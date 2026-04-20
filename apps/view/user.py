from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.constants import ROLE_INVESTOR
from apps.permissions import IsAuthenticatedAndKnownRole
from apps.serializers import KycRequestSerializer, MeSerializer, ProfileUpdateSerializer
from apps.utils.response_formatter import success_response, error_response


class MeKycRequestView(APIView):
    """Investors can ask staff to review their KYC (optional message)."""

    permission_classes = [IsAuthenticatedAndKnownRole]
    parser_classes = [JSONParser, FormParser]

    def post(self, request):
        if request.user.profile.role != ROLE_INVESTOR:
            return Response(
                error_response(403, "Only investor accounts can submit a KYC request."),
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = KycRequestSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        payload = MeSerializer.build_payload(request.user)
        return Response(success_response(data=MeSerializer(payload).data, message="KYC request submitted"))


class MeView(APIView):
    permission_classes = [IsAuthenticatedAndKnownRole]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        payload = MeSerializer.build_payload(request.user)
        serializer = MeSerializer(payload)
        return Response(success_response(data=serializer.data))

    def patch(self, request):
        serializer = ProfileUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.update(request.user, serializer.validated_data)
        payload = MeSerializer.build_payload(request.user)
        return Response(success_response(data=MeSerializer(payload).data, message="Profile updated"))
