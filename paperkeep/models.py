from django.db import models
from django.contrib.auth.models import User
from django.db.models import Sum

class FinancialDocument(models.Model):
    document_number = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="documents/")
    business_name = models.CharField(max_length=255) # SSM states not longer than 50 characters
    business_address = models.TextField()
    transaction_datetime = models.DateTimeField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
        
    def __str__(self):
        return f"{self.__class__.__name__} from {self.business_name} on {self.transaction_datetime}"
    
class LineItem(models.Model):
    financial_document = models.ForeignKey(FinancialDocument, related_name = "line_items", on_delete=models.CASCADE)
    item = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey("SpendingCategory", on_delete=models.SET_NULL, null=True)

    # def save(self, *args, **kwargs):
    #     self.total_price = self.quantity * self.unit_price
    #     super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.item} (RM{self.total_price})"
    
class SpendingCategory(models.Model):
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name
    
class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey('SpendingCategory', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.category.name} - Budget: {self.amount}"

class BudgetAnalysis:
    # You can implement custom functions or use Django’s aggregation methods to generate analytical reports.
    # However, I suggest keeping this part abstract and dynamic, calculating it on the fly using Django’s ORM.
    
    @staticmethod
    def calculate_total_spent(user, category=None):
        transactions = LineItem.objects.filter(financial_document__user=user)
        if category:
            transactions = transactions.filter(category=category)
        return transactions.aggregate(total_spent=Sum('amount'))['total_spent'] or 0.00
    
    @staticmethod
    def calculate_remaining_budget(user, category):
        budget = Budget.objects.filter(user=user, category=category).first()
        if budget:
            total_spent = BudgetAnalysis.calculate_total_spent(user, category)
            return budget.amount - total_spent
        if not budget:
            raise ValueError(f"No budget found for category {category} and user {user}")