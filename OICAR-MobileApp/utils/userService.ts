import { UserDTO, UpdateUserDTO } from '../types/user';
import { API_BASE_URL } from './apiConfig';
import { apiService } from './apiService';

export class UserService {
  // Get token from apiService
  private static getToken(): string {
    const token = apiService.getAuthToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    return token;
  }

  static async getUserProfile(): Promise<UserDTO> {
    try {
      const token = this.getToken();
      const url = `${API_BASE_URL}/users/profile`;
      console.log('Get user profile:', { url });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Get profile response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Get profile error:', errorText);
        throw new Error(errorText || 'Failed to load profile');
      }

      const response_data = await response.json();
      console.log('Raw API response:', JSON.stringify(response_data, null, 2));
      
      // Handle the new API response format
      const data = response_data.data || response_data;
      console.log('Available fields:', Object.keys(data));
      
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
      
      console.log('Mapped profile data:', JSON.stringify(mappedData, null, 2));
      
      return mappedData;
    } catch (error) {
      console.log('Get profile exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load profile');
    }
  }

  static async updateUserProfile(userData: UpdateUserDTO): Promise<void> {
    try {
      const token = this.getToken();
      const url = `${API_BASE_URL}/users/profile`;
      const payload = {
        Username: userData.username,
        Email: userData.email,
        FirstName: userData.firstName,
        LastName: userData.lastName,
        PhoneNumber: userData.phoneNumber,
      };
      
      console.log('Update user profile:', { url, payload });
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Update profile response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Update profile error:', errorText);
        throw new Error(errorText || 'Failed to update profile');
      }

      console.log('Profile updated successfully');
    } catch (error) {
      console.log('Update profile exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  }
} 