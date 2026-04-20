"""Shared branding context + inline logo attachments for transactional HTML emails."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from django.conf import settings

from apps.utils.email_logo import resolve_email_logo_path

BRAND_NAME = "Eurostar Group"


def branding_context_and_inline() -> tuple[dict[str, Any], dict[str, Path]]:
    """
    Context keys for templates extending layout_branded.html:
    - site_name
    - use_cid_logo: attach cid:brand_logo when True
    - logo_url: optional absolute URL when no local file (PUBLIC_BRAND_LOGO_URL)
    """
    inline: dict[str, Path] = {}
    logo_url = (getattr(settings, "PUBLIC_BRAND_LOGO_URL", None) or "").strip()
    path = resolve_email_logo_path()
    ctx: dict[str, Any] = {
        "site_name": BRAND_NAME,
        "use_cid_logo": False,
        "logo_url": logo_url,
    }
    if path and path.is_file():
        inline["brand_logo"] = path
        ctx["use_cid_logo"] = True
        ctx["logo_url"] = ""
    return ctx, inline
