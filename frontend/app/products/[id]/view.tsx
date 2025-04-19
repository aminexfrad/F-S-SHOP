"use client";

import { useState, useEffect, SetStateAction } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import styles from "../../styles/productinfo.module.css";
import Carousel from "../../carousel/page";
import Navbar from "../../../app/components/navbar/page";
import { request, gql } from "graphql-request";
import { getCSRFToken } from "../../../hooks"; // Adjust import path as needed
import { useAuth } from "../../../app/context/AuthContext"; // Import useAuth from AuthContext
const GRAPHQL_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/graphql/";

// Add to Cart Mutation
const ADD_TO_CART_MUTATION = gql`
  mutation AddToCart($userId: Int!, $productId: Int!, $quantity: Int!) {
    addProductToCart(userId: $userId, productId: $productId, quantity: $quantity) {
      id
      user
    }
  }
`;

export default function ProductPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth(); // Get user from context
  
  const id = searchParams.get("id") || "";
  const name = searchParams.get("name") || "Unknown Product";
  const description = searchParams.get("description") || "No description available.";
  const price = searchParams.get("price") || "0";
  const image1 = searchParams.get("image1") || "/default.jpg";
  const image2 = searchParams.get("image2") || undefined;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [fadeIn, setFadeIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const images = [image1, image2].filter((img) => Boolean(img));

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        // Start fade out transition
        setFadeIn(false);
        
        // After transition completes, change the image and fade in
        setTimeout(() => {
          setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
          setFadeIn(true);
        }, 300); // This delay should be shorter than your CSS transition duration
        
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [images]);

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleThumbnailClick = (index: SetStateAction<number>) => {
    if (currentImageIndex !== index) {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentImageIndex(index);
        setFadeIn(true);
      }, 300);
    }
  };

  const handleAddToCart = async () => {
    if (!id) {
      setNotification({ message: "Invalid product ID", type: "error" });
      return;
    }

    if (!user) {
      setNotification({ message: "You need to be logged in to add items to the cart", type: "error" });
      return;
    }

    setLoading(true);
    
    try {
      const variables = {
        userId: parseInt(user.id), // Get user ID from context
        productId: parseInt(id),
        quantity: quantity
      };

      const endpoint = GRAPHQL_URL;
      const headers = { 'X-CSRFToken': getCSRFToken() };

      const result = await request(endpoint, ADD_TO_CART_MUTATION, variables, headers);
      
      console.log("Add to cart success:", result);
      setNotification({ 
        message: `Added ${quantity} ${name} to your cart!`, 
        type: "success" 
      });
      
    } catch (error) {
      console.error("Add to cart error:", error);
      setNotification({ 
        message: "Failed to add item to cart. Please try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <div className={styles.container}>
        {/* Back Button */}
        <button className={styles.backButton} onClick={() => router.push("/products")}>
          <ArrowLeft size={20} />
          <span>Back to Products</span>
        </button>

        <div className={styles.productGrid}>
          {/* Image Gallery */}
          <div className={styles.imageSection}>
            <div className={styles.carousel}>
              <img
                src={images[currentImageIndex]}
                alt={name}
                className={`${styles.carouselImage} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}
              />
            </div>
            
            {images.length > 1 && (
              <div className={styles.thumbnailContainer}>
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${name} thumbnail ${index + 1}`}
                    className={`${styles.thumbnail} ${currentImageIndex === index ? styles.activeThumbnail : ''}`}
                    onClick={() => handleThumbnailClick(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className={styles.detailsContainer}>
            <div className={styles.titleSection}>
              <h1 className={styles.productTitle}>{name}</h1>
            </div>

            {/* Price Section */}
            <div className={styles.priceSection}>
              <span className={styles.price}>Rs. {parseFloat(price).toFixed(2)}</span>
              <span className={styles.originalPrice}>Rs. {(parseFloat(price) * 1.2).toFixed(2)}</span>
              <span className={styles.discount}>16% OFF</span>
            </div>

            <div className={styles.divider}></div>

            <p className={styles.description}>{description}</p>

            {/* Quantity Selection */}
            <div className={styles.selectionSection}>
              <h3 className={styles.subheading}>Quantity</h3>
              <div className={styles.quantitySelector}>
                <button className={styles.quantityButton} onClick={decreaseQuantity}>-</button>
                <span className={styles.quantityValue}>{quantity}</span>
                <button className={styles.quantityButton} onClick={increaseQuantity}>+</button>
              </div>
            </div>

            {notification.message && (
              <div className={`${styles.notification} ${styles[notification.type]}`}>
                {notification.message}
              </div>
            )}

            <div className={styles.buttonContainer}>
              <button 
                className={styles.addToCart} 
                onClick={handleAddToCart}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.carouselGrid}>
          <h2 className={styles.sectionTitle}>You May Also Like</h2>
          <Carousel />
        </div>
      </div>
    </div>
  );
}