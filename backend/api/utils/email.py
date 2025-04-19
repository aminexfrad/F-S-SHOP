from django.core.mail import send_mail

def send_notification_email(subject, message, recipient_email):
    send_mail(
        subject,
        message,
        None,  # Uses DEFAULT_FROM_EMAIL from settings
        [recipient_email],
        fail_silently=False,
    )
