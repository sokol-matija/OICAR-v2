import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrdersService } from '../../../core/services/orders.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideAnimations } from '@angular/platform-browser/animations';
import { OrderWithDetails } from '../../../core/models/order.model';

interface Order {
  idOrder: number;
  orderNumber: string;
  userName: string;
  statusName: string;
  orderDate: string;
  totalAmount: number;
  containsUserItems: boolean;
  totalItems: number;
  uniqueSellerCount: number;
  estimatedCommission: number;
  orderType: string;
  orderSource: string;
  isHighValue: boolean;
  daysOld: number;
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  providers: [
    provideAnimations()
  ],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {
  displayedColumns: string[] = [
    'orderNumber',
    'orderDate',
    'statusName',
    'orderType',
    'orderSource',
    'totalItems',
    'totalAmount',
    'daysOld',
    'actions'
  ];
  
  orders: Order[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private ordersService: OrdersService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.ordersService.getMyOrders().subscribe({
      next: (response) => {
        this.orders = response.map(order => this.transformOrder(order));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.error = 'Failed to load orders. Please try again later.';
        this.loading = false;
      }
    });
  }

  private transformOrder(order: OrderWithDetails): Order {
    const now = new Date();
    const orderDate = new Date(order.orderDate);
    const daysOld = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      idOrder: order.idOrder,
      orderNumber: order.orderNumber,
      userName: order.user.username,
      statusName: order.status.statusName,
      orderDate: order.orderDate.toISOString(),
      totalAmount: order.totalAmount,
      containsUserItems: order.orderItems.some(item => item.item.sellerUserId !== undefined),
      totalItems: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      uniqueSellerCount: new Set(order.orderItems.map(item => item.item.sellerUserId)).size,
      estimatedCommission: order.orderItems.reduce((sum, item) => {
        const commission = item.item.commissionRate || 0;
        return sum + (item.priceAtOrder * item.quantity * commission);
      }, 0),
      orderType: order.orderItems.some(item => item.item.sellerUserId !== undefined) ? 'Marketplace' : 'Store',
      orderSource: new Set(order.orderItems.map(item => item.item.sellerUserId)).size > 1 ? 'Multi-Seller' : 'Single-Seller',
      isHighValue: order.totalAmount > 500,
      daysOld
    };
  }

  cancelOrder(orderId: number): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.ordersService.cancelOrder(orderId).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          this.error = 'Failed to cancel order. Please try again later.';
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Processing': return 'status-processing';
      case 'Delivered': return 'status-delivered';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  }
} 