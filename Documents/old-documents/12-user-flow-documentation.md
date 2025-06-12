# User Flow Documentation - WebShop Project

## 1. User Registration Flow

### Flow Diagram
```
Start → Landing Page → Register Button → Registration Form → Submit → Validation → Success/Error → Dashboard/Fix Errors
```

### Detailed Steps

1. **User Lands on Homepage**
   - Sees "Register" or "Sign Up" button in navigation
   - Alternative: Prompted to register when trying to checkout

2. **Registration Form**
   - Required Fields:
     - Username (unique)
     - Email (unique)
     - Password
     - Confirm Password
     - First Name
     - Last Name
   - Optional Fields:
     - Phone Number
   - Form includes:
     - Password strength indicator
     - Terms and conditions checkbox
     - "Already have an account? Login" link

3. **Form Submission**
   - Client-side validation first
   - API call to `/api/auth/register`
   - Server-side validation

4. **Validation Process**
   ```
   Check Email Format → Check Email Uniqueness → Check Username Uniqueness → 
   Validate Password Strength → Check Matching Passwords → Create User
   ```

5. **Success Path**
   - User account created
   - Password hashed with salt
   - Automatic cart creation
   - Welcome email sent
   - Auto-login with JWT token
   - Redirect to dashboard

6. **Error Handling**
   - Email already exists → "Email already registered. Login instead?"
   - Username taken → "Username unavailable. Try another."
   - Weak password → "Password must contain..."
   - Form validation errors → Inline error messages

### API Endpoints
```
POST /api/auth/register
Body: {
  "username": "string",
  "email": "string", 
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string" (optional)
}
```

---

## 2. User Login Flow

### Flow Diagram
```
Start → Landing Page → Login Button → Login Form → Submit → Validation → Success/Error → Dashboard/Fix Errors
```

### Detailed Steps

1. **Access Login Page**
   - Click "Login" in navigation
   - Redirected when accessing protected pages
   - Alternative: Mini login form in dropdown

2. **Login Form**
   - Email/Username field
   - Password field
   - "Remember me" checkbox
   - "Forgot password?" link
   - "Create account" link

3. **Authentication Process**
   ```
   Submit Credentials → Find User by Email → Verify Password Hash → 
   Generate JWT Token → Create Session → Return Token
   ```

4. **Success Path**
   - JWT token generated
   - Token stored in httpOnly cookie
   - User redirected to:
     - Original requested page (if redirected)
     - Dashboard (if direct login)
   - Cart synchronized

5. **Error Handling**
   - Invalid credentials → "Invalid email or password"
   - Account locked → "Account locked. Contact support."
   - Account not verified → "Please verify your email"

### API Endpoints
```
POST /api/auth/login
Body: {
  "email": "string",
  "password": "string"
}
Response: {
  "token": "JWT_token"
}
```

---

## 3. Product CRUD Operations

### Customer Product Operations

#### Browse Products
```
Homepage → Browse Products → Category/Search → Product List → Filter/Sort → Product Details
```

#### View Product Details
```
Product List → Click Product → Product Details Page → View Images/Description/Reviews → Add to Cart
```

#### Search Products
```
Search Bar → Enter Query → View Results → Apply Filters → Sort Results → Select Product
```

### Admin Product Operations

#### Create Product
1. **Access Admin Dashboard**
   - Login as admin
   - Navigate to Products section
   - Click "Add New Product"

2. **Product Creation Form**
   ```
   Enter Basic Info → Add Images → Set Pricing → Set Inventory → 
   Assign Category → Add Tags → Save Product
   ```

3. **Required Fields**
   - Title
   - Description  
   - Price
   - Stock Quantity
   - Category
   - Weight

4. **API Endpoint**
   ```
   POST /api/products
   Headers: Authorization: Bearer {token}
   Body: {
     "title": "string",
     "description": "string",
     "price": number,
     "stockQuantity": number,
     "categoryId": number,
     "weight": number
   }
   ```

