import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { CartComponent } from '../../features/cart/cart.component';
import { environment } from '../../../environments/environment';
import { CartItemWithDetails } from '../../core/models/cart.model';
import { Item } from '../../core/models/item.model';

describe('Cart Integration Tests', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartService: CartService;
  let httpMock: HttpTestingController;

  const mockItem: Item = {
    idItem: 1,
    title: 'Test Item',
    description: 'Test Description',
    price: 99.99,
    stockQuantity: 10,
    itemCategoryId: 1,
    isActive: true,
    isFeatured: false,
    isApproved: true,
    itemStatus: 'Active',
    images: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockCartItems: CartItemWithDetails[] = [
    {
      idCartItem: 1,
      userId: 1,
      itemId: 1,
      quantity: 2,
      addedAt: new Date(),
      item: {
        idItem: 1,
        title: 'Test Item 1',
        description: 'Test Description 1',
        price: 99.99,
        stockQuantity: 10,
        itemCategoryId: 1,
        isActive: true,
        isFeatured: false,
        isApproved: true,
        itemStatus: 'Active',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      itemTitle: 'Test Item 1',
      itemPrice: 99.99
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        CartComponent
      ],
      providers: [CartService]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    cartService = TestBed.inject(CartService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add item to cart', fakeAsync(() => {
    // Arrange
    const mockResponse = {
      success: true,
      message: 'Item added to cart successfully'
    };

    // Act
    cartService.addToCart(1, 2).subscribe();
    tick();

    // Assert
    const req = httpMock.expectOne(`${environment.apiUrl}/cart/items`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ itemId: 1, quantity: 2 });
    req.flush(mockResponse);
  }));

  it('should remove item from cart', fakeAsync(() => {
    // Arrange
    const cartItemId = 1;

    // Act
    cartService.removeFromCart(cartItemId).subscribe();
    tick();

    // Assert
    const req = httpMock.expectOne(`${environment.apiUrl}/cart/${cartItemId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  }));

  it('should calculate cart total correctly', fakeAsync(() => {
    // Arrange
    const mockResponse = {
      success: true,
      data: {
        items: mockCartItems
      }
    };

    // Act
    component.ngOnInit();
    tick();

    // Assert
    const req = httpMock.expectOne(`${environment.apiUrl}/cart`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    // Calculate expected total
    const expectedSubtotal = mockCartItems.reduce((total, item) => {
      return total + (item.itemPrice * item.quantity);
    }, 0);

    expect(component.subtotal).toBe(expectedSubtotal);
    expect(component.total).toBe(expectedSubtotal + component.shipping);
  }));

  it('should handle error when adding item to cart', fakeAsync(() => {
    // Arrange
    const errorResponse = {
      success: false,
      message: 'Failed to add item to cart'
    };

    // Act
    cartService.addToCart(1, 2).subscribe({
      error: (error) => {
        expect(error.message).toContain('Failed to add item to cart');
      }
    });
    tick();

    // Assert
    const req = httpMock.expectOne(`${environment.apiUrl}/cart/items`);
    expect(req.request.method).toBe('POST');
    req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
  }));

  it('should update cart item quantity', fakeAsync(() => {
    // Arrange
    const cartItemId = 1;
    const newQuantity = 3;
    const mockResponse = {
      success: true,
      data: {
        idCartItem: cartItemId,
        quantity: newQuantity,
        item: mockItem,
        itemPrice: 99.99,
        itemTitle: 'Test Item'
      }
    };

    // Act
    cartService.updateCartItem(cartItemId, newQuantity).subscribe();
    tick();

    // Assert
    const req = httpMock.expectOne(`${environment.apiUrl}/cart/${cartItemId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ quantity: newQuantity });
    req.flush(mockResponse);
  }));
}); 