# API Contracts Documentation - WebShop Project

## Base URL
```
Development: https://localhost:7118/api
Production: https://api.webshop.com/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer {token}
```

## Standard Response Formats

### Success Response
```json
{
  "data": {}, // Response payload
  "success": true,
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional error details
  },
  "success": false
}
```

### Pagination Response
```json
{
  "data": [],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalCount": 100
  },
  "success": true
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string" // optional
}
```

**Response:** `200 OK`
```json
{
  "message": "User registered successfully",
  "success": true
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input or user already exists
- `500 Internal Server Error` - Server error

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "success": true
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Invalid input

---

## User Endpoints

### Get All Users
**GET** `/user`
- **Authorization:** Admin only
- **Response:** Array of UserDTO

### Get User by ID
**GET** `/user/{id}`
- **Authorization:** User can only access own profile, Admin can access all
- **Parameters:** `id` (integer)
- **Response:** UserDTO

### Create User
**POST** `/user`
- **Authorization:** Required
- **Request Body:** UserDTO
- **Response:** Created UserDTO with ID

### Update User
**PUT** `/user/{id}`
- **Authorization:** User can only update own profile
- **Parameters:** `id` (integer)
- **Request Body:** UserDTO
- **Response:** `204 No Content`

### Delete User
**DELETE** `/user/{id}`
- **Authorization:** Required
- **Parameters:** `id` (integer)
- **Response:** `204 No Content`

### Get User by Username
**GET** `/user/ByUsername/{username}`
- **Authorization:** Required
- **Parameters:** `username` (string)
- **Response:** UserDTO

### Get User by Email
**GET** `/user/ByEmail/{email}`
- **Authorization:** Required
- **Parameters:** `email` (string)
- **Response:** UserDTO

### Get Admin Users
**GET** `/user/Admins`
- **Authorization:** Admin only
- **Response:** Array of UserDTO

**UserDTO Structure:**
```json
{
  "idUser": 0,
  "username": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phoneNumber": "string",
  "isAdmin": false
}
```

---

## Product Endpoints

### Get All Products
**GET** `/item`
- **Response:** Array of ItemDTO

### Get Product by ID
**GET** `/item/{itemId}`
- **Parameters:** `itemId` (integer)
- **Response:** ItemDTO

### Create Product
**POST** `/item`
- **Authorization:** Admin only
- **Request Body:** ItemDTO
- **Response:** Created ItemDTO with ID

### Update Product
**PUT** `/item/{id}`
- **Authorization:** Admin only
- **Parameters:** `id` (integer)
- **Request Body:** ItemDTO
- **Response:** `204 No Content`

### Delete Product
**DELETE** `/item/{id}`
- **Authorization:** Admin only
- **Parameters:** `id` (integer)
- **Response:** `204 No Content`

### Get Products by Category
**GET** `/item/categories/{categoryId}/items`
- **Parameters:** `categoryId` (integer)
- **Response:** Array of ItemDTO

### Search Products by Title
**GET** `/item/items/title/search`
- **Query Parameters:** `title` (string)
- **Response:** Array of ItemDTO

### Check Product Stock
**GET** `/item/items/{itemId}/stock`
- **Parameters:** `itemId` (integer)
- **Response:** Boolean

**ItemDTO Structure:**
```json
{
  "idItem": 0,
  "itemCategoryID": 0,
  "title": "string",
  "description": "string",
  "stockQuantity": 0,
  "price": 0.00,
  "weight": 0.00
}
```

---

## Category Endpoints

### Get All Categories
**GET** `/itemcategory`
- **Response:** Array of ItemCategoryDTO

### Get Category by ID
**GET** `/itemcategory/{id}`
- **Parameters:** `id` (integer)
- **Response:** ItemCategoryDTO

### Create Category
**POST** `/itemcategory`
- **Authorization:** Admin only
- **Request Body:** ItemCategoryDTO
- **Response:** Created ItemCategoryDTO with ID

### Update Category
**PUT** `/itemcategory/{id}`
- **Authorization:** Admin only
- **Parameters:** `id` (integer)
- **Request Body:** ItemCategoryDTO
- **Response:** `204 No Content`

### Delete Category
**DELETE** `/itemcategory/{id}`
- **Authorization:** Admin only
- **Parameters:** `id` (integer)
- **Response:** `204 No Content`

### Get Category by Name
**GET** `/itemcategory/item-categories/{name}`
- **Parameters:** `name` (string)
- **Response:** ItemCategoryDTO

**ItemCategoryDTO Structure:**
```json
{
  "idItemCategory": 0,
  "categoryName": "string"
}
```

---

## Cart Endpoints

### Get All Carts
**GET** `/cart`
- **Authorization:** Required
- **Response:** Array of CartDTO

### Get Cart by ID
**GET** `/cart/{id}`
- **Authorization:** Required
- **Parameters:** `id` (integer)
- **Response:** CartDTO

### Create Cart
**POST** `/cart`
- **Authorization:** Required
- **Request Body:** CartDTO
- **Response:** Created CartDTO with ID

### Update Cart
**PUT** `/cart/{id}`
- **Authorization:** Required
- **Parameters:** `id` (integer)
- **Request Body:** CartDTO
- **Response:** `204 No Content`

### Delete Cart
**DELETE** `/cart/{id}`
- **Authorization:** Required
- **Parameters:** `id` (integer)
- **Response:** `204 No Content`

### Get Cart by User ID
**GET** `/cart/users/{userId}`
- **Authorization:** Required
- **Parameters:** `userId` (integer)
- **Response:** CartDTO

**CartDTO Structure:**
```json
{
  "idCart": 0,
  "userID": 0,
  "cartItems": [
    {
      "idCartItem": 0,
      "itemID": 0,
      "cartID": 0,
      "quantity": 0
    }
  ]
}
```

---

## Cart Item Endpoints

### Get All Cart Items
**GET** `/cartitem`
- **Authorization:** Required
- **Response:** Array of CartItemDTO

### Get Cart Item by ID
**GET** `/cartitem/{id}`
- **Authorization:** Required
- **Parameters:** `id` (integer)
- **Response:** CartItemDTO

### Add Cart Item
**POST** `/cartitem`
- **Authorization:** Required
- **Request Body:** CartItemDTO
- **Response:** Created CartItemDTO with ID

### Update Cart Item
**PUT** `/cartitem/{id}`
- **Authorization:** Required
- **Parameters:** `id` (integer)
- **Request Body:** CartItemDTO
- **Response:** `204 No Content`

### Delete Cart Item
**DELETE** `/cartitem/{id}`
- **Authorization:** Required
- **Parameters:** `id` (integer)
- **Response:** `204 No Content`

### Get Cart Items by Cart ID
**GET** `/cartitem/cart/{cartId}`
- **Authorization:** Required
- **Parameters:** `cartId` (integer)
- **Response:** Array of CartItemDTO

**CartItemDTO Structure:**
```json
{
  "idCartItem": 0,
  "itemID": 0,
  "cartID": 0,
  "quantity": 0
}
```

---

## Order Endpoints

### Get All Orders
**GET** `/order`
- **Authorization:** Admin only
- **Response:** Array of OrderDTO

### Get Order by ID
**GET** `/order/{id}`
- **Authorization:** Required
- **Parameters:** `id` (integer)
- **Response:** OrderDTO

### Create Order
**POST** `/order`
- **Authorization:** Required
- **Request Body:** OrderDTO
- **Response:** Created OrderDTO with ID

### Update Order
**PUT** `/order/{id}`
- **Authorization:** Admin only
- **Parameters:** `id` (integer)
- **Request Body:** OrderDTO
- **Response:** `204 No Content`

### Delete Order
**DELETE** `/order/{id}`
- **Authorization:** Admin only
- **Parameters:** `id` (integer)
- **Response:** `204 No Content`

### Get Orders by User ID
**GET** `/order/users/{userId}`
- **Authorization:** Required
- **Parameters:** `userId` (integer)
- **Response:** Array of OrderDTO

### Update Order Status
**PUT** `/order/orders/{orderId}/status`
- **Authorization:** Admin only
- **Parameters:** `orderId` (integer)
- **Request Body:** `statusId` (integer)
- **Response:** `204 No Content`

**OrderDTO Structure:**
```json
{
  "idOrder": 0,
  "userID": 0,
  "statusID": 0,
  "orderDate": "2025-05-03T00:00:00",
  "totalAmount": 0.00
}
```

---

## Order Item Endpoints

### Get All Order Items
**GET** `/orderitem`
- **Authorization:** Required
- **Response:** Array of OrderItemDTO

### Get Order Item by ID
**GET** `/orderitem/{id}`
- **Authorization:** Required
- **Parameters:** `id` (integer)
- **Response:** OrderItemDTO

### Create Order Item
**POST** `/orderitem`
- **Authorization:** Required
- **Request Body:** OrderItemDTO
- **Response:** Created OrderItemDTO with ID

### Update Order Item
**PUT** `/orderitem/{id}`
- **Authorization:** Required
- **Parameters:** `id` (integer)
- **Request Body:** OrderItemDTO
- **Response:** `204 No Content`

### Delete Order Item
**DELETE** `/orderitem/{id}`
- **Authorization:** Required
- **Parameters:** `id` (integer)
- **Response:** `204 No Content`

### Get Order Items by Order ID
**GET** `/orderitem/orders/{orderId}/items`
- **Authorization:** Required
- **Parameters:** `orderId` (integer)
- **Response:** Array of OrderItemDTO

### Get Order Items by Item ID
**GET** `/orderitem/items/{itemId}/orders`
- **Authorization:** Required
- **Parameters:** `itemId` (integer)
- **Response:** Array of OrderItemDTO

**OrderItemDTO Structure:**
```json
{
  "idOrderItem": 0,
  "orderID": 0,
  "itemID": 0,
  "quantity": 0
}
```

---

## Status Endpoints

### Get All Statuses
**GET** `/status`
- **Response:** Array of StatusDTO

### Get Status by ID
**GET** `/status/{id}`
- **Parameters:** `id` (integer)
- **Response:** StatusDTO

### Create Status
**POST** `/status`
- **Authorization:** Admin only
- **Request Body:** StatusDTO
- **Response:** Created StatusDTO with ID

### Update Status
**PUT** `/status/{id}`
- **Authorization:** Admin only
- **Parameters:** `id` (integer)
- **Request Body:** StatusDTO
- **Response:** `204 No Content`

### Delete Status
**DELETE** `/status/{id}`
- **Authorization:** Admin only
- **Parameters:** `id` (integer)
- **Response:** `204 No Content`

### Get Status by Name
**GET** `/status/ByName/{name}`
- **Parameters:** `name` (string)
- **Response:** StatusDTO

**StatusDTO Structure:**
```json
{
  "idStatus": 0,
  "name": "string",
  "description": "string"
}
```

---

## Tag Endpoints

### Get All Tags
**GET** `/tag`
- **Response:** Array of TagDTO

### Get Tag by ID
**GET** `/tag/{id}`
- **Parameters:** `id` (integer)
- **Response:** TagDTO

### Create Tag
**POST** `/tag`
- **Authorization:** Admin only
- **Request Body:** TagDTO
- **Response:** Created TagDTO with ID

### Update Tag
**PUT** `/tag/{id}`
- **Authorization:** Admin only
- **Parameters:** `id` (integer)
- **Request Body:** TagDTO
- **Response:** `204 No Content`

### Delete Tag
**DELETE** `/tag/{id}`
- **Authorization:** Admin only
- **Parameters:** `id` (integer)
- **Response:** `204 No Content`

### Get Tag by Name
**GET** `/tag/ByName/{name}`
- **Parameters:** `name` (string)
- **Response:** TagDTO

**TagDTO Structure:**
```json
{
  "idTag": 0,
  "name": "string"
}
```

---

## Logs Endpoints

### Get Latest Logs
**GET** `/logs/{n?}`
- **Authorization:** Required
- **Parameters:** `n` (integer, optional, default: 10)
- **Response:** Array of Log entries

### Get Log Count
**GET** `/logs/count`
- **Authorization:** Required
- **Response:** `{ "count": 0 }`

**Log Structure:**
```json
{
  "id": 0,
  "timestamp": "2025-05-03T00:00:00",
  "level": "Info",
  "message": "string"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid credentials |
| `AUTH_002` | Token expired |
| `AUTH_003` | Insufficient permissions |
| `USER_001` | User not found |
| `USER_002` | Email already exists |
| `USER_003` | Username already taken |
| `PRODUCT_001` | Product not found |
| `PRODUCT_002` | Insufficient stock |
| `ORDER_001` | Order not found |
| `ORDER_002` | Invalid order status |
| `CART_001` | Cart not found |
| `CART_002` | Cart is empty |
| `VALIDATION_001` | Invalid input data |

---

## Rate Limiting

- Authentication endpoints: 5 requests per minute per IP
- Public endpoints: 100 requests per minute per IP
- Authenticated endpoints: 500 requests per minute per user

---

## Versioning

API versioning through URL path:
```
/api/v1/products
/api/v2/products
```

Current version: v1 (implicit, no version in URL)

---

**Document prepared by**: Team 13 - OICAR  
**Date**: May 3, 2025  
**Sprint**: 1 (API Documentation)
