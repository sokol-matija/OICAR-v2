export interface OrderDTO {
  idOrder: number;
  userID: number;
  statusID: number;
  orderDate: string; // ISO date string
  totalAmount: number;
}

export interface OrderItemDTO {
  idOrderItem: number;
  orderID: number;
  itemID: number;
  quantity: number;
}

export interface StatusDTO {
  idStatus: number;
  name: string;
  description: string;
}

export interface CreateOrderRequest {
  userID: number;
  statusID: number;
  totalAmount: number;
  orderItems: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  itemID: number;
  quantity: number;
}

export interface OrderWithItems extends OrderDTO {
  orderItems: OrderItemDTO[];
  status?: StatusDTO;
} 