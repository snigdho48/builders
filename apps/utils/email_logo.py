"""Resolve inline logo path for transactional HTML emails (CID attachments)."""

from __future__ import annotations

from pathlib import Path

from django.conf import settings


def resolve_email_logo_path() -> Path | None:
    """
    Prefer EMAIL_INLINE_LOGO_PATH / EMAIL_HOST_USER_IMAGE, then defaults under media/ or static/.
    Relative paths are resolved against BASE_DIR (e.g. media/assets/navlogo.jpg).
    """
    custom = getattr(settings, "EMAIL_INLINE_LOGO_PATH", None)
    if custom:
        p = Path(str(custom).strip())
        if not p.is_absolute():
            p = Path(getattr(settings, "BASE_DIR", Path("."))) / p
        if p.is_file():
            return p

    mr = getattr(settings, "MONEY_RECEIPT_LOGO_PATH", None)
    if mr:
        p = Path(str(mr))
        if p.is_file():
            return p

    base = Path(settings.BASE_DIR)
    for rel in (
        base / "media" / "assets" / "navlogo.jpg",
        base / "static" / "branding" / "navlogo.jpg",
        base / "static" / "branding" / "logo.jpg",
    ):
        if rel.is_file():
            return rel
    return None
