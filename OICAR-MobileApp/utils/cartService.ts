import { CartDTO, CartItemDTO, AddToCartRequest } from '../types/cart';
import { API_BASE_URL } from './apiConfig';
import { apiService } from './apiService';

export class CartService {
  // Get token from apiService
  private static getToken(): string {
    const token = apiService.getAuthToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    return token;
  }

  static async getUserCart(): Promise<CartDTO | null> {
    try {
      const token = this.getToken();
      const url = `${API_BASE_URL}/cart`;
      console.log('🔍 Get user cart:', { url });
      console.log('🔍 Token for get cart:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Get cart response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get cart error:', errorText);
        throw new Error(errorText || 'Failed to load cart');
      }

      const data = await response.json();
      console.log(`✅ Loaded cart response:`, JSON.stringify(data, null, 2));
      
      // Parse the API response structure
      const cartData = data.data || data;
      const items = cartData.items || [];
      
      // Convert to our DTO format
      const cartDTO = {
        idCart: 1, // Use a dummy cart ID since the API doesn't return one
        userID: 0, // Use a dummy user ID
        cartItems: items.map((item: any) => ({
          idCartItem: item.idCartItem || item.IDCartItem,
          itemID: item.itemID || item.ItemID,
          cartID: 1, // Use dummy cart ID
          quantity: item.quantity || item.Quantity,
          itemTitle: item.itemTitle,
          itemPrice: item.itemPrice,
          lineTotal: item.lineTotal,
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

  // Cart is automatically created when adding the first item, so this method is not needed

  static async addItemToCart(itemId: number, quantity: number): Promise<void> {
    try {
      const token = this.getToken();
      // Use the correct cart/items endpoint
      const url = `${API_BASE_URL}/cart/items`;
      console.log('🔍 Add item to cart:', { url, itemId, quantity });
      console.log('🔍 Token for request:', token ? 'Present' : 'Missing');
      
      // Create cart item data according to API expectations
      const cartItemData = {
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

  private static async getCartById(cartId: number): Promise<CartDTO | null> {
    try {
      const token = this.getToken();
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

  static async removeCartItem(itemId: number): Promise<void> {
    try {
      const token = this.getToken();
      // SnjofkaloAPI uses cart/items/{itemId} endpoint for removal (by product ID, not cart item ID)
      const url = `${API_BASE_URL}/cart/items/${itemId}`;
      console.log('🗑️ Removing cart item:', { url, itemId });
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Remove cart item response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Remove cart item error:', errorText);
        throw new Error(errorText || 'Failed to remove cart item');
      }

      console.log('✅ Cart item removed successfully');
    } catch (error) {
      console.log('💥 Remove cart item exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to remove cart item');
    }
  }

  static async updateCartItemQuantity(cartItemId: number, quantity: number, token: string): Promise<void> {
    try {
      const url = `${API_BASE_URL}/cartitem/${cartItemId}`;
      console.log('📝 Updating cart item quantity:', { url, cartItemId, quantity });
      
      // First get the current cart item to preserve other fields
      const getResponse = await fetch(`${API_BASE_URL}/cartitem/${cartItemId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!getResponse.ok) {
        throw new Error('Failed to get current cart item');
      }

      const currentItem = await getResponse.json();
      
      const updateData = {
        IDCartItem: currentItem.idCartItem || currentItem.IDCartItem,
        CartID: currentItem.cartID || currentItem.CartID,
        ItemID: currentItem.itemID || currentItem.ItemID,
        Quantity: quantity,
      };
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      console.log('📡 Update cart item response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Update cart item error:', errorText);
        throw new Error(errorText || 'Failed to update cart item');
      }

      console.log('✅ Cart item quantity updated successfully');
    } catch (error) {
      console.log('💥 Update cart item exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update cart item');
    }
  }
} 