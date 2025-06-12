// Integration Tests: Mobile App ↔ .NET API
// These test that your React Native app can successfully communicate with your deployed API

describe('Mobile App to API Integration', () => {
  const API_BASE_URL = 'https://your-api-url.azurewebsites.net'; // Replace with your actual Azure API URL
  
  beforeEach(() => {
    // Reset any app state before each test
    jest.clearAllMocks();
  });

  test('App can fetch products from API', async () => {
    // This tests: Mobile App → API Request → Get Products → Display in App
    
    const response = await fetch(`${API_BASE_URL}/api/items`);
    const products = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    
    // Verify product structure matches what app expects
    if (products.length > 0) {
      const firstProduct = products[0];
      expect(firstProduct).toHaveProperty('id');
      expect(firstProduct).toHaveProperty('title');
      expect(firstProduct).toHaveProperty('price');
    }
  });

  test('App can authenticate user with API', async () => {
    // This tests: Mobile Login → API Authentication → Database Check → Return Token
    
    const loginData = {
      email: 'test@example.com',
      password: 'TestPassword123!'
    };

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    // Note: This will fail if test user doesn't exist - you'd need test data setup
    expect([200, 401]).toContain(response.status); // Either success or invalid credentials
    
    if (response.status === 200) {
      const result = await response.json();
      expect(result).toHaveProperty('token');
    }
  });

  test('App can add item to cart via API', async () => {
    // This tests: Add to Cart Action → API Call → Database Update → Response
    
    const cartItem = {
      productId: 1,
      quantity: 2
    };

    const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer your-test-token' // You'd need auth for real test
      },
      body: JSON.stringify(cartItem)
    });

    // Check that API responds appropriately (success or auth required)
    expect([200, 201, 401]).toContain(response.status);
  });

  test('App handles API errors gracefully', async () => {
    // This tests: App → Bad API Request → Error Handling → User Feedback
    
    const response = await fetch(`${API_BASE_URL}/api/nonexistent-endpoint`);
    
    expect(response.status).toBe(404);
    
    // In a real app, you'd test that error messages show to user
    const errorData = await response.text();
    expect(errorData).toBeDefined();
  });
}); 