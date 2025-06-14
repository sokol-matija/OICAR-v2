# Authentication Screens

This covers the login and register screens we built for the mobile app. They match the web app's look and connect to our API backend.

## What we built

### Design
We made sure the mobile screens look consistent with the web app:
- Same color scheme (blue primary, green success buttons, etc.)
- Uses the Snjofkalo branding
- Clean card-based layout with shadows
- Colors we used:
  - Primary Blue: #007bff
  - Success Green: #28a745 
  - Dark Header: #343a40
  - Background: #f8f9fa

### Authentication
- Login screen with email and password
- Register screen with all the required fields
- Form validation that shows errors in real time
- Loading indicators when making API calls
- Proper error handling and success messages

### Components we made

#### CustomInput (components/CustomInput.tsx)
A reusable input field that we use throughout the app:
- Has label and error message support
- Styled to look like Bootstrap form controls
- Proper TypeScript types

#### CustomButton (components/CustomButton.tsx)
Button component with different styles:
- Primary, success, danger, and outline variants
- Shows loading state when needed
- Matches the Bootstrap button look

#### LoginScreen (screens/LoginScreen.tsx)
The main login screen:
- Email and password fields
- Validates input in real time
- Connects to our API for authentication
- Can navigate to register screen

#### RegisterScreen (screens/RegisterScreen.tsx)
User registration form with these fields:
- Username
- Email
- Password
- First Name
- Last Name
- Phone Number

Has validation for all fields and connects to the API. After successful registration, it takes you back to the login screen.

### API Integration

We built an AuthService that handles all the authentication stuff:

For login:
```typescript
AuthService.login({ email, password })
// Returns: { token: string }
```

For registration:
```typescript
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

The API endpoints we use:
- POST /api/auth/login - for logging in
- POST /api/auth/register - for creating new accounts

### File Structure

Here's how we organized the authentication stuff:

```
OICAR-MobileApp/
├── components/
│   ├── CustomInput.tsx      # Input field component
│   └── CustomButton.tsx     # Button component
├── screens/
│   ├── LoginScreen.tsx      # Login screen
│   └── RegisterScreen.tsx   # Register screen
├── types/
│   └── auth.ts             # TypeScript types
├── utils/
│   └── authService.ts      # API calls for auth
└── App.tsx                 # Main app
```

### How to run it

First install the dependencies:
```bash
npm install expo-linear-gradient
```

Then start the app:
```bash
npm start
```

Make sure the backend API is running on http://localhost:7118 first, otherwise the authentication won't work.

### Configuration

The app automatically figures out the right API URL depending on where you're running it:

- Android emulator: http://10.0.2.2:7118/api (because Android emulator can't reach localhost)
- iOS simulator: http://localhost:7118/api  
- Web: http://localhost:7118/api

### Troubleshooting

If you get "Network request failed" errors:

1. Make sure the backend is running on http://localhost:7118
2. Test the API endpoint manually:
   ```bash
   curl -X POST http://localhost:7118/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"Username":"test","Email":"test@test.com","Password":"password","FirstName":"Test","LastName":"User","PhoneNumber":"123456789"}'
   ```
3. Check the console logs in your app - they'll show you what's happening with the API calls
4. If using Android emulator, make sure it's using 10.0.2.2 instead of localhost

### Customizing

You can change the colors by modifying the styles in each component. The brand info is in the header sections, and validation rules are in the validateForm functions.

### Form Validation

For the login form:
- Email: Required, needs to be a valid email
- Password: Required, at least 6 characters

For the register form:
- Username: Required, at least 3 characters
- Email: Required, valid email format
- Password: Required, at least 6 characters
- First Name: Required
- Last Name: Required
- Phone Number: Required, valid phone format

### What's next

Some things we could add later:
1. Secure token storage using AsyncStorage or SecureStore
2. Better navigation with React Navigation
3. Authentication context for the whole app
4. More screens after login
5. Logout functionality
6. Password recovery

### Backend Integration

The screens work with our existing OICAR backend API. They match the UserDTO and authentication DTOs, handle errors properly, and use JWT token-based authentication just like the web app. 