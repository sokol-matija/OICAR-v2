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
      console.log('🔍 Token for get cart:', token ? 'Present' : 'Missing');
      
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
        console.log('ℹ️ No cart found for user (404 response)');
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get cart error:', errorText);
        throw new Error(errorText || 'Failed to load cart');
      }

      const data = await response.json();
      console.log(`✅ Loaded cart response:`, JSON.stringify(data, null, 2));
      
      // Convert backend naming to frontend naming
      const cartDTO = {
        idCart: data.idCart || data.IDCart,
        userID: data.userID || data.UserID,
        cartItems: (data.cartItems || data.CartItems || []).map((item: any) => ({
          idCartItem: item.idCartItem || item.IDCartItem,
          itemID: item.itemID || item.ItemID,
          cartID: item.cartID || item.CartID,
          quantity: item.quantity || item.Quantity,
        })),
      };
      
      console.log(`✅ Converted cart DTO:`, JSON.stringify(cartDTO, null, 2));
      console.log(`✅ Loaded cart with ${cartDTO.cartItems?.length || 0} items`);
      
      return cartDTO;
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
      
      console.log('📦 Cart creation payload:', JSON.stringify(cartData, null, 2));
      
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
      console.log('✅ Created new cart response:', JSON.stringify(data, null, 2));
      
      // Convert backend naming to frontend naming
      const cartDTO = {
        idCart: data.idCart || data.IDCart,
        userID: data.userID || data.UserID,
        cartItems: [],
      };
      
      console.log('✅ Converted cart DTO:', JSON.stringify(cartDTO, null, 2));
      
      if (!cartDTO.idCart || cartDTO.idCart <= 0) {
        console.log('❌ Cart creation returned invalid ID:', cartDTO.idCart);
        throw new Error('Cart creation failed - invalid cart ID returned');
      }
      
      return cartDTO;
    } catch (error) {
      console.log('💥 Create cart exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create cart');
    }
  }

  static async addItemToCart(cartId: number, itemId: number, quantity: number, token: string): Promise<void> {
    try {
      // Use the CartItem endpoint to add items directly
      const url = `${API_BASE_URL}/cartitem`;
      console.log('🔍 Add item to cart:', { url, cartId, itemId, quantity });
      console.log('🔍 Token for request:', token ? 'Present' : 'Missing');
      
      // Create cart item data (no IDCartItem for new items)
      const cartItemData = {
        CartID: cartId,
        ItemID: itemId,
        Quantity: quantity,
      };
      
      console.log('📦 Cart item data:', JSON.stringify(cartItemData, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cartItemData),
      });

      console.log('📡 Add item response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Add item error response:', errorText);
        throw new Error(errorText || 'Failed to add item to cart');
      }

      const responseData = await response.json();
      console.log('✅ Add item success response:', JSON.stringify(responseData, null, 2));
      console.log('✅ Item added to cart successfully');
    } catch (error) {
      console.log('💥 Add item exception:', error);
      console.log('💥 Exception type:', typeof error);
      console.log('💥 Exception message:', error instanceof Error ? error.message : 'Unknown error');
      if (error instanceof Error && error.stack) {
        console.log('💥 Exception stack:', error.stack);
      }
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
        idCart: data.idCart || data.IDCart,
        userID: data.userID || data.UserID,
        cartItems: (data.cartItems || data.CartItems || []).map((item: any) => ({
          idCartItem: item.idCartItem || item.IDCartItem,
          itemID: item.itemID || item.ItemID,
          cartID: item.cartID || item.CartID,
          quantity: item.quantity || item.Quantity,
        })),
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load cart');
    }
  }
} 