import { Platform } from 'react-native';
import { OrderDTO, OrderItemDTO, StatusDTO, CreateOrderRequest, CreateOrderItemRequest } from '../types/order';
import { CartDTO, CartItemDTO } from '../types/cart';
import { ProductService } from './productService';

// Use different URLs for different platforms
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5042/api';
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:5042/api';
  } else {
    return 'http://localhost:5042/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

export class OrderService {
  static async getUserOrders(token: string): Promise<OrderDTO[]> {
    try {
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
      
      // First create the order - include all fields that match OrderDTO
      const orderData = {
        IDOrder: 0, // Backend will generate the real ID
        UserID: userId,
        StatusID: 1, // Assuming 1 is "Pending" status
        OrderDate: new Date().toISOString(),
        TotalAmount: totalAmount,
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
      
      // The backend returns the original order with IDOrder still 0
      // Let's fetch all orders for this user and get the latest one
      console.log('🔍 Fetching user orders to find the created order...');
      const userOrders = await this.getUserOrders(token);
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

        // Update stock quantity - reduce by purchased amount
        console.log(`📦 Updating stock for item ${cartItem.itemID}, reducing by ${cartItem.quantity}`);
        await this.updateItemStock(cartItem.itemID, cartItem.quantity, token);
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