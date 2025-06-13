import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'success' | 'danger' | 'outline';
  loading?: boolean;
  testID?: string;
}

export default function CustomButton({ 
  title, 
  variant = 'primary', 
  loading = false, 
  style, 
  disabled,
  testID,
  ...props 
}: CustomButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'success':
        return styles.successButton;
      case 'danger':
        return styles.dangerButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    return variant === 'outline' ? styles.outlineText : styles.buttonText;
  };

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.button,
        getButtonStyle(),
        (disabled || loading) && styles.disabledButton,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      <Text style={[getTextStyle(), (disabled || loading) && styles.disabledText]}>
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  successButton: {
    backgroundColor: '#28a745',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.7,
  },
}); 