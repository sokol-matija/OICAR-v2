import { UserDTO } from '../types/user';
import { AnonymizationRequest, CreateAnonymizationRequest, AnonymizationResponse, UserProfileWithAnonymization } from '../types/anonymization';
import { API_BASE_URL } from './apiConfig';
import { apiService } from './apiService';

export class ProfileService {
  // Get token from apiService
  private static getToken(): string {
    const token = apiService.getAuthToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    return token;
  }

  /**
   * Get user profile with anonymization request status
   */
  static async getUserProfileWithAnonymization(): Promise<UserProfileWithAnonymization> {
    try {
      const token = this.getToken();
      const url = `${API_BASE_URL}/users/profile`;
      console.log('🔍 Get user profile with anonymization:', { url });
      
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

      const response_data = await response.json();
      console.log('🔍 Raw API response:', JSON.stringify(response_data, null, 2));
      
      // Handle the API response format
      const data = response_data.data || response_data;
      
      // Convert backend naming to frontend naming
      const mappedData: UserProfileWithAnonymization = {
        idUser: data.IDUser || data.idUser || 0,
        username: data.Username || data.username || '',
        email: data.Email || data.email || '',
        firstName: data.FirstName || data.firstName || '',
        lastName: data.LastName || data.lastName || '',
        phoneNumber: data.PhoneNumber || data.phoneNumber || '',
        isAdmin: data.IsAdmin || data.isAdmin || false,
        hasAnonymizationRequest: data.HasAnonymizationRequest || data.hasAnonymizationRequest || false,
        anonymizationRequest: data.AnonymizationRequest || data.anonymizationRequest ? {
          idRequest: data.AnonymizationRequest?.IDRequest || data.anonymizationRequest?.idRequest,
          userID: data.AnonymizationRequest?.UserID || data.anonymizationRequest?.userID,
          reason: data.AnonymizationRequest?.Reason || data.anonymizationRequest?.reason,
          requestDate: data.AnonymizationRequest?.RequestDate || data.anonymizationRequest?.requestDate,
          status: data.AnonymizationRequest?.Status || data.anonymizationRequest?.status,
          processedDate: data.AnonymizationRequest?.ProcessedDate || data.anonymizationRequest?.processedDate,
          notes: data.AnonymizationRequest?.Notes || data.anonymizationRequest?.notes,
        } : undefined,
      };
      
      console.log('✅ Mapped profile data with anonymization:', JSON.stringify(mappedData, null, 2));
      
      return mappedData;
    } catch (error) {
      console.log('💥 Get profile exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load profile');
    }
  }

  /**
   * Submit an anonymization request
   */
  static async submitAnonymizationRequest(requestData: CreateAnonymizationRequest): Promise<AnonymizationResponse> {
    try {
      const token = this.getToken();
      const url = `${API_BASE_URL}/users/anonymization-request`;
      
      const payload = {
        Reason: requestData.reason,
        Notes: requestData.notes || '',
      };
      
      console.log('🔍 Submit anonymization request:', { url, payload });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Submit anonymization request response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Submit anonymization request error:', errorText);
        throw new Error(errorText || 'Failed to submit anonymization request');
      }

      const response_data = await response.json();
      console.log('✅ Anonymization request submitted:', JSON.stringify(response_data, null, 2));
      
      // Handle the API response format
      const data = response_data.data || response_data;
      
      return {
        success: response_data.success !== false,
        data: data ? {
          idRequest: data.IDRequest || data.idRequest,
          userID: data.UserID || data.userID,
          reason: data.Reason || data.reason,
          requestDate: data.RequestDate || data.requestDate,
          status: data.Status || data.status,
          processedDate: data.ProcessedDate || data.processedDate,
          notes: data.Notes || data.notes,
        } : undefined,
        message: response_data.message || 'Anonymization request submitted successfully',
      };
    } catch (error) {
      console.log('💥 Submit anonymization request exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to submit anonymization request');
    }
  }

  /**
   * Get anonymization request status for current user
   */
  static async getAnonymizationRequestStatus(): Promise<AnonymizationRequest | null> {
    try {
      const token = this.getToken();
      const url = `${API_BASE_URL}/users/anonymization-request/status`;
      console.log('🔍 Get anonymization request status:', { url });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Get anonymization status response status:', response.status);

      if (response.status === 404) {
        // No anonymization request found
        console.log('ℹ️ No anonymization request found for user');
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get anonymization status error:', errorText);
        throw new Error(errorText || 'Failed to get anonymization request status');
      }

      const response_data = await response.json();
      console.log('✅ Anonymization request status:', JSON.stringify(response_data, null, 2));
      
      // Handle the API response format
      const data = response_data.data || response_data;
      
      return {
        idRequest: data.IDRequest || data.idRequest,
        userID: data.UserID || data.userID,
        reason: data.Reason || data.reason,
        requestDate: data.RequestDate || data.requestDate,
        status: data.Status || data.status,
        processedDate: data.ProcessedDate || data.processedDate,
        notes: data.Notes || data.notes,
      };
    } catch (error) {
      console.log('💥 Get anonymization status exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get anonymization request status');
    }
  }
} 