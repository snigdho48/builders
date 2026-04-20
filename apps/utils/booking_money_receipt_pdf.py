"""
Eurostar-style Money Receipt PDF (plot booking).
Layout: e-ticket style — bordered sections, banded titles, tight vertical rhythm (reference: airline e-ticket PDFs).
"""

from __future__ import annotations

import io
import os
import tempfile
from pathlib import Path
from xml.sax.saxutils import escape

from django.conf import settings
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from apps.models import LandBooking

_FONT_REGISTERED = False


def _register_font() -> str:
    global _FONT_REGISTERED
    font_name = "Helvetica"
    if _FONT_REGISTERED:
        return "DejaVu" if "DejaVu" in pdfmetrics.getRegisteredFontNames() else font_name
    try:
        import reportlab

        root = Path(reportlab.__file__).resolve().parent
        dejavu = root / "fonts" / "DejaVuSans.ttf"
        if dejavu.is_file():
            pdfmetrics.registerFont(TTFont("DejaVu", str(dejavu)))
            _FONT_REGISTERED = True
            return "DejaVu"
    except Exception:
        pass
    _FONT_REGISTERED = True
    return font_name


def _resolve_logo_path() -> Path | None:
    """Prefer backend `media/assets/navlogo.jpg`; override with settings.MONEY_RECEIPT_LOGO_PATH."""
    custom = getattr(settings, "MONEY_RECEIPT_LOGO_PATH", None)
    if custom:
        p = Path(str(custom))
        if p.is_file():
            return p
    base = Path(settings.BASE_DIR)
    repo = base.parent
    for rel in (
        base / "media" / "assets" / "navlogo.jpg",
        base / "static" / "branding" / "navlogo.jpg",
        base / "static" / "branding" / "logo.jpg",
    ):
        if rel.is_file():
            return rel
    return None


def _logo_to_temp_png(path: Path, max_w_mm: float = 26.0, max_h_mm: float = 24.0) -> tuple[str, float, float] | None:
    """
    Resize logo to a temp PNG; return path + draw size in points for canvas.drawImage.
    Platypus Image inside Tables hits layout bugs on some ReportLab/Python combinations (invalid row height).
    """
    max_w = max(1, int(round(float(max_w_mm * mm))))
    max_h = max(1, int(round(float(max_h_mm * mm))))

    try:
        from PIL import Image as PILImage

        try:
            resample = PILImage.Resampling.LANCZOS
        except AttributeError:
            resample = PILImage.LANCZOS

        with PILImage.open(path) as im:
            im = im.convert("RGB")
            im.thumbnail((max_w, max_h), resample)
            nw, nh = im.size
            if nw <= 0 or nh <= 0:
                return None
            fd, tmp_png = tempfile.mkstemp(prefix="rcpt_logo_", suffix=".png")
            os.close(fd)
            im.save(tmp_png, format="PNG")
            return (tmp_png, float(nw), float(nh))
    except Exception:
        return None


def _unlink_safe(path: str | None) -> None:
    if not path:
        return
    try:
        os.unlink(path)
    except OSError:
        pass


def _ad(booking: LandBooking, *keys: str, default: str = "") -> str:
    """application_data nested get."""
    d = booking.application_data
    if not isinstance(d, dict):
        return default
    cur: object = d
    for k in keys:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(k)
    if cur is None:
        return default
    if isinstance(cur, bool):
        return "Yes" if cur else ""
    return str(cur)


def _p(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(escape(text).replace("\n", "<br/>"), style)


def _checkbox(val: bool) -> str:
    return "[x]" if val else "[ ]"


def _boxed_section(
    inner_w: float,
    body_font: str,
    title: str,
    body_flowables: list | object,
    *,
    padding: tuple[int, int, int, int] = (10, 10, 10, 10),
) -> Table:
    """Single outer border; grey title band; padded body (e-ticket section feel)."""
    pt, pr, pb, pl = padding
    title_para = Paragraph(
        f"<b>{escape(title.upper())}</b>",
        ParagraphStyle(
            name="_BandInner",
            fontName=body_font,
            fontSize=8,
            leading=11,
            letterSpacing=0.8,
            textColor=colors.HexColor("#334155"),
            alignment=TA_LEFT,
        ),
    )
    inner_col_w = inner_w - pl - pr
    if isinstance(body_flowables, list):
        # Never use KeepTogether inside Table cells — ReportLab can compute ~2^24 pt row height on split pages.
        stack_rows = [[fl] for fl in body_flowables]
        body_cell = Table(stack_rows, colWidths=[inner_col_w])
        body_cell.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ]
            )
        )
    else:
        body_cell = body_flowables
    inner_rows: list = [[title_para], [body_cell]]
    t = Table(inner_rows, colWidths=[inner_w])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8eef5")),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, 0), 7),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 7),
                ("LEFTPADDING", (0, 0), (-1, 0), pl),
                ("RIGHTPADDING", (0, 0), (-1, 0), pr),
                ("TOPPADDING", (0, 1), (-1, 1), pt),
                ("BOTTOMPADDING", (0, 1), (-1, 1), pb),
                ("LEFTPADDING", (0, 1), (-1, 1), pl),
                ("RIGHTPADDING", (0, 1), (-1, 1), pr),
                ("BOX", (0, 0), (-1, -1), 0.85, colors.HexColor("#94a3b8")),
                ("LINEBELOW", (0, 0), (-1, 0), 0.65, colors.HexColor("#cbd5e1")),
            ]
        )
    )
    return t


