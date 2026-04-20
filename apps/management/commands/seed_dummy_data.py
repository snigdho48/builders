"""Seed rich demo data for maps, bookings, installments, KYC, and P2P."""

from datetime import date, timedelta
from decimal import Decimal
import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify
from django.utils import timezone

from apps.models import (
    InstallmentLedger,
    LandBooking,
    LandShareListing,
    P2PBid,
    P2PListing,
    Plot,
    Property,
    SiteSettings,
    UserProfile,
)
from apps.serializers.land_bookings import (
    _stamp_application_reference_numbers,
    apply_accept,
    apply_reject,
)

User = get_user_model()

# Dummy login accounts (seed / local demo only).
DEMO_PASSWORD = "azsx1234"


def _demo_plot_application_data(
    *,
    full_name: str,
    email: str,
    phone: str,
    booking_money: bool = True,
) -> dict:
    """Structured answers for Money Receipt PDF + booking confirmation emails."""
    return {
        "applicant_full_name_en": full_name,
        "contact_email": email,
        "contact_mobile_phone": phone,
        "plot_category": "Residential land",
        "plot_position": "Corner",
        "plot_facing": "East",
        "instruction_if_any": "Seeded demo application — substitute real client data in production.",
        "official_use": {
            "payment_booking_money": booking_money,
            "payment_down_payment": False,
            "payment_part_payment": False,
            "payment_full_payment": False,
            "payment_full_payment_percent": "",
            "payment_mode_at_once": False,
            "payment_mode_installment": True,
        },
    }
LAND_IMAGE_POOL = [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
]


