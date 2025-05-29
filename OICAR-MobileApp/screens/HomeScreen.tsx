import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HomeScreenProps {
  token?: string;
  onLogout?: () => void;
  onNavigateToProfile?: () => void;
}

export default function HomeScreen({ token, onLogout, onNavigateToProfile }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>📞 +385 91 772 9143</Text>
        <Text style={styles.topBarText}>✉️ support@snjofkalo.com</Text>
      </View>

      {/* Brand Header */}
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.brandContainer}
      >
        <View style={styles.brand}>
          <Text style={styles.brandIcon}>🏪</Text>
          <Text style={styles.brandText}>Snjofkalo</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          {/* Welcome Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>🎉 Welcome to Snjofkalo!</Text>
            </View>
            
            <View style={styles.cardBody}>
              <Text style={styles.welcomeText}>
                Your trusted online store for quality products. Browse our categories and find what you're looking for.
              </Text>
              
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Quick Actions:</Text>
                <Text style={styles.actionText}>🛍️ Browse Products</Text>
                <Text style={styles.actionText}>🛒 View Cart</Text>
                <Text style={styles.actionText}>📦 My Orders</Text>
                <Text style={styles.actionText}>👤 My Profile</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topBar: {
    backgroundColor: '#343a40',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarText: {
    color: '#ffffff',
    fontSize: 12,
  },
  brandContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  brandText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
    paddingBottom: 100, // Space for bottom navigation
  },
  contentContainer: {
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#007bff',
    marginBottom: 8,
    textAlign: 'center',
  },
}); 