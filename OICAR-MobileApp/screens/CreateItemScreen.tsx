import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProductService } from '../utils/productService';
import apiService from '../utils/apiService';
import { ItemCategoryDTO, CreateItemFormData, ItemImageData, CreateItemRequest, CreateItemResponse } from '../types/product';

interface CreateItemScreenProps {
  token?: string;
  onItemCreated?: () => void;
  onCancel?: () => void;
}

export default function CreateItemScreen({ token, onItemCreated, onCancel }: CreateItemScreenProps) {
  const [formData, setFormData] = useState<CreateItemFormData>({
    title: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: 1,
    images: [],
  });

  const [categories, setCategories] = useState<ItemCategoryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant permission to access your photo library to add images to your items.'
      );
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoryList = await ProductService.getAllCategories();
      setCategories(categoryList);
      console.log('✅ Loaded categories for item creation:', categoryList.length);
    } catch (error) {
      console.log('💥 Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = 'Please enter a valid price greater than 0';
    } else if (price > 999999.99) {
      newErrors.price = 'Price cannot exceed $999,999.99';
    }

    const stock = parseInt(formData.stockQuantity);
    if (!formData.stockQuantity || isNaN(stock) || stock < 0) {
      newErrors.stockQuantity = 'Please enter a valid stock quantity (0 or higher)';
    } else if (stock > 99999) {
      newErrors.stockQuantity = 'Stock quantity cannot exceed 99,999';
    }

    if (formData.categoryId < 1) {
      newErrors.categoryId = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async (useCamera: boolean = false) => {
    try {
      if (formData.images.length >= 5) {
        Alert.alert('Image Limit', 'You can add up to 5 images per item.');
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
            allowsMultipleSelection: false,
          });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const imageData: ItemImageData = {
          uri: asset.uri,
          base64: asset.base64 || '',
          fileName: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        };

        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageData],
        }));

        console.log('📸 Image added:', {
          uri: asset.uri,
          size: asset.base64?.length || 0,
          fileName: imageData.fileName,
        });
      }
    } catch (error) {
      console.log('💥 Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const showImagePicker = () => {
    Alert.alert(
      'Add Image',
      'Choose how you want to add an image to your item',
      [
        { text: 'Camera', onPress: () => pickImage(true) },
        { text: 'Photo Library', onPress: () => pickImage(false) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    if (!token) {
      Alert.alert('Authentication Required', 'Please log in to create an item.');
      return;
    }

    setSubmitting(true);

    try {
      // Convert form data to API format
      const images = formData.images.map((img, index) => ({
        imageData: img.base64,
        imageOrder: index,
        fileName: img.fileName,
        contentType: img.type || 'image/jpeg',
      }));

      const requestData: CreateItemRequest = {
        itemCategoryID: formData.categoryId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        stockQuantity: parseInt(formData.stockQuantity),
        price: parseFloat(formData.price),
        isFeatured: false,
        isApproved: true, // Auto-approve seller items as requested
        images: images,
      };

      console.log('🏪 Creating item with data:', {
        ...requestData,
        images: `${images.length} images`,
      });

      const response = await apiService.createSellerItem(requestData) as CreateItemResponse;

      if (response.success) {
        Alert.alert(
          'Item Created! 🎉',
          'Your item has been created and is now available for purchase.',
          [
            {
              text: 'Create Another',
              onPress: () => {
                setFormData({
                  title: '',
                  description: '',
                  price: '',
                  stockQuantity: '',
                  categoryId: 1,
                  images: [],
                });
                setErrors({});
              },
            },
            {
              text: 'Done',
              onPress: () => onItemCreated?.(),
              style: 'default',
            },
          ]
        );
      } else {
        throw new Error(response.message || 'Failed to create item');
      }
    } catch (error) {
      console.log('💥 Error creating item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create item';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const CategoryPicker = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Category *</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScrollView}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.idItemCategory}
            style={[
              styles.categoryChip,
              formData.categoryId === category.idItemCategory && styles.categoryChipSelected,
            ]}
            onPress={() => setFormData(prev => ({ ...prev, categoryId: category.idItemCategory }))}
          >
            <Text style={[
              styles.categoryChipText,
              formData.categoryId === category.idItemCategory && styles.categoryChipTextSelected,
            ]}>
              {category.categoryName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}
    </View>
  );

  const ImageSection = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Images ({formData.images.length}/5)</Text>
      <Text style={styles.helperText}>Add photos to showcase your item</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
        {formData.images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.selectedImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {formData.images.length < 5 && (
          <TouchableOpacity style={styles.addImageButton} onPress={showImagePicker}>
            <Text style={styles.addImageText}>📷</Text>
            <Text style={styles.addImageLabel}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Create New Item</Text>
            <Text style={styles.subtitle}>Share your products with the world</Text>
          </View>

          <View style={styles.form}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="Enter item title"
                maxLength={200}
                autoCapitalize="words"
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.textArea, errors.description && styles.inputError]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Describe your item in detail"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={2000}
              />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>

            {/* Price and Stock Row */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Price * ($)</Text>
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  value={formData.price}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
                {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Stock Quantity *</Text>
                <TextInput
                  style={[styles.input, errors.stockQuantity && styles.inputError]}
                  value={formData.stockQuantity}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, stockQuantity: text }))}
                  placeholder="0"
                  keyboardType="number-pad"
                />
                {errors.stockQuantity && <Text style={styles.errorText}>{errors.stockQuantity}</Text>}
              </View>
            </View>

            {/* Category Picker */}
            <CategoryPicker />

            {/* Image Section */}
            <ImageSection />

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Creating...' : 'Create Item'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    minHeight: 100,
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  categoryScrollView: {
    maxHeight: 50,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  categoryChipSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#ffffff',
  },
  imageScrollView: {
    maxHeight: 120,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  addImageText: {
    fontSize: 24,
    marginBottom: 4,
  },
  addImageLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#28a745',
    marginLeft: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#94d3a2',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 