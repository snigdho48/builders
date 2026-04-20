"""
Send a one-off test message and print each step to the console (and Python logging).

Usage:
  python manage.py test_email
  python manage.py test_email --to other@example.com
"""

from __future__ import annotations

import logging
import traceback
from datetime import datetime, timezone

from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection
from django.core.management.base import BaseCommand

logger = logging.getLogger("management.test_email")


class Command(BaseCommand):
    help = "Send a test email and log every SMTP step (for debugging delivery)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--to",
            type=str,
            default="atiquzzamansnigdho@gmail.com",
            help="Recipient address (default: atiquzzamansnigdho@gmail.com).",
        )

    def handle(self, *args, **options):
        to_addr = (options["to"] or "").strip()
        if not to_addr:
            self.stderr.write(self.style.ERROR("ERROR: --to must be a non-empty email address."))
            return

        def step(msg: str) -> None:
            self.stdout.write(msg)
            logger.info(msg)

        def ok(msg: str) -> None:
            self.stdout.write(self.style.SUCCESS(msg))
            logger.info(msg)

        def warn(msg: str) -> None:
            self.stdout.write(self.style.WARNING(msg))
            logger.warning(msg)

        def err(msg: str) -> None:
            self.stderr.write(self.style.ERROR(msg))
            logger.error(msg)

        step("=" * 60)
        step("test_email: started")
        step(f"  Recipient: {to_addr}")
        step(f"  Time (UTC): {datetime.now(timezone.utc).isoformat()}")

        # --- Step 1: settings snapshot (no secrets) ---
        step("[Step 1] Reading Django email settings...")
        host = getattr(settings, "EMAIL_HOST", "")
        port = getattr(settings, "EMAIL_PORT", "")
        use_tls = getattr(settings, "EMAIL_USE_TLS", False)
        use_ssl = getattr(settings, "EMAIL_USE_SSL", False)
        user = getattr(settings, "EMAIL_HOST_USER", "") or ""
        pwd_set = bool(getattr(settings, "EMAIL_HOST_PASSWORD", ""))
        backend = getattr(settings, "EMAIL_BACKEND", "")
        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "") or user or "(not set)"

        step(f"  EMAIL_BACKEND={backend}")
        step(f"  EMAIL_HOST={host!r}  EMAIL_PORT={port}")
        step(f"  EMAIL_USE_TLS={use_tls}  EMAIL_USE_SSL={use_ssl}")
        step(f"  EMAIL_HOST_USER set={bool(user)}  EMAIL_HOST_PASSWORD set={pwd_set}")
        step(f"  DEFAULT_FROM_EMAIL={from_email!r}")

        if not user or not pwd_set:
            warn(
                "  WARNING: SMTP username or password is empty in settings. "
                "Set EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in backend/.env then restart the server."
            )

        # --- Step 2: open connection ---
        connection = get_connection(fail_silently=False)
        step("[Step 2] Opening SMTP connection (django.core.mail.get_connection)...")
        try:
            connection.open()
            ok("  Connection opened successfully.")
        except Exception as exc:
            logger.exception("SMTP connection.open failed")
            err(f"  FAILED to open SMTP connection: {exc}")
            self.stderr.write(traceback.format_exc())
            raise SystemExit(1) from exc

        # --- Step 3: build message ---
        step("[Step 3] Building EmailMultiAlternatives...")
        subject = "[Eurostar] Django mail test"
        body = (
            "This is a test message from the Django management command `test_email`.\n\n"
            f"If you received this, SMTP settings are working.\n\n"
            f"Sent at (UTC): {datetime.now(timezone.utc).isoformat()}\n"
        )
        msg = EmailMultiAlternatives(
            subject=subject,
            body=body,
            from_email=from_email,
            to=[to_addr],
            connection=connection,
        )
        ok(f"  Message built: subject={subject!r} from={from_email!r} to={[to_addr]!r}")

        # --- Step 4: send ---
        step("[Step 4] Sending message (EmailMultiAlternatives.send)...")
        try:
            n = msg.send()
            step(f"  send() returned: {n!r} (messages accepted by backend)")
            if n != 1:
                warn(f"  Unexpected return value {n}; expected 1 for a single message.")
            ok("[Step 5] DONE - check the inbox (and spam) for the test email.")
        except Exception as exc:
            logger.exception("EmailMultiAlternatives.send failed")
            err(f"  FAILED to send: {exc}")
            self.stderr.write(traceback.format_exc())
            raise SystemExit(1) from exc
        finally:
            step("[Cleanup] Closing SMTP connection...")
            try:
                connection.close()
                ok("  Connection closed.")
            except Exception as close_exc:
                warn(f"  Connection close raised (often harmless): {close_exc}")

        step("=" * 60)
