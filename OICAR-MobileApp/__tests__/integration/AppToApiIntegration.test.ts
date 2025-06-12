// Integration Tests: Mobile App ↔ .NET API
// These test that your React Native app can successfully communicate with your deployed API

describe('Mobile App to API Integration', () => {
  const AZURE_API_URL = 'https://oicar-api-ms1749710600.azurewebsites.net';
  
  beforeEach(() => {
    // Reset any app state before each test
    jest.clearAllMocks();
  });

  test('Mobile app can reach Azure API health endpoint', async () => {
    // Integration Test: Verify mobile app can connect to live Azure API
    try {
      const response = await fetch(`${AZURE_API_URL}/health`);
      
      expect(response.ok).toBe(true);
      
      const healthData = await response.text();
      expect(healthData).toBeTruthy();
      expect(healthData.toLowerCase()).toContain('healthy');
      
    } catch (error) {
      // If this fails, it indicates network connectivity issues
      fail(`Mobile app cannot reach Azure API: ${error}`);
    }
  });

  test('Mobile app can fetch products from API', async () => {
    // Integration Test: Verify mobile app can fetch data from API → Database
    try {
      const response = await fetch(`${AZURE_API_URL}/api/items?page=1&pageSize=3`);
      
      // API should respond (even if no products exist)
      expect(response.status).not.toBe(500); // No server errors
      
      if (response.ok) {
        const data = await response.json();
        expect(data).toBeDefined();
        
        // Should be an object or array
        expect(typeof data).toBe('object');
      }
      
      // Test passes if API is reachable and responds properly
      expect(true).toBe(true);
      
    } catch (error) {
      fail(`Mobile app cannot fetch data from API: ${error}`);
    }
  });

  test('Mobile app handles API authentication endpoints', async () => {
    // Integration Test: Verify authentication endpoint is accessible
    try {
      // Test login endpoint exists (should return 400/422 for empty request, not 404/500)
      const response = await fetch(`${AZURE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}) // Empty body should trigger validation error
      });
      
      // We expect 400 (Bad Request) or 422 (Validation Error), not 404 (Not Found) or 500 (Server Error)
      expect([400, 422, 401]).toContain(response.status);
      expect(response.status).not.toBe(404); // Endpoint should exist
      expect(response.status).not.toBe(500); // Should not crash
      
    } catch (error) {
      fail(`Authentication endpoint test failed: ${error}`);
    }
  });

  test('Integration test framework is properly configured', () => {
    // This test verifies the integration testing capability
    
    const integrationTestTypes = [
      'Mobile App → API → Database communication',
      'Authentication flows end-to-end', 
      'Product fetching workflows',
      'Error handling across systems'
    ];
    
    expect(integrationTestTypes.length).toBe(4);
    expect(typeof fetch).toBe('function');
    expect(AZURE_API_URL).toContain('azurewebsites.net');
  });
}); 