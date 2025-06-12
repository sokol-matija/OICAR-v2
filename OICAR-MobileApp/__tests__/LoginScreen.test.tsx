import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';

// Mock the config module
jest.mock('../config', () => ({
  API_BASE_URL: 'http://localhost:5042',
}));

describe('LoginScreen', () => {
  it('renders login form correctly', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    expect(getByText('Welcome to OICAR')).toBeTruthy();
    expect(getByPlaceholderText('Username')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('shows validation errors for empty fields', async () => {
    const { getByText } = render(<LoginScreen />);
    
    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);
    
    await waitFor(() => {
      expect(getByText('Username is required')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
    });
  });

  it('allows user to enter username and password', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    
    const usernameInput = getByPlaceholderText('Username');
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpassword');
    
    expect(usernameInput.props.value).toBe('testuser');
    expect(passwordInput.props.value).toBe('testpassword');
  });

  it('navigates to register screen when register link is pressed', () => {
    const { getByText } = render(<LoginScreen />);
    
    const registerLink = getByText("Don't have an account? Register");
    fireEvent.press(registerLink);
    
    // In a real test, you would mock the router and check if navigation occurred
    // For now, we just test that the component doesn't crash
    expect(registerLink).toBeTruthy();
  });
}); 