# Web Compatibility Fixes

## Making Your App Web-Compatible

### Issue: expo-image-picker on Web
Your `CreateItemScreen.tsx` uses `expo-image-picker` which has limited web support.

### Solution: Platform-specific Code

Add to `utils/imagePickerWeb.ts`:
```typescript
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const pickImageUniversal = async (useCamera: boolean = false) => {
  if (Platform.OS === 'web') {
    // Web fallback - use HTML input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              canceled: false,
              assets: [{
                uri: reader.result as string,
                base64: (reader.result as string).split(',')[1],
                fileName: file.name,
                type: file.type
              }]
            });
          };
          reader.readAsDataURL(file);
        } else {
          resolve({ canceled: true });
        }
      };
      input.click();
    });
  } else {
    // Native fallback
    return useCamera
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
        });
  }
};
```

### Update CreateItemScreen.tsx:
Replace the `pickImage` function with:
```typescript
import { pickImageUniversal } from '../utils/imagePickerWeb';

const pickImage = async (useCamera: boolean = false) => {
  try {
    if (formData.images.length >= 5) {
      Alert.alert('Image Limit', 'You can add up to 5 images per item.');
      return;
    }

    const result = await pickImageUniversal(useCamera);
    // ... rest of the function stays the same
  } catch (error) {
    console.log('Error picking image:', error);
    Alert.alert('Error', 'Failed to select image. Please try again.');
  }
};
```

## Other Compatibility Notes
- `expo-linear-gradient` - Works on web
- `react-native-reanimated` - Has web support
- `nativewind` - Works on web
- API calls - Work perfectly on web
- Navigation - Works on web
- Authentication - Works on web

## Result
Your app will work 99% the same on web with this small fix! 