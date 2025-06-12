export interface ItemDTO {
  idItem: number;
  itemCategoryID: number;
  title: string;
  description: string;
  stockQuantity: number;
  price: number;
  weight: number;
}

export interface ItemCategoryDTO {
  idItemCategory: number;
  categoryName: string;
}

export interface ProductWithCategory {
  item: ItemDTO;
  category?: ItemCategoryDTO;
}

// NEW: Types for item creation
export interface CreateItemRequest {
  itemCategoryID: number;
  title: string;
  description: string;
  stockQuantity: number;
  price: number;
  isFeatured?: boolean;
  isApproved?: boolean;
  images?: ItemImageRequest[];
}

export interface ItemImageRequest {
  imageData: string; // Base64 string
  imageOrder: number;
  fileName?: string;
  contentType?: string;
}

export interface CreateItemFormData {
  title: string;
  description: string;
  price: string;
  stockQuantity: string;
  categoryId: number;
  images: ItemImageData[];
}

export interface ItemImageData {
  uri: string;
  base64: string;
  fileName?: string;
  type?: string;
}

export interface CreateItemResponse {
  success: boolean;
  data?: ItemDTO;
  message?: string;
  errors?: string[];
} 