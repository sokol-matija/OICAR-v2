import { ItemDTO, ItemCategoryDTO } from '../types/product';
import { API_BASE_URL } from './apiConfig';

export class ProductService {
  static async getAllItems(): Promise<ItemDTO[]> {
    try {
      const url = `${API_BASE_URL}/items`;
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

      const response_data = await response.json();
      // Log API response summary (avoiding large image data)
      console.log('🔍 API response summary:', {
        success: response_data.success,
        itemCount: response_data.data?.data?.length || 0,
        hasData: !!response_data.data
      });
      
      // Handle the new API response format - items are in response_data.data.data
      const data = response_data.data?.data || response_data.data || response_data;
      console.log(`✅ Loaded ${data.length} items`);
      // Log first item summary (avoiding image blob)
      if (data[0]) {
        const firstItem = { ...data[0] };
        if (firstItem.primaryImage?.imageData) {
          firstItem.primaryImage.imageData = `[${firstItem.primaryImage.imageData.length} chars]`;
        }
        console.log('🔍 First item summary:', JSON.stringify(firstItem, null, 2));
      }
      
      // Map to the correct field names from your API response
      return data.map((item: any, index: number) => {
        const mappedItem = {
          idItem: item.idItem || item.IDItem || item.Id || item.id,
          itemCategoryID: item.itemCategoryID || item.ItemCategoryID || item.CategoryID || item.categoryId,
          title: item.title || item.Title || 'Untitled Product',
          description: item.description || item.Description || '',
          stockQuantity: item.stockQuantity ?? item.StockQuantity ?? 0,
          price: Number(item.price ?? item.Price ?? 0),
          weight: Number(item.weight ?? item.Weight ?? 0),
          // Preserve all additional fields from API
          ...item
        };
        
        // Debug just the essential info to avoid blob data
        console.log(`🔍 Mapped item ${index}:`, {
          id: mappedItem.idItem,
          title: mappedItem.title,
          price: mappedItem.price,
          stock: mappedItem.stockQuantity,
          description: mappedItem.description?.substring(0, 30) || 'None',
          categoryName: (mappedItem as any).categoryName || 'None',
          hasImage: !!(mappedItem as any).primaryImage?.imageData
        });
        
        return mappedItem;
      }).filter((item: any) => item.idItem !== undefined && item.idItem !== null);
    } catch (error) {
      console.log('💥 Get items exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load items');
    }
  }

  static async getAllCategories(): Promise<ItemCategoryDTO[]> {
    try {
      const url = `${API_BASE_URL}/categories`;
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

      const response_data = await response.json();
      console.log('🔍 Full categories API response:', JSON.stringify(response_data, null, 2));
      
      // Handle the new API response format (categories are directly in data array)
      const data = response_data.data || response_data;
      console.log(`✅ Loaded ${data.length} categories`);
      console.log('🔍 First category raw data:', JSON.stringify(data[0], null, 2));
      
      // Convert backend naming to frontend naming
      return data.map((category: any) => ({
        idItemCategory: category.IDItemCategory || category.idItemCategory || category.Id || category.id,
        categoryName: category.CategoryName || category.categoryName || category.Name || category.name,
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

      const response_data = await response.json();
      
      // Handle the new API response format
      const data = response_data.data?.data || response_data.data || response_data;
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

      const response_data = await response.json();
      
      // Handle the new API response format
      const data = response_data.data?.data || response_data.data || response_data;
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