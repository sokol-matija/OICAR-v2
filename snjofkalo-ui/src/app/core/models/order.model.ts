import { BaseOrder, User, Item } from './index';

export interface Order extends BaseOrder {}

export interface OrderWithDetails extends Order {
  user: User;
  status: Status;
  orderItems: OrderItem[];
  totalAmount: number;
}

export interface OrderItem {
  idOrderItem: number;
  orderId: number;
  itemId: number;
  quantity: number;
  priceAtOrder: number;
  itemTitle: string;
  item: Item;
}

export interface Status {
  idStatus: number;
  statusName: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
} 