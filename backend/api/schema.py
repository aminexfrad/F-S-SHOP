import strawberry
from typing import List, Optional
from datetime import datetime
import os
import uuid
import base64
from django.conf import settings
from django.contrib.auth import get_user_model
User = get_user_model()
from .models import Category, Product, Profile, Cart, CartItem, Order, OrderItem
from strawberry.tools import merge_types
from authentication.schema import AuthQuery, AuthMutation
from strawberry.types import Info
from api.models import Order
from api.utils.email import send_notification_email

@strawberry.type
class CategoryType:
    id: int
    name: str
    description: Optional[str]

@strawberry.type
class ProductType:
    id: int
    name: str
    description: str
    price: float
    category: CategoryType
    image1: Optional[str]
    image2: Optional[str]
    gender: str

@strawberry.type
class ProfileType:
    user: str
    address: str
    first_name: str
    last_name: str
    email: str
    phone_number: str
    image: Optional[str]
    id : int

@strawberry.type
class CartItemType:
    id: int
    product: ProductType
    quantity: int

    @strawberry.field
    def subtotal(self) -> float:
        return self.quantity * self.product.price

@strawberry.type
class CartType:
    id: int
    user: str
    items: List[CartItemType]
    created_at: datetime

@strawberry.type
class OrderItemType:
    id: int
    product: ProductType
    quantity: int
    price: float

@strawberry.type
class OrderType:
    id: int
    user: str
    total_price: float
    status: str
    created_at: datetime
    order_items: List[OrderItemType]

@strawberry.type
class DeleteOrderResponse:
    success: bool
    message: str

@strawberry.type
class Query:
    @strawberry.field
    def categories(self) -> List[CategoryType]:
        return Category.objects.all()

    @strawberry.field
    def products(self) -> List[ProductType]:
        return Product.objects.all()

    @strawberry.field
    def profile(self, user_id: int) -> Optional[ProfileType]:
        profile = Profile.objects.filter(user__id=user_id).first()
        if profile:
            return ProfileType(
                id=profile.user.id,
                user=profile.user.username,
                address=profile.address,
                first_name=profile.first_name,
                last_name=profile.last_name,
                email=profile.email,
                phone_number=profile.phone_number,
                image=profile.image.url if profile.image else None
            )
        return None

    @strawberry.field
    def cart(self, user_id: int) -> Optional[CartType]:
        cart = Cart.objects.filter(user__id=user_id).first()
        if cart:
            return CartType(
                id=cart.id,
                user=cart.user.username,
                items=cart.items.all(),
                created_at=cart.created_at,
            )
        return None

    @strawberry.field
    def orders(self, user_id: int) -> List[OrderType]:
        orders = Order.objects.filter(user__user__id=user_id)
        return [
            OrderType(
                id=order.id,
                user=order.user.user.username,
                total_price=order.total_price,
                status=order.status,
                created_at=order.created_at,
                order_items=[
                    OrderItemType(
                        id=item.id,
                        product=ProductType(
                            id=item.product.id,
                            name=item.product.name,
                            description=item.product.description,
                            price=item.product.price,
                            category=CategoryType(
                                id=item.product.category.id,
                                name=item.product.category.name,
                                description=item.product.category.description
                            ),
                            image1=item.product.image1,
                            image2=item.product.image2,
                            gender=item.product.gender
                        ),
                        quantity=item.quantity,
                        price=item.price
                    )
                    for item in order.order_items.all()  #  Use correct related_name
                ]
            )
            for order in orders
        ]

