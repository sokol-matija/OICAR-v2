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
import { CartDTO, CartItemDTO } from '../types/cart';
import { ItemDTO } from '../types/product';
import { CartService } from '../utils/cartService';
import { ProductService } from '../utils/productService';
import { JWTUtils } from '../utils/jwtUtils';

interface CartScreenProps {
  token?: string;
}

interface CartItemWithProduct extends CartItemDTO {
  product?: ItemDTO;
}

const CartScreen: React.FC<CartScreenProps> = ({ token }) => {
  const [cart, setCart] = useState<CartDTO | null>(null);
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      loadCart();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadCart = async () => {
    if (!token) return;

    try {
      const userId = JWTUtils.parseToken(token)?.id;
      if (!userId) return;

      console.log('🛒 Loading cart for user:', userId);
      
      const userCart = await CartService.getUserCart(parseInt(userId), token);
      setCart(userCart);

      if (userCart && userCart.cartItems.length > 0) {
        // Load product details for each cart item
        const itemsWithProducts = await Promise.all(
          userCart.cartItems.map(async (cartItem) => {
            try {
              const products = await ProductService.getAllItems();
              const product = products.find(p => p.idItem === cartItem.itemID);
              return { ...cartItem, product };
            } catch (error) {
              console.log('❌ Failed to load product for cart item:', cartItem.itemID);
              return cartItem;
            }
          })
        );
        setCartItems(itemsWithProducts);
      } else {
        setCartItems([]);
      }

      console.log('✅ Cart loaded successfully');
    } catch (error) {
      console.log('❌ Failed to load cart:', error);
      Alert.alert('Error', 'Failed to load cart');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCart();
  };

  const getTotalPrice = (): number => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getTotalItems = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const renderCartItem = ({ item }: { item: CartItemWithProduct }) => (
    <View style={styles.cartItemCard}>
      <View style={styles.cartItemHeader}>
        <Text style={styles.cartItemTitle}>
          {item.product?.title || 'Unknown Product'}
        </Text>
        <Text style={styles.cartItemPrice}>
          ${((item.product?.price || 0) * item.quantity).toFixed(2)}
        </Text>
      </View>
      
      <Text style={styles.cartItemDescription} numberOfLines={2}>
        {item.product?.description || 'No description available'}
      </Text>
      
      <View style={styles.cartItemFooter}>
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Quantity: {item.quantity}</Text>
          <Text style={styles.unitPrice}>
            ${(item.product?.price || 0).toFixed(2)} each
          </Text>
        </View>
        
        <View style={styles.cartItemActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {/* TODO: Implement quantity update */}}
            disabled={updatingItem === item.idCartItem}
          >
            <Ionicons name="create-outline" size={16} color="#007bff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => {/* TODO: Implement remove item */}}
            disabled={updatingItem === item.idCartItem}
          >
            <Ionicons name="trash-outline" size={16} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Please log in to view your cart</Text>
        </View>
      </View>
    );
  }

  if (!cart || cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add some products to get started!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
        <Text style={styles.itemCount}>
          {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => `cart-item-${item.idCartItem}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.cartList}
      />

      {/* Cart Summary */}
      <View style={styles.cartSummary}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>${getTotalPrice().toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={() => {
            Alert.alert('Checkout', 'Checkout functionality coming soon!');
          }}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
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
  itemCount: {
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
  cartList: {
    padding: 16,
    paddingBottom: 100, // Space for bottom navigation
  },
  cartItemCard: {
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
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cartItemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginRight: 8,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  cartItemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cartItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantitySection: {
    flex: 1,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 2,
  },
  unitPrice: {
    fontSize: 12,
    color: '#666',
  },
  cartItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  removeButton: {
    borderColor: '#dc3545',
  },
  cartSummary: {
    position: 'absolute',
    bottom: 80, // Above bottom navigation
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
  },
  checkoutButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen; 