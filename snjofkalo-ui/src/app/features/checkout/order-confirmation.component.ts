import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrdersService } from '../../core/services/orders.service';
import { BaseOrder, BaseItem } from '../../core/models/shared.types';

interface OrderItem {
  idOrderItem: number;
  orderId: number;
  itemId: number;
  quantity: number;
  price: number;
  item: BaseItem;
}

interface ShippingDetails {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface OrderWithDetails extends BaseOrder {
  orderItems: OrderItem[];
  shippingDetails: ShippingDetails;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  orderStatus: string;
}

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="confirmation-container">
      <div class="confirmation-card">
        <div class="success-icon">✓</div>
        <h1>Order Confirmed!</h1>
        <p class="thank-you">Thank you for your purchase</p>

        <div *ngIf="order" class="order-details">
          <div class="detail-section">
            <h2>Order Information</h2>
            <div class="detail-row">
              <span>Order Number:</span>
              <span>{{ order.idOrder }}</span>
            </div>
            <div class="detail-row">
              <span>Order Date:</span>
              <span>{{ order.orderDate | date:'medium' }}</span>
            </div>
            <div class="detail-row">
              <span>Status:</span>
              <span class="status-badge">{{ order.orderStatus }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h2>Shipping Information</h2>
            <div class="detail-row">
              <span>Name:</span>
              <span>{{ order.shippingDetails.fullName }}</span>
            </div>
            <div class="detail-row">
              <span>Address:</span>
              <span>{{ order.shippingDetails.address }}</span>
            </div>
            <div class="detail-row">
              <span>City:</span>
              <span>{{ order.shippingDetails.city }}</span>
            </div>
            <div class="detail-row">
              <span>Postal Code:</span>
              <span>{{ order.shippingDetails.postalCode }}</span>
            </div>
            <div class="detail-row">
              <span>Country:</span>
              <span>{{ order.shippingDetails.country }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h2>Order Summary</h2>
            <div class="order-items">
              <div *ngFor="let item of order.orderItems" class="order-item">
                <div class="item-details">
                  <span class="item-name">{{ item.item.title }}</span>
                  <span class="item-quantity">x{{ item.quantity }}</span>
                </div>
                <span class="item-price">{{ item.price * item.quantity | currency:'EUR' }}</span>
              </div>
            </div>
            <div class="order-total">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>{{ order.subtotal | currency:'EUR' }}</span>
              </div>
              <div class="total-row">
                <span>Shipping:</span>
                <span>{{ order.shippingCost | currency:'EUR' }}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total:</span>
                <span>{{ order.totalAmount | currency:'EUR' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <a routerLink="/items" class="continue-shopping">Continue Shopping</a>
          <a routerLink="/orders" class="view-orders">View My Orders</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .confirmation-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 2rem;
      text-align: center;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background-color: #2ecc71;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      margin: 0 auto 1.5rem;
    }

    .thank-you {
      color: #666;
      margin-bottom: 2rem;
    }

    .order-details {
      text-align: left;
      margin: 2rem 0;
    }

    .detail-section {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    .detail-section:last-child {
      border-bottom: none;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin: 0.5rem 0;
    }

    .status-badge {
      background-color: #2ecc71;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.9rem;
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

    .item-details {
      display: flex;
      gap: 0.5rem;
    }

    .item-quantity {
      color: #666;
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

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    .continue-shopping,
    .view-orders {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
    }

    .continue-shopping {
      background-color: #3498db;
      color: white;
    }

    .view-orders {
      background-color: #f8f9fa;
      color: #2c3e50;
      border: 1px solid #ddd;
    }

    @media (max-width: 768px) {
      .action-buttons {
        flex-direction: column;
      }

      .continue-shopping,
      .view-orders {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  order: OrderWithDetails | null = null;

  constructor(
    private route: ActivatedRoute,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(Number(orderId));
    }
  }

  private loadOrder(orderId: number): void {
    this.ordersService.getOrderById(orderId).subscribe({
      next: (order) => {
        if (this.isOrderWithDetails(order)) {
          this.order = order;
        } else {
          // Optionally handle fallback or error
          this.order = null;
        }
      },
      error: (error) => {
        console.error('Error loading order:', error);
      }
    });
  }

  private isOrderWithDetails(order: any): order is OrderWithDetails {
    return order && Array.isArray(order.orderItems) && order.shippingDetails && typeof order.subtotal === 'number';
  }
} 