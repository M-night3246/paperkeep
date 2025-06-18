from django.db import models
from django.contrib.auth.models import User
from django.db.models import Sum

class FinancialDocument(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="documents/")
    business_name = models.CharField(max_length=255, blank=True) # SSM states not longer than 50 characters
    business_address = models.TextField(blank=True)
    transaction_datetime = models.DateTimeField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    upload_datetime = models.DateTimeField(auto_now_add=True)
        
    def __str__(self):
        return f"{self.__class__.__name__} from {self.business_name} on {self.transaction_datetime}"
    
class LineItem(models.Model):
    financial_document = models.ForeignKey(FinancialDocument, related_name = "line_items", on_delete=models.CASCADE)
    item = models.CharField(max_length=255, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    category = models.ForeignKey(
        "UserSpendingCategory",
        on_delete=models.SET_NULL,
        null=True,
        related_name="line_items"
    )
    # def save(self, *args, **kwargs):
    #     self.total_price = self.quantity * self.unit_price
    #     super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.item} (RM{self.total_price})"
    
class SystemSpendingCategory(models.Model):
    key = models.SlugField(unique=True)  # e.g. 'groceries'
    default_name = models.CharField(max_length=100)

class UserSpendingCategory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    system_category = models.ForeignKey(
        SystemSpendingCategory,
        on_delete=models.PROTECT
    )
    name = models.CharField(max_length=100)
    
class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(
        UserSpendingCategory,
        on_delete=models.CASCADE,
        related_name="budgets"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.category.name} - Budget: {self.amount}"

