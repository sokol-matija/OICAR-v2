import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { CartItemWithDetails } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="cart-container">
      <h1>Shopping Cart</h1>
      
      <div *ngIf="cartItems.length === 0" class="empty-cart">
        <p>Your cart is empty</p>
        <a routerLink="/items" class="continue-shopping">Continue Shopping</a>
      </div>

      <div *ngIf="cartItems.length > 0" class="cart-content">
        <div class="cart-items">
          <div *ngFor="let item of cartItems" class="cart-item">
            <img [src]="item.item.images[0]?.imageData || 'assets/images/placeholder.jpg'" [alt]="item.item.title">
            <div class="item-details">
              <h3>{{ item.item.title }}</h3>
              <p class="description">{{ item.item.description }}</p>
              <p class="price">{{ item.item.price | currency:'EUR' }}</p>
              <p class="stock">Available: {{ item.item.stockQuantity }}</p>
              <div class="quantity-controls">
                <button (click)="updateQuantity(item, item.quantity - 1)" [disabled]="item.quantity <= 1">-</button>
                <input type="number" [(ngModel)]="item.quantity" min="1" [max]="item.item.stockQuantity" (change)="updateQuantity(item, item.quantity)">
                <button (click)="updateQuantity(item, item.quantity + 1)" [disabled]="item.quantity >= item.item.stockQuantity">+</button>
              </div>
            </div>
            <div class="item-total">
              <p>{{ (item.item.price * item.quantity) | currency:'EUR' }}</p>
              <button class="remove-btn" (click)="removeItem(item)">Remove</button>
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <h2>Order Summary</h2>
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>{{ subtotal | currency:'EUR' }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping:</span>
            <span>{{ shipping | currency:'EUR' }}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>{{ total | currency:'EUR' }}</span>
          </div>
          <button class="checkout-btn" routerLink="/checkout">Proceed to Checkout</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .empty-cart {
      text-align: center;
      padding: 3rem;
    }

    .continue-shopping {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background-color: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }

    .cart-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .cart-item img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 4px;
    }

    .item-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .description {
      color: #666;
      font-size: 0.9rem;
      margin: 0.5rem 0;
    }

    .stock {
      color: #27ae60;
      font-size: 0.9rem;
    }

    .price {
      color: #2c3e50;
      font-weight: bold;
      font-size: 1.1rem;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .quantity-controls button {
      width: 30px;
      height: 30px;
      border: 1px solid #ddd;
      background-color: white;
      border-radius: 4px;
      cursor: pointer;
    }

    .quantity-controls input {
      width: 60px;
      text-align: center;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 0.25rem;
    }

    .item-total {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .remove-btn {
      padding: 0.5rem;
      background-color: #e74c3c;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .cart-summary {
      background-color: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      height: fit-content;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin: 1rem 0;
    }

    .summary-row.total {
      font-size: 1.2rem;
      font-weight: bold;
      border-top: 1px solid #ddd;
      padding-top: 1rem;
      margin-top: 1rem;
    }

    .checkout-btn {
      width: 100%;
      padding: 1rem;
      background-color: #2ecc71;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1.1rem;
      cursor: pointer;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .cart-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  cartItems: CartItemWithDetails[] = [];
  subtotal = 0;
  shipping = 5.99;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  private loadCart(): void {
    this.cartService.getCart().subscribe(
      (items) => {
        this.cartItems = items;
        this.calculateSubtotal();
      },
      (error) => {
        console.error('CartComponent - Error loading cart:', error);
      }
    );
  }

  updateQuantity(item: CartItemWithDetails, newQuantity: number): void {
    if (newQuantity < 1 || newQuantity > item.item.stockQuantity) return;

    this.cartService.updateCartItem(item.idCartItem, newQuantity).subscribe({
      next: () => {
        item.quantity = newQuantity;
        this.calculateSubtotal();
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
      }
    });
  }

  removeItem(item: CartItemWithDetails): void {
    this.cartService.removeFromCart(item.idCartItem).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(i => i.idCartItem !== item.idCartItem);
        this.calculateSubtotal();
      },
      error: (error) => {
        console.error('Error removing item:', error);
      }
    });
  }

  private calculateSubtotal(): void {
    this.subtotal = this.cartItems.reduce((acc, item) => {
      const itemPrice = item.itemPrice || 0;
      const quantity = item.quantity || 0;
      const itemTotal = itemPrice * quantity;
      return acc + itemTotal;
    }, 0);
    console.log('CartComponent Debug - cartItems:', this.cartItems, 'subtotal:', this.subtotal);
  }

  get total(): number {
    const calculatedTotal = this.subtotal + this.shipping;
    return calculatedTotal;
  }
} 