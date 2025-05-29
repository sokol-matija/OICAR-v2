import { LoginDTO, RegisterDTO, AuthResponse, AuthError } from '../types/auth';
import { Platform } from 'react-native';

// Use different URLs for different platforms
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Android emulator needs 10.0.2.2 to reach host machine
    return 'http://10.0.2.2:7118/api';
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return 'http://localhost:7118/api';
  } else {
    // Web can use localhost
    return 'http://localhost:7118/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

export class AuthService {
  static async login(loginData: LoginDTO): Promise<AuthResponse> {
    try {
      const url = `${API_BASE_URL}/auth/login`;
      const payload = {
        Email: loginData.email,
        Password: loginData.password,
      };
      
      console.log('🔍 Login attempt:', { url, payload: { ...payload, Password: '[HIDDEN]' } });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Login error:', errorText);
        throw new Error(errorText || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ Login success - Full response:', data);
      console.log('🔑 Token value:', data.Token || data.token);
      return { token: data.Token || data.token };
    } catch (error) {
      console.log('💥 Login exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  static async register(registerData: RegisterDTO): Promise<string> {
    try {
      const url = `${API_BASE_URL}/auth/register`;
      const payload = {
        Username: registerData.username,
        Email: registerData.email,
        Password: registerData.password,
        FirstName: registerData.firstName,
        LastName: registerData.lastName,
        PhoneNumber: registerData.phoneNumber,
      };
      
      console.log('🔍 Register attempt:', { url, payload: { ...payload, Password: '[HIDDEN]' } });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Register response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Register error:', errorText);
        throw new Error(errorText || 'Registration failed');
      }

      const result = await response.text();
      console.log('✅ Register success:', result);
      return result;
    } catch (error) {
      console.log('💥 Register exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  }
} 