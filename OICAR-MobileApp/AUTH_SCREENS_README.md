# OICAR Mobile App - Authentication Screens

This document describes the newly created login and register screens that match the web app's theme and integrate with the OICAR backend API.

## Features

### 🎨 **Design & Theme**
- **Matches Web App Theme**: Identical color scheme and styling to the Bootstrap-based web application
- **Brand Consistency**: Uses "Snjofkalo" branding with store icon and contact information
- **Bootstrap-Style Cards**: Clean card-based design with shadows and rounded corners
- **Color Scheme**: 
  - Primary Blue: `#007bff`
  - Success Green: `#28a745` 
  - Dark Header: `#343a40`
  - Background: `#f8f9fa`

### 🔐 **Authentication Flow**
- **Login Screen**: Email and password authentication
- **Register Screen**: Complete user registration with validation
- **Form Validation**: Real-time field validation with error messages
- **Loading States**: Visual feedback during API calls
- **Success/Error Handling**: User-friendly alerts and navigation

### 📱 **Components Created**

#### 1. **CustomInput** (`/components/CustomInput.tsx`)
- Reusable input component with label and error support
- Styled to match Bootstrap form controls
- TypeScript support with proper prop types

#### 2. **CustomButton** (`/components/CustomButton.tsx`)
- Multi-variant button component (primary, success, danger, outline)
- Loading state support
- Matches Bootstrap button styling

#### 3. **LoginScreen** (`/screens/LoginScreen.tsx`)
- Email and password login form
- Real-time validation
- API integration with error handling
- Navigation to register screen

#### 4. **RegisterScreen** (`/screens/RegisterScreen.tsx`)
- Complete registration form with all required fields:
  - Username
  - Email
  - Password
  - First Name
  - Last Name
  - Phone Number
- Comprehensive validation
- API integration
- Navigation to login screen after success

### 🌐 **API Integration**

#### **AuthService** (`/utils/authService.ts`)
Handles all authentication API calls:

```typescript
// Login
AuthService.login({ email, password })
// Returns: { token: string }

// Register  
AuthService.register({
  username,
  email, 
  password,
  firstName,
  lastName,
  phoneNumber
})
// Returns: success message string
```

#### **API Endpoints Used**
- **POST** `/api/auth/login` - User authentication
- **POST** `/api/auth/register` - User registration

### 🏗️ **Project Structure**

```
OICAR-MobileApp/
├── components/
│   ├── CustomInput.tsx      # Reusable input component
│   └── CustomButton.tsx     # Reusable button component
├── screens/
│   ├── LoginScreen.tsx      # Login screen
│   └── RegisterScreen.tsx   # Register screen
├── types/
│   └── auth.ts             # TypeScript interfaces
├── utils/
│   └── authService.ts      # API service for authentication
└── App.tsx                 # Main app with navigation
```

### 🚀 **Getting Started**

1. **Install Dependencies**:
   ```bash
   npm install expo-linear-gradient
   ```

2. **Run the App**:
   ```bash
   npm start
   ```

3. **Backend Setup**: 
   - Ensure the OICAR backend API is running on `http://localhost:7118`
   - The authentication endpoints should be available

### 🔧 **Configuration**

#### **API Base URL**
The API base URL is automatically configured based on the platform:

```typescript
// Android Emulator: http://10.0.2.2:7118/api
// iOS Simulator: http://localhost:7118/api  
// Web: http://localhost:7118/api
```

**Important for Android Emulator:**
- Android emulator can't reach `localhost` from the host machine
- Uses `10.0.2.2` to reach the host machine where your API server runs
- Make sure your API server is running on `http://localhost:7118`

#### **Network Troubleshooting**
If you get "Network request failed" errors:

1. **Verify API Server**: Check that your backend is running on `http://localhost:7118`
2. **Test API Endpoint**: 
   ```bash
   curl -X POST http://localhost:7118/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"Username":"test","Email":"test@test.com","Password":"password","FirstName":"Test","LastName":"User","PhoneNumber":"123456789"}'
   ```
3. **Check Console Logs**: The app logs all API calls with 🔍, 📡, ✅, and ❌ emojis
4. **Android Emulator**: Ensure you're using `10.0.2.2` instead of `localhost`

#### **Customization**
- Colors can be modified in the `styles` objects of each component
- Brand information can be updated in the header sections
- Validation rules can be adjusted in the `validateForm` functions

### 📝 **Form Validation**

#### **Login Form**
- Email: Required, valid email format
- Password: Required, minimum 6 characters

#### **Register Form**
- Username: Required, minimum 3 characters
- Email: Required, valid email format
- Password: Required, minimum 6 characters
- First Name: Required
- Last Name: Required
- Phone Number: Required, valid phone format

### 🎯 **Next Steps**

1. **Token Storage**: Implement secure token storage (AsyncStorage/SecureStore)
2. **Navigation**: Integrate with React Navigation for proper screen management
3. **User Context**: Create authentication context for app-wide state management
4. **Home Screen**: Develop main app screens after successful authentication
5. **Logout**: Implement logout functionality
6. **Password Recovery**: Add forgot password feature

### 🔗 **Integration with Existing Backend**

The screens are fully compatible with your existing OICAR backend API:

- **User Model**: Matches the `UserDTO` and authentication DTOs
- **Validation**: Consistent with backend validation requirements  
- **Error Handling**: Properly handles API error responses
- **Success Flow**: Integrates with JWT token-based authentication

The mobile authentication flow now provides the same experience as your web application while maintaining native mobile usability and performance. 