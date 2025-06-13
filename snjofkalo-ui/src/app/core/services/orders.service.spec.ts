import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrdersService } from './orders.service';
import { environment } from '../../../environments/environment';
import { OrderWithDetails } from '../models/order.model';
import { BaseOrder } from '../models/shared.types';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpMock: HttpTestingController;

  const mockOrder: BaseOrder = {
    idOrder: 1,
    orderNumber: 'ORD-001',
    userId: 1,
    statusId: 1,
    orderDate: new Date(),
    shippingAddress: '123 Test St',
    billingAddress: '123 Test St',
    orderNotes: 'Test order',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockOrderWithDetails: OrderWithDetails = {
    ...mockOrder,
    user: {
      idUser: 1,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      failedLoginAttempts: 0,
      requestedAnonymization: false,
      isSeller: false
    },
    status: {
      idStatus: 1,
      statusName: 'Pending',
      description: 'Order is pending',
      isActive: true,
      sortOrder: 1
    },
    orderItems: [
      {
        idOrderItem: 1,
        orderId: 1,
        itemId: 1,
        quantity: 1,
        priceAtOrder: 49.99,
        itemTitle: 'Test Item 1',
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
          updatedAt: new Date(),
          images: []
        }
      }
    ],
    totalAmount: 49.99
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrdersService]
    });

    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create an order', () => {
    const orderData = {
      items: [
        { itemId: 1, quantity: 1 }
      ]
    };

    service.createOrder(orderData).subscribe(response => {
      expect(response.data).toEqual(mockOrderWithDetails);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(orderData);
    req.flush({ data: mockOrderWithDetails });
  });

  it('should get all orders', () => {
    const mockOrders: BaseOrder[] = [mockOrder];

    service.getOrders().subscribe(orders => {
      expect(orders).toEqual(mockOrders);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });

  it('should get order by id', () => {
    const orderId = 1;

    service.getOrderById(orderId).subscribe(order => {
      expect(order).toEqual(mockOrder);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/${orderId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrder);
  });

  it('should update order status', () => {
    const orderId = 1;
    const newStatus = 'Processing';

    service.updateOrderStatus(orderId, newStatus).subscribe(order => {
      expect(order).toEqual({ ...mockOrder, statusId: 2 });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/${orderId}/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: newStatus });
    req.flush({ ...mockOrder, statusId: 2 });
  });

  it('should cancel an order', () => {
    const orderId = 1;

    service.cancelOrder(orderId).subscribe(order => {
      expect(order).toEqual({ ...mockOrder, statusId: 3 });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/${orderId}/cancel`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockOrder, statusId: 3 });
  });

  it('should get my orders', () => {
    const mockOrders: OrderWithDetails[] = [{
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
      user: {
        idUser: 1,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        requestedAnonymization: false,
        isSeller: false
      },
      status: {
        idStatus: 1,
        statusName: 'Pending',
        description: 'Order is pending',
        isActive: true,
        sortOrder: 1
      },
      orderItems: [{
        idOrderItem: 1,
        orderId: 1,
        itemId: 1,
        quantity: 1,
        priceAtOrder: 49.99,
        itemTitle: 'Test Item 1',
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
          updatedAt: new Date(),
          images: []
        }
      }],
      totalAmount: 49.99
    }];

    const mockResponse = {
      data: {
        data: mockOrders,
        hasNextPage: false,
        hasPreviousPage: false,
        pageNumber: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1
      }
    };

    service.getMyOrders().subscribe(orders => {
      expect(orders).toEqual(mockOrders);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/my`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get my seller orders', () => {
    const mockOrders: BaseOrder[] = [mockOrder];

    service.getMySellerOrders().subscribe(orders => {
      expect(orders).toEqual(mockOrders);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/seller/my`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });

  it('should get all orders (admin)', () => {
    const mockOrders: BaseOrder[] = [mockOrder];

    service.getAllOrders().subscribe(orders => {
      expect(orders).toEqual(mockOrders);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/admin/all`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });
}); 