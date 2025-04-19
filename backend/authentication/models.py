from django.contrib.auth.models import AbstractUser
from django.db import models
from chowkidar.models import AbstractRefreshToken
from datetime import timedelta
from django.utils import timezone
from django.conf import settings

def default_expiry():
    return timezone.now() + timedelta(days=7) 

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    refresh_token_value = models.CharField(max_length=255, blank=True, null=True, unique=True)

    def __str__(self):
        return self.username

class RefreshToken(AbstractRefreshToken, models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,  # Link to CustomUser
        related_name='refresh_token',
        on_delete=models.CASCADE
    )