class Command(BaseCommand):
    help = "Create demo users, properties, land-share listings, plot polygons, bookings/installments, KYC, and P2P data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete generated demo data and non-superuser users (keeps superusers).",
        )
        parser.add_argument(
            "--seed",
            type=int,
            default=42,
            help="Random seed for deterministic demo values.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        rng = random.Random(options["seed"])
        if options["reset"]:
            SiteSettings.objects.all().delete()
            P2PBid.objects.all().delete()
            P2PListing.objects.all().delete()
            InstallmentLedger.objects.all().delete()
            LandBooking.objects.all().delete()
            LandShareListing.objects.all().delete()
            Plot.objects.all().delete()
            Property.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(
                self.style.WARNING(
                    "Cleared site settings, demo properties, land-share listings, plots, bookings, installments, "
                    "p2p, and users."
                )
            )

        admin_user, admin_created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@example.com",
                "first_name": "Admin",
                "is_superuser": True,
                "is_staff": True,
            },
        )
        admin_user.set_password(DEMO_PASSWORD)
        admin_user.is_superuser = True
        admin_user.is_staff = True
        if not admin_user.email:
            admin_user.email = "admin@example.com"
        admin_user.save()
        admin_user.profile.role = UserProfile.UserRole.ADMIN
        admin_user.profile.phone = "01700000001"
        admin_user.profile.save(update_fields=["role", "phone", "updated_at"])
        if admin_created:
            self.stdout.write(self.style.SUCCESS(f"Created superuser admin / {DEMO_PASSWORD}"))

        def ensure_user(username: str, email: str, role: str, phone: str = "") -> User:
            u, _created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": username[:150].title(),
                },
            )
            u.set_password(DEMO_PASSWORD)
            u.email = email
            u.save()
            prof = u.profile
            prof.role = role
            prof.phone = phone
            prof.save(update_fields=["role", "phone", "updated_at"])
            return u

        agent1 = ensure_user("agent", "agent@example.com", UserProfile.UserRole.AGENT, "01700000010")
        agent2 = ensure_user("agent2", "agent2@example.com", UserProfile.UserRole.AGENT, "01700000011")

        investors = [
            ensure_user("investor", "atiquzzamansnigdho@gmail.com", UserProfile.UserRole.INVESTOR, "01710000001"),
            ensure_user("investor2", "investor2@example.com", UserProfile.UserRole.INVESTOR, "01710000002"),
            ensure_user("investor3", "investor3@example.com", UserProfile.UserRole.INVESTOR, "01710000003"),
            ensure_user("investor4", "investor4@example.com", UserProfile.UserRole.INVESTOR, "01710000004"),
            ensure_user("investor5", "investor5@example.com", UserProfile.UserRole.INVESTOR, "01710000005"),
        ]

        # KYC diversity for testing.
        for idx, inv in enumerate(investors):
            prof = inv.profile
            if idx == 0:
                prof.kyc_status = UserProfile.KycStatus.APPROVED
                prof.kyc_notes = "Verified with NID and utility bill."
                prof.kyc_verified_at = timezone.now() - timedelta(days=20)
                prof.kyc_verified_by = admin_user
            elif idx == 1:
                prof.kyc_status = UserProfile.KycStatus.PENDING
                prof.kyc_investor_notes = "I uploaded all required docs."
                prof.kyc_requested_at = timezone.now() - timedelta(days=1)
            elif idx == 2:
                prof.kyc_status = UserProfile.KycStatus.REJECTED
                prof.kyc_notes = "Document mismatch; please re-submit."
                prof.kyc_verified_at = timezone.now() - timedelta(days=5)
                prof.kyc_verified_by = admin_user
            elif idx == 4:
                prof.kyc_status = UserProfile.KycStatus.APPROVED
                prof.kyc_notes = "Secondary approved profile for multi-account demos."
                prof.kyc_verified_at = timezone.now() - timedelta(days=3)
                prof.kyc_verified_by = admin_user
            else:
                prof.kyc_status = UserProfile.KycStatus.PENDING
                prof.kyc_requested_at = timezone.now() - timedelta(days=2)
                prof.kyc_investor_notes = "Need quick verification for active booking."
            prof.save()

        # At least 10 land-buy + 10 installment listings for maps, filters, and booking demos.
        _lb = Property.SaleType.LAND_BUY
        _ins = Property.SaleType.INSTALLMENT
        lands = [
            # --- Land buy (10) ---
            {
                "title": "Eurostar Riverside Reserve — Bashundhara fringe",
                "sale_type": _lb,
                "land_price": Decimal("18500000.00"),
                "installment_years": None,
                "location": "Bashundhara / Vatara corridor",
                "lat": Decimal("23.822100"),
                "lng": Decimal("90.458200"),
                "agent": agent1,
            },
            {
                "title": "Eurostar Gulshan Annex — gated land parcel",
                "sale_type": _lb,
                "land_price": Decimal("42600000.00"),
                "installment_years": None,
                "location": "Dhaka north (Gulshan-linked growth belt)",
                "lat": Decimal("23.794500"),
                "lng": Decimal("90.413800"),
                "agent": agent1,
            },
            {
                "title": "Eurostar Nikunja Lakefront — corner plot belt",
                "sale_type": _lb,
                "land_price": Decimal("16200000.00"),
                "installment_years": None,
                "location": "Nikunja DOHS",
                "lat": Decimal("23.834200"),
                "lng": Decimal("90.419500"),
                "agent": agent2,
            },
            {
                "title": "Eurostar Uttara Sector 18 — airport-link parcel",
                "sale_type": _lb,
                "land_price": Decimal("19800000.00"),
                "installment_years": None,
                "location": "Uttara Sector 18",
                "lat": Decimal("23.879800"),
                "lng": Decimal("90.389500"),
                "agent": agent1,
            },
            {
                "title": "Eurostar Banani Extension — premium land strip",
                "sale_type": _lb,
                "land_price": Decimal("35500000.00"),
                "installment_years": None,
                "location": "Banani / Gulshan link road",
                "lat": Decimal("23.798200"),
                "lng": Decimal("90.406800"),
                "agent": agent2,
            },
            {
                "title": "Eurostar Mohakhali DOHS — boulevard-facing land",
                "sale_type": _lb,
                "land_price": Decimal("28900000.00"),
                "installment_years": None,
                "location": "Mohakhali DOHS",
                "lat": Decimal("23.780500"),
                "lng": Decimal("90.400200"),
                "agent": agent1,
            },
            {
                "title": "Eurostar Hatirjheel Ring — urban renewal parcel",
                "sale_type": _lb,
                "land_price": Decimal("21400000.00"),
                "installment_years": None,
                "location": "Hatirjheel / Rampura belt",
                "lat": Decimal("23.769800"),
                "lng": Decimal("90.423100"),
                "agent": agent2,
            },
            {
                "title": "Eurostar Mirpur embankment — residential land",
                "sale_type": _lb,
                "land_price": Decimal("12800000.00"),
                "installment_years": None,
                "location": "Mirpur DOHS embankment",
                "lat": Decimal("23.806500"),
                "lng": Decimal("90.368400"),
                "agent": agent1,
            },
            {
                "title": "Eurostar Savar EPZ Link — growth corridor land",
                "sale_type": _lb,
                "land_price": Decimal("9850000.00"),
                "installment_years": None,
                "location": "Savar — Ashulia road",
                "lat": Decimal("23.899500"),
                "lng": Decimal("90.255000"),
                "agent": agent2,
            },
            {
                "title": "Eurostar Keraniganj Bridgehead — river-view parcel",
                "sale_type": _lb,
                "land_price": Decimal("11200000.00"),
                "installment_years": None,
                "location": "Keraniganj — Padma bridge approach",
                "lat": Decimal("23.682000"),
                "lng": Decimal("90.421000"),
                "agent": agent1,
            },
            # --- Installment whole-land (10) ---
            {
                "title": "Eurostar Highland Pasture — 12 acre installment block",
                "sale_type": _ins,
                "land_price": Decimal("52800000.00"),
                "installment_years": 10,
                "location": "Sylhet foothills corridor",
                "lat": Decimal("24.894900"),
                "lng": Decimal("91.868700"),
                "agent": agent1,
                "land_area_sqft": 522720,
            },
            {
                "title": "Eurostar Coastal Edge — Cox's Bazar corridor",
                "sale_type": _ins,
                "land_price": Decimal("25900000.00"),
                "installment_years": 7,
                "location": "Cox's Bazar growth corridor",
                "lat": Decimal("21.427200"),
                "lng": Decimal("92.005800"),
                "agent": agent2,
            },
            {
                "title": "Eurostar NSR Block — Purbachal expressway access",
                "sale_type": _ins,
                "land_price": Decimal("31200000.00"),
                "installment_years": 8,
                "location": "Purbachal New Town",
                "lat": Decimal("23.882000"),
                "lng": Decimal("90.642000"),
                "agent": agent2,
            },
            {
                "title": "Eurostar Chattogram Hill View — phased installment land",
                "sale_type": _ins,
                "land_price": Decimal("44500000.00"),
                "installment_years": 12,
                "location": "Chattogram Khulshi hills",
                "lat": Decimal("22.335000"),
                "lng": Decimal("91.834000"),
                "agent": agent1,
            },
            {
                "title": "Eurostar Rajshahi Silk Route — agricultural-residential mix",
                "sale_type": _ins,
                "land_price": Decimal("18600000.00"),
                "installment_years": 6,
                "location": "Rajshahi Nowhata bypass",
                "lat": Decimal("24.363600"),
                "lng": Decimal("88.551100"),
                "agent": agent2,
            },
            {
                "title": "Eurostar Khulna Riverfront — installment waterfront block",
                "sale_type": _ins,
                "land_price": Decimal("22300000.00"),
                "installment_years": 9,
                "location": "Khulna Khan Jahan Ali road",
                "lat": Decimal("22.845600"),
                "lng": Decimal("89.540300"),
                "agent": agent1,
            },
            {
                "title": "Eurostar Jessore Highway — BTMC belt land",
                "sale_type": _ins,
                "land_price": Decimal("17400000.00"),
                "installment_years": 5,
                "location": "Jessore Benapole highway",
                "lat": Decimal("23.166700"),
                "lng": Decimal("89.208600"),
                "agent": agent2,
            },
            {
                "title": "Eurostar Mymensingh Growth — trunk road parcel",
                "sale_type": _ins,
                "land_price": Decimal("15100000.00"),
                "installment_years": 8,
                "location": "Mymensingh bypass",
                "lat": Decimal("24.747100"),
                "lng": Decimal("90.420300"),
                "agent": agent1,
            },
            {
                "title": "Eurostar Bogura Ring — northern agricultural hub",
                "sale_type": _ins,
                "land_price": Decimal("13900000.00"),
                "installment_years": 7,
                "location": "Bogura Sherpur road",
                "lat": Decimal("24.846500"),
                "lng": Decimal("89.377100"),
                "agent": agent2,
            },
            {
                "title": "Eurostar Narayanganj Port — industrial-residential edge",
                "sale_type": _ins,
                "land_price": Decimal("26800000.00"),
                "installment_years": 10,
                "location": "Narayanganj Adamjee EPZ belt",
                "lat": Decimal("23.623400"),
                "lng": Decimal("90.499800"),
                "agent": agent1,
            },
        ]

        created_props: list[Property] = []
        for spec in lands:
            _img_i = len(created_props)
            _hero = LAND_IMAGE_POOL[_img_i % len(LAND_IMAGE_POOL)]
            _g1 = LAND_IMAGE_POOL[(_img_i + 1) % len(LAND_IMAGE_POOL)]
            _g2 = LAND_IMAGE_POOL[(_img_i + 2) % len(LAND_IMAGE_POOL)]
            slug_base = slugify(spec["title"])[:180]
            slug = slug_base
            n = 0
            while Property.objects.filter(slug=slug).exists():
                n += 1
                slug = f"{slug_base}-{n}"
            prop = Property.objects.create(
                title=spec["title"],
                slug=slug,
                description=(
                    f"<p><strong>Eurostar Group</strong> demo listing — {spec['title']}. "
                    "Illustrative parcel for maps, plot grid, and booking flows.</p>"
                ),
                description_secondary=(
                    "<p>Road access, survey references, and mutation support available through Eurostar legal desk.</p>"
                ),
                property_type=Property.PropertyKind.LAND,
                sale_type=spec["sale_type"],
                land_price=spec["land_price"],
                installment_years=spec["installment_years"],
                location_name=spec["location"],
                latitude=spec["lat"],
                longitude=spec["lng"],
                land_area_sqft=spec.get("land_area_sqft")
                or (522720 if "12 acre" in spec["title"].lower() else 174240),
                assigned_agent=spec["agent"],
                top_view_image=_hero,
                gallery_images=[_g1, _g2],
                tags=["land", "demo"],
                amenities=[
                    "Road access",
                    "Electricity nearby",
                    "Survey / documents on request",
                ],
                floor_plans=[
                    {
                        "title": "Site outline",
                        "image_url": LAND_IMAGE_POOL[(_img_i + 3) % len(LAND_IMAGE_POOL)],
                        "description": "Illustrative boundary for demo purposes.",
                    },
                ],
                rating_average="4.7",
                review_count=28,
                review_sample_author="NRB investor — demo",
                review_sample_date=date(2026, 2, 10),
                review_sample_text="Eurostar kept everything transparent from plot selection through booking documents.",
                status=Property.PropertyStatus.AVAILABLE,
                listing_active=True,
            )
            created_props.append(prop)

        land_share_specs = [
            {
                "title": "Eurostar Land Share — Purbachal entry tiers",
                "location": "Purbachal New Town",
                "lat": Decimal("23.875000"),
                "lng": Decimal("90.630000"),
                "agent": agent1,
                "land_price": Decimal("8950000.00"),
                "land_area_sqft": 15600,
                "payment_options": [
                    {"amount": "25000.00", "billing_period": "monthly"},
                    {"amount": "55000.00", "billing_period": "monthly"},
                    {"amount": "105000.00", "billing_period": "monthly"},
                ],
            },
            {
                "title": "Eurostar Land Share — Bashundhara growth pool",
                "location": "Bashundhara R/A",
                "lat": Decimal("23.815000"),
                "lng": Decimal("90.425000"),
                "agent": agent2,
                "land_price": Decimal("16800000.00"),
                "land_area_sqft": 22800,
                "payment_options": [
                    {"amount": "30000.00", "billing_period": "monthly"},
                    {"amount": "60000.00", "billing_period": "monthly"},
                    {"amount": "95000.00", "billing_period": "monthly"},
                ],
            },
            {
                "title": "Eurostar Land Share — Uttara lakeside fractional",
                "location": "Uttara Sector 18",
                "lat": Decimal("23.879500"),
                "lng": Decimal("90.389000"),
                "agent": agent2,
                "land_price": Decimal("12100000.00"),
                "land_area_sqft": 13200,
                "payment_options": [
                    {"amount": "15000.00", "billing_period": "monthly"},
                    {"amount": "40000.00", "billing_period": "monthly"},
                    {"amount": "75000.00", "billing_period": "yearly"},
                ],
            },
        ]
        created_land_shares: list[LandShareListing] = []
        for li, spec in enumerate(land_share_specs):
            slug_base = slugify(spec["title"])[:180]
            slug = slug_base
            n = 0
            while LandShareListing.objects.filter(slug=slug).exists():
                n += 1
                slug = f"{slug_base}-{n}"
            ls = LandShareListing.objects.create(
                title=spec["title"],
                slug=slug,
                description=(
                    f"<p><strong>Eurostar fractional land</strong> — {spec['title']}. "
                    "Tiered contributions for investor dashboard and installment ledger demos.</p>"
                ),
                description_secondary="<p>Governance & tier rules are illustrative; swap with production copy before go-live.</p>",
                property_type=LandShareListing.PropertyKind.LAND,
                land_price=spec["land_price"],
                payment_options=spec["payment_options"],
                location_name=spec["location"],
                latitude=spec["lat"],
                longitude=spec["lng"],
                land_area_sqft=spec["land_area_sqft"],
                top_view_image=LAND_IMAGE_POOL[li % len(LAND_IMAGE_POOL)],
                gallery_images=[LAND_IMAGE_POOL[li % len(LAND_IMAGE_POOL)], LAND_IMAGE_POOL[(li + 1) % len(LAND_IMAGE_POOL)]],
                tags=["land-share", "demo"],
                amenities=["Tiered payments", "Staff-assigned agent", "Reference pricing"],
                assigned_agent=spec["agent"],
                status=LandShareListing.ListingStatus.AVAILABLE,
                listing_active=True,
            )
            created_land_shares.append(ls)

        # Create fixed predefined plots with polygon rings around each property center.
        def make_plot_ring(center_lat: float, center_lng: float, r: int, c: int):
            width = 0.00030
            height = 0.00024
            x_gap = 0.00005
            y_gap = 0.00005
            start_lng = center_lng - (2 * width + 1.5 * x_gap)
            start_lat = center_lat + (1.5 * height + y_gap)
            x0 = start_lng + c * (width + x_gap)
            y0 = start_lat - r * (height + y_gap)
            return [
                [round(x0, 7), round(y0, 7)],
                [round(x0 + width, 7), round(y0, 7)],
                [round(x0 + width, 7), round(y0 - height, 7)],
                [round(x0, 7), round(y0 - height, 7)],
                [round(x0, 7), round(y0, 7)],
            ]

        all_plots: list[Plot] = []
        for prop in created_props:
            base_area = prop.land_area_sqft or 1200
            base_price = Decimal(str(prop.land_price or "1000000"))
            center_lat = float(prop.latitude or Decimal("23.810300"))
            center_lng = float(prop.longitude or Decimal("90.412500"))
            idx_num = 1
            for r in range(3):
                for c in range(4):
                    noise = rng.randint(-6, 6)
                    area = max(600, base_area // 12 + noise * 15)
                    price = (base_price / Decimal("12")) * (Decimal(area) / Decimal(max(base_area // 12, 1)))
                    status = Plot.PlotStatus.AVAILABLE
                    if idx_num % 8 == 0:
                        status = Plot.PlotStatus.SOLD
                    elif idx_num % 6 == 0:
                        status = Plot.PlotStatus.BOOKED
                    plot = Plot.objects.create(
                        property=prop,
                        plot_id=f"P-{idx_num:02d}",
                        area_sqft=area,
                        price=price.quantize(Decimal("0.01")),
                        status=status,
                        coordinates=make_plot_ring(center_lat, center_lng, r, c),
                    )
                    all_plots.append(plot)
                    idx_num += 1

        # Ensure enough available plots for booking flow demo.
        Plot.objects.filter(status=Plot.PlotStatus.BOOKED).update(status=Plot.PlotStatus.AVAILABLE)

        # Create mixed booking statuses and corresponding installment ledgers.
        created_bookings = 0
        accepted_count = 0
        rejected_count = 0
        pending_count = 0
        accepted_per_property: dict[int, int] = {p.id: 0 for p in created_props}
        for inv in investors:
            for prop in created_props:
                available_plot = (
                    Plot.objects.filter(property=prop, status=Plot.PlotStatus.AVAILABLE).order_by("id").first()
                )
                if not available_plot:
                    continue
                display_name = inv.get_full_name().strip() or inv.username.title()
                booking = LandBooking.objects.create(
                    property=prop,
                    investor=inv,
                    booking_kind=LandBooking.BookingKind.PLOT_BUY,
                    plan_type=rng.choice(
                        [
                            LandBooking.PlanType.ONE_PERCENT_INSTALLMENT,
                            LandBooking.PlanType.FIFTY_PERCENT_INSTALLMENT,
                        ]
                    ),
                    full_name=display_name,
                    email=inv.email,
                    phone=inv.profile.phone or "01700000000",
                    contact_notes="Eurostar seed demo — dashboard & money-receipt testing.",
                    application_data=_demo_plot_application_data(
                        full_name=display_name,
                        email=inv.email,
                        phone=inv.profile.phone or "",
                    ),
                    selected_plot=available_plot,
                    selected_plot_code=available_plot.plot_id,
                    selected_plot_area_sqft=available_plot.area_sqft,
                    selected_plot_price=available_plot.price,
                    status=LandBooking.Status.PENDING,
                )
                _stamp_application_reference_numbers(booking)
                available_plot.status = Plot.PlotStatus.BOOKED
                available_plot.save(update_fields=["status", "updated_at"])
                created_bookings += 1

                mode_roll = rng.random()
                if mode_roll < 0.45:
                    # Keep at least one property publicly visible for browsing demos.
                    if accepted_per_property.get(prop.id, 0) == 0 and rng.random() < 0.65:
                        pending_count += 1
                    else:
                        apply_accept(booking, admin_user)
                        accepted_count += 1
                        accepted_per_property[prop.id] = accepted_per_property.get(prop.id, 0) + 1
                elif mode_roll < 0.70:
                    apply_reject(booking, admin_user, "Demo rejection: document mismatch.")
                    rejected_count += 1
                else:
                    pending_count += 1

        ls_created = 0
        ls_accepted = 0
        ls_rejected = 0
        ls_pending = 0
        for inv in investors:
            for ls in created_land_shares:
                opts = ls.payment_options or []
                if not opts:
                    continue
                tier = rng.choice(opts)
                try:
                    amount = Decimal(str(tier.get("amount", "0"))).quantize(Decimal("0.01"))
                except (ArithmeticError, TypeError, ValueError):
                    continue
                if amount <= 0:
                    continue
                billing = str(tier.get("billing_period") or "monthly").strip().lower()
                booking = LandBooking.objects.create(
                    property=None,
                    land_share_listing=ls,
                    investor=inv,
                    booking_kind=LandBooking.BookingKind.INVESTMENT,
                    plan_type=LandBooking.PlanType.INVESTMENT,
                    investment_option_amount=amount,
                    investment_option_billing_period=billing,
                    full_name=(inv.get_full_name().strip() or inv.username.title()),
                    email=inv.email,
                    phone=inv.profile.phone,
                    contact_notes="Demo land-share booking for dashboard testing.",
                    status=LandBooking.Status.PENDING,
                )
                ls_created += 1
                mode_roll = rng.random()
                if mode_roll < 0.5:
                    apply_accept(booking, admin_user)
                    ls_accepted += 1
                elif mode_roll < 0.72:
                    apply_reject(booking, admin_user, "Demo rejection: tier capacity sample.")
                    ls_rejected += 1
                else:
                    ls_pending += 1

        # Make installment rows more realistic for accepted bookings.
        for inst in InstallmentLedger.objects.select_related("booking").all():
            if inst.booking.status != LandBooking.Status.ACCEPTED:
                continue
            if inst.installment_no == 1:
                inst.status = InstallmentLedger.Status.PAID
                inst.amount_paid = inst.amount_due
                inst.paid_at = timezone.now() - timedelta(days=rng.randint(2, 25))
                inst.payment_reference = f"TXN-{rng.randint(100000, 999999)}"
            elif inst.installment_no % 5 == 0:
                inst.status = InstallmentLedger.Status.OVERDUE
                inst.amount_paid = Decimal("0.00")
                inst.reminder_note = "overdue_reminder_sent"
                inst.reminder_sent_at = timezone.now() - timedelta(days=rng.randint(1, 7))
                inst.due_date = date.today() - timedelta(days=rng.randint(8, 45))
            elif inst.installment_no % 3 == 0:
                inst.status = InstallmentLedger.Status.PARTIAL
                inst.amount_paid = (inst.amount_due * Decimal("0.40")).quantize(Decimal("0.01"))
                inst.reminder_note = "partial_paid_follow_up"
                inst.due_date = date.today() - timedelta(days=rng.randint(1, 12))
            else:
                inst.status = InstallmentLedger.Status.UNPAID
                inst.amount_paid = Decimal("0.00")
                inst.due_date = date.today() + timedelta(days=rng.randint(2, 60))
            inst.save()

        # Guarantee available properties exist for public listing pages.
        if not Property.objects.filter(status=Property.PropertyStatus.AVAILABLE, listing_active=True).exists():
            first_prop = Property.objects.order_by("id").first()
            if first_prop:
                first_prop.listing_active = True
                first_prop.status = Property.PropertyStatus.AVAILABLE
                first_prop.save(update_fields=["status", "listing_active", "updated_at"])

        # Singleton site settings (plot-buy promo + slot cap for installment plans).
        ss = SiteSettings.objects.first()
        if not ss:
            SiteSettings.objects.create(
                plot_buy_installment_promo_enabled=True,
                plot_buy_installment_slot_limit=200,
            )
        else:
            SiteSettings.objects.filter(pk=ss.pk).update(
                plot_buy_installment_promo_enabled=True,
                plot_buy_installment_slot_limit=200,
            )

        # P2P demo data (listings + incoming/sent bids across investors).
        p2p_locations = ["Bashundhara", "Purbachal", "Uttara", "Jolshiri", "Keraniganj", "Baridhara"]
        p2p_listings: list[P2PListing] = []
        for i in range(12):
            seller = investors[i % len(investors)]
            loc = p2p_locations[i % len(p2p_locations)]
            title = f"Eurostar P2P resale — plot {i + 1} ({loc})"
            slug_base = slugify(title)[:200]
            slug = f"{slug_base}-{i + 1}-{seller.id}"
            listing = P2PListing.objects.create(
                seller=seller,
                title=title,
                slug=slug,
                description=(
                    "<p>Peer resale listing seeded for marketplace inbox, maps, and bid status flows.</p>"
                ),
                location_name=loc,
                asking_price_hint=Decimal(str(rng.randint(22, 95))) * Decimal("100000"),
                land_area_sqft=rng.randint(950, 4200),
                latitude=Decimal("23.78") + Decimal(str(i % 7)) * Decimal("0.012"),
                longitude=Decimal("90.38") + Decimal(str(i % 5)) * Decimal("0.015"),
                contact_email=seller.email,
                contact_phone=(getattr(seller.profile, "phone", None) or "")[:40],
                features=["Corner access", "Seed demo", "Eurostar-style disclosure"],
                hero_image=LAND_IMAGE_POOL[i % len(LAND_IMAGE_POOL)],
                gallery_images=[
                    LAND_IMAGE_POOL[(i + 1) % len(LAND_IMAGE_POOL)],
                    LAND_IMAGE_POOL[(i + 2) % len(LAND_IMAGE_POOL)],
                ],
                status=rng.choice(
                    [P2PListing.Status.ACTIVE, P2PListing.Status.ACTIVE, P2PListing.Status.WITHDRAWN]
                ),
            )
            p2p_listings.append(listing)

        bid_count = 0
        for listing in p2p_listings:
            bidders = [x for x in investors if x.id != listing.seller_id]
            rng.shuffle(bidders)
            for b in bidders[: rng.randint(1, 3)]:
                status = rng.choice([P2PBid.Status.PENDING, P2PBid.Status.ACCEPTED, P2PBid.Status.DECLINED])
                P2PBid.objects.create(
                    listing=listing,
                    buyer=b,
                    bid_price=(listing.asking_price_hint or Decimal("1500000"))
                    * Decimal(str(rng.uniform(0.75, 1.05)))
                    .quantize(Decimal("0.01")),
                    message="Eurostar seed bid — exercise pending / accepted / declined states.",
                    status=status,
                )
                bid_count += 1

        self.stdout.write(self.style.SUCCESS("Seed complete."))
        self.stdout.write(f"  Dummy logins (password for all: {DEMO_PASSWORD}):")
        self.stdout.write(f"    admin / {DEMO_PASSWORD}")
        self.stdout.write(f"    agent / {DEMO_PASSWORD}")
        self.stdout.write(f"    agent2 / {DEMO_PASSWORD}")
        self.stdout.write(f"    investor, investor2, investor3, investor4, investor5 / {DEMO_PASSWORD}")
        self.stdout.write(
            "  Plot bookings include stamped Owner ID / File numbers + application_data for money-receipt PDFs."
        )
        ss_final = SiteSettings.objects.first()
        self.stdout.write(
            f"  Site settings: plot-buy installment promo on, slot cap "
            f"{ss_final.plot_buy_installment_slot_limit if ss_final else '—'}."
        )
        self.stdout.write(
            f"  Created: properties={len(created_props)}, land_share_listings={len(created_land_shares)}, "
            f"plots={Plot.objects.count()}, plot_bookings={created_bookings} "
            f"(accepted={accepted_count}, rejected={rejected_count}, pending={pending_count}), "
            f"land_share_bookings={ls_created} (accepted={ls_accepted}, rejected={ls_rejected}, pending={ls_pending}), "
            f"installments={InstallmentLedger.objects.count()}, p2p_listings={len(p2p_listings)}, p2p_bids={bid_count}"
        )
