import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductPage from '../[id]/page'; 
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../app/context/AuthContext';
import { request } from 'graphql-request';
import { getCSRFToken } from '..../../../hooks';
const GRAPHQL_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/graphql/";

// Mock the dependencies
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock('@/app/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('graphql-request', () => ({
  request: vi.fn(),
  gql: (query) => query,
}));

vi.mock('@/hooks', () => ({
  getCSRFToken: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft Icon</div>,
  Heart: () => <div data-testid="heart-icon">Heart Icon</div>,
  Share2: () => <div data-testid="share-icon">Share Icon</div>,
}));

vi.mock('@/app/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('../../carousel/page', () => ({
  default: () => <div data-testid="carousel">Carousel Component</div>,
}));

describe('ProductPage', () => {
  // Setup mock parameters and functions
  const mockRouter = {
    push: vi.fn(),
  };

  const mockSearchParams = new Map([
    ['id', '123'],
    ['name', 'Test Product'],
    ['description', 'This is a test product description'],
    ['price', '2000'],
    ['image1', 'test-image1.jpg'],
    ['image2', 'test-image2.jpg'],
  ]);

  const mockGetSearchParam = (param) => mockSearchParams.get(param);
  mockSearchParams.get = mockGetSearchParam;

  beforeEach(() => {
    // Set up mocks before each test
    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams);
    vi.mocked(useAuth).mockReturnValue({ 
      user: { id: '1', username: 'testuser' }, 
      login: vi.fn(), 
      logout: vi.fn(),
      loading: false 
    });
    vi.mocked(getCSRFToken).mockReturnValue('mock-csrf-token');
    vi.mocked(request).mockResolvedValue({
      addProductToCart: { id: '1', user: '1' }
    });

    // Mock setInterval and setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders product information correctly', () => {
    render(<ProductPage />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('This is a test product description')).toBeInTheDocument();
    expect(screen.getByText('Rs. 2000.00')).toBeInTheDocument();
    expect(screen.getByText('16% OFF')).toBeInTheDocument();
    expect(screen.getByAltText('Test Product')).toBeInTheDocument();
  });

  it('handles back button click', () => {
    render(<ProductPage />);
    
    const backButton = screen.getByText('Back to Products');
    fireEvent.click(backButton);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/products');
  });

  it('handles quantity selection', () => {
    render(<ProductPage />);
    
    // Initial quantity should be 1
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Increase quantity
    const increaseButton = screen.getAllByText('+')[0];
    fireEvent.click(increaseButton);
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Decrease quantity
    const decreaseButton = screen.getAllByText('-')[0];
    fireEvent.click(decreaseButton);
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Quantity should not go below 1
    fireEvent.click(decreaseButton);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('adds product to cart successfully', async () => {
    render(<ProductPage />);
    
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);
    
    // Check loading state
    expect(screen.getByText('Adding...')).toBeInTheDocument();
    
    // Wait for the operation to complete
    await waitFor(() => {
      expect(request).toHaveBeenCalledWith(
        GRAPHQL_URL,
        expect.anything(),
        {
          userId: 1,
          productId: 123,
          quantity: 1
        },
        { 'X-CSRFToken': 'mock-csrf-token' }
      );
    });
    
    // Check success notification
    expect(screen.getByText('Added 1 Test Product to your cart!')).toBeInTheDocument();
    
    // Check that the button returns to normal state
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('shows error when adding to cart fails', async () => {
    vi.mocked(request).mockRejectedValueOnce(new Error('API Error'));
    
    render(<ProductPage />);
    
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);
    
    // Wait for the operation to complete
    await waitFor(() => {
      expect(screen.getByText('Failed to add item to cart. Please try again.')).toBeInTheDocument();
    });
  });

  it('prevents add to cart when user is not logged in', async () => {
    vi.mocked(useAuth).mockReturnValue({ 
      user: null, 
      login: vi.fn(), 
      logout: vi.fn(),
      loading: false
    });
    
    render(<ProductPage />);
    
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);
    
    expect(screen.getByText('You need to be logged in to add items to the cart')).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it('handles image gallery thumbnail clicks', () => {
    render(<ProductPage />);
    
    // Get all thumbnails and click the second one
    const thumbnails = screen.getAllByRole('img');
    // The first image is the main display, thumbnails start from index 1
    fireEvent.click(thumbnails[1]);
    
    // The second image should now have the active class
    expect(thumbnails[1]).toHaveClass('activeThumbnail');
  });

  it('auto-rotates images', async () => {
    render(<ProductPage />);
    
    const initialSrc = screen.getAllByRole('img')[0].getAttribute('src');
    
    // Advance timers to trigger image rotation
    vi.advanceTimersByTime(4300); // Advance past the interval + transition time
    
    await waitFor(() => {
      const newSrc = screen.getAllByRole('img')[0].getAttribute('src');
      expect(newSrc).not.toBe(initialSrc);
    });
  });
});