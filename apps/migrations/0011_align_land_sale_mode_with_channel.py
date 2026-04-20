from django.db import migrations


def align_land_sale_modes(apps, schema_editor):
    Property = apps.get_model("apps", "Property")
    Property.objects.filter(property_channel="direct_buy").update(land_sale_mode="whole_land")
    Property.objects.filter(property_channel="installment", land_sale_mode="whole_land").update(
        land_sale_mode="per_block"
    )


class Migration(migrations.Migration):
    dependencies = [
        ("apps", "0010_property_managed_by"),
    ]

    operations = [
        migrations.RunPython(align_land_sale_modes, migrations.RunPython.noop),
    ]
