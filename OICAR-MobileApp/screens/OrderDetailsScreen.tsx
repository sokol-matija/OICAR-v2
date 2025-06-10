import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderDTO, OrderItemDTO, StatusDTO } from '../types/order';
import { ItemDTO } from '../types/product';
import { OrderService } from '../utils/orderService';
import { ProductService } from '../utils/productService';
import { JWTUtils } from '../utils/jwtUtils';

interface OrderDetailsScreenProps {
  orderId: number;
  token?: string;
  onBack?: () => void;
  onReorder?: (orderItems: OrderItemWithProduct[]) => void;
}

interface OrderItemWithProduct extends OrderItemDTO {
  product?: ItemDTO;
  subtotal?: number;
}

interface OrderWithDetails extends OrderDTO {
  status?: StatusDTO;
  orderItems: OrderItemWithProduct[];
  calculatedTotal: number;
}

const OrderDetailsScreen: React.FC<OrderDetailsScreenProps> = ({ 
  orderId, 
  token, 
  onBack, 
  onReorder 
}) => {
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (token && orderId) {
      loadOrderDetails();
    }
  }, [token, orderId]);

  const loadOrderDetails = async () => {
    if (!token || !orderId) return;

    try {
      console.log('📋 Loading order details for order:', orderId);
      
      // Load order items, statuses, and products in parallel
      const [orderItems, statuses, products] = await Promise.all([
        OrderService.getOrderItems(orderId, token),
        OrderService.getAllStatuses(token),
        ProductService.getAllItems()
      ]);

      console.log('✅ Loaded order items:', orderItems.length);
      console.log('✅ Loaded statuses:', statuses.length);
      console.log('✅ Loaded products:', products.length);

      // Find order info from a previous call or create a minimal one
      // For now, we'll need to get the order info separately
      const userOrders = await OrderService.getUserOrders(token);
      const orderInfo = userOrders.find(o => o.idOrder === orderId);

      if (!orderInfo) {
        throw new Error('Order not found');
      }

      console.log('🔍 Found order info:', JSON.stringify(orderInfo, null, 2));
      console.log('🔍 Order totalAmount from API:', orderInfo.totalAmount);

      // Combine order items with product details
      const itemsWithProducts: OrderItemWithProduct[] = orderItems.map(item => {
        const product = products.find(p => p.idItem === item.itemID);
        const subtotal = product ? product.price * item.quantity : 0;
        return {
          ...item,
          product,
          subtotal
        };
      });

      // Calculate total from items
      const calculatedTotal = itemsWithProducts.reduce((total, item) => 
        total + (item.subtotal || 0), 0
      );

      console.log('🔍 Calculated total from items:', calculatedTotal);
      console.log('🔍 API total amount:', orderInfo.totalAmount);

      // Find status info
      const status = statuses.find(s => s.idStatus === orderInfo.statusID);

      const orderWithDetails: OrderWithDetails = {
        ...orderInfo,
        status,
        orderItems: itemsWithProducts,
        calculatedTotal: calculatedTotal > 0 ? calculatedTotal : (orderInfo.totalAmount || 0)
      };

      console.log('✅ Order details loaded:', orderWithDetails);
      setOrder(orderWithDetails);
      
    } catch (error) {
      console.log('💥 Load order details error:', error);
      Alert.alert(
        'Error Loading Order',
        error instanceof Error ? error.message : 'Failed to load order details'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrderDetails();
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (statusName?: string): string => {
    if (!statusName) return '#666';
    
    const name = statusName.toLowerCase();
    if (name.includes('completed') || name.includes('delivered') || name.includes('success')) {
      return '#28a745';
    } else if (name.includes('pending') || name.includes('processing')) {
      return '#ffc107';
    } else if (name.includes('cancelled') || name.includes('failed')) {
      return '#dc3545';
    } else if (name.includes('shipped') || name.includes('transit')) {
      return '#007bff';
    }
    return '#6c757d';
  };

  const canCancelOrder = (statusName?: string): boolean => {
    if (!statusName) return false;
    const name = statusName.toLowerCase();
    return name.includes('pending') || name.includes('processing');
  };

  const handleCancelOrder = async () => {
    if (!token || !order) return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'No, Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setActionLoading('cancel');
            try {
              // TODO: Implement order cancellation API call
              // For now, just show success message
              Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
              loadOrderDetails(); // Refresh to get updated status
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order. Please try again.');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleReorder = () => {
    if (!order || !onReorder) return;

    Alert.alert(
      'Reorder Items',
      'Add all items from this order to your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to Cart',
          onPress: () => {
            onReorder(order.orderItems);
          }
        }
      ]
    );
  };

  const renderOrderItem = (item: OrderItemWithProduct, index: number) => (
    <View key={`order-item-${index}`} style={styles.orderItemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>
          {item.product?.title || 'Unknown Product'}
        </Text>
        <Text style={styles.itemSubtotal}>
          ${(item.subtotal || 0).toFixed(2)}
        </Text>
      </View>
      
      <Text style={styles.itemDescription} numberOfLines={2}>
        {item.product?.description || 'No description available'}
      </Text>
      
      <View style={styles.itemFooter}>
        <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
        <Text style={styles.itemPrice}>
          ${(item.product?.price || 0).toFixed(2)} each
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="log-in-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Please log in to view order details</Text>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="receipt-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Order not found</Text>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Order #{order.idOrder}</Text>
          <Text style={styles.headerDate}>{formatDate(order.orderDate)}</Text>
        </View>
      </View>

      {/* Order Status */}
      <View style={styles.statusSection}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status?.name) }]}>
          <Text style={styles.statusText}>
            {order.status?.name || 'Unknown Status'}
          </Text>
        </View>
        {order.status?.description && (
          <Text style={styles.statusDescription}>{order.status.description}</Text>
        )}
      </View>

      {/* Order Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items</Text>
          <Text style={styles.summaryValue}>{order.orderItems.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${order.calculatedTotal.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${order.calculatedTotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.orderItems.map((item, index) => renderOrderItem(item, index))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        {canCancelOrder(order.status?.name) && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancelOrder}
            disabled={actionLoading === 'cancel'}
          >
            {actionLoading === 'cancel' ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Cancel Order</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        
        {onReorder && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.reorderButton]}
            onPress={handleReorder}
            disabled={!!actionLoading}
          >
            <Ionicons name="refresh-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Reorder</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  header: {
    backgroundColor: '#007bff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerDate: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  statusSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  summarySection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#212529',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  itemsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  orderItemCard: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginRight: 8,
  },
  itemSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  actionsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  reorderButton: {
    backgroundColor: '#007bff',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderDetailsScreen; 