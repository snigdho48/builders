from django.db import models

from .users import TimeStampedModel


class SiteSettings(TimeStampedModel):
    """
    Singleton-style platform config (use one row; admin restricts adding more).
    """

    plot_buy_installment_promo_enabled = models.BooleanField(
        default=True,
        help_text=(
            "When off, 1% and 50% plot-buy plans are hidden and treated as unavailable site-wide "
            "(hero promos, booking flow, slot counter). Independent of slot limit."
        ),
    )
    plot_buy_installment_slot_limit = models.PositiveIntegerField(
        default=100,
        help_text=(
            "1% and 50% installment plans apply only to buy-plot (plot buy) listings. "
            "Counts pending + accepted plot-buy bookings using those plans; set to 0 to allow none."
        ),
    )

    class Meta:
        verbose_name = "Site settings"
        verbose_name_plural = "Site settings"

    def __str__(self) -> str:
        return "Site settings"
