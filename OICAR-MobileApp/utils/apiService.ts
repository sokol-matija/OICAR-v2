import { CONFIG } from '../config';
import { JWTUtils } from './jwtUtils';

// API Service for OICAR Mobile App
export class ApiService {
  private baseURL: string;
  private timeout: number;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
    this.timeout = 30000; // 30 seconds for Android compatibility
    console.log('🚀 ApiService initialized with base URL:', this.baseURL);
    console.log('🕒 Request timeout set to:', this.timeout, 'ms');
  }

  // Set authentication token
  setAuthToken(token: string) {
    console.log('🔑 Setting auth token:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('🔑 Token length:', token?.length || 0);
    console.log('🔑 Token format check:', token?.split('.').length === 3 ? 'Valid JWT' : 'Invalid JWT');
    this.authToken = token;
  }

  // Clear authentication token
  clearAuthToken() {
    console.log('🔑 Clearing auth token');
    this.authToken = null;
  }

  // Get current token
  getAuthToken(): string | null {
    console.log('🔑 Getting auth token:', this.authToken ? `${this.authToken.substring(0, 20)}...` : 'null');
    return this.authToken;
  }

  // Get user ID from stored JWT token
  getUserIdFromToken(): number | null {
    if (!this.authToken) {
      console.log('❌ No token available for user ID extraction');
      return null;
    }
    
    console.log('🔍 Extracting user ID from stored token...');
    return JWTUtils.getUserIdFromToken(this.authToken);
  }

  // Check if token is valid JWT format
  isTokenValid(): boolean {
    if (!this.authToken) {
      return false;
    }
    
    const parts = this.authToken.split('.');
    const isValidFormat = parts.length === 3;
    console.log('🔍 Token validation - Parts:', parts.length, 'Valid:', isValidFormat);
    
    if (isValidFormat) {
      const isExpired = JWTUtils.isTokenExpired(this.authToken);
      console.log('🔍 Token expiration check - Expired:', isExpired);
      return !isExpired;
    }
    
    return false;
  }

  // Test network connectivity
  async testConnectivity(): Promise<boolean> {
    try {
      console.log('🌐 Testing network connectivity...');
      
      // Try multiple endpoints to diagnose the issue
      const endpoints = [
        `${this.baseURL.replace('/api', '')}/health`,
        'https://httpbin.org/status/200',
        'https://api.github.com',
      ];
      
      for (const testUrl of endpoints) {
        try {
          console.log('🌐 Testing connection to:', testUrl);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          console.log('🌐 Connectivity test response:', response.status);
          
          if (response.status === 200) {
            console.log('🌐 Network connectivity confirmed with:', testUrl);
            return true;
          }
        } catch (error) {
          console.log('🌐 Failed to connect to:', testUrl, error instanceof Error ? error.message : 'Unknown error');
        }
      }
      
      console.error('🌐 All connectivity tests failed');
      return false;
    } catch (error) {
      console.error('🌐 Connectivity test failed:', error);
      return false;
    }
  }

  // Create a timeout promise
  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  // Generic API request method
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`📡 Making ${options.method || 'GET'} request to: ${url}`);
    console.log(`📡 Request options:`, {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? 'Present' : 'None',
      timeout: this.timeout
    });
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add auth token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
      console.log('🔑 Token added to request headers');
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      // Create the fetch promise with timeout
      const fetchPromise = fetch(url, config);
      const timeoutPromise = this.createTimeoutPromise(this.timeout);
      
      console.log(`📡 Starting request with ${this.timeout}ms timeout...`);
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log(`📡 Response received - Status: ${response.status}`);
      console.log(`📡 Response headers:`, {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ API error (${response.status}):`, errorText);
        
        // Try to parse error response for better error messages
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            throw new Error(errorData.message);
          }
        } catch (parseError) {
          console.log(`⚠️ Could not parse error response as JSON`);
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Request successful - Response data type:`, typeof data);
      return data;
    } catch (error) {
      console.error(`💥 API request failed: ${endpoint}`, error);
      console.error(`💥 Error type:`, error?.constructor?.name);
      console.error(`💥 Error message:`, error instanceof Error ? error.message : 'Unknown error');
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          console.error(`🚨 Network connectivity issue detected`);
          console.error(`🚨 Trying to reach: ${url}`);
          throw new Error('Network connection failed. Please check your internet connection and try again.');
        }
        if (error.message.includes('timeout')) {
          console.error(`🚨 Request timeout detected`);
          throw new Error('Request timeout. The server took too long to respond.');
        }
      }
      
      throw error;
    }
  }

  // Authentication methods
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    // Convert email to username format for API
    const loginData = {
      username: credentials.email,
      password: credentials.password
    };
    
    console.log(`🔐 Login attempt with:`, {
      username: loginData.username,
      passwordLength: loginData.password.length
    });
    
    const response = await this.makeRequest<{ 
      success: boolean; 
      data: { 
        token: string; 
        user: any; 
      }; 
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
    
    // Store the token for future requests
    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    this.clearAuthToken();
    // Add any logout API call here if needed
  }

  // User profile methods
  async getProfile() {
    return this.makeRequest('/users/profile', {
      method: 'GET',
    });
  }

  async updateProfile(userData: any) {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Cart methods
  async getCart() {
    return this.makeRequest('/cart', {
      method: 'GET',
    });
  }

  async addToCart(itemId: number, quantity: number) {
    const cartItemData = {
      ItemID: itemId,
      Quantity: quantity,
    };
    
    return this.makeRequest('/cart/items', {
      method: 'POST',
      body: JSON.stringify(cartItemData),
    });
  }

  async removeFromCart(itemId: number) {
    return this.makeRequest(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Order methods
  async getOrders() {
    return this.makeRequest('/orders/my', {
      method: 'GET',
    });
  }

  async createOrder(orderData: any) {
    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Create a new seller item
  async createSellerItem(itemData: any) {
    console.log('🏪 === APISERVICE CREATE SELLER ITEM START ===');
    console.log('🏪 Item data:', JSON.stringify(itemData, null, 2));
    
    // Validate token
    if (!this.authToken) {
      console.log('❌ No auth token for item creation');
      throw new Error('Authentication required. Please log in again.');
    }

    if (!this.isTokenValid()) {
      console.log('❌ Invalid or expired token for item creation');
      throw new Error('Session expired. Please log in again.');
    }

    try {
      const response = await this.makeRequest('/items/seller', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });

      console.log('✅ Item created successfully:', response);
      console.log('🏪 === APISERVICE CREATE SELLER ITEM END ===');
      return response;
      
    } catch (error) {
      console.log('💥 Create item failed:', error);
      console.log('🏪 === APISERVICE CREATE SELLER ITEM END ===');
      throw error;
    }
  }

  // Checkout - create order from current cart
  async checkout() {
    console.log('🛒 === APISERVICE CHECKOUT START ===');
    
    // Validate token
    if (!this.authToken) {
      console.log('❌ No auth token for checkout');
      throw new Error('Authentication required. Please log in again.');
    }

    if (!this.isTokenValid()) {
      console.log('❌ Invalid or expired token for checkout');
      throw new Error('Session expired. Please log in again.');
    }

    // Get user ID from token
    const userId = this.getUserIdFromToken();
    if (!userId) {
      console.log('❌ Could not extract user ID from token');
      throw new Error('Could not verify user identity. Please log in again.');
    }

    console.log('✅ User ID for checkout:', userId);

    try {
      // Create order from cart using the same format as OrderService
      console.log('🛒 Creating order from cart...');
      const orderData = {
        ShippingAddress: "Default Shipping Address",
        BillingAddress: "Default Billing Address", 
        OrderNotes: "Order created from mobile app"
      };

      const orderResponse = await this.makeRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      console.log('✅ Order created successfully:', orderResponse);
      console.log('🛒 === APISERVICE CHECKOUT END ===');
      return orderResponse;
      
    } catch (error) {
      console.log('💥 Checkout failed:', error);
      console.log('🛒 === APISERVICE CHECKOUT END ===');
      throw error;
    }
  }

  // Product methods
  async getItems() {
    return this.makeRequest('/items', {
      method: 'GET',
    });
  }

  async getCategories() {
    return this.makeRequest('/categories', {
      method: 'GET',
    });
  }
}

// Export a singleton instance
export const apiService = new ApiService();
export default apiService; 