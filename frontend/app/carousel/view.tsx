"use client";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../styles/carousel.css";
import { gql } from "graphql-request";
import { useFetchGraphQL } from "../../hooks";  


const PRODUCTS_QUERY = gql`
  query {
    products {
      id
      name
      description
      price
      category {
        name
      }
      gender
      image1
      image2
    }
  }
`;

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image1: string;
  image2: string;
}

const CarouselPage = () => {
  const router = useRouter();
  const { data, loading, error } = useFetchGraphQL<{ products: Product[] }>(PRODUCTS_QUERY);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (data?.products && data.products.length > 0) {
      const validProducts = data.products.filter(
        product => product.image1 && product.image2
      );
      
      const shuffled = [...validProducts].sort(() => Math.random() - 0.5);
      setSelectedProducts(shuffled.slice(0, 10));
    }
  }, [data]);

  const [scrollIndex, setScrollIndex] = useState(0);
  const itemsPerView = 6;
  const scrollAmount = 183;
  const maxScrollIndex = Math.max(0, selectedProducts.length - itemsPerView);

  useEffect(() => {  
    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev < maxScrollIndex ? prev + 1 : 0));
    }, 3000);

    return () => clearInterval(interval);
  }, [maxScrollIndex]);

  const scrollLeft = () => {
    setScrollIndex((prev) => (prev > 0 ? prev - 1 : maxScrollIndex));
  };

  const scrollRight = () => {
    setScrollIndex((prev) => (prev < maxScrollIndex ? prev + 1 : 0));
  };

  const navigateToProductPage = (product: Product) => {
    router.push(
      `/products/${product.id}?id=${encodeURIComponent(product.id)}&name=${encodeURIComponent(product.name
      )}&description=${encodeURIComponent(
        product.description
      )}&price=${product.price}&image1=${encodeURIComponent(
        product.image1
      )}&image2=${encodeURIComponent(product.image2)}`
    );
  };

  const handleImageError = (productId: number) => {
    setSelectedProducts(prev => 
      prev.filter(product => product.id !== productId)
    );
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error fetching products: {error.message}</p>;

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          integrity="sha384-TpJlARZ7aa7dBl0XXe9B6B6lM5LNx1wBbbNHs2mrz3lbjVdhBFjc/IHyVR1jE5v1"
          crossOrigin="anonymous"
        />
      </Head>
      <div className="container d-flex flex-column align-items-center p-4">
        <div className="carousel-wrapper">
          <h2 className="text-dark text-2xl pl-10 fw-bold mb-3">Recommended for You</h2>

          <button onClick={scrollLeft} className="carousel-btn left" aria-label="chevron-right">
            <ChevronLeft size={24} />
          </button>

          <div className="carousel-container">
            <div
              className="carousel-track"
              style={{ transform: `translateX(-${scrollIndex * scrollAmount}px)` }}
            >
              {selectedProducts.map((item) => (
                <div
                  key={item.id}
                  className="item-card"
                  onClick={() => navigateToProductPage(item)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={item.image1}
                    className="item-image"
                    alt={item.name}
                    onError={() => handleImageError(item.id)}
                  />
                  <div className="item-info">
                    <span className="item-name">
                      {item.name.split(" ").slice(0, 2).join(" ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={scrollRight} className="carousel-btn right" aria-label="chevron-left">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </>
  );
};

export default CarouselPage;