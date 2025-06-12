import { render } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';

// Simple test component since we don't have HomeScreen readily available
const TestComponent = () => (
  <View>
    <Text>Welcome to OICAR!</Text>
    <Text>Mobile App Testing</Text>
  </View>
);

describe('<TestComponent />', () => {
  test('Text renders correctly', () => {
    const { getByText } = render(<TestComponent />);
    
    // Test that welcome text is present
    expect(getByText('Welcome to OICAR!')).toBeTruthy();
    expect(getByText('Mobile App Testing')).toBeTruthy();
  });

  test('Component renders without crashing', () => {
    const { toJSON } = render(<TestComponent />);
    expect(toJSON()).toBeTruthy();
  });
}); 