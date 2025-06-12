import { Platform } from 'react-native';

/**
 * Get the appropriate API base URL for the current platform
 * Currently configured to use the Azure production API
 */
export const getApiBaseUrl = (): string => {
  // Azure production API endpoint - same for all platforms
  return 'https://oicar-api-ms1749710600.azurewebsites.net/api';
};

// Export the base URL for direct usage
export const API_BASE_URL = getApiBaseUrl();

// Log current configuration
console.log('🔧 API Configuration:', {
  platform: Platform.OS,
  baseUrl: API_BASE_URL
}); 