"use client";
import { useState, useEffect, useCallback } from "react";
import Carousel from "../carousel/page";
import "../styles/cart.css";
import { getCSRFToken } from "../../hooks";
import { gql, request } from "graphql-request";
import Navbar from '../components/navbar/page';
import { useAuth } from "../../app/context/AuthContext";
const GRAPHQL_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/graphql/";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: number;
  category: {
    name: string;
  };
  image1: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface OrderResponse {
  placeOrder: {
    id: string;
    user: string;
    totalPrice: number;
    status: string;
  };
}

interface ProfileResponse {
  profile: {
    address: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
}

interface CartResponse {
  cart: {
    items: {
      product: {
        id: number;
        name: string;
        price: number;
        category: {
          name: string;
        };
        image1: string;
      };
      quantity: number;
      subtotal: number;
    }[];
  };
}

interface NotifyOrderResponse {
  notifyOrder: boolean;
}

const PROFILE_QUERY = gql`
  query GetProfile($userId: Int!) {
    profile(userId: $userId) {
      user
      address
      firstName
      lastName
      phoneNumber
      image
      email
    }
  }
`;

const CART_QUERY = gql`
  query Cart($userId: Int!) {
    cart(userId: $userId) {
      items {
        product {
          id
          name
          price
          category {
            name
          }
          image1
        }
        quantity
        subtotal
      }
    }
  }
`;

const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProductFromCart($userId: Int!, $productId: Int!) {
    deleteProductFromCart(userId: $userId, productId: $productId) {
      id
      user
    }
  }
`;

const UPDATE_CART_PRODUCT_MUTATION = gql`
  mutation UpdateCartProduct($userId: Int!, $productId: Int!, $quantity: Int!) {
    updateCartProduct(userId: $userId, productId: $productId, quantity: $quantity) {
      id
      user
      items {
        product {
          id
          name
        }
        quantity
        subtotal
      }
      createdAt
    }
  }
`;

const PLACE_ORDER_MUTATION = gql`
  mutation PlaceOrder($userId: Int!) {
    placeOrder(userId: $userId) {
      id
      user
      totalPrice
      status
    }
  }
`;

const NOTIFY_ORDER_MUTATION = gql`
  mutation NotifyOrder($orderId: Int!) {
    notifyOrder(orderId: $orderId)
  }
`;

const CartPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [userId, setUserId] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [donation, setDonation] = useState<number>(0);
  const [activeDonation, setActiveDonation] = useState<number | null>(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [removeLoading, setRemoveLoading] = useState<number | null>(null);
  const [updateLoading, setUpdateLoading] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [totals, setTotals] = useState({
    totalMRP: 0,
    platformFee: 20,
    shipping: 0,
    total: 0,
  });

  const [profile, setProfile] = useState({
    address: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: ""
  });

  // Add a function to fetch profile data
  const fetchProfileData = useCallback(async () => {
    if (!userId) return;
    
    try {
      const endpoint = GRAPHQL_URL;
      const headers = { 'X-CSRFToken': getCSRFToken() };
      
      const result = await request<ProfileResponse>(endpoint, PROFILE_QUERY, { userId }, headers);
      
      if (result && result.profile) {
        setProfile({
          address: result.profile.address || "",
          firstName: result.profile.firstName || "",
          lastName: result.profile.lastName || "",
          phoneNumber: result.profile.phoneNumber || "",
          email: result.profile.email || ""
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    }
  }, [userId]);

  // Add a useEffect to fetch profile data when userId changes
  useEffect(() => {
    if (userId !== null) {
      fetchProfileData();
    }
  }, [userId, fetchProfileData]);


  // Update userId when user changes
  useEffect(() => {
    if (!authLoading && user) {
      setUserId(parseInt(user.id));
    } else if (!authLoading) {
      setUserId(null);
    }
  }, [user, authLoading]);

  // Manual fetch function instead of using useFetchGraphQL hook
  const fetchCartData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = GRAPHQL_URL;
      const headers = { 'X-CSRFToken': getCSRFToken() };
      
      const result = await request<CartResponse>(endpoint, CART_QUERY, { userId }, headers);
      
      if (result && result.cart && result.cart.items) {
        setCartItems(result.cart.items);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch cart data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch cart data");
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch cart data when userId changes
  useEffect(() => {
    if (userId !== null) {
      fetchCartData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [userId, authLoading, fetchCartData]);

  useEffect(() => {
    updateTotals();
  }, [cartItems, donation]);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const updateTotals = () => {
    const totalMRP = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const finalTotal = totalMRP + donation;

    setTotals({
      totalMRP,
      platformFee: 20,
      shipping: 0,
      total: finalTotal,
    });
  };

  const updateQuantity = async (index: number, change: number) => {
    if (!userId) return;
    
    const newQuantity = Math.max(1, cartItems[index].quantity + change);
    const productId = cartItems[index].product.id;
    
    if (newQuantity === cartItems[index].quantity) return;
    
    setUpdateLoading(index);
    
    try {
      setCartItems((prevItems) => {
        const newItems = [...prevItems];
        newItems[index] = {
          ...newItems[index],
          quantity: newQuantity,
          subtotal: newItems[index].product.price * newQuantity,
        };
        return newItems;
      });

      const endpoint = GRAPHQL_URL;
      const headers = { 'X-CSRFToken': getCSRFToken() };
      
      const variables = {
        userId,
        productId: productId,
        quantity: newQuantity
      };

      await request(endpoint, UPDATE_CART_PRODUCT_MUTATION, variables, headers);
      await fetchCartData();
      
    } 
    catch (error) {
        console.error("Failed to update quantity:", error);
        
        // Revert the optimistic UI update
        setCartItems((prevItems) => {
          const newItems = [...prevItems];
          newItems[index] = {
            ...newItems[index],
            quantity: newItems[index].quantity - change,
            subtotal: newItems[index].product.price * (newItems[index].quantity - change),
          };
          return newItems;
        });
        
        setNotification({ 
          message: "Failed to update quantity. Please try again.", 
          type: "error" 
        });
    } finally {
      setUpdateLoading(null);
    }
  };

  const removeItem = async (index: number) => {
    if (!userId) return;
    
    const productId = cartItems[index].product.id;
    const productName = cartItems[index].product.name;
    
    setRemoveLoading(index);
    
    try {
      const endpoint = GRAPHQL_URL;
      const headers = { 'X-CSRFToken': getCSRFToken() };
      
      const variables = {
        userId,
        productId: productId
      };
      await request(endpoint, DELETE_PRODUCT_MUTATION, variables, headers);
      
      setCartItems((prevItems) => prevItems.filter((_, i) => i !== index));
      
      setNotification({ 
        message: `Removed ${productName} from your cart!`, 
        type: "success" 
      });
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      setNotification({ 
        message: "Failed to remove item. Please try again.", 
        type: "error" 
      });
    } finally {
      setRemoveLoading(null);
    }
  };

  // Modified function to toggle donations
  const toggleDonation = (amount: number) => {
    if (activeDonation === amount) {
      setDonation(0);
      setActiveDonation(null);
    } else {
      setDonation(amount);
      setActiveDonation(amount);
    }
  };

  // New function to handle placing an order
  const placeOrder = async () => {
    if (!userId) return;
    // Check if there are any items in the cart
    if (cartItems.length === 0) {
      setNotification({
        message: "Your cart is empty. Please add items to place an order.",
        type: "error"
      });
      return;
    }
    
    setOrderLoading(true);
    
    try {
      const endpoint = GRAPHQL_URL;
      const headers = { 'X-CSRFToken': getCSRFToken() };
      
      // Execute the place order mutation
      const result = await request<OrderResponse>(
        endpoint, 
        PLACE_ORDER_MUTATION, 
        { userId }, 
        headers
      );
      
      // If successful, show success message and refresh cart
      if (result && result.placeOrder) {
        await sendOrderNotification(result.placeOrder.id);
        setNotification({
          message: `Order placed successfully! Order ID: ${result.placeOrder.id}`,
          type: "success"
        });
        // Clear cart or refresh data
        await fetchCartData();
      }
    } catch (error) {
      console.error("Failed to place order:", error);
      setNotification({
        message: "Failed to place your order. Please try again.",
        type: "error"
      });
    } finally {
      setOrderLoading(false);
    }
  };

  const sendOrderNotification = async (orderId: string) => {
    try {
      const endpoint = "http://127.0.0.1:8000/graphql/";
      const headers = { 'X-CSRFToken': getCSRFToken() };
      
      const variables = {
        orderId: orderId
      };
      
      const notifyResult = await request<NotifyOrderResponse>(
        endpoint, 
        NOTIFY_ORDER_MUTATION, 
        variables, 
        headers
      );
      
      console.log("Order notification sent:", notifyResult);
      return notifyResult.notifyOrder;
    } catch (error) {
      console.error("Failed to send order notification:", error);
      return false;
    }
  };
  // Show loading state
  if (isLoading || authLoading) {
    return (
      <>
        <Navbar />
        <div className="cart-container">
          <p className="text-center text-gray-500">Loading your cart...</p>
        </div>
      </>
    );
  }

  // Show login message when user is not logged in
  if (!userId && !authLoading) {
    return (
      <>
        <Navbar />
        <div className="cart-container">
          <div className="empty-cart-message">
            <p>Please log in to view your cart.</p>
            <button 
              onClick={() => router.push('/login')}
              className="place-order-btn" 
              style={{ maxWidth: '200px', margin: '20px auto' }}
            >
              GO TO LOGIN
            </button>
          </div>
        </div>
      </>
    );
  }

  // Show error message
  if (error) {
    return (
      <>
        <Navbar />
        <div className="cart-container">
          <p className="text-center text-red-500">Error: {error}</p>
          <button 
            onClick={fetchCartData}
            className="place-order-btn" 
            style={{ maxWidth: '200px', margin: '20px auto' }}
          >
            Try Again
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="cart-container">
        
        {notification.message && (
          <div className={`notification ${notification.type}`} style={{
            padding: '10px 15px',
            margin: '10px 0',
            borderRadius: '4px',
            backgroundColor: notification.type === 'success' ? '#d4edda' : '#f8d7da',
            color: notification.type === 'success' ? '#155724' : '#721c24',
            textAlign: 'center'
          }}>
            {notification.message}
          </div>
        )}
        
        <div className="cart-content">
          {/* Left Section - Cart Items */}
          <div className="cart-left">
            <div className="delivery-address">
              <h2>
                Deliver to: <span>{profile.firstName} {profile.lastName}, {profile.phoneNumber}</span>
              </h2>
              <p>{profile.address || "No address provided. Please update your profile."}</p>
            </div>

            <div className="offers-section">
              <h3>Available Offers</h3>
              <p>Flat 16% Discount on all Products on the Fresh Launch of ShopifyFR.</p>
            </div>

            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <div key={index} className="cart-item">
                  <img
                    src={item.product.image1 || "/images/placeholder.jpg"}
                    alt={item.product.name}
                    className="cart-item-img"
                    onError={(e) => ((e.target as HTMLImageElement).src = "/images/placeholder.jpg")}
                  />
                  <div className="cart-item-details">
                    <h2>{item.product.name}</h2>
                    <p>Category: {item.product.category.name}</p>
                    <p className="price">
                      <span className="discount-price">₹{item.product.price}</span>
                      <span className="original-price">₹{(item.product.price * 1.2).toFixed(2)}</span>
                      <span className="discount-percent">16% OFF</span>
                    </p>
                    <p className="delivery">
                      Delivery by{" "}
                      {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                      })}
                    </p>
                    <div className="quantity-control">
                      <button 
                        onClick={() => updateQuantity(index, -1)}
                        disabled={updateLoading === index}
                      >
                        -
                      </button>
                      <span>{updateLoading === index ? '...' : item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(index, 1)}
                        disabled={updateLoading === index}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      className="remove-btn" 
                      onClick={() => removeItem(index)}
                      disabled={removeLoading === index}
                    >
                      {removeLoading === index ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-cart-message">
                <p>Your cart is empty. Start shopping to add items to your cart!</p>
              </div>
            )}
          </div>

          <div className="vertical-divider"></div>

          {/* Right Section - Price Summary */}
          <div className="cart-right">
            <div className="donation-section">
              <h2>Donate and Make a Difference</h2>
              <div className="donation-buttons">
                {[10, 20, 50, 100].map((amount) => (
                  <button 
                    key={amount} 
                    onClick={() => toggleDonation(amount)}
                    className={activeDonation === amount ? "active-donation" : ""}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>
            <div className="price-summary">
              <h2>Price Details</h2>
              <div className="price-item">
                <span>Total MRP:</span>
                <span>₹{totals.totalMRP.toLocaleString("en-IN")}</span>
              </div>
              <div className="price-item">
                <span>Donation:</span>
                <span>₹{donation}</span>
              </div>
              <div className="total-price">
                <span>Total:</span>
                <span>₹{totals.total.toLocaleString("en-IN")}</span>
              </div>
              <button 
                className="place-order-btn" 
                disabled={cartItems.length === 0 || orderLoading}
                onClick={placeOrder}
              >
                {orderLoading ? 'PROCESSING...' : 'PLACE ORDER'}
              </button>
            </div>
          </div>
        </div>
        <div className="carousel-section">
          <h2 className="recommended-heading">You may also like</h2>
          <Carousel />
        </div>
      </div>
    </>
  );
};

export default CartPage;