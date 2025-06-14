import { CONFIG } from '../config';
import { JWTUtils } from './jwtUtils';

export class ApiService {
  private baseURL: string;
  private timeout: number;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
    this.timeout = 30000;
    console.log('ApiService initialized with base URL:', this.baseURL);
    console.log('Request timeout set to:', this.timeout, 'ms');
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  getUserIdFromToken(): number | null {
    if (!this.authToken) {
      return null;
    }
    
    return JWTUtils.getUserIdFromToken(this.authToken);
  }

  isTokenValid(): boolean {
    if (!this.authToken) {
      return false;
    }
    
    const parts = this.authToken.split('.');
    const isValidFormat = parts.length === 3;
    
    if (isValidFormat) {
      const isExpired = JWTUtils.isTokenExpired(this.authToken);
      return !isExpired;
    }
    
    return false;
  }

  async testConnectivity(): Promise<boolean> {
    try {
      console.log('Testing network connectivity...');
      
      const endpoints = [
        `${this.baseURL.replace('/api', '')}/health`,
        'https://httpbin.org/status/200',
        'https://api.github.com',
      ];
      
      for (const testUrl of endpoints) {
        try {
          console.log('Testing connection to:', testUrl);
          
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
          console.log('Connectivity test response:', response.status);
          
          if (response.status === 200) {
            console.log('Network connectivity confirmed with:', testUrl);
            return true;
          }
        } catch (error) {
          console.log('Failed to connect to:', testUrl, error instanceof Error ? error.message : 'Unknown error');
        }
      }
      
      console.error('All connectivity tests failed');
      return false;
    } catch (error) {
      console.error('Connectivity test failed:', error);
      return false;
    }
  }

  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const fetchPromise = fetch(url, config);
      const timeoutPromise = this.createTimeoutPromise(this.timeout);
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`API error (${response.status}):`, errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            throw new Error(errorData.message);
          }
        } catch (parseError) {
          // Continue with generic error
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          throw new Error('Network connection failed. Please check your internet connection and try again.');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Request timeout. The server took too long to respond.');
        }
      }
      
      throw error;
    }
  }

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
    const loginData = {
      username: credentials.email,
      password: credentials.password
    };
    
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
    
    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    this.clearAuthToken();
  }

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

  async createSellerItem(itemData: any) {
    if (!this.authToken) {
      throw new Error('Authentication required. Please log in again.');
    }

    if (!this.isTokenValid()) {
      throw new Error('Session expired. Please log in again.');
    }

    try {
      const response = await this.makeRequest('/items/seller', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });

      return response;
      
    } catch (error) {
      console.log('Create item failed:', error);
      throw error;
    }
  }

  async checkout() {
    if (!this.authToken) {
      throw new Error('Authentication required. Please log in again.');
    }

    if (!this.isTokenValid()) {
      throw new Error('Session expired. Please log in again.');
    }

    const userId = this.getUserIdFromToken();
    if (!userId) {
      throw new Error('Could not verify user identity. Please log in again.');
    }

    try {
      const orderData = {
        ShippingAddress: "Default Shipping Address",
        BillingAddress: "Default Billing Address", 
        OrderNotes: "Order created from mobile app"
      };

      const orderResponse = await this.makeRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      return orderResponse;
      
    } catch (error) {
      console.log('Checkout failed:', error);
      throw error;
    }
  }

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

  async submitAnonymizationRequest(requestData: { reason: string; notes?: string }) {
    if (!this.authToken) {
      throw new Error('Authentication required. Please log in again.');
    }

    if (!this.isTokenValid()) {
      throw new Error('Session expired. Please log in again.');
    }

    try {
      const payload = {
        Reason: requestData.reason,
        Notes: requestData.notes || '',
      };

      const response = await this.makeRequest('/users/anonymization-request', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response;
      
    } catch (error) {
      console.log('Submit anonymization request failed:', error);
      throw error;
    }
  }

  async getAnonymizationRequestStatus() {
    if (!this.authToken) {
      throw new Error('Authentication required. Please log in again.');
    }

    if (!this.isTokenValid()) {
      throw new Error('Session expired. Please log in again.');
    }

    try {
      const response = await this.makeRequest('/users/anonymization-request/status', {
        method: 'GET',
      });

      return response;
      
    } catch (error) {
      console.log('Get anonymization status failed:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();
export default apiService; 