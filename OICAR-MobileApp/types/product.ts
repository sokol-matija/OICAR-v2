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