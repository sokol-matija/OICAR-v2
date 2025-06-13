import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OrderHistoryComponent } from './order-history.component';
import { OrdersService } from '../../../core/services/orders.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { OrderWithDetails } from '../../../core/models/order.model';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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

describe('OrderHistoryComponent', () => {
  let component: OrderHistoryComponent;
  let fixture: ComponentFixture<OrderHistoryComponent>;
  let mockOrdersService: jasmine.SpyObj<OrdersService>;
  let mockRouter: jasmine.SpyObj<Router>;

  // Create a partial mock that matches the structure needed for the test
  const mockOrderWithDetails: OrderWithDetails = {
    idOrder: 1,
    userId: 1,
    statusId: 1,
    orderNumber: 'ORD-001',
    orderDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    totalAmount: 49.99,
    orderItems: [
      {
        idOrderItem: 1,
        orderId: 1,
        itemId: 1,
        quantity: 1,
        priceAtOrder: 49.99,
        itemTitle: 'Test Item',
        item: {
          idItem: 1,
          itemCategoryId: 1,
          title: 'Test Item',
          description: 'Test Description',
          price: 49.99,
          stockQuantity: 10,
          sellerUserId: undefined,
          commissionRate: 0,
          isActive: true,
          isApproved: true,
          isFeatured: false,
          itemStatus: 'Active',
          createdAt: new Date(),
          updatedAt: new Date(),
          images: []
        }
      }
    ],
    status: {
      idStatus: 1,
      statusName: 'Pending',
      description: 'Order is pending',
      isActive: true,
      sortOrder: 1
    },
    user: {
      idUser: 1,
      username: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      isAdmin: false,
      isSeller: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      failedLoginAttempts: 0,
      requestedAnonymization: false
    }
  };

  const expectedTransformedOrder: Order = {
    idOrder: 1,
    orderNumber: 'ORD-001',
    userName: 'Test User',
    statusName: 'Pending',
    orderDate: mockOrderWithDetails.orderDate.toISOString(),
    totalAmount: 49.99,
    containsUserItems: false,
    totalItems: 1,
    uniqueSellerCount: 1,
    estimatedCommission: 0,
    orderType: 'Store',
    orderSource: 'Single-Seller',
    isHighValue: false,
    daysOld: 0
  };

  beforeEach(async () => {
    mockOrdersService = jasmine.createSpyObj('OrdersService', ['getMyOrders', 'cancelOrder']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockOrdersService.getMyOrders.and.returnValue(of([mockOrderWithDetails]));
    mockOrdersService.cancelOrder.and.returnValue(of(mockOrderWithDetails));

    await TestBed.configureTestingModule({
      imports: [
        OrderHistoryComponent,
        RouterTestingModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders on init', () => {
    expect(mockOrdersService.getMyOrders).toHaveBeenCalled();
    expect(component.orders).toEqual([expectedTransformedOrder]);
  });

  it('should display orders in table', () => {
    const compiled = fixture.nativeElement;
    const tableRows = compiled.querySelectorAll('tr.mat-mdc-row');
    expect(tableRows.length).toBe(1);
  });

  it('should display order number', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('ORD-001');
  });

  it('should display order status', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Pending');
  });

  it('should display total amount', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('49.99');
  });

  it('should handle error when loading orders', () => {
    mockOrdersService.getMyOrders.and.returnValue(throwError(() => new Error('Failed to load orders')));
    component.loadOrders();
    expect(component.error).toBeTruthy();
  });

  it('should refresh orders', () => {
    mockOrdersService.getMyOrders.and.returnValue(of([mockOrderWithDetails]));
    fixture.detectChanges();
    
    // Reset the spy
    mockOrdersService.getMyOrders.calls.reset();
    
    // Call refresh
    component.loadOrders();
    fixture.detectChanges();
    
    // Verify getMyOrders was called again
    expect(mockOrdersService.getMyOrders).toHaveBeenCalled();
  });

  it('should confirm before cancelling order', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockOrdersService.cancelOrder.and.returnValue(of(mockOrderWithDetails));
    
    component.cancelOrder(1);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to cancel this order?');
    expect(mockOrdersService.cancelOrder).toHaveBeenCalledWith(1);
  });

  it('should not cancel order if user declines', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    
    component.cancelOrder(1);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to cancel this order?');
    expect(mockOrdersService.cancelOrder).not.toHaveBeenCalled();
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass('Pending')).toBe('status-pending');
    expect(component.getStatusClass('Processing')).toBe('status-processing');
    expect(component.getStatusClass('Delivered')).toBe('status-delivered');
    expect(component.getStatusClass('Cancelled')).toBe('status-cancelled');
    expect(component.getStatusClass('Unknown')).toBe('');
  });
}); 