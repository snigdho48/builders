from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .view import (
    AgentViewSet,
    BookingPromoSettingsView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    DashboardView,
    InvestorViewSet,
    InstallmentLedgerViewSet,
    LandBookingViewSet,
    LandShareListingViewSet,
    MeKycRequestView,
    MeView,
    P2PBidViewSet,
    P2PListingViewSet,
    PlotViewSet,
    PropertyViewSet,
    RegisterView,
)
from .view.password import ForgotPasswordRequestView, PasswordResetConfirmView

router = DefaultRouter()
router.register("properties", PropertyViewSet, basename="property")
router.register("land-share-listings", LandShareListingViewSet, basename="land-share-listing")
router.register("land-bookings", LandBookingViewSet, basename="land-booking")
router.register("installments", InstallmentLedgerViewSet, basename="installment")
router.register("p2p-listings", P2PListingViewSet, basename="p2p-listing")
router.register("p2p-bids", P2PBidViewSet, basename="p2p-bid")
router.register("plots", PlotViewSet, basename="plot")
router.register("investors", InvestorViewSet, basename="investor")
router.register("agents", AgentViewSet, basename="agent")

urlpatterns = [
    path("booking-promo-settings/", BookingPromoSettingsView.as_view(), name="booking-promo-settings"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/password/forgot/", ForgotPasswordRequestView.as_view(), name="password-forgot"),
    path("auth/password/reset/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/me/kyc-request/", MeKycRequestView.as_view(), name="me-kyc-request"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("", include(router.urls)),
]
