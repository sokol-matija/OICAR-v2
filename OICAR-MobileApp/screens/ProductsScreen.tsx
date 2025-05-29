import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Alert,
  FlatList,
  Dimensions,
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ItemDTO, ItemCategoryDTO } from '../types/product';
import { CartDTO } from '../types/cart';
import { ProductService } from '../utils/productService';
import { CartService } from '../utils/cartService';
import { JWTUtils } from '../utils/jwtUtils';

const { width } = Dimensions.get('window');

interface ProductsScreenProps {
  navigation?: any;
  token?: string;
}

const ProductsScreen: React.FC<ProductsScreenProps> = ({ navigation, token }) => {
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [categories, setCategories] = useState<ItemCategoryDTO[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [cart, setCart] = useState<CartDTO | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, selectedCategory, searchQuery]);

  useEffect(() => {
    if (token) {
      loadUserCart();
    }
  }, [token]);

  const loadData = async () => {
    try {
      console.log('🔄 Loading products and categories...');
      
      const [itemsData, categoriesData] = await Promise.all([
        ProductService.getAllItems(),
        ProductService.getAllCategories()
      ]);
      
      setItems(itemsData);
      setCategories(categoriesData);
      console.log(`✅ Loaded ${itemsData.length} items and ${categoriesData.length} categories`);
    } catch (error) {
      console.log('❌ Failed to load data:', error);
      Alert.alert('Error', 'Failed to load products and categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== null) {
      filtered = filtered.filter(item => item.itemCategoryID === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) {
      filterItems();
      return;
    }

    try {
      setSearchLoading(true);
      const searchResults = await ProductService.searchItemsByTitle(searchQuery);
      
      // If we have a category selected, filter the search results by category
      let filtered = searchResults;
      if (selectedCategory !== null) {
        filtered = searchResults.filter(item => item.itemCategoryID === selectedCategory);
      }
      
      setFilteredItems(filtered);
    } catch (error) {
      console.log('❌ Search failed:', error);
      Alert.alert('Error', 'Failed to search products');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setShowCategoryDropdown(false);
    setSearchQuery(''); // Clear search when changing category
  };

  const getCategoryName = (categoryId: number): string => {
    console.log(`🔍 Looking for category ID: ${categoryId}`);
    console.log(`📋 Available categories:`, categories.map(cat => ({ id: cat.idItemCategory, name: cat.categoryName })));
    
    const category = categories.find(cat => cat.idItemCategory === categoryId);
    const result = category ? category.categoryName : 'Unknown';
    
    console.log(`📝 Category result for ID ${categoryId}: ${result}`);
    return result;
  };

  const getSelectedCategoryName = (): string => {
    if (selectedCategory === null) return 'All Products';
    return getCategoryName(selectedCategory);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSelectedCategory(null);
    setSearchQuery('');
    loadData();
  };

  const loadUserCart = async () => {
    if (!token) return;

    try {
      const userId = JWTUtils.parseToken(token)?.id;
      if (!userId) return;

      console.log('🔄 Loading user cart...');
      let userCart = await CartService.getUserCart(parseInt(userId), token);
      
      if (!userCart) {
        // Create a new cart if none exists
        userCart = await CartService.createCart(parseInt(userId), token);
      }
      
      setCart(userCart);
      console.log('✅ Cart loaded successfully');
    } catch (error) {
      console.log('❌ Failed to load cart:', error);
      // Don't show alert for cart loading errors - cart functionality is optional
    }
  };

  const handleAddToCart = async (item: ItemDTO) => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please log in to add items to cart');
      return;
    }

    if (item.stockQuantity <= 0) {
      Alert.alert('Out of Stock', 'This item is currently out of stock');
      return;
    }

    setAddingToCart(item.idItem);

    try {
      const userId = JWTUtils.parseToken(token)?.id;
      if (!userId) {
        Alert.alert('Error', 'Invalid authentication token');
        return;
      }

      let currentCart = cart;
      if (!currentCart) {
        currentCart = await CartService.createCart(parseInt(userId), token);
        setCart(currentCart);
      }

      await CartService.addItemToCart(currentCart.idCart, item.idItem, 1, token);
      
      // Update local stock count (optimistic update)
      setItems(prevItems => 
        prevItems.map(prevItem => 
          prevItem.idItem === item.idItem 
            ? { ...prevItem, stockQuantity: prevItem.stockQuantity - 1 }
            : prevItem
        )
      );

      // Reload cart to get updated state
      await loadUserCart();

      Alert.alert('Success', `${item.title} added to cart!`);
    } catch (error) {
      console.log('❌ Add to cart failed:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(null);
    }
  };

  const renderProductItem = ({ item }: { item: ItemDTO }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productTitle}>{item.title || 'Untitled Product'}</Text>
        <Text style={styles.productPrice}>${(item.price || 0).toFixed(2)}</Text>
      </View>
      
      <Text style={styles.productDescription} numberOfLines={2}>
        {item.description || 'No description available'}
      </Text>
      
      <View style={styles.productFooter}>
        <View style={styles.productInfo}>
          <Text style={styles.productCategory}>
            {getCategoryName(item.itemCategoryID || 0)}
          </Text>
          <View style={styles.productMeta}>
            <Text style={[styles.productStock, (item.stockQuantity || 0) > 0 ? styles.inStock : styles.outOfStock]}>
              {(item.stockQuantity || 0) > 0 ? `${item.stockQuantity} in stock` : 'Out of stock'}
            </Text>
            <Text style={styles.productWeight}>{(item.weight || 0).toFixed(1)}kg</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            (item.stockQuantity || 0) <= 0 && styles.addToCartButtonDisabled,
            addingToCart === item.idItem && styles.addToCartButtonLoading
          ]}
          onPress={() => handleAddToCart(item)}
          disabled={(item.stockQuantity || 0) <= 0 || addingToCart === item.idItem}
        >
          {addingToCart === item.idItem ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="cart" size={16} color="white" style={styles.cartIcon} />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchLoading && (
            <ActivityIndicator size="small" color="#007bff" style={styles.searchLoader} />
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchSubmit}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.categorySelector}
          onPress={() => setShowCategoryDropdown(true)}
        >
          <View style={styles.categorySelectorContent}>
            <Ionicons name="filter" size={20} color="#007bff" />
            <Text style={styles.categorySelectorText}>{getSelectedCategoryName()}</Text>
            <Ionicons name="chevron-down" size={20} color="#007bff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <View style={styles.productsSection}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultCount}>
            {filteredItems.length} {filteredItems.length === 1 ? 'product' : 'products'}
            {selectedCategory !== null && ` in ${getCategoryName(selectedCategory)}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </Text>
        </View>

        <FlatList
          data={filteredItems}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => `product-${item.idItem || `fallback-${index}`}`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={[
            styles.productsList,
            filteredItems.length === 0 && styles.emptyList
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No products found matching your search' : 'No products available'}
              </Text>
              {searchQuery && (
                <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearButtonText}>Clear search</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>

      {/* Category Dropdown Modal */}
      <Modal
        visible={showCategoryDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryDropdown(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.dropdownList}>
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  selectedCategory === null && styles.dropdownItemSelected
                ]}
                onPress={() => handleCategorySelect(null)}
              >
                <Text style={[
                  styles.dropdownItemText,
                  selectedCategory === null && styles.dropdownItemTextSelected
                ]}>
                  All Products
                </Text>
                {selectedCategory === null && (
                  <Ionicons name="checkmark" size={20} color="#007bff" />
                )}
              </TouchableOpacity>
              
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.idItemCategory}
                  style={[
                    styles.dropdownItem,
                    selectedCategory === category.idItemCategory && styles.dropdownItemSelected
                  ]}
                  onPress={() => handleCategorySelect(category.idItemCategory)}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    selectedCategory === category.idItemCategory && styles.dropdownItemTextSelected
                  ]}>
                    {category.categoryName}
                  </Text>
                  {selectedCategory === category.idItemCategory && (
                    <Ionicons name="checkmark" size={20} color="#007bff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchLoader: {
    marginLeft: 8,
  },
  searchButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categorySelector: {
    padding: 16,
  },
  categorySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categorySelectorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  productsSection: {
    flex: 1,
  },
  resultHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  productsList: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  productCard: {
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
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginRight: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productInfo: {
    flex: 1,
  },
  productCategory: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  productMeta: {
    alignItems: 'flex-end',
  },
  productStock: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  inStock: {
    color: '#28a745',
  },
  outOfStock: {
    color: '#dc3545',
  },
  productWeight: {
    fontSize: 11,
    color: '#666',
  },
  addToCartButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addToCartButtonLoading: {
    backgroundColor: '#007bff',
  },
  cartIcon: {
    marginRight: 8,
  },
  addToCartText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  clearButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: width * 0.8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  dropdownItemSelected: {
    backgroundColor: '#f8f9fa',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  dropdownItemTextSelected: {
    color: '#007bff',
  },
});

export default ProductsScreen; 