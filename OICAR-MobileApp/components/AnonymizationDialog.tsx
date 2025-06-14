import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from './CustomButton';
import { ProfileService } from '../utils/profileService';
import { CreateAnonymizationRequest } from '../types/anonymization';

interface AnonymizationDialogProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AnonymizationDialog({
  visible,
  onClose,
  onSuccess,
}: AnonymizationDialogProps) {
  const [formData, setFormData] = useState<CreateAnonymizationRequest>({
    reason: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ reason?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { reason?: string } = {};

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for anonymization';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await ProfileService.submitAnonymizationRequest(formData);
      
      Alert.alert(
        'Request Submitted',
        'Your anonymization request has been submitted successfully. We will review it and contact you soon.',
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
              onSuccess();
            },
          },
        ]
      );
    } catch (error) {
      console.log('Anonymization request failed:', error);
      Alert.alert(
        'Request Failed',
        error instanceof Error ? error.message : 'Failed to submit anonymization request. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ reason: '', notes: '' });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <LinearGradient
            colors={['#dc3545', '#c82333']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Request Data Anonymization</Text>
              <Text style={styles.headerSubtitle}>
                This will permanently remove your personal data from our system
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.warningCard}>
              <Text style={styles.warningIcon}>!</Text>
              <Text style={styles.warningTitle}>Important Notice</Text>
              <Text style={styles.warningText}>
                • This action cannot be undone{'\n'}
                • All your personal data will be permanently removed{'\n'}
                • You will not be able to access your account after anonymization{'\n'}
                • This process may take 7-30 days to complete
              </Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Tell us why you want to anonymize your data:</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Reason *</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    errors.reason && styles.inputError
                  ]}
                  value={formData.reason}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, reason: text }));
                    if (errors.reason) {
                      setErrors(prev => ({ ...prev, reason: undefined }));
                    }
                  }}
                  placeholder="Please explain why you want to anonymize your data (minimum 10 characters)"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
                {errors.reason && (
                  <Text style={styles.errorText}>{errors.reason}</Text>
                )}
                <Text style={styles.characterCount}>
                  {formData.reason.length}/500 characters
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.notes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                  placeholder="Any additional information you'd like to provide"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={300}
                />
                <Text style={styles.characterCount}>
                  {formData.notes?.length || 0}/300 characters
                </Text>
              </View>
            </View>

            <View style={styles.gdprCard}>
              <Text style={styles.gdprTitle}>Your Rights Under GDPR</Text>
              <Text style={styles.gdprText}>
                You have the right to request erasure of your personal data under Article 17 of the GDPR. 
                We will process your request within 30 days and notify you of the outcome.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <CustomButton
                title="Submit Request"
                variant="danger"
                loading={loading}
                onPress={handleSubmit}
                style={styles.submitButton}
                testID="submit-anonymization-button"
              />

              <CustomButton
                title="Cancel"
                variant="outline"
                onPress={handleClose}
                style={styles.cancelButton}
                testID="cancel-anonymization-button"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  warningCard: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    fontSize: 14,
    color: '#333',
    minHeight: 80,
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 5,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 5,
  },
  gdprCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#bbdefb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 30,
  },
  gdprTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 8,
  },
  gdprText: {
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 10,
  },
  submitButton: {
    backgroundColor: '#dc3545',
  },
  cancelButton: {
    borderColor: '#6c757d',
  },
}); 