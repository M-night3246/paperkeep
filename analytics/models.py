from django.db import models
from django.contrib.auth.models import User

class VisitedPlace(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    last_visited = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'name', 'address')

    def __str__(self):
        return f"{self.name} @ {self.address}"