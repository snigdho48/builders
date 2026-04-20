from __future__ import annotations

import logging
import mimetypes
from email.mime.image import MIMEImage
from collections.abc import Sequence
from pathlib import Path
from typing import Any

import os

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template import TemplateDoesNotExist
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def _smtp_settings_snapshot() -> dict[str, object]:
    """Safe for logs — never includes passwords."""
    return {
        "EMAIL_HOST": getattr(settings, "EMAIL_HOST", ""),
        "EMAIL_PORT": getattr(settings, "EMAIL_PORT", ""),
        "EMAIL_USE_TLS": getattr(settings, "EMAIL_USE_TLS", False),
        "EMAIL_USE_SSL": getattr(settings, "EMAIL_USE_SSL", False),
        "EMAIL_HOST_USER_set": bool(getattr(settings, "EMAIL_HOST_USER", "")),
        "EMAIL_HOST_PASSWORD_set": bool(getattr(settings, "EMAIL_HOST_PASSWORD", "")),
        "DEFAULT_FROM_EMAIL": getattr(settings, "DEFAULT_FROM_EMAIL", ""),
    }


def _email_verbose() -> bool:
    return bool(
        getattr(settings, "DEBUG", False)
        or os.environ.get("EMAIL_DEBUG", "").lower() in ("1", "true", "yes", "on")
    )


def render_email_pair(template_base: str, context: dict[str, Any]) -> tuple[str, str]:
    """
    Render HTML and plain-text parts. If emails/{template_base}.txt is missing,
    plain text is derived by stripping HTML.
    """
    html = render_to_string(f"emails/{template_base}.html", context)
    try:
        text = render_to_string(f"emails/{template_base}.txt", context)
    except TemplateDoesNotExist:
        text = strip_tags(html)
    return html, text


def send_templated_mail(
    *,
    subject: str,
    template_base: str,
    context: dict[str, Any],
    to: list[str] | tuple[str, ...],
    from_email: str | None = None,
    reply_to: list[str] | None = None,
    cc: list[str] | None = None,
    bcc: list[str] | None = None,
    inline_images: dict[str, Path] | None = None,
    file_attachments: Sequence[tuple[str, bytes, str]] | None = None,
) -> bool:
    """
    Send HTML + text email using templates under templates/emails/{template_base}.*.

    Catches all exceptions, logs them, and returns False so API flows are not interrupted.
    Returns True if Django reports the message was sent.
    """
    if not to:
        logger.warning("send_templated_mail skipped: empty recipient list (subject=%r)", subject)
        return False

    sender = from_email or settings.DEFAULT_FROM_EMAIL

    snap = _smtp_settings_snapshot()
    logger.info(
        "send_templated_mail start template=%s to=%s subject=%r from=%s",
        template_base,
        list(to),
        subject,
        sender,
    )
    if _email_verbose():
        logger.info("send_templated_mail SMTP settings (no secrets): %s", snap)
    if not snap["EMAIL_HOST_USER_set"] or not snap["EMAIL_HOST_PASSWORD_set"]:
        logger.warning(
            "SMTP credentials missing in settings — mail will fail until EMAIL_HOST_USER / "
            "EMAIL_HOST_PASSWORD are set in the environment (.env)."
        )

    try:
        html_body, text_body = render_email_pair(template_base, context)
    except Exception:
        logger.exception(
            "Email template render failed (subject=%r template=%r)", subject, template_base
        )
        return False

    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=sender,
            to=list(to),
            cc=cc or [],
            bcc=bcc or [],
            reply_to=reply_to or [],
        )
        msg.attach_alternative(html_body, "text/html")
        for cid, path in (inline_images or {}).items():
            if not isinstance(path, Path):
                path = Path(path)
            if not path.is_file():
                logger.warning("Inline image missing for cid=%r path=%s", cid, path)
                continue
            with path.open("rb") as fh:
                raw = fh.read()
            guessed, _ = mimetypes.guess_type(path.name)
            if guessed and guessed.startswith("image/"):
                sub = guessed.split("/", 1)[1]
                mime_img = MIMEImage(raw, _subtype=sub)
            else:
                mime_img = MIMEImage(raw, _subtype="jpeg")
            # Match HTML src="cid:…" (RFC 2392); bracket form is standard for Content-ID.
            mime_img.add_header("Content-ID", f"<{cid}>")
            mime_img.add_header("Content-Disposition", "inline", filename=path.name)
            msg.attach(mime_img)
        for fname, raw, ctype in file_attachments or ():
            msg.attach(fname, raw, ctype)
            if _email_verbose():
                logger.info(
                    "send_templated_mail attachment name=%s bytes=%s type=%s",
                    fname,
                    len(raw),
                    ctype,
                )
        msg.send(fail_silently=False)
    except Exception:
        logger.exception(
            "SMTP send failed (subject=%r template=%r to=%s)",
            subject,
            template_base,
            to,
        )
        return False

    logger.info(
        "send_templated_mail OK template=%s to=%s subject=%r",
        template_base,
        list(to),
        subject,
    )
    return True


def send_plain_mail(
    *,
    subject: str,
    body: str,
    to: list[str] | tuple[str, ...],
    from_email: str | None = None,
    reply_to: list[str] | None = None,
) -> bool:
    """Simple plain-text email; failures are logged and do not propagate."""
    if not to:
        logger.warning("send_plain_mail skipped: empty recipient list (subject=%r)", subject)
        return False

    sender = from_email or settings.DEFAULT_FROM_EMAIL

    logger.info("send_plain_mail subject=%r to=%s from=%s", subject, list(to), sender)
    if _email_verbose():
        logger.info("send_plain_mail SMTP settings (no secrets): %s", _smtp_settings_snapshot())

    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=body,
            from_email=sender,
            to=list(to),
            reply_to=reply_to or [],
        )
        msg.send(fail_silently=False)
    except Exception:
        logger.exception("SMTP send failed (plain mail subject=%r to=%s)", subject, to)
        return False

    logger.info("send_plain_mail OK to=%s", list(to))
    return True
