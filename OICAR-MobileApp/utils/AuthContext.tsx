import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from './apiService';

// Define the user type
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  isAdmin: boolean;
}

// Define the authentication context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const token = apiService.getAuthToken();

  // Initialize auth state (check for existing session)
  useEffect(() => {
    // You might want to check AsyncStorage for saved token here
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('🔐 Starting login process...');
      
      // Test connectivity first
      console.log('🌐 Testing network connectivity before login...');
      const isConnected = await apiService.testConnectivity();
      if (!isConnected) {
        throw new Error('Network connectivity test failed. Please check your internet connection.');
      }
      console.log('🌐 Network connectivity test passed');
      
      const response = await apiService.login({ email, password });
      console.log('🔐 Login response:', response);
      
      if (response.success && response.data) {
        // Extract user data from the response
        const userData = response.data.user;
        const mappedUser: User = {
          id: userData.idUser || userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
          isAdmin: userData.isAdmin || false
        };
        
        setUser(mappedUser);
        console.log('🔐 User logged in successfully:', mappedUser);
        // You might want to save token to AsyncStorage here
      } else {
        throw new Error('Login failed: Invalid response format');
      }
    } catch (error) {
      console.error('💥 Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      // Auto-login after successful registration
      await login(userData.email, userData.password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiService.logout();
      setUser(null);
      console.log('🔐 User logged out successfully');
      // You might want to clear AsyncStorage here
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 