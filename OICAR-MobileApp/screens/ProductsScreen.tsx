import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Modal,
  Image 
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

  // Load cart after login - will be called when component mounts
  useEffect(() => {
    loadUserCart();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading products and categories...');
      
      const [itemsData, categoriesData] = await Promise.all([
        ProductService.getAllItems(),
        ProductService.getAllCategories()
      ]);
      
      setItems(itemsData);
      setCategories(categoriesData);
      console.log(`Loaded ${itemsData.length} items and ${categoriesData.length} categories`);
    } catch (error) {
      console.log('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load products and categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setShowCategoryDropdown(false);
    setSearchQuery(''); // Clear search when changing category
  };

  // Memoized category lookup map for performance
  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach(category => {
      map.set(category.idItemCategory, category.categoryName);
    });
    return map;
  }, [categories]);

  const getCategoryName = useCallback((categoryId: number): string => {
    return categoryMap.get(categoryId) || 'Unknown';
  }, [categoryMap]);

  const filterItems = useCallback(() => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== null) {
      // Find the category name for the selected category ID
      const selectedCategoryName = getCategoryName(selectedCategory);
      console.log('Filtering by category:', { selectedCategory, selectedCategoryName });
      
      filtered = filtered.filter(item => {
        const hasMatchingCategoryId = item.itemCategoryID === selectedCategory;
        const hasMatchingCategoryName = (item as any).categoryName === selectedCategoryName;
        
        console.log('Item filter check:', {
          itemTitle: item.title,
          itemCategoryID: item.itemCategoryID,
          itemCategoryName: (item as any).categoryName,
          selectedCategory,
          selectedCategoryName,
          hasMatchingCategoryId,
          hasMatchingCategoryName,
          matches: hasMatchingCategoryId || hasMatchingCategoryName
        });
        
        // Check both itemCategoryID and categoryName for compatibility
        return hasMatchingCategoryId || hasMatchingCategoryName;
      });
      
      console.log('Filtered items count:', filtered.length);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [items, selectedCategory, searchQuery, getCategoryName]);

  // Filter items when data loads or category selection changes
  useEffect(() => {
    filterItems();
  }, [filterItems]);

  const handleSearchSubmit = useCallback(async () => {
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
        const selectedCategoryName = getCategoryName(selectedCategory);
        filtered = searchResults.filter(item => {
          return item.itemCategoryID === selectedCategory || 
                 (item as any).categoryName === selectedCategoryName;
        });
      }
      
      setFilteredItems(filtered);
    } catch (error) {
              console.log('Search failed:', error);
      Alert.alert('Error', 'Failed to search products');
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, selectedCategory, filterItems]);

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

  const loadUserCart = useCallback(async () => {
    try {
      console.log('Loading user cart...');
      let userCart = await CartService.getUserCart();
      
      setCart(userCart);
              console.log('Cart loaded successfully');
    } catch (error) {
              console.log('Failed to load cart:', error);
      // Don't show alert for cart loading errors - cart functionality is optional
    }
  }, []);

  const addToCart = async (item: ItemDTO) => {
    if (!item.idItem) {
      Alert.alert('Error', 'Invalid item selected');
      return;
    }

    if (item.stockQuantity <= 0) {
      Alert.alert('Out of Stock', 'This item is currently out of stock');
      return;
    }

          console.log('ADD TO CART DEBUG START');
      console.log('Item to add:', {
      idItem: item.idItem,
      title: item.title,
      description: item.description,
      stockQuantity: item.stockQuantity,
      price: item.price,
      weight: item.weight,
      categoryName: (item as any).categoryName,
      isActive: (item as any).isActive,
      isFeatured: (item as any).isFeatured,
      createdAt: (item as any).createdAt,
      sellerUserID: (item as any).sellerUserID,
      sellerName: (item as any).sellerName,
      itemStatus: (item as any).itemStatus,
      isApproved: (item as any).isApproved,
      primaryImage: (item as any).primaryImage ? {
        ...(item as any).primaryImage,
        imageData: `[${(item as any).primaryImage.imageData?.length || 0} chars]`
      } : null,
      imageCount: (item as any).imageCount,
      isUserGenerated: (item as any).isUserGenerated,
      itemSource: (item as any).itemSource,
      isAvailableForPurchase: (item as any).isAvailableForPurchase,
      statusDisplay: (item as any).statusDisplay
    });
          console.log('Item stock:', item.stockQuantity);
      
      console.log('Set adding to cart for item:', item.idItem);
    setAddingToCart(item.idItem);

    try {
              console.log('Adding item to cart directly...');
        console.log('Item ID:', item.idItem);
        console.log('Quantity:', 1);
      await CartService.addItemToCart(item.idItem, 1);
      Alert.alert('Success', 'Item added to cart!');
    } catch (error) {
              console.log('ADD TO CART ERROR:', error);
        console.log('Error details:', error);
      
      // Parse error message for better user experience
      let errorMessage = 'Failed to add item to cart';
      
      if (error instanceof Error) {
        const errorString = error.message;
        
        // Check for specific error messages
        if (errorString.includes('You cannot add your own items to cart')) {
          errorMessage = "You can't add your own items to cart! Try viewing other sellers' items instead.";
        } else if (errorString.includes('Insufficient stock')) {
          errorMessage = 'This item is out of stock';
        } else if (errorString.includes('not found or not available')) {
          errorMessage = 'This item is no longer available';
        } else {
          errorMessage = errorString;
        }
      }
      
      Alert.alert('Cannot Add to Cart', errorMessage);
    } finally {
      setAddingToCart(null);
      console.log('ADD TO CART DEBUG END');
    }
  };

  const renderProduct = ({ item }: { item: ItemDTO }) => {
    // Debug description and category logging
    console.log('📝 Description debug:', {
      itemTitle: item.title,
      itemDescription: item.description,
      rawDescription: (item as any).description,
      apiDescription: (item as any).Description
    });
    
    console.log('🏷️ Category debug:', {
      itemTitle: item.title,
      itemCategoryID: item.itemCategoryID,
      finalCategoryName: (item as any).categoryName,
      apiCategoryName: (item as any).CategoryName
    });

    // Get display description - prefer longer description
    const displayDescription = item.description || 
      (item as any).Description || 
      'No description available';
    
    // Get the primary image with proper formatting
    const primaryImage = (item as any).primaryImage;
    let imageSource = null;
    
    if (primaryImage?.imageData) {
      // Clean the base64 data - remove any data URL prefix if present
      let imageData = primaryImage.imageData;
      if (imageData.startsWith('data:image/')) {
        imageData = imageData.split(',')[1];
      }
      
      // Ensure proper base64 format
      imageSource = { uri: `data:image/jpeg;base64,${imageData}` };
    }

    return (
      <View style={styles.productCard}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image 
              source={imageSource} 
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="camera-outline" size={32} color="#999" />
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{item.title}</Text>
          <Text style={styles.productPrice}>${Number(item.price).toFixed(2)}</Text>
          
          {/* Show truncated description if available */}
          {displayDescription && displayDescription !== 'No description available' && (
            <Text style={styles.productDescription}>
              {displayDescription.length > 50 
                ? `${displayDescription.substring(0, 50)}...` 
                : displayDescription}
            </Text>
          )}
          
          <Text style={styles.productCategory}>
            {(item as any).categoryName || 'Unknown Category'}
          </Text>
          
          <Text style={styles.productStock}>
            Stock: {item.stockQuantity} available
          </Text>
          
          <TouchableOpacity 
            testID={`add-to-cart-${item.idItem}`}
            style={[
              styles.addButton, 
              (item.stockQuantity <= 0 || addingToCart === item.idItem) && styles.addButtonDisabled
            ]}
            onPress={() => addToCart(item)}
            disabled={item.stockQuantity <= 0 || addingToCart === item.idItem}
          >
            {addingToCart === item.idItem ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="cart" size={16} color="white" />
                <Text style={styles.addButtonText}>
                  {item.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
           };

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
            testID="products-search-input"
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
        <TouchableOpacity testID="products-search-button" style={styles.searchButton} onPress={handleSearchSubmit}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          testID="category-filter-dropdown"
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
          renderItem={renderProduct}
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
              <TouchableOpacity testID="category-dropdown-close" onPress={() => setShowCategoryDropdown(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.dropdownList}>
              <TouchableOpacity
                testID="category-all-products"
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
                  testID={`category-${category.idItemCategory}`}
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
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  noImageText: {
    fontSize: 32,
    color: '#dee2e6',
    marginBottom: 8,
  },
  productInfo: {
    padding: 16,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
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
  productCategory: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
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