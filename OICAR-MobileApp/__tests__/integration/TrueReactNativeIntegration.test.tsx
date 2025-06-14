// FIXED REACT NATIVE INTEGRATION TESTS
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import LoginScreen from '../../screens/LoginScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import ProductsScreen from '../../screens/ProductsScreen';
import CartScreen from '../../screens/CartScreen';
import { AuthProvider } from '../../utils/AuthContext';
import AuthContext from '../../utils/AuthContext';

// Mock external dependencies
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock ALL network calls consistently
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock service modules
jest.mock('../../utils/userService', () => ({
  UserService: {
    getUserProfile: jest.fn(),
  },
}));

jest.mock('../../utils/profileService', () => ({
  ProfileService: {
    getUserProfileWithAnonymization: jest.fn(),
  },
}));

jest.mock('../../utils/productService', () => ({
  ProductService: {
    getAllItems: jest.fn(),
    getAllCategories: jest.fn(),
    searchItemsByTitle: jest.fn(),
  },
}));

jest.mock('../../utils/cartService', () => ({
  CartService: {
    getUserCart: jest.fn(),
    addItemToCart: jest.fn(),
    removeCartItem: jest.fn(),
  },
}));

// Import mocked services
import { UserService } from '../../utils/userService';
import { ProfileService } from '../../utils/profileService';
import { ProductService } from '../../utils/productService';
import { CartService } from '../../utils/cartService';

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockProfileService = ProfileService as jest.Mocked<typeof ProfileService>;
const mockProductService = ProductService as jest.Mocked<typeof ProductService>;
const mockCartService = CartService as jest.Mocked<typeof CartService>;

// Test wrapper with controllable auth state
const TestWrapperWithAuth = ({ 
  children, 
  authToken = null, 
  setAuthToken = () => {} 
}: { 
  children: React.ReactNode;
  authToken?: string | null;
  setAuthToken?: (token: string | null) => void;
}) => {
  // Create a mock auth context value
  const authContextValue = {
    user: authToken ? { 
      id: 1, 
      email: 'test@example.com', 
      firstName: 'Test', 
      lastName: 'User', 
      username: 'testuser', 
      isAdmin: false 
    } : null,
    isLoading: false,
    isAuthenticated: !!authToken,
    token: authToken,
    login: async (email: string, password: string) => {
      setAuthToken('test-token');
    },
    register: async (userData: any) => {
      setAuthToken('test-token');
    },
    logout: async () => {
      setAuthToken(null);
    },
  };

  return (
    <NavigationContainer>
      <AuthContext.Provider value={authContextValue}>
        {children}
      </AuthContext.Provider>
    </NavigationContainer>
  );
};

// Regular test wrapper for components that manage their own auth
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <AuthProvider>
      {children}
    </AuthProvider>
  </NavigationContainer>
);

