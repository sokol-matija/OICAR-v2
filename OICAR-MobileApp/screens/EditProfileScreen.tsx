import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { UserService } from '../utils/userService';
import { UserDTO, UpdateUserDTO } from '../types/user';

interface EditProfileScreenProps {
  userProfile: UserDTO;
  token: string;
  onProfileUpdated?: (updatedProfile: UserDTO) => void;
  onCancel?: () => void;
}

export default function EditProfileScreen({ 
  userProfile, 
  token, 
  onProfileUpdated, 
  onCancel 
}: EditProfileScreenProps) {
  const [formData, setFormData] = useState<UpdateUserDTO>({
    idUser: userProfile.idUser,
    username: userProfile.username,
    email: userProfile.email,
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    phoneNumber: userProfile.phoneNumber,
  });
  const [errors, setErrors] = useState<Partial<UpdateUserDTO>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateUserDTO> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await UserService.updateUserProfile(formData, token);
      
      // Create updated profile object
      const updatedProfile: UserDTO = {
        ...userProfile,
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
      };

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => onProfileUpdated?.(updatedProfile) }
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof UpdateUserDTO, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

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
          {/* Edit Profile Card */}
          <View style={styles.card}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>✏️ Edit Profile</Text>
            </View>

            {/* Card Body */}
            <View style={styles.cardBody}>
              <CustomInput
                label="Username"
                value={formData.username}
                onChangeText={(value) => updateFormData('username', value)}
                error={errors.username}
                placeholder="Enter your username"
                autoCapitalize="none"
              />

              <CustomInput
                label="Email"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                error={errors.email}
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <CustomInput
                label="First Name"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                error={errors.firstName}
                placeholder="Enter your first name"
                autoCapitalize="words"
              />

              <CustomInput
                label="Last Name"
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                error={errors.lastName}
                placeholder="Enter your last name"
                autoCapitalize="words"
              />

              <CustomInput
                label="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(value) => updateFormData('phoneNumber', value)}
                error={errors.phoneNumber}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />

              <View style={styles.buttonSection}>
                <CustomButton
                  title="Update Profile"
                  variant="success"
                  loading={loading}
                  onPress={handleUpdateProfile}
                  style={styles.updateButton}
                />

                <CustomButton
                  title="Cancel"
                  variant="outline"
                  onPress={onCancel}
                  style={styles.cancelButton}
                />
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    paddingHorizontal: 20,
    paddingVertical: 32,
    paddingBottom: 100,
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
  buttonSection: {
    marginTop: 16,
    gap: 12,
  },
  updateButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginTop: 8,
  },
}); 