#### Read/List Products
```
Admin Dashboard → Products → View All Products → Search/Filter → View Details
```

#### Update Product
1. **Edit Product Flow**
   ```
   Products List → Click Edit → Modify Details → Save Changes → Confirmation
   ```

2. **API Endpoint**
   ```
   PUT /api/products/{id}
   Headers: Authorization: Bearer {token}
   Body: {
     "title": "string",
     "description": "string",
     "price": number,
     "stockQuantity": number,
     "categoryId": number,
     "weight": number
   }
   ```

#### Delete Product
1. **Delete Flow**
   ```
   Products List → Click Delete → Confirm Dialog → Delete → Success Message
   ```

2. **API Endpoint**
   ```
   DELETE /api/products/{id}
   Headers: Authorization: Bearer {token}
   ```

---

## 4. Order Management Flow

### Customer Order Flow

#### Create Order
```
Shopping Cart → Checkout → Shipping Info → Payment → Order Confirmation → Thank You Page
```

#### View Orders
```
Account Dashboard → My Orders → Order List → Order Details
```

#### Track Order
```
Order Details → View Status → Track Shipment → View History
```

### Admin Order Flow

#### Process Orders
```
Admin Dashboard → Orders → New Orders → Process Order → Update Status → Notify Customer
```

#### Manage Orders
```
Orders List → Search/Filter → View Details → Update Status → Generate Invoice
```

---

## 5. Category CRUD Operations

### Create Category
```
Admin Dashboard → Categories → Add Category → Enter Name → Save
```

### Update Category
```
Categories List → Edit → Update Details → Save Changes
```

### Delete Category
```
Categories List → Delete → Confirm → Success Message
```

### API Endpoints
```
POST   /api/itemcategory
GET    /api/itemcategory
GET    /api/itemcategory/{id}
PUT    /api/itemcategory/{id}
DELETE /api/itemcategory/{id}
```

---

## 6. Shopping Cart Flow

### Add to Cart
```
Product Page → Click "Add to Cart" → Update Cart Quantity → Show Success Message → Update Mini Cart
```

### Manage Cart
```
View Cart → Update Quantities → Remove Items → Calculate Total → Proceed to Checkout
```

### Checkout Process
```
Cart Review → Login/Register → Shipping Details → Payment Details → 
Review Order → Place Order → Confirmation
```

---

## 7. User Account Management

### View Profile
```
User Menu → My Account → View Profile → See User Details
```

### Edit Profile
```
My Account → Edit Profile → Update Info → Save Changes → Success Message
```

### Change Password
```
Account Settings → Change Password → Enter Current → Enter New → Confirm New → Save
```

### Delete Account (GDPR)
```
Account Settings → Delete Account → Confirm → Enter Password → 
Final Confirm → Account Deleted
```

---

## 8. Security Considerations

### Authentication Flow
1. All requests include JWT token in header
2. Token validated on each request
3. Token expires after set duration
4. Refresh token mechanism for extended sessions

### Protected Routes
- All admin routes require "Admin" role
- User-specific routes validate user ID
- Cart operations tied to authenticated user

### Error Handling
- Generic error messages for security
- Detailed logs for debugging
- Rate limiting on authentication endpoints

---

## 9. State Management

### Session State
- JWT token in httpOnly cookie
- User role and permissions
- Shopping cart state
- Recently viewed products

### Persistent State
- User preferences
- Saved addresses
- Order history
- Wishlist items

---

## 10. Navigation Flow

### Main Navigation
```
Homepage → Categories → Products → Product Details → Cart → Checkout → Order Confirmation
```

### User Navigation
```
Login/Register → Dashboard → Orders → Profile → Settings → Logout
```

### Admin Navigation
```
Admin Login → Dashboard → Products → Orders → Users → Categories → Reports → Settings
```

---

**Document prepared by**: Team 13 - OICAR  
**Date**: May 3, 2025  
**Sprint**: 1 (User Flow Documentation)
