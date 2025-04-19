from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Category, Product, Profile, Cart, CartItem, Order, OrderItem

class ModelsTestCase(TestCase):
    def setUp(self):
        # Create a user
        self.user = get_user_model().objects.create_user(username="testuser", password="password123")
        
        # Create a category
        self.category = Category.objects.create(name="Electronics", description="Electronic items")
        
        # Create a product
        self.product = Product.objects.create(
            name="Smartphone",
            description="A high-end smartphone",
            price=999.99,
            category=self.category,
            gender="Unisex"
        )
        
        # Create a profile
        self.profile = Profile.objects.create(
            user=self.user,
            username="testuser",
            email="testuser@example.com",
            address="123 Test Street",
            first_name="Test",
            last_name="User",
            phone_number="1234567890"
        )
        
        # Create a cart
        self.cart = Cart.objects.create(user=self.user)
        
        # Create a cart item
        self.cart_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)
        
        # Create an order
        self.order = Order.objects.create(user=self.profile, total_price=1999.98, status="Pending")
        
        # Create an order item
        self.order_item = OrderItem.objects.create(order=self.order, product=self.product, quantity=2, price=999.99)

    def test_category_creation(self):
        self.assertEqual(self.category.name, "Electronics")
        self.assertEqual(self.category.description, "Electronic items")

    def test_product_creation(self):
        self.assertEqual(self.product.name, "Smartphone")
        self.assertEqual(self.product.price, 999.99)
        self.assertEqual(self.product.category, self.category)

    def test_profile_creation(self):
        self.assertEqual(self.profile.username, "testuser")
        self.assertEqual(self.profile.email, "testuser@example.com")
        self.assertEqual(self.profile.address, "123 Test Street")

    def test_cart_creation(self):
        self.assertEqual(self.cart.user, self.user)
        self.assertEqual(self.cart.items.count(), 1)

    def test_cart_item_creation(self):
        self.assertEqual(self.cart_item.cart, self.cart)
        self.assertEqual(self.cart_item.product, self.product)
        self.assertEqual(self.cart_item.quantity, 2)
        self.assertEqual(self.cart_item.subtotal(), 1999.98)

    def test_order_creation(self):
        self.assertEqual(self.order.user, self.profile)
        self.assertEqual(self.order.total_price, 1999.98)
        self.assertEqual(self.order.status, "Pending")

    def test_order_item_creation(self):
        self.assertEqual(self.order_item.order, self.order)
        self.assertEqual(self.order_item.product, self.product)
        self.assertEqual(self.order_item.quantity, 2)
        self.assertEqual(self.order_item.price, 999.99)