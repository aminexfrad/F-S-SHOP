import { render } from '@testing-library/react';
import { useRouter } from 'next/router';
import ProductsPage from '../page';

// Mocking the useRouter hook for Vitest
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

describe('ProductsPage', () => {
  it('should render loading state', () => {
    // Mocking useRouter to avoid the invariant error
    useRouter.mockReturnValue({
      pathname: '/products',
      query: {},
      asPath: '/products',
    });

    const { getByText } = render(<ProductsPage />);

    // Add assertions for the loading state
    expect(getByText(/loading/i)).toBeInTheDocument(); // Adjust this to match your actual loading state text
  });

  it('should render error state if there\'s an error', () => {
    // Mocking the error scenario
    useRouter.mockReturnValue({
      pathname: '/products',
      query: {},
      asPath: '/products',
    });

    const { getByText } = render(<ProductsPage />);

    // Add assertions for error state
    expect(getByText(/error/i)).toBeInTheDocument(); // Adjust this based on your error state message
  });

  it('should render products when data is available', () => {
    // Mocking data fetching and the router
    useRouter.mockReturnValue({
      pathname: '/products',
      query: {},
      asPath: '/products',
    });

    const { getByText } = render(<ProductsPage />);

    // Add assertions to check if products are rendered
    expect(getByText(/product name/i)).toBeInTheDocument(); // Adjust based on the expected product name in the page
  });

  it('should handle category filter change', () => {
    // Test logic for category filter change
    useRouter.mockReturnValue({
      pathname: '/products',
      query: { category: 'electronics' },
      asPath: '/products?category=electronics',
    });

    const { getByText } = render(<ProductsPage />);

    // Add assertions for category filter change
    expect(getByText(/electronics/i)).toBeInTheDocument();
  });

  it('should update price range', () => {
    // Test logic for price range update
    useRouter.mockReturnValue({
      pathname: '/products',
      query: { price: '100-500' },
      asPath: '/products?price=100-500',
    });

    const { getByText } = render(<ProductsPage />);

    // Add assertions for price range update
    expect(getByText(/100-500/i)).toBeInTheDocument();
  });
});
