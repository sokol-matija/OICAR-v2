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
import { OrderService } from '../utils/orderService';
import { JWTUtils } from '../utils/jwtUtils';

interface CartScreenProps {
  token?: string;
  onNavigateToOrders?: () => void;
}

interface CartItemWithProduct extends CartItemDTO {
  product?: ItemDTO;
}

const CartScreen: React.FC<CartScreenProps> = ({ token, onNavigateToOrders }) => {
  const [cart, setCart] = useState<CartDTO | null>(null);
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

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
      console.log('🛒 Loading cart...');
      
      const userCart = await CartService.getUserCart(token);
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

  const handleCheckout = async () => {
    console.log('🛒 === CHECKOUT DEBUG START ===');
    console.log('🛒 Token available:', !!token);
    console.log('🛒 Cart available:', !!cart);
    console.log('🛒 Cart items count:', cartItems.length);
    
    if (!token) {
      console.log('❌ No token available for checkout');
      Alert.alert('Authentication Required', 'Please log in to checkout');
      return;
    }

    if (!cart || cartItems.length === 0) {
      console.log('❌ No cart or cart items for checkout');
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }

    setCheckingOut(true);

    try {
      console.log('🔍 Extracting user ID from token...');
      const userId = JWTUtils.getUserIdFromToken(token);
      
      if (!userId) {
        console.log('❌ Could not extract user ID from token');
        throw new Error('Could not verify user identity');
      }

      console.log('✅ User ID extracted:', userId);
      console.log('🛒 Creating order from cart...');
      
      // Create order from cart
      const createdOrder = await OrderService.createOrderFromCart(cart, userId, token);
      console.log('✅ Order created:', JSON.stringify(createdOrder, null, 2));

      // Clear the cart after successful order creation
      console.log('🧹 Clearing cart...');
      await OrderService.clearCart(cart.idCart, token);
      console.log('✅ Cart cleared');

      // Update local state
      setCart(null);
      setCartItems([]);

      // Show success message
      Alert.alert(
        'Order Placed Successfully! 🎉',
        `Your order #${createdOrder.idOrder} has been placed. Thank you for your purchase!`,
        [
          {
            text: 'View Orders',
            onPress: () => {
              if (onNavigateToOrders) {
                onNavigateToOrders();
              } else {
                console.log('Navigate to orders screen');
              }
            }
          },
          {
            text: 'Continue Shopping',
            style: 'cancel'
          }
        ]
      );

      console.log('✅ Checkout completed successfully');
    } catch (error) {
      console.log('💥 Checkout error:', error);
      Alert.alert(
        'Checkout Failed',
        error instanceof Error ? error.message : 'An error occurred during checkout. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setCheckingOut(false);
      console.log('🛒 === CHECKOUT DEBUG END ===');
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please log in to remove items');
      return;
    }

    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setUpdatingItem(cartItemId);
            try {
              await CartService.removeCartItem(cartItemId, token);
              // Reload cart after successful removal
              await loadCart();
              Alert.alert('Success', 'Item removed from cart');
            } catch (error) {
              console.log('❌ Remove item error:', error);
              Alert.alert('Error', 'Failed to remove item from cart');
            } finally {
              setUpdatingItem(null);
            }
          }
        }
      ]
    );
  };

  const handleUpdateQuantity = async (cartItemId: number, currentQuantity: number) => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please log in to update items');
      return;
    }

    Alert.prompt(
      'Update Quantity',
      'Enter new quantity:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async (newQuantityStr) => {
            const newQuantity = parseInt(newQuantityStr || '1');
            if (isNaN(newQuantity) || newQuantity < 1) {
              Alert.alert('Invalid Quantity', 'Please enter a valid quantity (1 or more)');
              return;
            }

            setUpdatingItem(cartItemId);
            try {
              await CartService.updateCartItemQuantity(cartItemId, newQuantity, token);
              // Reload cart after successful update
              await loadCart();
              Alert.alert('Success', 'Quantity updated');
            } catch (error) {
              console.log('❌ Update quantity error:', error);
              Alert.alert('Error', 'Failed to update quantity');
            } finally {
              setUpdatingItem(null);
            }
          }
        }
      ],
      'plain-text',
      currentQuantity.toString()
    );
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
            onPress={() => handleUpdateQuantity(item.idCartItem, item.quantity)}
            disabled={updatingItem === item.idCartItem}
          >
            {updatingItem === item.idCartItem ? (
              <ActivityIndicator size="small" color="#007bff" />
            ) : (
              <Ionicons name="create-outline" size={16} color="#007bff" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => handleRemoveItem(item.idCartItem)}
            disabled={updatingItem === item.idCartItem}
          >
            {updatingItem === item.idCartItem ? (
              <ActivityIndicator size="small" color="#dc3545" />
            ) : (
              <Ionicons name="trash-outline" size={16} color="#dc3545" />
            )}
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
          style={[styles.checkoutButton, checkingOut && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={checkingOut}
        >
          {checkingOut ? (
            <View style={styles.checkoutButtonContent}>
              <ActivityIndicator size="small" color="white" style={styles.checkoutLoader} />
              <Text style={styles.checkoutButtonText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          )}
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
  checkoutButtonDisabled: {
    backgroundColor: '#ccc',
  },
  checkoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutLoader: {
    marginRight: 8,
  },
});

export default CartScreen; 