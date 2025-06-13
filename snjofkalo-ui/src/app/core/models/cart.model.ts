import { BaseCartItem, Item, User } from './index';

export interface CartItem extends BaseCartItem {
    item: any;
}

export interface CartItemWithDetails extends CartItem {
  item: Item;
  itemTitle: string;
  itemPrice: number;
  user?: User;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartWithDetails extends Cart {
  items: (CartItem & {
    item: {
      id: string;
      name: string;
      description: string;
      images: string[];
      availableQuantity: number;
    };
  })[];
} 