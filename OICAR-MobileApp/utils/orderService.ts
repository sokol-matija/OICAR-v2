import { Platform } from 'react-native';
import { OrderDTO, OrderItemDTO, StatusDTO, CreateOrderRequest, CreateOrderItemRequest } from '../types/order';
import { CartDTO, CartItemDTO } from '../types/cart';

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

export class OrderService {
  static async getUserOrders(userId: number, token: string): Promise<OrderDTO[]> {
    try {
      const url = `${API_BASE_URL}/order/users/${userId}`;
      console.log('🔍 Get user orders:', { url, userId });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Get orders response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get orders error:', errorText);
        throw new Error(errorText || 'Failed to load orders');
      }

      const data = await response.json();
      console.log('✅ Loaded orders response:', JSON.stringify(data, null, 2));
      
      // Convert backend naming to frontend naming
      const orders = (Array.isArray(data) ? data : []).map((order: any) => {
        console.log('🔍 Processing order:', JSON.stringify(order, null, 2));
        const convertedOrder = {
          idOrder: order.idOrder || order.IDOrder,
          userID: order.userID || order.UserID,
          statusID: order.statusID || order.StatusID,
          orderDate: order.orderDate || order.OrderDate,
          totalAmount: order.totalAmount || order.TotalAmount || 0,
        };
        console.log('🔍 Converted to:', JSON.stringify(convertedOrder, null, 2));
        return convertedOrder;
      });
      
      console.log('✅ Converted orders:', JSON.stringify(orders, null, 2));
      return orders;
    } catch (error) {
      console.log('💥 Get orders exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load orders');
    }
  }

  static async getOrderItems(orderId: number, token: string): Promise<OrderItemDTO[]> {
    try {
      const url = `${API_BASE_URL}/orderitem/orders/${orderId}/items`;
      console.log('🔍 Get order items:', { url, orderId });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Get order items response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get order items error:', errorText);
        throw new Error(errorText || 'Failed to load order items');
      }

      const data = await response.json();
      console.log('✅ Loaded order items response:', JSON.stringify(data, null, 2));
      
      // Convert backend naming to frontend naming
      const orderItems = (Array.isArray(data) ? data : []).map((item: any) => ({
        idOrderItem: item.idOrderItem || item.IDOrderItem,
        orderID: item.orderID || item.OrderID,
        itemID: item.itemID || item.ItemID,
        quantity: item.quantity || item.Quantity,
      }));
      
      console.log('✅ Converted order items:', JSON.stringify(orderItems, null, 2));
      return orderItems;
    } catch (error) {
      console.log('💥 Get order items exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load order items');
    }
  }

  static async createOrderFromCart(cart: CartDTO, userId: number, token: string): Promise<OrderDTO> {
    try {
      console.log('🛒 Creating order from cart:', JSON.stringify(cart, null, 2));
      
      // Calculate total amount
      const totalAmount = 0; // We'll calculate this properly after getting product prices
      
      // First create the order - include all fields that match OrderDTO
      const orderData = {
        IDOrder: 0, // Backend will generate the real ID
        UserID: userId,
        StatusID: 1, // Assuming 1 is "Completed" status - we'll fix this later
        OrderDate: new Date().toISOString(),
        TotalAmount: totalAmount,
      };
      
      const orderUrl = `${API_BASE_URL}/order`;
      console.log('📦 Creating order:', JSON.stringify(orderData, null, 2));
      
      const orderResponse = await fetch(orderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      console.log('📡 Create order response status:', orderResponse.status);

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.log('❌ Create order error:', errorText);
        throw new Error(errorText || 'Failed to create order');
      }

      const orderResult = await orderResponse.json();
      console.log('✅ Created order response:', JSON.stringify(orderResult, null, 2));
      
      // The backend returns the original order with IDOrder still 0
      // Let's fetch all orders for this user and get the latest one
      console.log('🔍 Fetching user orders to find the created order...');
      const userOrders = await this.getUserOrders(userId, token);
      console.log('📋 User orders after creation:', JSON.stringify(userOrders, null, 2));
      
      // Find the most recent order (highest ID)
      const latestOrder = userOrders.length > 0 
        ? userOrders.reduce((latest, current) => 
            current.idOrder > latest.idOrder ? current : latest
          )
        : null;
        
      if (!latestOrder || latestOrder.idOrder <= 0) {
        console.log('❌ Could not find the created order');
        throw new Error('Order was created but could not retrieve order ID');
      }
      
      const createdOrder = latestOrder;
      console.log('✅ Found created order:', JSON.stringify(createdOrder, null, 2));

      // Now create order items for each cart item
      for (const cartItem of cart.cartItems) {
        const orderItemData = {
          OrderID: createdOrder.idOrder,
          ItemID: cartItem.itemID,
          Quantity: cartItem.quantity,
        };
        
        const orderItemUrl = `${API_BASE_URL}/orderitem`;
        console.log('📦 Creating order item:', JSON.stringify(orderItemData, null, 2));
        
        const orderItemResponse = await fetch(orderItemUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(orderItemData),
        });

        if (!orderItemResponse.ok) {
          const errorText = await orderItemResponse.text();
          console.log('❌ Create order item error:', errorText);
          throw new Error(`Failed to create order item: ${errorText}`);
        }

        const orderItemResult = await orderItemResponse.json();
        console.log('✅ Created order item:', JSON.stringify(orderItemResult, null, 2));
      }

      console.log('✅ Order created successfully with all items');
      return createdOrder;
    } catch (error) {
      console.log('💥 Create order exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create order');
    }
  }

  static async clearCart(cartId: number, token: string): Promise<void> {
    try {
      console.log('🧹 Clearing cart:', cartId);
      
      // First get the cart items to delete them individually
      const cartItems = await fetch(`${API_BASE_URL}/cartitem/cart/${cartId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (cartItems.ok) {
        const items = await cartItems.json();
        console.log('🧹 Found cart items to delete:', JSON.stringify(items, null, 2));
        
        // Delete each cart item
        for (const item of items) {
          const itemId = item.idCartItem || item.IDCartItem;
          if (itemId) {
            const deleteUrl = `${API_BASE_URL}/cartitem/${itemId}`;
            console.log('🗑️ Deleting cart item:', itemId);
            
            const deleteResponse = await fetch(deleteUrl, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (!deleteResponse.ok) {
              console.log('⚠️ Failed to delete cart item:', itemId);
            } else {
              console.log('✅ Deleted cart item:', itemId);
            }
          }
        }
      }

      console.log('✅ Cart cleared successfully');
    } catch (error) {
      console.log('💥 Clear cart exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to clear cart');
    }
  }

  static async getAllStatuses(token: string): Promise<StatusDTO[]> {
    try {
      const url = `${API_BASE_URL}/status`;
      console.log('🔍 Get all statuses:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Get statuses response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get statuses error:', errorText);
        throw new Error(errorText || 'Failed to load statuses');
      }

      const data = await response.json();
      console.log('✅ Loaded statuses response:', JSON.stringify(data, null, 2));
      
      // Convert backend naming to frontend naming
      const statuses = (Array.isArray(data) ? data : []).map((status: any) => ({
        idStatus: status.idStatus || status.IDStatus,
        name: status.name || status.Name,
        description: status.description || status.Description,
      }));
      
      console.log('✅ Converted statuses:', JSON.stringify(statuses, null, 2));
      return statuses;
    } catch (error) {
      console.log('💥 Get statuses exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load statuses');
    }
  }
} 