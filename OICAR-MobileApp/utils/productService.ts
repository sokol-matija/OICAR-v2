import { Platform } from 'react-native';
import { ItemDTO, ItemCategoryDTO } from '../types/product';

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

export class ProductService {
  static async getAllItems(): Promise<ItemDTO[]> {
    try {
      const url = `${API_BASE_URL}/item`;
      console.log('🔍 Get all items:', { url });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Get items response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get items error:', errorText);
        throw new Error(errorText || 'Failed to load items');
      }

      const data = await response.json();
      console.log(`✅ Loaded ${data.length} items`);
      console.log('🔍 First item raw data:', JSON.stringify(data[0], null, 2));
      
      // Convert backend naming to frontend naming with safety checks
      return data.map((item: any, index: number) => {
        const mappedItem = {
          idItem: item.IDItem || item.idItem || item.Id || item.id,
          itemCategoryID: item.ItemCategoryID || item.itemCategoryID || item.CategoryID || item.categoryId,
          title: item.Title || item.title || 'Untitled Product',
          description: item.Description || item.description || 'No description available',
          stockQuantity: item.StockQuantity ?? item.stockQuantity ?? 0,
          price: Number(item.Price ?? item.price ?? 0),
          weight: Number(item.Weight ?? item.weight ?? 0),
        };
        
        // Log any items with undefined IDs for debugging
        if (!mappedItem.idItem) {
          console.log(`⚠️ Item ${index} has undefined ID:`, JSON.stringify(item, null, 2));
        }
        
        return mappedItem;
      }).filter(item => item.idItem !== undefined && item.idItem !== null); // Filter out invalid items
    } catch (error) {
      console.log('💥 Get items exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load items');
    }
  }

  static async getAllCategories(): Promise<ItemCategoryDTO[]> {
    try {
      const url = `${API_BASE_URL}/itemcategory`;
      console.log('🔍 Get all categories:', { url });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Get categories response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get categories error:', errorText);
        throw new Error(errorText || 'Failed to load categories');
      }

      const data = await response.json();
      console.log(`✅ Loaded ${data.length} categories`);
      
      // Convert backend naming to frontend naming
      return data.map((category: any) => ({
        idItemCategory: category.IDItemCategory,
        categoryName: category.CategoryName,
      }));
    } catch (error) {
      console.log('💥 Get categories exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load categories');
    }
  }

  static async getItemsByCategory(categoryId: number): Promise<ItemDTO[]> {
    try {
      const url = `${API_BASE_URL}/item/categories/${categoryId}/items`;
      console.log('🔍 Get items by category:', { url, categoryId });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Get items by category response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Get items by category error:', errorText);
        throw new Error(errorText || 'Failed to load items by category');
      }

      const data = await response.json();
      console.log(`✅ Loaded ${data.length} items for category ${categoryId}`);
      
      // Convert backend naming to frontend naming
      return data.map((item: any) => ({
        idItem: item.IDItem,
        itemCategoryID: item.ItemCategoryID,
        title: item.Title,
        description: item.Description,
        stockQuantity: item.StockQuantity,
        price: item.Price,
        weight: item.Weight,
      }));
    } catch (error) {
      console.log('💥 Get items by category exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load items by category');
    }
  }

  static async searchItemsByTitle(title: string): Promise<ItemDTO[]> {
    try {
      const url = `${API_BASE_URL}/item/items/title/search?title=${encodeURIComponent(title)}`;
      console.log('🔍 Search items by title:', { url, title });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Search items response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Search items error:', errorText);
        throw new Error(errorText || 'Failed to search items');
      }

      const data = await response.json();
      console.log(`✅ Found ${data.length} items matching "${title}"`);
      
      // Convert backend naming to frontend naming
      return data.map((item: any) => ({
        idItem: item.IDItem,
        itemCategoryID: item.ItemCategoryID,
        title: item.Title,
        description: item.Description,
        stockQuantity: item.StockQuantity,
        price: item.Price,
        weight: item.Weight,
      }));
    } catch (error) {
      console.log('💥 Search items exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search items');
    }
  }
} 