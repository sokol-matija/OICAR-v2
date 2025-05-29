import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../components/CustomButton';

interface HomeScreenProps {
  token?: string;
  onLogout?: () => void;
}

export default function HomeScreen({ token, onLogout }: HomeScreenProps) {
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
              <Text style={styles.cardTitle}>🎉 Welcome!</Text>
            </View>
            
            <View style={styles.cardBody}>
              <Text style={styles.welcomeText}>
                You have successfully logged in to the OICAR mobile application!
              </Text>
              
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Authentication Status:</Text>
                <Text style={styles.statusText}>✅ Logged In</Text>
              </View>

              {token && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Token Preview:</Text>
                  <Text style={styles.tokenText} numberOfLines={3}>
                    {token.substring(0, 50)}...
                  </Text>
                </View>
              )}

              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Available Features:</Text>
                <Text style={styles.featureText}>• User Authentication ✅</Text>
                <Text style={styles.featureText}>• API Integration ✅</Text>
                <Text style={styles.featureText}>• Form Validation ✅</Text>
                <Text style={styles.featureText}>• Theme Matching ✅</Text>
              </View>

              <CustomButton
                title="Logout"
                variant="outline"
                onPress={onLogout}
                style={styles.logoutButton}
              />
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
    backgroundColor: '#28a745',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 24,
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
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '500',
  },
  tokenText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  featureText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  logoutButton: {
    marginTop: 20,
  },
}); 