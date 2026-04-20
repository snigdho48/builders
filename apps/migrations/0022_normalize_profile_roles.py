from django.db import migrations


def forwards(apps, schema_editor):
    UserProfile = apps.get_model("apps", "UserProfile")
    UserProfile.objects.filter(role="representative").update(role="agent")
    UserProfile.objects.filter(role="superadmin").update(role="admin")


class Migration(migrations.Migration):
    dependencies = [
        ("apps", "0021_land_platform_reset"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