def build_money_receipt_pdf(booking: LandBooking) -> bytes:
    body_font = _register_font()
    buf = io.BytesIO()
    page_w, page_h = A4
    margin_l = 16 * mm
    margin_r = 16 * mm
    margin_t = 12 * mm
    margin_b = 14 * mm
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=margin_l,
        rightMargin=margin_r,
        topMargin=margin_t,
        bottomMargin=margin_b,
        title=f"Money Receipt — Booking {booking.id}",
    )

    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="HdrCompany",
            fontName=body_font,
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#0b1f44"),
            alignment=TA_LEFT,
            spaceAfter=2,
        )
    )
    styles.add(
        ParagraphStyle(
            name="HdrMain",
            fontName=body_font,
            fontSize=15,
            leading=18,
            textColor=colors.HexColor("#0b1f44"),
            alignment=TA_LEFT,
            spaceAfter=2,
        )
    )
    styles.add(
        ParagraphStyle(
            name="HdrSub",
            fontName=body_font,
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor("#64748b"),
            alignment=TA_LEFT,
            spaceAfter=0,
        )
    )
    styles.add(
        ParagraphStyle(
            name="HdrRef",
            fontName=body_font,
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#475569"),
            alignment=TA_LEFT,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Body",
            fontName=body_font,
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#1e293b"),
            alignment=TA_LEFT,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Label",
            fontName=body_font,
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#64748b"),
            alignment=TA_LEFT,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ReceiptFooter",
            fontName=body_font,
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#64748b"),
            alignment=TA_CENTER,
        )
    )

    inner_w = page_w - margin_l - margin_r
    created = timezone.localtime(booking.created_at) if booking.created_at else timezone.now()
    date_str = created.strftime("%d-%m-%Y")
    ref = f"ES-BOOK-{booking.id:06d}"

    form_id = _ad(booking, "form_id_no") or "—"
    file_no = _ad(booking, "form_file_no") or "—"
    sl_no = str(booking.id)

    received = (booking.full_name or "").strip() or _ad(booking, "applicant_full_name_en") or "—"
    addr_parts = [
        _ad(booking, "mailing_present_address_en"),
        _ad(booking, "permanent_address_en"),
    ]
    address = " · ".join(a.strip() for a in addr_parts if a and str(a).strip()) or "—"

    proj = _ad(booking, "plot_detail_project_name") or (booking.property.title if booking.property_id else "—")
    ptype = _ad(booking, "plot_detail_property_type") or "—"
    loc_addr = _ad(booking, "plot_detail_location_address") or "—"
    mode = _ad(booking, "applicant_ownership_mode")
    ind_joint = "Joint" if mode == "joint" else "Individual"
    joint_note = ""
    if mode == "joint":
        d = booking.application_data if isinstance(booking.application_data, dict) else {}
        ja = d.get("joint_applicants") or []
        names = []
        if isinstance(ja, list):
            for row in ja:
                if isinstance(row, dict):
                    n = (row.get("name_en") or "").strip()
                    if n:
                        names.append(n)
        joint_note = ", ".join(names) if names else ""

    plot_no = _ad(booking, "selected_plot_no") or (booking.selected_plot_code or "—")
    plot_size = _ad(booking, "plot_size_katha") or "—"
    unit_l = _ad(booking, "plot_unit_label") or "—"
    road_no = _ad(booking, "plot_road_no") or "—"
    road_sz = _ad(booking, "plot_road_size") or "—"
    sector = _ad(booking, "plot_sector_or_block") or "—"
    pcat = _ad(booking, "plot_category") or "—"
    ppos = _ad(booking, "plot_position") or "—"
    pface = _ad(booking, "plot_facing") or "—"

    plot_sqft = ""
    if booking.selected_plot_area_sqft is not None:
        plot_sqft = f"{booking.selected_plot_area_sqft} sq ft"

    ou = {}
    if isinstance(booking.application_data, dict):
        raw_ou = booking.application_data.get("official_use")
        if isinstance(raw_ou, dict):
            ou = raw_ou

    def ou_bool(k: str) -> bool:
        v = ou.get(k)
        return v is True

    def ou_str(k: str, default: str = "") -> str:
        v = ou.get(k)
        if v is None:
            return default
        return str(v).strip() or default

    note_tail = _ad(booking, "instruction_if_any") or ""

    def kv(label: str, value: str | int | float):
        return [
            Paragraph(f"<b>{escape(label)}</b>", styles["Label"]),
            Paragraph(escape(str(value)), styles["Body"]),
        ]

    story: list = []

    logo_path = _resolve_logo_path()
    logo_canvas: tuple[str, float, float] | None = None
    logo_w_mm = 28.0
    if logo_path:
        logo_canvas = _logo_to_temp_png(logo_path, max_w_mm=logo_w_mm, max_h_mm=24)

    title_rows = [
        [Paragraph("<b>EUROSTAR GROUP</b>", styles["HdrCompany"])],
        [Paragraph("<b>Money Receipt</b>", styles["HdrMain"])],
        [Paragraph("Plot booking · Application confirmation", styles["HdrSub"])],
        [
            Paragraph(
                f"Reference <b>{escape(ref)}</b> &nbsp;·&nbsp; Booking ID <b>{booking.id}</b> &nbsp;·&nbsp; <b>{escape(date_str)}</b>",
                styles["HdrRef"],
            )
        ],
    ]
    # Bordered shell for the header block only (logo + titles live inside this box).
    shell_cmds_outer = [
        ("BOX", (0, 0), (-1, -1), 0.85, colors.HexColor("#0b1f44")),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]
    shell_cmds_text_only = shell_cmds_outer + [
        ("BOTTOMPADDING", (0, 2), (-1, 2), 6),
    ]

    if logo_canvas:
        _lpath, lw_draw, _lh_draw = logo_canvas
        logo_img = Image(_lpath, width=lw_draw, height=_lh_draw)
        gap_pt = 10
        logo_col_w = min(lw_draw + gap_pt, inner_w * 0.32)
        text_col_w = inner_w - logo_col_w
        if text_col_w < 120:
            logo_col_w = min(inner_w * 0.28, inner_w * 0.5)
            text_col_w = inner_w - logo_col_w
        text_tbl = Table(title_rows, colWidths=[text_col_w])
        text_tbl.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("BOTTOMPADDING", (0, 2), (-1, 2), 6),
                ]
            )
        )
        header_tbl = Table([[logo_img, text_tbl]], colWidths=[logo_col_w, text_col_w])
        header_tbl.setStyle(TableStyle(shell_cmds_outer))
    else:
        header_tbl = Table(title_rows, colWidths=[inner_w])
        header_tbl.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")] + shell_cmds_text_only))

    story.append(header_tbl)
    story.append(Spacer(1, 10))

    meta_inner = Table(
        [
            [
                Paragraph(f"<b>Owner ID No.</b><br/>{escape(form_id)}", styles["Body"]),
                Paragraph(f"<b>File No.</b><br/>{escape(file_no)}", styles["Body"]),
                Paragraph(f"<b>Sl. No.</b><br/>{escape(sl_no)}", styles["Body"]),
                Paragraph(f"<b>Date</b><br/>{escape(date_str)}", styles["Body"]),
            ]
        ],
        colWidths=[inner_w / 4.0] * 4,
    )
    meta_inner.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("INNERGRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(_boxed_section(inner_w, body_font, "Application reference", [meta_inner]))

    story.append(Spacer(1, 10))

    story.append(_boxed_section(inner_w, body_font, "Received from", [_p(received, styles["Body"])]))

    story.append(Spacer(1, 10))

    story.append(_boxed_section(inner_w, body_font, "Address", [_p(address, styles["Body"])]))

    story.append(Spacer(1, 10))

    ij_val = ind_joint + (f" — {joint_note}" if joint_note else "")
    plot_rows = [
        kv("Project Name", proj),
        kv("Property Type", ptype),
        kv("Address", loc_addr),
        kv("Individual / Joint", ij_val),
        kv("Plot No.", plot_no),
        kv("Plot Size (katha approx.)", plot_size),
        kv("Unit", unit_l),
        kv("Road No.", road_no),
        kv("Road Size", road_sz),
        kv("Sector / Block", sector),
        kv("Plot Category", pcat),
        kv("Plot Position", ppos),
        kv("Plot Facing", pface),
        kv("Area (from selection)", plot_sqft or "—"),
        kv("Plot price (BDT)", str(booking.selected_plot_price or "—")),
    ]
    plot_tbl = Table(plot_rows, colWidths=[inner_w * 0.34, inner_w * 0.66])
    plot_tbl.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), body_font),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#e2e8f0")),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ]
        )
    )
    story.append(_boxed_section(inner_w, body_font, "Selected plot detail", [plot_tbl]))

    story.append(Spacer(1, 10))

    pay_block = [
        Paragraph(
            (
                f"{_checkbox(ou_bool('payment_mode_at_once'))} At a Time &nbsp;&nbsp; "
                f"{_checkbox(ou_bool('payment_mode_installment'))} Installment"
            ),
            styles["Body"],
        ),
        Spacer(1, 6),
        Paragraph(
            (
                f"{_checkbox(ou_bool('payment_booking_money'))} Booking Money &nbsp;&nbsp; "
                f"{_checkbox(ou_bool('payment_down_payment'))} Down Payment &nbsp;&nbsp; "
                f"{_checkbox(ou_bool('payment_part_payment'))} Part Payment &nbsp;&nbsp; "
                f"{_checkbox(ou_bool('payment_full_payment'))} Full Payment "
                f"({escape(ou_str('payment_full_payment_percent'))} %)"
            ),
            styles["Body"],
        ),
        Spacer(1, 8),
        Paragraph(
            (
                f"<b>A/C Payee Cheque / Deposit Slip / Cash / DD / P.O.:</b> {escape(ou_str('instrument_type_note'))} &nbsp; "
                f"<b>No.:</b> {escape(ou_str('cash_cheque_po_dd_no'))} &nbsp; "
                f"<b>Date:</b> {escape(ou_str('cash_cheque_date'))}"
            ),
            styles["Body"],
        ),
    ]
    story.append(_boxed_section(inner_w, body_font, "Mode of payment detail", pay_block))

    story.append(Spacer(1, 10))

    taka_line = f"{ou_str('amount_taka')} on or before {ou_str('amount_on_or_before_date')}".strip()
    bank_rows = [
        kv("Account Name", ou_str("account_name")),
        kv("Bank Name", ou_str("bank_name")),
        kv("Branch Name", ou_str("branch_name")),
        kv("Routing No.", ou_str("routing_no")),
        kv("SWIFT Code", ou_str("swift_code")),
        kv("Taka (on or before)", taka_line if taka_line != "on or before" else "—"),
        kv("In word", ou_str("amount_in_words")),
        kv("Installment options #", ou_str("num_installment_options")),
        kv("Per installment (Taka)", ou_str("per_installment_taka")),
        kv("Installment start from", ou_str("installment_start_from")),
    ]
    bank_tbl = Table(bank_rows, colWidths=[inner_w * 0.34, inner_w * 0.66])
    bank_tbl.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), body_font),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#e2e8f0")),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(_boxed_section(inner_w, body_font, "Bank / amount detail", [bank_tbl]))

    story.append(Spacer(1, 10))

    story.append(_boxed_section(inner_w, body_font, "Note", [_p(note_tail or "—", styles["Body"])]))

    story.append(Spacer(1, 14))

    foot_tbl = Table(
        [
            [
                Paragraph(
                    '<font size="10" color="#0b1f44"><b>Eurostar Group</b></font><br/>'
                    '<font size="8" color="#64748b">Since 2000 · Corporate Office</font>',
                    styles["ReceiptFooter"],
                )
            ],
            [
                Paragraph(
                    "+8801312345003 · biz@eurostar.land · https://www.eurostar.land",
                    styles["ReceiptFooter"],
                )
            ],
            [
                Paragraph(
                    "701, Floor # 6th (Lift # 6), SKS Shopping Complex,<br/>"
                    "Baridhara DOHS, Dhaka 1206, Bangladesh.",
                    styles["ReceiptFooter"],
                )
            ],
            [
                Paragraph(
                    f'<font size="7" color="#94a3b8">Generated electronically upon booking submission. Reference {escape(ref)}.</font>',
                    styles["ReceiptFooter"],
                )
            ],
        ],
        colWidths=[inner_w],
    )
    foot_tbl.setStyle(
        TableStyle(
            [
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LINEABOVE", (0, 0), (-1, 0), 0.75, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, 0), 12),
            ]
        )
    )
    story.append(foot_tbl)

    def _draw_page_num(canvas, doc_):
        canvas.saveState()
        canvas.setFont(body_font, 8)
        canvas.setFillColor(colors.HexColor("#94a3b8"))
        canvas.drawRightString(page_w - margin_r, margin_b - 2 * mm, f"Page {canvas.getPageNumber()}")
        canvas.restoreState()

    def _on_first_page(canvas, doc_):
        """Logo is embedded in flow (header table); only draw footer page number here."""
        _draw_page_num(canvas, doc_)

    doc.build(story, onFirstPage=_on_first_page, onLaterPages=_draw_page_num)
    _unlink_safe(logo_canvas[0] if logo_canvas else None)
    pdf = buf.getvalue()
    buf.close()
    return pdf