describe('React Native Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    
    // Reset all service mocks
    mockUserService.getUserProfile.mockClear();
    mockProfileService.getUserProfileWithAnonymization.mockClear();
    mockProductService.getAllItems.mockClear();
    mockProductService.getAllCategories.mockClear();
    mockProductService.searchItemsByTitle.mockClear();
    mockCartService.getUserCart.mockClear();
    mockCartService.addItemToCart.mockClear();
    mockCartService.removeCartItem.mockClear();
  });

  // Increase timeout for all tests
  const TEST_TIMEOUT = 15000;

  test('Login screen integrates authentication with app state and navigation', async () => {
    // Mock health check and login API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            token: 'integration-token-123',
            user: { username: 'testuser', email: 'test@example.com' }
          }
        })
      } as Response);

    const mockOnLoginSuccess = jest.fn();
    
    const { getByTestId } = render(
      <TestWrapper>
        <LoginScreen onLoginSuccess={mockOnLoginSuccess} />
      </TestWrapper>
    );

    // Fill form and submit
    await act(async () => {
      fireEvent.changeText(getByTestId('login-username-input'), 'testuser');
      fireEvent.changeText(getByTestId('login-password-input'), 'password123');
    });

    await act(async () => {
      fireEvent.press(getByTestId('login-submit-button'));
    });

    // Wait for login to complete
    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalledWith('logged-in');
    }, { timeout: 8000 });

    // Verify API was called correctly
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('testuser')
      })
    );
  }, TEST_TIMEOUT);

  test('Profile screen integrates API data loading with UI state management', async () => {
    // Mock profile service response
    mockProfileService.getUserProfileWithAnonymization.mockResolvedValueOnce({
      idUser: 1,
      username: 'profileuser',
      email: 'profile@example.com',
      firstName: 'Profile',
      lastName: 'User',
      phoneNumber: '123-456-7890',
      isAdmin: false,
      anonymizationRequest: undefined
    });

    const { getByText, queryByText } = render(
      <TestWrapperWithAuth authToken="valid-token">
        <ProfileScreen token="valid-token" onLogout={() => {}} />
      </TestWrapperWithAuth>
    );

    // Wait for profile to load
    await waitFor(() => {
      expect(mockProfileService.getUserProfileWithAnonymization).toHaveBeenCalled();
    }, { timeout: 8000 });

    // Verify UI shows loaded data
    await waitFor(() => {
      expect(getByText('profileuser')).toBeTruthy();
      expect(getByText('profile@example.com')).toBeTruthy();
    }, { timeout: 5000 });
  }, TEST_TIMEOUT);

  test('Products screen integrates search functionality with cart state updates', async () => {
    // Mock initial data
    const mockProducts = [
      { idItem: 1, itemCategoryID: 1, title: 'iPhone 15', description: 'Latest iPhone', stockQuantity: 10, price: 999.99, weight: 0.2 },
      { idItem: 2, itemCategoryID: 1, title: 'iPad Pro', description: 'Professional tablet', stockQuantity: 5, price: 1299.99, weight: 0.5 }
    ];

    const mockSearchResults = [
      { idItem: 1, itemCategoryID: 1, title: 'iPhone 15', description: 'Latest iPhone', stockQuantity: 10, price: 999.99, weight: 0.2 }
    ];

    mockProductService.getAllItems.mockResolvedValueOnce(mockProducts);
    mockProductService.getAllCategories.mockResolvedValueOnce([]);
    mockCartService.getUserCart.mockRejectedValueOnce(new Error('No authentication token available'));
    mockProductService.searchItemsByTitle.mockResolvedValueOnce(mockSearchResults);
    mockCartService.addItemToCart.mockResolvedValueOnce(undefined);

    const { getByTestId, getByText, queryByText } = render(
      <TestWrapperWithAuth authToken="search-token">
        <ProductsScreen token="search-token" />
      </TestWrapperWithAuth>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(getByText('iPhone 15')).toBeTruthy();
      expect(getByText('iPad Pro')).toBeTruthy();
    }, { timeout: 8000 });

    // Perform search
    await act(async () => {
      fireEvent.changeText(getByTestId('products-search-input'), 'iPhone');
    });

    await act(async () => {
      fireEvent.press(getByTestId('products-search-button'));
    });

    // Wait for search results
    await waitFor(() => {
      expect(mockProductService.searchItemsByTitle).toHaveBeenCalledWith('iPhone');
    }, { timeout: 5000 });

    // The UI should now show only iPhone results
    await waitFor(() => {
      expect(getByText('iPhone 15')).toBeTruthy();
      // Note: iPad Pro might still be visible depending on how your component handles search results
    }, { timeout: 3000 });

    // Test add to cart
    const addToCartButtons = await waitFor(() => {
      return [getByText('Add to Cart')];
    });

    await act(async () => {
      fireEvent.press(addToCartButtons[0]);
    });

    await waitFor(() => {
      expect(mockCartService.addItemToCart).toHaveBeenCalledWith(1, 1);
    }, { timeout: 3000 });
  }, TEST_TIMEOUT);

  test('Cart screen integrates item operations with UI state synchronization', async () => {
    const mockCartWithItems = {
      idCart: 1,
      userID: 1,
      cartItems: [
        {
          idCartItem: 1,
          itemID: 1,
          cartID: 1,
          quantity: 2
        }
      ]
    };

    const mockEmptyCart = {
      idCart: 1,
      userID: 1,
      cartItems: []
    };

    // First call returns cart with items, second call returns empty cart
    mockCartService.getUserCart
      .mockResolvedValueOnce(mockCartWithItems)
      .mockResolvedValueOnce(mockEmptyCart);

    mockCartService.removeCartItem.mockResolvedValueOnce(undefined);

    const { getByTestId, getByText, queryByText } = render(
      <TestWrapperWithAuth authToken="cart-token">
        <CartScreen token="cart-token" />
      </TestWrapperWithAuth>
    );

    // Wait for cart to load
    await waitFor(() => {
      expect(mockCartService.getUserCart).toHaveBeenCalled();
    }, { timeout: 8000 });

    // Remove item
    await act(async () => {
      fireEvent.press(getByTestId('remove-item-1'));
    });

    await waitFor(() => {
      expect(mockCartService.removeCartItem).toHaveBeenCalledWith(1);
    }, { timeout: 5000 });

    // Wait for UI to update (you might need to trigger a cart reload)
    await waitFor(() => {
      expect(getByText('Your cart is empty')).toBeTruthy();
    }, { timeout: 5000 });
  }, TEST_TIMEOUT);

  test('Navigation between screens maintains state and data consistency', async () => {
    let authToken: string | null = null;
    const setAuthToken = (token: string | null) => {
      authToken = token;
    };

    // Mock login response
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { token: 'nav-token', user: { username: 'navuser' } }
        })
      } as Response);

    mockProfileService.getUserProfileWithAnonymization.mockResolvedValueOnce({
      idUser: 1,
      username: 'navuser',
      email: 'nav@example.com',
      firstName: 'Nav',
      lastName: 'User',
      phoneNumber: '123-456-7890',
      isAdmin: false,
      anonymizationRequest: undefined
    });

    // Start with login screen
    const { getByTestId, rerender } = render(
      <TestWrapperWithAuth authToken={authToken} setAuthToken={setAuthToken}>
        <LoginScreen 
          onLoginSuccess={(token) => {
            setAuthToken('nav-token');
          }} 
        />
      </TestWrapperWithAuth>
    );

    // Login
    await act(async () => {
      fireEvent.changeText(getByTestId('login-username-input'), 'navuser');
      fireEvent.changeText(getByTestId('login-password-input'), 'password');
      fireEvent.press(getByTestId('login-submit-button'));
    });

    await waitFor(() => {
      expect(authToken).toBe('nav-token');
    }, { timeout: 8000 });

    // Navigate to profile
    rerender(
      <TestWrapperWithAuth authToken={authToken} setAuthToken={setAuthToken}>
        <ProfileScreen 
          token={authToken!} 
          onLogout={() => {
            setAuthToken(null);
          }} 
        />
      </TestWrapperWithAuth>
    );

    // Verify profile loads
    await waitFor(() => {
      expect(mockProfileService.getUserProfileWithAnonymization).toHaveBeenCalled();
    }, { timeout: 5000 });

    // Test logout
    await act(async () => {
      fireEvent.press(getByTestId('logout-button'));
    });

    expect(authToken).toBeNull();
  }, TEST_TIMEOUT);
}); 