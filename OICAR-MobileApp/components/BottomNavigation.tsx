import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

interface NavigationItem {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
}

interface BottomNavigationProps {
  items: NavigationItem[];
  activeItem?: string;
}

export default function BottomNavigation({ items, activeItem }: BottomNavigationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              activeItem === item.id && styles.activeNavItem
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.navIcon,
              activeItem === item.id && styles.activeNavIcon
            ]}>
              {item.icon}
            </Text>
            <Text style={[
              styles.navLabel,
              activeItem === item.id && styles.activeNavLabel
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activeNavItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  activeNavIcon: {
    transform: [{ scale: 1.1 }],
  },
  navLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#007bff',
    fontWeight: '600',
  },
}); 