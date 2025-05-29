import { Platform } from 'react-native';
import { CartDTO, CartItemDTO, AddToCartRequest } from '../types/cart';

// Use different URLs for different platforms
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:7118/api';
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:7118/api';
  } else {
    return 'http://localhost:7118/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

export class CartService {
  static async getUserCart(userId: number, token: string): Promise<CartDTO | null> {
    try {
      const url = `${API_BASE_URL}/cart/users/${userId}`;
      console.log('🔍 Get user cart:', { url, userId });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Get cart response status:', response.status);

      if (response.status === 404) {
        // No cart exists yet, return null
        console.log('ℹ️ No cart found for user');
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get cart error:', errorText);
        throw new Error(errorText || 'Failed to load cart');
      }

      const data = await response.json();
      console.log(`✅ Loaded cart with ${data.CartItems?.length || 0} items`);
      
      // Convert backend naming to frontend naming
      return {
        idCart: data.IDCart,
        userID: data.UserID,
        cartItems: (data.CartItems || []).map((item: any) => ({
          idCartItem: item.IDCartItem,
          itemID: item.ItemID,
          cartID: item.CartID,
          quantity: item.Quantity,
        })),
      };
    } catch (error) {
      console.log('💥 Get cart exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load cart');
    }
  }

  static async createCart(userId: number, token: string): Promise<CartDTO> {
    try {
      const url = `${API_BASE_URL}/cart`;
      console.log('🔍 Create cart:', { url, userId });
      
      const cartData = {
        UserID: userId,
        CartItems: []
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cartData),
      });

      console.log('📡 Create cart response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Create cart error:', errorText);
        throw new Error(errorText || 'Failed to create cart');
      }

      const data = await response.json();
      console.log('✅ Created new cart:', data);
      
      // Convert backend naming to frontend naming
      return {
        idCart: data.IDCart,
        userID: data.UserID,
        cartItems: [],
      };
    } catch (error) {
      console.log('💥 Create cart exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create cart');
    }
  }

  static async addItemToCart(cartId: number, itemId: number, quantity: number, token: string): Promise<void> {
    try {
      // For simplicity, we'll update the entire cart
      // In a real app, you might have a specific endpoint for adding items
      const url = `${API_BASE_URL}/cart/${cartId}`;
      console.log('🔍 Add item to cart:', { url, cartId, itemId, quantity });
      
      // First, get the current cart
      const currentCart = await this.getCartById(cartId, token);
      if (!currentCart) {
        throw new Error('Cart not found');
      }

      // Check if item already exists in cart
      const existingItemIndex = currentCart.cartItems.findIndex(item => item.itemID === itemId);
      
      let updatedCartItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedCartItems = [...currentCart.cartItems];
        updatedCartItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        const newCartItem = {
          IDCartItem: 0, // Will be set by backend
          ItemID: itemId,
          CartID: cartId,
          Quantity: quantity,
        };
        updatedCartItems = [...currentCart.cartItems.map(item => ({
          IDCartItem: item.idCartItem,
          ItemID: item.itemID,
          CartID: item.cartID,
          Quantity: item.quantity,
        })), newCartItem];
      }

      const cartUpdateData = {
        IDCart: currentCart.idCart,
        UserID: currentCart.userID,
        CartItems: updatedCartItems,
      };
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cartUpdateData),
      });

      console.log('📡 Add item response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Add item error:', errorText);
        throw new Error(errorText || 'Failed to add item to cart');
      }

      console.log('✅ Item added to cart successfully');
    } catch (error) {
      console.log('💥 Add item exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to add item to cart');
    }
  }

  private static async getCartById(cartId: number, token: string): Promise<CartDTO | null> {
    try {
      const url = `${API_BASE_URL}/cart/${cartId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to load cart');
      }

      const data = await response.json();
      
      // Convert backend naming to frontend naming
      return {
        idCart: data.IDCart,
        userID: data.UserID,
        cartItems: (data.CartItems || []).map((item: any) => ({
          idCartItem: item.IDCartItem,
          itemID: item.ItemID,
          cartID: item.CartID,
          quantity: item.Quantity,
        })),
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load cart');
    }
  }
} 