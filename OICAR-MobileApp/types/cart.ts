export interface CartItemDTO {
  idCartItem: number;
  itemID: number;
  cartID: number;
  quantity: number;
}

export interface CartDTO {
  idCart: number;
  userID: number;
  cartItems: CartItemDTO[];
}

export interface AddToCartRequest {
  itemID: number;
  quantity: number;
} 