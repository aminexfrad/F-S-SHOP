import csv
import os
import ast
from django.core.management.base import BaseCommand
from api.models import Product, Category

class Command(BaseCommand):
    help = 'Seed the database with data from a CSV file'

    def handle(self, *args, **kwargs):
        csv_file_path = os.path.join(os.path.dirname(__file__), 'Dataset_ShopifyFR.csv')
        
        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f'CSV file not found: {csv_file_path}'))
            return
        
        with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row in reader:
                images = row['Product Image'].split(', ')
                image1 = images[0].lstrip("[")
                image2 = images[1].rstrip("]")
                # Convert the string to a dictionary and fetch the keys
                image1_dict = ast.literal_eval(image1)
                image1_keys = list(image1_dict.keys())
                image2_dict = ast.literal_eval(image2)
                image2_keys = list(image2_dict.keys())
                
                product_name = row['Product Name']
                price = row['Price']
                details = row['Details']
                categories = row['Categories'].split(', ')
                gender = row['Gender']
                
                # Ensure categories exist in the database
                category_objects = []
                for category_name in categories:
                    category, created = Category.objects.get_or_create(name=category_name)
                    category_objects.append(category)
                
                # Ensure the product does not already exist in the database
                existing_products = Product.objects.filter(name=product_name)
                if existing_products.exists():
                    product = existing_products.first()
                    product.price = price.strip('₹').replace(',', '')
                    product.description = details
                    product.image1 = image1_keys[0]
                    product.image2 = image2_keys[0]
                    product.category = category_objects[0]
                    product.gender = gender
                    product.save()
                    self.stdout.write(self.style.WARNING(f'Product {product_name} updated'))
                else:
                    product = Product.objects.create(
                        name=product_name,
                        price=price.strip('₹').replace(',', ''),
                        description=details,
                        image1=image1_keys[0],
                        image2=image2_keys[0],
                        category=category_objects[0],
                        gender=gender
                    )
                    self.stdout.write(self.style.SUCCESS(f'Product {product_name} created successfully'))