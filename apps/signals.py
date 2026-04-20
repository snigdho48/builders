from uuid import uuid4

from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import UserProfile

User = get_user_model()


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if not created:
        return

    referral_code = f"REF{uuid4().hex[:8].upper()}"
    UserProfile.objects.create(user=instance, referral_code=referral_code)
