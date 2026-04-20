from django.db import migrations


def forward_normalize_fractional(apps, schema_editor):
    Investment = apps.get_model("apps", "Investment")
    InvestmentCheckoutRequest = apps.get_model("apps", "InvestmentCheckoutRequest")

    Investment.objects.filter(type="fractional").update(type="installment")
    InvestmentCheckoutRequest.objects.filter(investment_type="fractional").update(
        investment_type="installment"
    )


def reverse_noop(apps, schema_editor):
    # Do not reintroduce deprecated legacy type.
    return


class Migration(migrations.Migration):
    dependencies = [
        ("apps", "0019_paymentrequest_investment"),
    ]

    operations = [
        migrations.RunPython(forward_normalize_fractional, reverse_noop),
    ]
