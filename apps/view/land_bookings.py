import mimetypes

from django.db import transaction
from django.db.models import Q
from django.http import HttpResponse
from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from apps.constants import ROLE_AGENT, ROLE_INVESTOR, is_staff_admin
from apps.models import LandBooking, LandBookingAttachment
from apps.permissions import CanAccessLandBookings
from apps.serializers.land_bookings import (
    LandBookingProcessSerializer,
    LandBookingReviewSerializer,
    LandBookingSerializer,
    apply_accept,
    apply_reject,
)
from apps.services.booking_emails import schedule_booking_confirmation_email
from apps.view.base import StandardModelViewSet


class LandBookingViewSet(StandardModelViewSet):
    serializer_class = LandBookingSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessLandBookings]
    http_method_names = ["get", "post", "head", "options"]
    queryset = LandBooking.objects.select_related(
        "property",
        "land_share_listing",
        "investor",
        "reviewed_by",
    ).prefetch_related("application_attachments").order_by("-created_at")

    def perform_create(self, serializer):
        super().perform_create(serializer)
        bid = serializer.instance.pk
        transaction.on_commit(lambda b=bid: schedule_booking_confirmation_email(b))

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        role = getattr(user.profile, "role", None)
        if is_staff_admin(role):
            return qs
        if role == ROLE_AGENT:
            return qs.filter(
                Q(property__assigned_agent=user) | Q(land_share_listing__assigned_agent=user)
            )
        if role == ROLE_INVESTOR:
            return qs.filter(investor=user)
        return LandBooking.objects.none()

    def _can_review(self, booking) -> bool:
        user = self.request.user
        role = getattr(user.profile, "role", None)
        if is_staff_admin(role):
            return True
        if role == ROLE_AGENT:
            if booking.property_id:
                return booking.property.assigned_agent_id == user.id
            if booking.land_share_listing_id:
                return booking.land_share_listing.assigned_agent_id == user.id
        return False

    @action(detail=True, methods=["post"], url_path="accept")
    def accept(self, request, pk=None):
        booking = self.get_object()
        if booking.status != LandBooking.Status.PENDING:
            return Response(
                {"detail": "Only pending bookings can be accepted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not self._can_review(booking):
            return Response(status=status.HTTP_403_FORBIDDEN)
        apply_accept(booking, request.user)
        ser = LandBookingSerializer(booking, context={"request": request})
        return self.respond(data=ser.data, message="Booking accepted")

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        booking = self.get_object()
        if booking.status != LandBooking.Status.PENDING:
            return Response(
                {"detail": "Only pending bookings can be rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not self._can_review(booking):
            return Response(status=status.HTTP_403_FORBIDDEN)
        ser = LandBookingReviewSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        apply_reject(booking, request.user, ser.validated_data.get("rejection_reason", ""))
        out = LandBookingSerializer(booking, context={"request": request})
        return self.respond(data=out.data, message="Booking rejected")

    @action(detail=True, methods=["post"], url_path="process-application")
    def process_application(self, request, pk=None):
        """
        Staff final-processing step:
        1) finalize enriched application_data / primary fields
        2) pending -> accept booking (creates installments)
        3) accepted -> allow post-accept form updates (no status/ledger changes)
        """
        booking = self.get_object()
        if booking.status not in (LandBooking.Status.PENDING, LandBooking.Status.ACCEPTED):
            return Response(
                {"detail": "Only pending or accepted bookings can be processed/updated."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        was_pending = booking.status == LandBooking.Status.PENDING
        if not self._can_review(booking):
            return Response(status=status.HTTP_403_FORBIDDEN)

        if booking.status == LandBooking.Status.PENDING and booking.booking_kind == LandBooking.BookingKind.PLOT_BUY:
            required_kinds = {
                LandBookingAttachment.Kind.PASSPORT_PHOTO_1,
                LandBookingAttachment.Kind.NID_OR_ID,
                LandBookingAttachment.Kind.BOOKING_MONEY_RECEIPT,
            }
            uploaded_kinds = set(
                LandBookingAttachment.objects.filter(booking=booking, kind__in=required_kinds).values_list("kind", flat=True)
            )
            missing = sorted(required_kinds - uploaded_kinds)
            if missing:
                return Response(
                    {
                        "detail": "Upload required application files before processing.",
                        "missing": missing,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        ser = LandBookingProcessSerializer(data=request.data or {})
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        update_fields = []
        for field in ("full_name", "email", "phone", "contact_notes", "referral_code_used"):
            if field in data:
                setattr(booking, field, data[field])
                update_fields.append(field)

        if "application_data" in data:
            booking.application_data = data.get("application_data") or {}
            update_fields.append("application_data")

        if update_fields:
            update_fields.append("updated_at")
            booking.save(update_fields=update_fields)

        if was_pending:
            apply_accept(booking, request.user)

        out = LandBookingSerializer(booking, context={"request": request})
        return self.respond(
            data=out.data,
            message=("Booking application processed" if was_pending else "Booking application updated"),
        )

    _ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024
    _ATTACHMENT_ALLOWED_TYPES = frozenset(
        {"image/jpeg", "image/png", "image/webp", "application/pdf"}
    )
    _ATTACHMENT_FORM_FIELDS = (
        ("passport_photo_1", LandBookingAttachment.Kind.PASSPORT_PHOTO_1),
        ("nid_or_id", LandBookingAttachment.Kind.NID_OR_ID),
        ("booking_money_receipt", LandBookingAttachment.Kind.BOOKING_MONEY_RECEIPT),
    )
    _ATTACHMENT_JOINT_OPTIONAL_FIELDS = (
        ("joint_applicant_01_passport_photo", LandBookingAttachment.Kind.JOINT_APPLICANT_01_PASSPORT_PHOTO),
        ("joint_applicant_01_nid_or_id", LandBookingAttachment.Kind.JOINT_APPLICANT_01_NID_OR_ID),
        ("joint_applicant_02_passport_photo", LandBookingAttachment.Kind.JOINT_APPLICANT_02_PASSPORT_PHOTO),
        ("joint_applicant_02_nid_or_id", LandBookingAttachment.Kind.JOINT_APPLICANT_02_NID_OR_ID),
        ("joint_applicant_03_passport_photo", LandBookingAttachment.Kind.JOINT_APPLICANT_03_PASSPORT_PHOTO),
        ("joint_applicant_03_nid_or_id", LandBookingAttachment.Kind.JOINT_APPLICANT_03_NID_OR_ID),
        ("joint_applicant_04_passport_photo", LandBookingAttachment.Kind.JOINT_APPLICANT_04_PASSPORT_PHOTO),
        ("joint_applicant_04_nid_or_id", LandBookingAttachment.Kind.JOINT_APPLICANT_04_NID_OR_ID),
        ("joint_applicant_05_passport_photo", LandBookingAttachment.Kind.JOINT_APPLICANT_05_PASSPORT_PHOTO),
        ("joint_applicant_05_nid_or_id", LandBookingAttachment.Kind.JOINT_APPLICANT_05_NID_OR_ID),
    )
    _ATTACHMENT_NOMINEE_OPTIONAL_FIELDS = (
        ("nominee_01_passport_photo", LandBookingAttachment.Kind.NOMINEE_01_PASSPORT_PHOTO),
        ("nominee_01_nid_or_id", LandBookingAttachment.Kind.NOMINEE_01_NID_OR_ID),
        ("nominee_02_passport_photo", LandBookingAttachment.Kind.NOMINEE_02_PASSPORT_PHOTO),
        ("nominee_02_nid_or_id", LandBookingAttachment.Kind.NOMINEE_02_NID_OR_ID),
        ("nominee_03_passport_photo", LandBookingAttachment.Kind.NOMINEE_03_PASSPORT_PHOTO),
        ("nominee_03_nid_or_id", LandBookingAttachment.Kind.NOMINEE_03_NID_OR_ID),
        ("nominee_04_passport_photo", LandBookingAttachment.Kind.NOMINEE_04_PASSPORT_PHOTO),
        ("nominee_04_nid_or_id", LandBookingAttachment.Kind.NOMINEE_04_NID_OR_ID),
        ("nominee_05_passport_photo", LandBookingAttachment.Kind.NOMINEE_05_PASSPORT_PHOTO),
        ("nominee_05_nid_or_id", LandBookingAttachment.Kind.NOMINEE_05_NID_OR_ID),
    )

    def _attachment_validate_upload(self, uploaded, field_name: str):
        """Return error Response or None."""
        if uploaded.size > self._ATTACHMENT_MAX_BYTES:
            return Response(
                {"detail": f"File too large for {field_name} (max 10 MB)."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ctype = getattr(uploaded, "content_type", None) or mimetypes.guess_type(uploaded.name)[0]
        if not ctype:
            lower = uploaded.name.lower()
            if lower.endswith((".jpg", ".jpeg")):
                ctype = "image/jpeg"
            elif lower.endswith(".png"):
                ctype = "image/png"
            elif lower.endswith(".webp"):
                ctype = "image/webp"
            elif lower.endswith(".pdf"):
                ctype = "application/pdf"
        if not ctype or ctype not in self._ATTACHMENT_ALLOWED_TYPES:
            return Response(
                {
                    "detail": f"Unsupported file type for {field_name}. Use JPG, PNG, WebP, or PDF.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return None

    @action(
        detail=True,
        methods=["post"],
        url_path="application-attachments",
        parser_classes=[MultiPartParser, FormParser],
    )
    def application_attachments(self, request, pk=None):
        """Upload required trio + optional joint/nominee photo+NID pairs (pending plot_buy only)."""
        booking = self.get_object()
        if booking.status != LandBooking.Status.PENDING:
            return Response(
                {"detail": "Attachments can only be uploaded while the booking is pending."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if booking.booking_kind != LandBooking.BookingKind.PLOT_BUY:
            return Response(
                {"detail": "Application attachments apply to plot-buy bookings only."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        missing = [name for name, _ in self._ATTACHMENT_FORM_FIELDS if name not in request.FILES]
        if missing:
            return Response(
                {"detail": "All three files are required.", "missing": missing},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for field_name, _kind in self._ATTACHMENT_FORM_FIELDS:
            err = self._attachment_validate_upload(request.FILES[field_name], field_name)
            if err:
                return err

        for field_name, _kind in self._ATTACHMENT_JOINT_OPTIONAL_FIELDS:
            if field_name not in request.FILES:
                continue
            err = self._attachment_validate_upload(request.FILES[field_name], field_name)
            if err:
                return err

        for field_name, _kind in self._ATTACHMENT_NOMINEE_OPTIONAL_FIELDS:
            if field_name not in request.FILES:
                continue
            err = self._attachment_validate_upload(request.FILES[field_name], field_name)
            if err:
                return err

        joint_kinds = [kind for _, kind in self._ATTACHMENT_JOINT_OPTIONAL_FIELDS]
        nominee_kinds = [kind for _, kind in self._ATTACHMENT_NOMINEE_OPTIONAL_FIELDS]

        with transaction.atomic():
            for field_name, kind in self._ATTACHMENT_FORM_FIELDS:
                uploaded = request.FILES[field_name]
                existing = (
                    LandBookingAttachment.objects.select_for_update()
                    .filter(booking=booking, kind=kind)
                    .first()
                )
                if existing:
                    if existing.file:
                        existing.file.delete(save=False)
                    existing.delete()
                LandBookingAttachment.objects.create(booking=booking, kind=kind, file=uploaded)

            LandBookingAttachment.objects.filter(booking=booking, kind__in=joint_kinds).delete()
            LandBookingAttachment.objects.filter(booking=booking, kind__in=nominee_kinds).delete()

            for field_name, kind in self._ATTACHMENT_JOINT_OPTIONAL_FIELDS:
                if field_name not in request.FILES:
                    continue
                LandBookingAttachment.objects.create(
                    booking=booking,
                    kind=kind,
                    file=request.FILES[field_name],
                )

            for field_name, kind in self._ATTACHMENT_NOMINEE_OPTIONAL_FIELDS:
                if field_name not in request.FILES:
                    continue
                LandBookingAttachment.objects.create(
                    booking=booking,
                    kind=kind,
                    file=request.FILES[field_name],
                )

        booking.refresh_from_db()
        out = LandBookingSerializer(booking, context={"request": request})
        return self.respond(data=out.data, message="Application documents uploaded")

    @action(detail=True, methods=["get"], url_path="money-receipt")
    def money_receipt(self, request, pk=None):
        """PDF Money Receipt (Eurostar template) for plot-buy bookings."""
        booking = self.get_object()
        if booking.booking_kind != LandBooking.BookingKind.PLOT_BUY:
            return Response(
                {"detail": "Money receipt is available for plot-buy bookings only."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from apps.utils.booking_money_receipt_pdf import build_money_receipt_pdf

        pdf_bytes = build_money_receipt_pdf(booking)
        filename = f"eurostar-money-receipt-{booking.id}.pdf"
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response
