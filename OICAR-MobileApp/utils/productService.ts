import { ItemDTO, ItemCategoryDTO } from '../types/product';
import { API_BASE_URL } from './apiConfig';

export class ProductService {
  static async getAllItems(): Promise<ItemDTO[]> {
    try {
      const url = `${API_BASE_URL}/items`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Get items error:', errorText);
        throw new Error(errorText || 'Failed to load items');
      }

      const response_data = await response.json();
      const data = response_data.data?.data || response_data.data || response_data;
      
      return data.map((item: any) => {
        const mappedItem = {
          idItem: item.idItem || item.IDItem || item.Id || item.id,
          itemCategoryID: item.itemCategoryID || item.ItemCategoryID || item.CategoryID || item.categoryId,
          title: item.title || item.Title || 'Untitled Product',
          description: item.description || item.Description || '',
          stockQuantity: item.stockQuantity ?? item.StockQuantity ?? 0,
          price: Number(item.price ?? item.Price ?? 0),
          weight: Number(item.weight ?? item.Weight ?? 0),
          ...item
        };
        
        return mappedItem;
      }).filter((item: any) => item.idItem !== undefined && item.idItem !== null);
    } catch (error) {
      console.log('Get items exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load items');
    }
  }

  static async getAllCategories(): Promise<ItemCategoryDTO[]> {
    try {
      const url = `${API_BASE_URL}/categories`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Get categories error:', errorText);
        throw new Error(errorText || 'Failed to load categories');
      }

      const response_data = await response.json();
      const data = response_data.data || response_data;
      
      return data.map((category: any) => ({
        idItemCategory: category.IDItemCategory || category.idItemCategory || category.Id || category.id,
        categoryName: category.CategoryName || category.categoryName || category.Name || category.name,
      }));
    } catch (error) {
      console.log('Get categories exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load categories');
    }
  }

  static async getItemsByCategory(categoryId: number): Promise<ItemDTO[]> {
    try {
      const url = `${API_BASE_URL}/item/categories/${categoryId}/items`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Get items by category error:', errorText);
        throw new Error(errorText || 'Failed to load items by category');
      }

      const response_data = await response.json();
      const data = response_data.data?.data || response_data.data || response_data;
      
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
      console.log('Get items by category exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load items by category');
    }
  }

  static async searchItemsByTitle(title: string): Promise<ItemDTO[]> {
    try {
      const url = `${API_BASE_URL}/item/items/title/search?title=${encodeURIComponent(title)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Search items error:', errorText);
        throw new Error(errorText || 'Failed to search items');
      }

      const response_data = await response.json();
      const data = response_data.data?.data || response_data.data || response_data;
      
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
      console.log('Search items exception:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search items');
    }
  }
} 