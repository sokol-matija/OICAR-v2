import CONFIG from '../config';

// API Service for OICAR Mobile App
export class ApiService {
  private baseURL: string;
  private timeout: number;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
    this.timeout = CONFIG.API_TIMEOUT;
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.authToken = token;
  }

  // Clear authentication token
  clearAuthToken() {
    this.authToken = null;
  }

  // Generic API request method
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add auth token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
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
    
    const response = await this.makeRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
    
    // Store the token for future requests
    if (response.token) {
      this.setAuthToken(response.token);
    }
    
    return response;
  }

  async logout() {
    this.clearAuthToken();
    // Add any logout API call here if needed
  }

  // User profile methods
  async getProfile() {
    return this.makeRequest('/user/profile', {
      method: 'GET',
    });
  }

  async updateProfile(userData: any) {
    return this.makeRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Add more API methods as needed...
}

// Export a singleton instance
export const apiService = new ApiService();
export default apiService; 