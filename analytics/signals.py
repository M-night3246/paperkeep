from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from main.models import FinancialDocument 
from analytics.models import VisitedPlace

# Ensure old visited places are cleared if they are no longer referenced
@receiver(post_save, sender=FinancialDocument)
def cleanup_orphaned_place_on_update(sender, instance, **kwargs):
    for place in VisitedPlace.objects.filter(user=instance.user):
        if not place.documents.exists():
            place.delete()