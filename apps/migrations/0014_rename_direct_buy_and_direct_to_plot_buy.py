# Generated manually: rename property_channel and investment type values.

from django.db import migrations, models


def forwards_rename_values(apps, schema_editor):
    Property = apps.get_model("apps", "Property")
    Investment = apps.get_model("apps", "Investment")
    InvestmentCheckoutRequest = apps.get_model("apps", "InvestmentCheckoutRequest")
    Property.objects.filter(property_channel="direct_buy").update(property_channel="plot_buy")
    Investment.objects.filter(type="direct").update(type="plot_buy")
    InvestmentCheckoutRequest.objects.filter(investment_type="direct").update(investment_type="plot_buy")


def backwards_restore_values(apps, schema_editor):
    Property = apps.get_model("apps", "Property")
    Investment = apps.get_model("apps", "Investment")
    InvestmentCheckoutRequest = apps.get_model("apps", "InvestmentCheckoutRequest")
    Property.objects.filter(property_channel="plot_buy").update(property_channel="direct_buy")
    Investment.objects.filter(type="plot_buy").update(type="direct")
    InvestmentCheckoutRequest.objects.filter(investment_type="plot_buy").update(investment_type="direct")


class Migration(migrations.Migration):

    dependencies = [
        ("apps", "0013_kyctemplate_paymentlog_paymentrequest_and_more"),
    ]

    operations = [
        migrations.RunPython(forwards_rename_values, backwards_restore_values),
        migrations.AlterField(
            model_name="property",
            name="property_channel",
            field=models.CharField(
                choices=[("plot_buy", "Plot buy"), ("installment", "Installment")],
                default="plot_buy",
                help_text="Homepage lane: plot buy vs installment (independent of land_sale_mode).",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="investment",
            name="type",
            field=models.CharField(
                choices=[
                    ("plot_buy", "Plot buy"),
                    ("installment", "Installment"),
                    ("fractional", "Fractional (Legacy)"),
                ],
                max_length=20,
            ),
        ),
    ]
