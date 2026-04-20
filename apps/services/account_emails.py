"""Welcome and password-reset emails (non-blocking for API via mail service)."""

from __future__ import annotations

import logging
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction

from apps.email_template_names import PASSWORD_RESET, WELCOME_CREDENTIALS
from apps.services.email_branding import BRAND_NAME, branding_context_and_inline
from apps.services.mail import send_templated_mail

logger = logging.getLogger(__name__)


def send_password_reset_email(*, user, reset_link: str) -> bool:
    brand_ctx, inline = branding_context_and_inline()
    ctx = {
        **brand_ctx,
        "email_title": "Reset your password",
        "user": user,
        "reset_link": reset_link,
        "frontend_base": settings.FRONTEND_PUBLIC_URL.rstrip("/"),
    }
    subject = f"{BRAND_NAME} — reset your password"
    return send_templated_mail(
        subject=subject,
        template_base=PASSWORD_RESET,
        context=ctx,
        to=[user.email],
        inline_images=inline or None,
    )


def send_welcome_account_email(
    *,
    user,
    login_url: str,
    plaintext_password: str | None = None,
    role_label: str = "",
) -> bool:
    brand_ctx, inline = branding_context_and_inline()
    show_password = bool(plaintext_password)
    ctx = {
        **brand_ctx,
        "email_title": f"Welcome to {BRAND_NAME}",
        "user": user,
        "login_url": login_url,
        "plaintext_password": plaintext_password or "",
        "show_password_block": show_password,
        "role_label": role_label,
        "frontend_base": settings.FRONTEND_PUBLIC_URL.rstrip("/"),
    }
    subject = f"Welcome to {BRAND_NAME}"
    return send_templated_mail(
        subject=subject,
        template_base=WELCOME_CREDENTIALS,
        context=ctx,
        to=[user.email],
        inline_images=inline or None,
    )


def schedule_welcome_email_after_commit(
    *,
    user_id: int,
    plaintext_password: str | None,
    include_credentials: bool,
    role_label: str = "",
) -> None:
    """Queue welcome email after the enclosing transaction commits."""

    def _send() -> None:
        User = get_user_model()
        user = User.objects.filter(pk=user_id).first()
        if not user or not (user.email or "").strip():
            logger.warning("Welcome email skipped: user %s missing or no email", user_id)
            return
        login_url = f"{settings.FRONTEND_PUBLIC_URL.rstrip('/')}/auth"
        send_welcome_account_email(
            user=user,
            login_url=login_url,
            plaintext_password=plaintext_password if include_credentials else None,
            role_label=role_label or "",
        )

    transaction.on_commit(_send)
