import { Platform } from 'react-native';
import { UserDTO, UpdateUserDTO } from '../types/user';

// Use different URLs for different platforms
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:7118/api';
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:7118/api';
  } else {
    return 'http://localhost:7118/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

export class UserService {
  static async getUserProfile(userId: number, token: string): Promise<UserDTO> {
    try {
      const url = `${API_BASE_URL}/user/${userId}`;
      console.log('🔍 Get user profile:', { url, userId });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Get profile response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get profile error:', errorText);
        throw new Error(errorText || 'Failed to load profile');
      }

      const data = await response.json();
      console.log('🔍 Raw API response:', JSON.stringify(data, null, 2));
      
      // Check what fields are actually in the response
      console.log('🔍 Available fields:', Object.keys(data));
      
      // Convert backend naming to frontend naming
      const mappedData = {
        idUser: data.IDUser || data.idUser || 0,
        username: data.Username || data.username || '',
        email: data.Email || data.email || '',
        firstName: data.FirstName || data.firstName || '',
        lastName: data.LastName || data.lastName || '',
        phoneNumber: data.PhoneNumber || data.phoneNumber || '',
        isAdmin: data.IsAdmin || data.isAdmin || false,
      };
      
      console.log('✅ Mapped profile data:', JSON.stringify(mappedData, null, 2));
      
      return mappedData;
    } catch (error) {
      console.log('💥 Get profile exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load profile');
    }
  }

  static async updateUserProfile(userData: UpdateUserDTO, token: string): Promise<void> {
    try {
      const url = `${API_BASE_URL}/user/${userData.idUser}`;
      const payload = {
        IDUser: userData.idUser,
        Username: userData.username,
        Email: userData.email,
        FirstName: userData.firstName,
        LastName: userData.lastName,
        PhoneNumber: userData.phoneNumber,
      };
      
      console.log('🔍 Update user profile:', { url, payload });
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Update profile response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Update profile error:', errorText);
        throw new Error(errorText || 'Failed to update profile');
      }

      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.log('💥 Update profile exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  }
} 