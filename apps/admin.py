from django.contrib import admin

from apps.constants import ROLE_AGENT
from .models import InstallmentLedger, LandBooking, LandBookingAttachment, LandShareListing, Property, SiteSettings, UserProfile


class LandBookingAttachmentInline(admin.TabularInline):
    model = LandBookingAttachment
    extra = 0
    readonly_fields = ("kind", "created_at")
    fields = ("kind", "file", "created_at")


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "kyc_status", "phone", "referral_code", "referral_commission_percent")
    list_filter = ("role", "kyc_status")
    search_fields = ("user__username", "user__email", "phone", "referral_code")


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ("id", "plot_buy_installment_promo_enabled", "plot_buy_installment_slot_limit", "updated_at")

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("title", "sale_type", "status", "assigned_agent", "land_price", "listing_active")
    list_filter = ("sale_type", "status", "listing_active")
    search_fields = ("title", "slug", "location_name")
    autocomplete_fields = ("assigned_agent",)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "assigned_agent":
            kwargs["queryset"] = db_field.related_model.objects.filter(profile__role=ROLE_AGENT)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(LandShareListing)
class LandShareListingAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "assigned_agent", "land_price", "listing_active")
    list_filter = ("status", "listing_active")
    search_fields = ("title", "slug", "location_name")
    autocomplete_fields = ("assigned_agent",)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "assigned_agent":
            kwargs["queryset"] = db_field.related_model.objects.filter(profile__role=ROLE_AGENT)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(LandBooking)
class LandBookingAdmin(admin.ModelAdmin):
    list_display = ("id", "property", "land_share_listing", "investor", "booking_kind", "plan_type", "status", "created_at")
    list_filter = ("status", "plan_type", "booking_kind")
    search_fields = ("full_name", "email", "phone", "investor__username")
    raw_id_fields = ("property", "land_share_listing", "investor", "reviewed_by")
    inlines = [LandBookingAttachmentInline]


@admin.register(InstallmentLedger)
class InstallmentLedgerAdmin(admin.ModelAdmin):
    list_display = ("id", "booking", "investor", "installment_no", "due_date", "amount_due", "status")
    list_filter = ("status", "due_date")
    search_fields = ("booking__id", "investor__username", "booking__property__title")
