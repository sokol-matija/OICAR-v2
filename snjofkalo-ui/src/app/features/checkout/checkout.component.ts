import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { BaseCartItem, BaseItem } from '../../core/models/shared.types';

interface CartItemWithDetails extends BaseCartItem {
  item: BaseItem;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="checkout-container">
      <h1>Checkout</h1>

      <div *ngIf="cartItems.length === 0" class="empty-cart">
        <p>Your cart is empty</p>
        <a routerLink="/items" class="continue-shopping">Continue Shopping</a>
      </div>

      <div *ngIf="cartItems.length > 0 && !showConfirmation" class="checkout-content">
        <div class="checkout-form">
          <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
            <div class="form-section">
              <h2>Shipping Information</h2>
              <div class="form-group">
                <label for="fullName">Full Name</label>
                <input type="text" id="fullName" formControlName="fullName">
              </div>
              <div class="form-group">
                <label for="address">Address</label>
                <input type="text" id="address" formControlName="address">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="city">City</label>
                  <input type="text" id="city" formControlName="city">
                </div>
                <div class="form-group">
                  <label for="postalCode">Postal Code</label>
                  <input type="text" id="postalCode" formControlName="postalCode">
                </div>
              </div>
              <div class="form-group">
                <label for="country">Country</label>
                <input type="text" id="country" formControlName="country">
              </div>
            </div>

            <div class="form-section">
              <h2>Payment Information</h2>
              <div class="form-group">
                <label for="cardNumber">Card Number</label>
                <input type="text" id="cardNumber" formControlName="cardNumber" placeholder="1234 5678 9012 3456">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="expiryDate">Expiry Date</label>
                  <input type="text" id="expiryDate" formControlName="expiryDate" placeholder="MM/YY">
                </div>
                <div class="form-group">
                  <label for="cvv">CVV</label>
                  <input type="text" id="cvv" formControlName="cvv" placeholder="123">
                </div>
              </div>
            </div>

            <div class="form-section">
              <h2>Order Summary</h2>
              <div class="order-items">
                <div *ngFor="let item of cartItems" class="order-item">
                  <span>{{ item.item.title }} x {{ item.quantity }}</span>
                  <span>{{ item.item.price * item.quantity | currency:'EUR' }}</span>
                </div>
              </div>
              <div class="order-total">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>{{ subtotal | currency:'EUR' }}</span>
                </div>
                <div class="total-row">
                  <span>Shipping:</span>
                  <span>{{ shipping | currency:'EUR' }}</span>
                </div>
                <div class="total-row grand-total">
                  <span>Total:</span>
                  <span>{{ total | currency:'EUR' }}</span>
                </div>
              </div>
            </div>

            <button type="submit" class="place-order-btn" [disabled]="!checkoutForm.valid || isSubmitting">
              {{ isSubmitting ? 'Processing...' : 'Place Order' }}
            </button>
          </form>
        </div>
      </div>

      <div *ngIf="showConfirmation" class="order-confirmation-message">
        <h2>Order Placed Successfully!</h2>
        <p>{{ orderPlacedMessage }}</p>
        <p>Redirecting you to order confirmation page in a few seconds...</p>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
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

    .checkout-content {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .form-section {
      background-color: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .order-items {
      margin: 1rem 0;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
    }

    .order-total {
      margin-top: 1rem;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      margin: 0.5rem 0;
    }

    .grand-total {
      font-size: 1.2rem;
      font-weight: bold;
      border-top: 2px solid #eee;
      padding-top: 1rem;
      margin-top: 1rem;
    }

    .place-order-btn {
      width: 100%;
      padding: 1rem;
      background-color: #2ecc71;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1.1rem;
      transition: background-color 0.3s ease;

      &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }

      &:hover:not(:disabled) {
        background-color: #27ae60;
      }
    }

    .order-confirmation-message {
      text-align: center;
      padding: 3rem;
      background-color: #e6ffe6; /* Light green background for success */
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      color: #28a745; /* Dark green text */

      h2 {
        color: #28a745;
        margin-bottom: 1rem;
      }

      p {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItemWithDetails[] = [];
  checkoutForm: FormGroup;
  subtotal = 0;
  shipping = 5.99;
  isSubmitting = false;
  orderPlacedMessage: string | null = null;
  showConfirmation: boolean = false;
  isErrorConfirmation: boolean = false;

  constructor(
    private cartService: CartService,
    private ordersService: OrdersService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.checkoutForm = this.fb.group({
      fullName: [''],
      address: [''],
      city: [''],
      postalCode: [''],
      country: [''],
      cardNumber: [''],
      expiryDate: [''],
      cvv: ['']
    });

    // Add input formatting for card number
    this.checkoutForm.get('cardNumber')?.valueChanges.subscribe(value => {
      if (value) {
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, '');
        // Format with spaces every 4 digits
        const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        // Update the form control if the value has changed
        if (formatted !== value) {
          this.checkoutForm.patchValue({ cardNumber: formatted }, { emitEvent: false });
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadCart();
  }

  private loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (items: CartItemWithDetails[]) => {
        this.cartItems = items;
        this.calculateSubtotal();
      },
      error: (err: any) => {
        console.error('Failed to load cart items', err);
        this.cartItems = [];
      }
    });
  }

  private calculateSubtotal(): void {
    this.subtotal = this.cartItems.reduce((acc, item) => acc + (item.item.price * item.quantity), 0);
  }

  get total(): number {
    return this.subtotal + this.shipping;
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      console.error('Form is invalid.');
      return;
    }

    this.isSubmitting = true;
    
    // Format shipping address as a string
    const shippingAddress = {
      fullName: this.checkoutForm.get('fullName')?.value,
      address: this.checkoutForm.get('address')?.value,
      city: this.checkoutForm.get('city')?.value,
      postalCode: this.checkoutForm.get('postalCode')?.value,
      country: this.checkoutForm.get('country')?.value,
    };

    const orderData = {
      shippingAddress: JSON.stringify(shippingAddress),
      billingAddress: JSON.stringify(shippingAddress), // Using same address for billing
      cartItems: this.cartItems.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity
      }))
    };

    this.ordersService.createOrder(orderData).subscribe({
      next: (response: any) => {
        console.log('Order placed successfully:', response);
        this.cartService.clearCart().subscribe(() => {
          this.isSubmitting = false;
          this.orderPlacedMessage = `Your order #${response.data.idOrder} has been placed successfully!`;
          this.showConfirmation = true;
          this.isErrorConfirmation = false;

          setTimeout(() => {
            this.router.navigate(['/order-confirmation', response.data.idOrder]);
          }, 3000);
        });
      },
      error: (error: any) => {
        console.error('Error placing order:', error);
        this.isSubmitting = false;
        this.orderPlacedMessage = error.error?.message || 'Failed to place your order. Please try again.';
        this.showConfirmation = true;
        this.isErrorConfirmation = true;
      }
    });
  }
} 