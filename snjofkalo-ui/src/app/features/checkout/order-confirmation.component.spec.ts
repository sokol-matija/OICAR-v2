import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OrderConfirmationComponent } from './order-confirmation.component';
import { OrdersService } from '../../core/services/orders.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BaseOrder, BaseItem } from '../../core/models/shared.types';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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

describe('OrderConfirmationComponent', () => {
  let component: OrderConfirmationComponent;
  let fixture: ComponentFixture<OrderConfirmationComponent>;
  let mockOrdersService: jasmine.SpyObj<OrdersService>;
  let mockActivatedRoute: any;

  const mockOrder: OrderWithDetails = {
    idOrder: 1,
    orderNumber: 'ORD-001',
    userId: 1,
    statusId: 1,
    orderDate: new Date(),
    shippingAddress: '123 Test St',
    billingAddress: '123 Test St',
    orderNotes: 'Test order',
    createdAt: new Date(),
    updatedAt: new Date(),
    orderItems: [{
      idOrderItem: 1,
      orderId: 1,
      itemId: 1,
      quantity: 1,
      price: 49.99,
      item: {
        idItem: 1,
        itemCategoryId: 1,
        title: 'Test Item 1',
        description: 'Test Description 1',
        stockQuantity: 10,
        price: 49.99,
        isActive: true,
        isFeatured: false,
        isApproved: true,
        itemStatus: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }],
    shippingDetails: {
      fullName: 'Test User',
      address: '123 Test St',
      city: 'Test City',
      postalCode: '12345',
      country: 'Test Country'
    },
    subtotal: 49.99,
    shippingCost: 0,
    totalAmount: 49.99,
    orderStatus: 'Pending'
  };

  beforeEach(async () => {
    mockOrdersService = jasmine.createSpyObj('OrdersService', ['getOrderById']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ id: '1' })
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        OrderConfirmationComponent,
        RouterTestingModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderConfirmationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load order details on init', () => {
    mockOrdersService.getOrderById.and.returnValue(of(mockOrder));
    fixture.detectChanges();
    expect(mockOrdersService.getOrderById).toHaveBeenCalledWith(1);
    expect(component.order).toEqual(mockOrder);
  });

  it('should display order number', () => {
    mockOrdersService.getOrderById.and.returnValue(of(mockOrder));
    fixture.detectChanges();
    
    // Debug the rendered HTML
    console.log('Rendered HTML:', fixture.debugElement.nativeElement.innerHTML);
    
    const compiled = fixture.nativeElement;
    const orderNumberElement = compiled.querySelector('.detail-row span:last-child');
    expect(orderNumberElement).toBeTruthy('Order number element should exist');
    expect(orderNumberElement.textContent.trim()).toBe('1');
  });

  it('should display total amount', () => {
    mockOrdersService.getOrderById.and.returnValue(of(mockOrder));
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('49.99');
  });

  it('should display order status', () => {
    mockOrdersService.getOrderById.and.returnValue(of(mockOrder));
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Pending');
  });

  it('should display order date', () => {
    mockOrdersService.getOrderById.and.returnValue(of(mockOrder));
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const orderDateElement = compiled.querySelector('.detail-row:nth-of-type(2) span:last-child');
    expect(orderDateElement).toBeTruthy('Order date element should exist');
    
    // Format the date to match the 'medium' pipe format
    const expectedDate = mockOrder.orderDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
    
    expect(orderDateElement.textContent.trim()).toBe(expectedDate);
  });

  it('should handle error when loading order', () => {
    mockOrdersService.getOrderById.and.returnValue(throwError(() => new Error('Failed to load order')));
    fixture.detectChanges();
    expect(component.order).toBeNull();
  });
}); 