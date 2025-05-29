import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderDTO, StatusDTO } from '../types/order';
import { OrderService } from '../utils/orderService';
import { JWTUtils } from '../utils/jwtUtils';

interface OrdersScreenProps {
  token?: string;
}

interface OrderWithStatus extends OrderDTO {
  status?: StatusDTO;
}

const OrdersScreen: React.FC<OrdersScreenProps> = ({ token }) => {
  const [orders, setOrders] = useState<OrderWithStatus[]>([]);
  const [statuses, setStatuses] = useState<StatusDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token]);

  const loadOrders = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      console.log('📋 Loading user orders...');
      
      // Get user ID from token
      const parsed = JWTUtils.parseToken(token);
      const userId = parsed?.id;
      
      if (!userId) {
        throw new Error('Could not verify user identity');
      }

      console.log('🔍 Loading orders for user:', userId);
      
      // Load orders and statuses in parallel
      const [ordersData, statusesData] = await Promise.all([
        OrderService.getUserOrders(parseInt(userId), token),
        OrderService.getAllStatuses(token)
      ]);

      setStatuses(statusesData);
      
      // Combine orders with status information
      const ordersWithStatus = ordersData.map(order => ({
        ...order,
        status: statusesData.find(status => status.idStatus === order.statusID)
      }));

      console.log('✅ Loaded orders with status:', JSON.stringify(ordersWithStatus, null, 2));
      setOrders(ordersWithStatus);
      
    } catch (error) {
      console.log('💥 Load orders error:', error);
      Alert.alert(
        'Error Loading Orders',
        error instanceof Error ? error.message : 'Failed to load orders'
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders().finally(() => setRefreshing(false));
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
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

  const renderOrderItem = ({ item }: { item: OrderWithStatus }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => {
        // TODO: Navigate to order details screen
        Alert.alert('Order Details', `Order #${item.idOrder} details coming soon!`);
      }}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderNumber}>
          <Text style={styles.orderNumberText}>Order #{item.idOrder}</Text>
          <Text style={styles.orderDate}>{formatDate(item.orderDate)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status?.name) }]}>
          <Text style={styles.statusText}>
            {item.status?.name || 'Unknown'}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderBody}>
        <View style={styles.orderInfo}>
          <Text style={styles.totalAmount}>${(item.totalAmount || 0).toFixed(2)}</Text>
          <Text style={styles.orderMeta}>Tap to view details</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="log-in-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Please log in to view your orders</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.orderCount}>
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubtext}>Your order history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => `order-${item.idOrder}`}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.ordersList}
        />
      )}
    </View>
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
  header: {
    backgroundColor: '#007bff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  orderCount: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  ordersList: {
    padding: 16,
    paddingBottom: 100, // Space for bottom navigation
  },
  orderCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    flex: 1,
  },
  orderNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 2,
  },
  orderMeta: {
    fontSize: 12,
    color: '#666',
  },
});

export default OrdersScreen; 