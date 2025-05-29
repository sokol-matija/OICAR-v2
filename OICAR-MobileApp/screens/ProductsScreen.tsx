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
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ItemDTO, ItemCategoryDTO } from '../types/product';
import { ProductService } from '../utils/productService';

const { width } = Dimensions.get('window');

interface ProductsScreenProps {
  navigation?: any;
}

const ProductsScreen: React.FC<ProductsScreenProps> = ({ navigation }) => {
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [categories, setCategories] = useState<ItemCategoryDTO[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, selectedCategory, searchQuery]);

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
    setSearchQuery(''); // Clear search when changing category
  };

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(cat => cat.idItemCategory === categoryId);
    return category ? category.categoryName : 'Unknown';
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSelectedCategory(null);
    setSearchQuery('');
    loadData();
  };

  const renderCategoryButton = ({ item }: { item: ItemCategoryDTO | { idItemCategory: null, categoryName: string } }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.idItemCategory && styles.selectedCategoryButton
      ]}
      onPress={() => handleCategorySelect(item.idItemCategory)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === item.idItemCategory && styles.selectedCategoryButtonText
      ]}>
        {item.categoryName}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: ItemDTO }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      </View>
      
      <Text style={styles.productDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.productFooter}>
        <Text style={styles.productCategory}>
          {getCategoryName(item.itemCategoryID)}
        </Text>
        <View style={styles.productMeta}>
          <Text style={[styles.productStock, item.stockQuantity > 0 ? styles.inStock : styles.outOfStock]}>
            {item.stockQuantity > 0 ? `${item.stockQuantity} in stock` : 'Out of stock'}
          </Text>
          <Text style={styles.productWeight}>{item.weight}kg</Text>
        </View>
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

  const categoryData = [
    { idItemCategory: null, categoryName: 'All Products' },
    ...categories
  ];

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

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <FlatList
          horizontal
          data={categoryData}
          renderItem={renderCategoryButton}
          keyExtractor={(item) => `category-${item.idItemCategory || 'all'}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />
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
          keyExtractor={(item) => `product-${item.idItem}`}
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
  categoriesSection: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  selectedCategoryButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  selectedCategoryButtonText: {
    color: 'white',
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
});

export default ProductsScreen; 