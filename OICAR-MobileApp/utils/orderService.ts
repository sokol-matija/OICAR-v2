import { OrderDTO, OrderItemDTO, StatusDTO, CreateOrderRequest, CreateOrderItemRequest } from '../types/order';
import { CartDTO, CartItemDTO } from '../types/cart';
import { ProductService } from './productService';
import { API_BASE_URL } from './apiConfig';
import { apiService } from './apiService';

export class OrderService {
  // Get token from apiService
  private static getToken(): string {
    const token = apiService.getAuthToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    return token;
  }

  static async getUserOrders(): Promise<OrderDTO[]> {
    try {
      const token = this.getToken();
      const url = `${API_BASE_URL}/orders/my`;
      console.log('🔍 Get user orders:', { url });
      
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
      
      // Handle SnjofkaloAPI response format
      const ordersData = data.success ? (data.data?.data || data.data || []) : (Array.isArray(data) ? data : []);
      
      // Convert backend naming to frontend naming
      const orders = ordersData.map((order: any) => {
        console.log('🔍 Processing order:', JSON.stringify(order, null, 2));
        const convertedOrder = {
          idOrder: order.IDOrder || order.idOrder,
          userID: order.UserID || order.userID,
          statusID: order.StatusID || order.statusID,
          orderDate: order.OrderDate || order.orderDate,
          totalAmount: order.TotalAmount || order.totalAmount || 0,
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

  static async getOrderItems(orderId: number): Promise<OrderItemDTO[]> {
    try {
      const token = this.getToken();
      // Try the direct orders endpoint first, then fallback to orders/my
      const url = `${API_BASE_URL}/orders/my/${orderId}`;
      console.log('🔍 Get order details:', { url, orderId });
      console.log('🔍 Token for order details:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('🔍 Token length:', token?.length || 0);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Get order details response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get order details error:', errorText);
        throw new Error(errorText || 'Failed to load order details');
      }

      const data = await response.json();
      console.log('✅ Loaded order details response:', JSON.stringify(data, null, 2));
      
      // Extract order items from the SnjofkaloAPI response format
      let orderItems: OrderItemDTO[] = [];
      if (data.success && data.data && data.data.items) {
        orderItems = data.data.items.map((item: any) => ({
          idOrderItem: item.idOrderItem || item.IDOrderItem || 0,
          orderID: orderId,
          itemID: item.idItem || item.IDItem || item.itemID || item.ItemID,
          quantity: item.quantity || item.Quantity || 1,
        }));
      }
      
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
      
      // Get product details to calculate accurate total
      const products = await ProductService.getAllItems();
      
      // Validate stock availability before proceeding
      console.log('📦 Validating stock availability...');
      for (const cartItem of cart.cartItems) {
        const product = products.find(p => p.idItem === cartItem.itemID);
        if (!product) {
          throw new Error(`Product not found for item ID: ${cartItem.itemID}`);
        }
        
        if (product.stockQuantity < cartItem.quantity) {
          throw new Error(`Insufficient stock for ${product.title}. Available: ${product.stockQuantity}, Requested: ${cartItem.quantity}`);
        }
        
        console.log(`✅ Stock check passed for ${product.title}: ${cartItem.quantity} requested, ${product.stockQuantity} available`);
      }
      
      // Calculate total amount from cart items
      console.log('💰 Calculating total amount from cart items...');
      let totalAmount = 0;
      
      for (const cartItem of cart.cartItems) {
        const product = products.find(p => p.idItem === cartItem.itemID);
        if (product) {
          const itemTotal = product.price * cartItem.quantity;
          totalAmount += itemTotal;
          console.log(`💰 Item ${product.title}: $${product.price} × ${cartItem.quantity} = $${itemTotal}`);
        } else {
          console.log(`⚠️ Product not found for item ID: ${cartItem.itemID}`);
        }
      }
      
      console.log(`💰 Total calculated amount: $${totalAmount}`);
      
      // Create order using SnjofkaloAPI format - it creates order from existing cart
      const orderData = {
        ShippingAddress: "Default Shipping Address", // Optional
        BillingAddress: "Default Billing Address",   // Optional
        OrderNotes: "Order created from mobile app"  // Optional
      };
      
      const orderUrl = `${API_BASE_URL}/orders`;
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
      
      // SnjofkaloAPI returns order data in the response
      if (orderResult.success && orderResult.data) {
        const createdOrder = {
          idOrder: orderResult.data.IDOrder || orderResult.data.idOrder,
          userID: orderResult.data.UserID || orderResult.data.userID || userId,
          statusID: orderResult.data.StatusID || orderResult.data.statusID || 1,
          orderDate: orderResult.data.OrderDate || orderResult.data.orderDate || new Date().toISOString(),
          totalAmount: orderResult.data.TotalAmount || orderResult.data.totalAmount || totalAmount,
        };
        
        console.log('✅ Order created successfully:', JSON.stringify(createdOrder, null, 2));
        return createdOrder;
      } else {
        // Fallback: try to fetch user orders to find the latest one
        console.log('🔍 Fetching user orders to find the created order...');
        const userOrders = await this.getUserOrders();
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
        
        console.log('✅ Found created order:', JSON.stringify(latestOrder, null, 2));
        return latestOrder;
      }
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

  static async getAllStatuses(): Promise<StatusDTO[]> {
    try {
      // For now, return hardcoded statuses since the API doesn't have a direct status endpoint
      // The /api/status endpoint returns system status, not order statuses
      console.log('🔍 Get all statuses: using hardcoded values');
      
      const statusDTOs = [
        { idStatus: 1, name: 'Pending', description: 'Order is pending', isActive: true },
        { idStatus: 2, name: 'Processing', description: 'Order is being processed', isActive: true },
        { idStatus: 3, name: 'Shipped', description: 'Order has been shipped', isActive: true },
        { idStatus: 4, name: 'Delivered', description: 'Order has been delivered', isActive: true },
        { idStatus: 5, name: 'Cancelled', description: 'Order has been cancelled', isActive: true },
        { idStatus: 6, name: 'Returned', description: 'Order has been returned', isActive: true },
      ];
      
      console.log('✅ Converted statuses:', statusDTOs);
      
      return statusDTOs;
    } catch (error) {
      console.log('💥 Get statuses exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load statuses');
    }
  }

  static async updateItemStock(itemId: number, purchasedQuantity: number, token: string): Promise<void> {
    try {
      console.log(`📦 Reducing stock for item ${itemId} by ${purchasedQuantity} units`);
      
      // First get the current item details including stock
      const currentItem = await this.getItemById(itemId, token);
      
      if (!currentItem) {
        console.log(`❌ Item ${itemId} not found, cannot update stock`);
        throw new Error(`Item ${itemId} not found`);
      }

      const currentStock = currentItem.stockQuantity;
      const newStock = currentStock - purchasedQuantity;

      console.log(`📦 Item ${itemId}: Current stock: ${currentStock}, Purchased: ${purchasedQuantity}, New stock: ${newStock}`);

      if (newStock < 0) {
        console.log(`❌ Insufficient stock for item ${itemId}. Available: ${currentStock}, Requested: ${purchasedQuantity}`);
        throw new Error(`Insufficient stock for item. Available: ${currentStock}, Requested: ${purchasedQuantity}`);
      }

      // Update the item with reduced stock quantity
      const updateData = {
        IDItem: currentItem.idItem,
        ItemCategoryID: currentItem.itemCategoryID,
        Title: currentItem.title,
        Description: currentItem.description,
        StockQuantity: newStock,
        Price: currentItem.price,
        Weight: currentItem.weight,
      };

      const updateUrl = `${API_BASE_URL}/item/${itemId}`;
      console.log('📦 Updating item stock:', JSON.stringify(updateData, null, 2));

      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Update item stock error:', errorText);
        throw new Error(`Failed to update item stock: ${errorText}`);
      }

      console.log(`✅ Successfully reduced stock for item ${itemId} from ${currentStock} to ${newStock}`);

    } catch (error) {
      console.log('💥 Update item stock exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update item stock');
    }
  }

  static async getItemById(itemId: number, token: string): Promise<any> {
    try {
      const url = `${API_BASE_URL}/item/${itemId}`;
      console.log('🔍 Get item by ID:', { url, itemId });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get item by ID error:', errorText);
        throw new Error(errorText || 'Failed to load item');
      }

      const data = await response.json();
      console.log('✅ Loaded item:', JSON.stringify(data, null, 2));

      // Convert backend naming to frontend naming
      return {
        idItem: data.idItem || data.IDItem,
        itemCategoryID: data.itemCategoryID || data.ItemCategoryID,
        title: data.title || data.Title,
        description: data.description || data.Description,
        stockQuantity: data.stockQuantity || data.StockQuantity,
        price: data.price || data.Price,
        weight: data.weight || data.Weight,
      };

    } catch (error) {
      console.log('💥 Get item by ID exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load item');
    }
  }

  static async getItemStock(itemId: number, token: string): Promise<number> {
    try {
      const url = `${API_BASE_URL}/item/items/${itemId}/stock`;
      console.log('🔍 Get item stock:', { url, itemId });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get item stock error:', errorText);
        throw new Error(errorText || 'Failed to load item stock');
      }

      const stockData = await response.json();
      console.log('✅ Loaded item stock:', stockData);

      // The API might return the stock as a number or as an object with stock property
      const stock = typeof stockData === 'number' ? stockData : stockData.stock || stockData.StockQuantity || 0;
      
      return stock;

    } catch (error) {
      console.log('💥 Get item stock exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load item stock');
    }
  }
} 