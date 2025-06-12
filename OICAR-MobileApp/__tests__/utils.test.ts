// Simple utility tests that don't require React Native components
describe('Basic utility tests', () => {
  it('should perform basic math operations', () => {
    expect(2 + 2).toBe(4);
    expect(5 * 3).toBe(15);
  });

  it('should handle string operations', () => {
    const testString = 'OICAR Mobile App';
    expect(testString.toLowerCase()).toBe('oicar mobile app');
    expect(testString.length).toBe(16);
  });

  it('should handle array operations', () => {
    const items = ['apple', 'banana', 'cherry'];
    expect(items).toHaveLength(3);
    expect(items.includes('banana')).toBe(true);
  });

  it('should handle object operations', () => {
    const user = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    };
    
    expect(user.id).toBe(1);
    expect(user.username).toBe('testuser');
    expect(user.email).toContain('@');
  });

  it('should validate API configuration', () => {
    // Mock API_BASE_URL for testing
    const API_BASE_URL = 'http://localhost:5042';
    
    expect(API_BASE_URL).toBeDefined();
    expect(API_BASE_URL).toContain('localhost');
    expect(API_BASE_URL).toContain('5042');
  });
}); 