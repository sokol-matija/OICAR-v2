// 5 SIMPLE INTEGRATION TESTS - Service Layer Integration
// These test how different services work together (true integration testing)

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Simple service classes to test integration
class AuthService {
  private token: string | null = null;

  async login(username: string, password: string): Promise<boolean> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      this.token = data.token;
      return true;
    }
    return false;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

class UserService {
  constructor(private authService: AuthService) {}

  async getProfile(): Promise<any> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });

    return response.json();
  }

  async updateProfile(data: any): Promise<boolean> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return response.ok;
  }
}

class ProductService {
  constructor(private authService: AuthService) {}

  async searchProducts(query: string): Promise<any[]> {
    const headers: any = {};
    if (this.authService.isAuthenticated()) {
      headers['Authorization'] = `Bearer ${this.authService.getToken()}`;
    }

    const response = await fetch(`/api/products/search?q=${query}`, { headers });
    const data = await response.json();
    return data.products || [];
  }

  async getProductDetails(id: number): Promise<any> {
    const response = await fetch(`/api/products/${id}`);
    return response.json();
  }
}

class CartService {
  constructor(private authService: AuthService) {}

  async addToCart(productId: number, quantity: number): Promise<boolean> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId, quantity })
    });

    return response.ok;
  }

  async getCart(): Promise<any> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/cart', {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });

    return response.json();
  }

  async removeFromCart(itemId: number): Promise<boolean> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/cart/remove/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });

    return response.ok;
  }
}

class AppStateManager {
  private currentScreen: string = 'login';
  private user: any = null;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  async handleLogin(username: string, password: string): Promise<string> {
    const success = await this.authService.login(username, password);
    
    if (success) {
      this.user = await this.userService.getProfile();
      this.currentScreen = 'home';
      return 'home';
    } else {
      this.currentScreen = 'login';
      return 'login';
    }
  }

  getCurrentScreen(): string {
    return this.currentScreen;
  }

  getUser(): any {
    return this.user;
  }

  navigateTo(screen: string): void {
    if (screen !== 'login' && !this.authService.isAuthenticated()) {
      this.currentScreen = 'login';
    } else {
      this.currentScreen = screen;
    }
  }
}

describe('Service Integration Tests', () => {
  let authService: AuthService;
  let userService: UserService;
  let productService: ProductService;
  let cartService: CartService;
  let appStateManager: AppStateManager;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    
    // Create service instances (integration setup)
    authService = new AuthService();
    userService = new UserService(authService);
    productService = new ProductService(authService);
    cartService = new CartService(authService);
    appStateManager = new AppStateManager(authService, userService);
  });

  // TEST 1: Authentication service integrates with user service
  test('Auth service integrates with user service for profile access', async () => {
    // Mock login and profile responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'abc123' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'John Doe', email: 'john@example.com' })
      } as Response);

    // Test integration: Login → Get Profile
    const loginSuccess = await authService.login('testuser', 'password');
    expect(loginSuccess).toBe(true);
    expect(authService.isAuthenticated()).toBe(true);

    const profile = await userService.getProfile();
    
    // Verify integration worked
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/auth/login', expect.any(Object));
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/user/profile', expect.objectContaining({
      headers: { 'Authorization': 'Bearer abc123' }
    }));
    expect(profile.name).toBe('John Doe');
  });

  // TEST 2: Product search integrates with authentication state
  test('Product search integrates with auth state for personalized results', async () => {
    // Mock login and search responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'xyz789' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [{ name: 'iPhone', price: 999 }] })
      } as Response);

    // Login first
    await authService.login('user', 'pass');
    
    // Search products (should include auth header)
    const products = await productService.searchProducts('iPhone');

    // Verify integration: Auth token passed to search
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/products/search?q=iPhone', {
      headers: { 'Authorization': 'Bearer xyz789' }
    });
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe('iPhone');
  });

  // TEST 3: Cart operations integrate with authentication
  test('Cart operations integrate with authentication service', async () => {
    // Mock login, add to cart, and get cart responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'cart123' })
      } as Response)
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [{ id: 1, name: 'iPhone', quantity: 1 }] })
      } as Response);

    // Login and add to cart
    await authService.login('user', 'pass');
    const addSuccess = await cartService.addToCart(1, 1);
    const cart = await cartService.getCart();

    // Verify integration: All cart operations use auth token
    expect(addSuccess).toBe(true);
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/cart/add', expect.objectContaining({
      headers: expect.objectContaining({ 'Authorization': 'Bearer cart123' })
    }));
    expect(mockFetch).toHaveBeenNthCalledWith(3, '/api/cart', expect.objectContaining({
      headers: { 'Authorization': 'Bearer cart123' }
    }));
    expect(cart.items).toHaveLength(1);
  });

  // TEST 4: Profile update integrates with authentication and validation
  test('Profile update integrates authentication with data validation', async () => {
    // Mock login and profile update
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'profile456' })
      } as Response)
      .mockResolvedValueOnce({ ok: true } as Response);

    // Login and update profile
    await authService.login('user', 'pass');
    const updateSuccess = await userService.updateProfile({
      name: 'Jane Doe',
      email: 'jane@example.com'
    });

    // Verify integration: Profile update uses auth and sends data
    expect(updateSuccess).toBe(true);
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer profile456',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@example.com'
      })
    });
  });

  // TEST 5: App state management integrates multiple services
  test('App state manager integrates auth, user, and navigation services', async () => {
    // Mock login and profile responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'state789' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'App User', role: 'customer' })
      } as Response);

    // Test complete login flow integration
    const resultScreen = await appStateManager.handleLogin('appuser', 'password');

    // Verify integration: Login → Profile → Navigation
    expect(resultScreen).toBe('home');
    expect(appStateManager.getCurrentScreen()).toBe('home');
    expect(appStateManager.getUser().name).toBe('App User');
    expect(authService.isAuthenticated()).toBe(true);

    // Test navigation with auth check
    appStateManager.navigateTo('profile');
    expect(appStateManager.getCurrentScreen()).toBe('profile');

    // Test navigation without auth (should redirect to login)
    const unauthenticatedManager = new AppStateManager(new AuthService(), new UserService(new AuthService()));
    unauthenticatedManager.navigateTo('profile');
    expect(unauthenticatedManager.getCurrentScreen()).toBe('login');
  });
}); 