@strawberry.type
class Mutation:
    @strawberry.mutation
    def add_product(self, name: str, description: str, price: float, category_id: int, image1: Optional[str], image2: Optional[str], gender: str) -> ProductType:
        category = Category.objects.get(id=category_id)
        product = Product.objects.create(name=name, description=description, price=price, category=category, image1=image1, image2=image2, gender=gender)
        return ProductType(
            id=product.id,
            name=product.name,
            description=product.description,
            price=product.price,
            category=CategoryType(id=category.id, name=category.name, description=category.description),
            image1=product.image1,
            image2=product.image2,
            gender=product.gender
        )

    @strawberry.mutation
    def create_cart(self, user_id: int) -> CartType:
        user = User.objects.get(id=user_id)
        cart = Cart.objects.create(user=user)
        return CartType(
            id=cart.id,
            user=user.username,
            items=[],
            created_at=cart.created_at
        )
    @strawberry.mutation
    def place_order(self, user_id: int) -> OrderType:
        user = User.objects.get(id=user_id)
        profile = Profile.objects.filter(user=user).first()

        if not profile:
            raise Exception("Profile does not exist for this user.")

        cart = Cart.objects.filter(user=user).first()
        if not cart or not cart.items.exists():
            raise Exception("Cart is empty. Add products before placing an order.")

        total_price = sum(item.product.price * item.quantity for item in cart.items.all())

        # Create the Order
        order = Order.objects.create(user=profile, total_price=total_price, status="Pending")

        order_items = []
        for cart_item in cart.items.all():
            order_item = OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
            order_items.append(order_item)

        # Clear the cart after placing the order
        cart.items.all().delete()

        return OrderType(
            id=order.id,
            user=order.user.user.username,
            total_price=order.total_price,
            status=order.status,
            created_at=order.created_at,
            order_items=[
                OrderItemType(
                    id=item.id,
                    product=ProductType(
                        id=item.product.id,
                        name=item.product.name,
                        description=item.product.description,
                        price=item.product.price,
                        category=CategoryType(
                            id=item.product.category.id,
                            name=item.product.category.name,
                            description=item.product.category.description
                        ),
                        image1=item.product.image1,
                        image2=item.product.image2,
                        gender=item.product.gender
                    ),
                    quantity=item.quantity,
                    price=item.price
                )
                for item in order_items
            ]
        )

    @strawberry.mutation
    def delete_order(self, order_id: int) -> DeleteOrderResponse:
        order = Order.objects.filter(id=order_id).first()
        if not order:
            return DeleteOrderResponse(success=False, message="Order not found.")

        order.delete()
        return DeleteOrderResponse(success=True, message="Order deleted successfully.")

    @strawberry.mutation
    def add_product_to_cart(self, user_id: int, product_id: int, quantity: int) -> CartType:
        user = User.objects.get(id=user_id)
        cart, created = Cart.objects.get_or_create(user=user)
        product = Product.objects.get(id=product_id)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={'quantity': quantity})
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        return CartType(
            id=cart.id,
            user=cart.user.username,
            items=cart.items.all(),
            created_at=cart.created_at
        )

    @strawberry.mutation
    def delete_product_from_cart(self, user_id: int, product_id: int) -> CartType:
        user = User.objects.get(id=user_id)
        cart = Cart.objects.get(user=user)
        cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
        cart_item.delete()
        return CartType(
            id=cart.id,
            user=cart.user.username,
            items=cart.items.all(),
            created_at=cart.created_at
        )   
    
    @strawberry.mutation
    def update_cart_product(self, user_id: int, product_id: int, quantity: int) -> CartType:
        user = User.objects.get(id=user_id)
        cart = Cart.objects.get(user=user)
        cart_item = CartItem.objects.get(cart=cart, product_id=product_id)

        if quantity > 0:
            cart_item.quantity = quantity
            cart_item.save()
        else:
            cart_item.delete()
        return CartType(
            id=cart.id,
            user=cart.user.username,
            items=cart.items.all(),
            created_at=cart.created_at
        )

    @strawberry.mutation
    def delete_profile(self, user_id: int) -> DeleteOrderResponse:
        profile = Profile.objects.filter(user__id=user_id).first()
        user = User.objects.filter(id=user_id).first()

        if not profile:
            return DeleteOrderResponse(success=False, message="Profile not found.")

        if not user:
            return DeleteOrderResponse(success=False, message="User not found.")

        # Delete the profile and the user
        profile.delete()
        user.delete()

        return DeleteOrderResponse(success=True, message="Profile and user deleted successfully.")

    @strawberry.mutation
    
    def edit_profile(self, user_id: int, username: Optional[str] = None, address: Optional[str] = None, 
                    first_name: Optional[str] = None, last_name: Optional[str] = None, 
                    phone_number: Optional[str] = None, image: Optional[str] = None) -> ProfileType:
        profile = Profile.objects.filter(user__id=user_id).first()
        user = User.objects.filter(id=user_id).first()

        if not profile:
            raise Exception("Profile does not exist for this user.")

        if not user:
            raise Exception("User does not exist.")

        if username is not None:
            user.username = username
            user.save()

        if address is not None:
            profile.address = address
        if first_name is not None:
            profile.first_name = first_name
        if last_name is not None:
            profile.last_name = last_name
        if phone_number is not None:
            profile.phone_number = phone_number
        
        # Handle image upload
        if image is not None and image.startswith('data:image'):
            # Extract file format and base64 data
            format, imgstr = image.split(';base64,')
            ext = format.split('/')[-1]
            
            # Generate a unique filename
            filename = f"{uuid.uuid4()}.{ext}"
            
            profile_images_dir = os.path.join(settings.MEDIA_ROOT, 'profileimage')
            
            # Save the image file
            file_path = os.path.join(profile_images_dir, filename)
            with open(file_path, 'wb') as f:
                f.write(base64.b64decode(imgstr))
            
            # Save path relative to MEDIA_ROOT
            profile.image = f'profileimage/{filename}'

        profile.save()

        # Get the full URL for the image
        image_url = None
        if profile.image:
            image_url = profile.image

        return ProfileType(
            id=profile.user.id,
            user=profile.user.username,
            address=profile.address,
            first_name=profile.first_name,
            last_name=profile.last_name,
            email=profile.email,
            phone_number=profile.phone_number,
            image=image_url
        )
    

    @strawberry.mutation
    def notify_order(self, info: Info, order_id: int) -> str:
        try:
            order = Order.objects.get(id=order_id)
            user_profile = order.user  # Profile model
            email = user_profile.email
            name = user_profile.first_name
            address = user_profile.address

            subject = f"Order #{order.id} Confirmation"
            message = (
                f"Hello {name},\n\n"
                f"Thank you for your order! We’re excited to let you know that your {order} has been successfully received and is now being processed.\n\n"
                f"Here are your Order Details\n\n"
                f"----------------------------------------------------\n\n"
                f"Order ID: {order.id}\n"
                f"Total: ₹{order.total_price}\n"
                f"Status: {order.status}\n"
                f"Placed on: {order.created_at.strftime('%Y-%m-%d %H:%M')}\n\n"
                f"Shipping Address\n"
                f"{address}\n\n"
                f"----------------------------------------------------\n\n"
                f"We'll notify you when it's shipped!\n\n"
                f"Thank you for choosing ShopifyFR!\n\n"
                f"Warm regards, \nShopifyFR\n\n"
            )

            send_notification_email(subject, message, email)
            return "Email sent successfully"
        except Order.DoesNotExist:
            return "Order not found"
        except Exception as e:
            return f"Error: {str(e)}"

MergedQuery = merge_types("MergedQuery", (AuthQuery, Query))
MergedMutation = merge_types("MergedMutation", (AuthMutation, Mutation))

schema = strawberry.Schema(query=MergedQuery, mutation=MergedMutation)


