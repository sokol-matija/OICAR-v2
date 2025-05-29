import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import BottomNavigation from './components/BottomNavigation';
import TestComponent from './components/TestComponent';
import { UserDTO } from './types/user';

type Screen = 'test' | 'login' | 'register' | 'home' | 'profile' | 'editProfile' | 'products' | 'cart' | 'orders';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserDTO | null>(null);

  const handleLoginSuccess = (token: string) => {
    setAuthToken(token);
    setCurrentScreen('home');
    console.log('Login successful! Token received:', token ? 'Yes' : 'No');
  };

  const handleRegisterSuccess = () => {
    setCurrentScreen('login');
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUserProfile(null);
    setCurrentScreen('login');
  };

  const handleNavigateToProfile = () => {
    setCurrentScreen('profile');
  };

  const handleEditProfile = (userProfile: UserDTO) => {
    setCurrentUserProfile(userProfile);
    setCurrentScreen('editProfile');
  };

  const handleProfileUpdated = (updatedProfile: UserDTO) => {
    setCurrentUserProfile(updatedProfile);
    setCurrentScreen('profile');
  };

  const handleCancelEdit = () => {
    setCurrentScreen('profile');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  // Navigation items for bottom navigation
  const getNavigationItems = () => [
    {
      id: 'home',
      icon: '🏠',
      label: 'Home',
      onPress: () => setCurrentScreen('home'),
    },
    {
      id: 'products',
      icon: '🛍️',
      label: 'Products',
      onPress: () => setCurrentScreen('products'),
    },
    {
      id: 'cart',
      icon: '🛒',
      label: 'Cart',
      onPress: () => setCurrentScreen('cart'),
    },
    {
      id: 'orders',
      icon: '📦',
      label: 'Orders',
      onPress: () => setCurrentScreen('orders'),
    },
    {
      id: 'profile',
      icon: '👤',
      label: 'Profile',
      onPress: () => setCurrentScreen('profile'),
    },
  ];

  // Screens that should show bottom navigation
  const screensWithBottomNav = ['home', 'products', 'cart', 'orders', 'profile'];
  const showBottomNav = authToken && screensWithBottomNav.includes(currentScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'test':
        return <TestComponent />;
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentScreen('register')}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => setCurrentScreen('login')}
          />
        );
      case 'home':
        return (
          <HomeScreen
            token={authToken || undefined}
            onLogout={handleLogout}
            onNavigateToProfile={handleNavigateToProfile}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            token={authToken || undefined}
            onEditProfile={handleEditProfile}
            onLogout={handleLogout}
          />
        );
      case 'editProfile':
        return currentUserProfile ? (
          <EditProfileScreen
            userProfile={currentUserProfile}
            token={authToken!}
            onProfileUpdated={handleProfileUpdated}
            onCancel={handleCancelEdit}
          />
        ) : null;
      case 'products':
        return (
          <View style={styles.placeholderContainer}>
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderTitle}>🛍️ Products</Text>
              <Text style={styles.placeholderText}>Coming Soon!</Text>
            </View>
          </View>
        );
      case 'cart':
        return (
          <View style={styles.placeholderContainer}>
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderTitle}>🛒 Cart</Text>
              <Text style={styles.placeholderText}>Coming Soon!</Text>
            </View>
          </View>
        );
      case 'orders':
        return (
          <View style={styles.placeholderContainer}>
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderTitle}>📦 Orders</Text>
              <Text style={styles.placeholderText}>Coming Soon!</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      {showBottomNav && (
        <BottomNavigation
          items={getNavigationItems()}
          activeItem={currentScreen}
        />
      )}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for bottom navigation
  },
  placeholderCard: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  placeholderTitle: {
    fontSize: 32,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: '500',
  },
});
