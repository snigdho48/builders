"""Booking confirmation emails with optional money-receipt PDF (non-blocking)."""

from __future__ import annotations

import logging

from django.conf import settings
from django.db import transaction

from apps.email_template_names import BOOKING_MONEY_RECEIPT_NOTICE
from apps.models import LandBooking
from apps.services.email_branding import BRAND_NAME, branding_context_and_inline
from apps.services.mail import send_templated_mail

logger = logging.getLogger(__name__)


def _listing_title(booking: LandBooking) -> str:
    if booking.property_id and booking.property:
        return booking.property.title
    if booking.land_share_listing_id and booking.land_share_listing:
        return booking.land_share_listing.title
    return "Eurostar listing"


def _application_refs(booking: LandBooking) -> tuple[str, str]:
    raw = booking.application_data
    if not isinstance(raw, dict):
        return "", ""
    return str(raw.get("form_id_no") or "").strip(), str(raw.get("form_file_no") or "").strip()


def send_booking_confirmation_email(booking: LandBooking) -> bool:
    to_addr = (booking.email or "").strip()
    if not to_addr:
        logger.warning(
            "Booking confirmation email skipped: booking %s has no customer email on the booking record",
            booking.pk,
        )
        return False

    logger.info(
        "send_booking_confirmation_email start booking_id=%s to=%s booking_kind=%s investor_id=%s",
        booking.pk,
        to_addr,
        booking.booking_kind,
        booking.investor_id,
    )

    brand_ctx, inline = branding_context_and_inline()
    front = settings.FRONTEND_PUBLIC_URL.rstrip("/")
    dashboard_url = f"{front}/dashboard/investor/bookings"

    plot_line = ""
    if booking.selected_plot_code:
        plot_line = booking.selected_plot_code
    if booking.selected_plot_area_sqft:
        plot_line = f"{plot_line} · {booking.selected_plot_area_sqft} sq ft".strip(" ·")

    owner_id, file_no = _application_refs(booking)
    listing_title = _listing_title(booking)

    attach_pdf = booking.booking_kind == LandBooking.BookingKind.PLOT_BUY
    pdf_bytes: bytes | None = None
    if attach_pdf:
        try:
            from apps.utils.booking_money_receipt_pdf import build_money_receipt_pdf

            pdf_bytes = build_money_receipt_pdf(booking)
        except Exception:
            logger.exception("Money receipt PDF build failed for booking %s; sending email without PDF", booking.pk)

    file_attachments: list[tuple[str, bytes, str]] = []
    if pdf_bytes:
        file_attachments.append(
            (f"eurostar-money-receipt-{booking.id}.pdf", pdf_bytes, "application/pdf")
        )

    ctx = {
        **brand_ctx,
        "email_title": "Booking confirmation",
        "booking": booking,
        "listing_title": listing_title,
        "plot_summary": plot_line,
        "owner_id": owner_id,
        "file_no": file_no,
        "dashboard_url": dashboard_url,
        "frontend_base": front,
        "has_money_receipt_pdf": bool(pdf_bytes),
    }

    if pdf_bytes:
        subject = f"{BRAND_NAME} — booking confirmed & money receipt (#{booking.id})"
    else:
        subject = f"{BRAND_NAME} — booking received (#{booking.id})"

    ok = send_templated_mail(
        subject=subject,
        template_base=BOOKING_MONEY_RECEIPT_NOTICE,
        context=ctx,
        to=[to_addr],
        inline_images=inline or None,
        file_attachments=file_attachments or None,
    )
    logger.info(
        "send_booking_confirmation_email finished booking_id=%s to=%s success=%s pdf_attached=%s",
        booking.pk,
        to_addr,
        ok,
        bool(file_attachments),
    )
    return ok


def schedule_booking_confirmation_email(booking_id: int) -> None:
    """Send after the enclosing DB transaction commits."""

    logger.info(
        "schedule_booking_confirmation_email: queued after transaction commit booking_id=%s",
        booking_id,
    )

    def _send() -> None:
        booking = (
            LandBooking.objects.select_related("property", "land_share_listing", "investor")
            .filter(pk=booking_id)
            .first()
        )
        if not booking:
            logger.warning("Booking confirmation email skipped: booking %s not found", booking_id)
            return
        send_booking_confirmation_email(booking)

    transaction.on_commit(_send)
