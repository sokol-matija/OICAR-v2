import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { CartItemWithDetails } from '../../core/models/cart.model';
import { CartComponent } from './cart.component';
import { TestModule } from '../../../test.module';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let mockCartService: jasmine.SpyObj<CartService>;

  const mockCartItems: CartItemWithDetails[] = [
    {
      idCartItem: 1,
      item: {
        idItem: 1,
        title: 'Test Item',
        description: 'Test Description',
        price: 15,
        stockQuantity: 5,
        itemCategoryId: 1,
        isActive: true,
        isFeatured: false,
        isApproved: true,
        itemStatus: 'Active',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      quantity: 3,
      itemPrice: 15,
      itemTitle: 'Test Item',
      userId: 1,
      itemId: 1,
      addedAt: new Date()
    }
  ];

  beforeEach(async () => {
    mockCartService = jasmine.createSpyObj('CartService', ['getCart', 'updateCartItem', 'removeFromCart']);

    await TestBed.configureTestingModule({
      imports: [
        CartComponent,
        TestModule,
        ToastModule
      ],
      providers: [
        { provide: CartService, useValue: mockCartService },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load cart items on init', () => {
    mockCartService.getCart.and.returnValue(of(mockCartItems));

    component.ngOnInit();

    expect(mockCartService.getCart).toHaveBeenCalled();
    expect(component.cartItems).toEqual(mockCartItems);
    expect(component.subtotal).toBe(45); // 3 items * $15 (itemPrice)
  });

  it('should calculate total as subtotal + shipping', () => {
    component.subtotal = 45;
    component.shipping = 5;
    expect(component.total).toBe(50);
  });

  it('should not update quantity if new quantity is invalid', () => {
    const item = mockCartItems[0];
    mockCartService.updateCartItem.and.returnValue(of(item));

    component.updateQuantity(item, 0); // Below minimum
    component.updateQuantity(item, 10); // Above stock

    expect(mockCartService.updateCartItem).not.toHaveBeenCalled();
  });

  it('should update quantity if new quantity is valid', () => {
    const item = mockCartItems[0];
    mockCartService.updateCartItem.and.returnValue(of(item));

    component.updateQuantity(item, 3);

    expect(mockCartService.updateCartItem).toHaveBeenCalledWith(item.idCartItem, 3);
  });

  it('should remove item from cart on successful removal', () => {
    component.cartItems = [...mockCartItems];
    mockCartService.removeFromCart.and.returnValue(of(void 0));

    component.removeItem(mockCartItems[0]);

    expect(mockCartService.removeFromCart).toHaveBeenCalledWith(mockCartItems[0].idCartItem);
    expect(component.cartItems.length).toBe(0);
  });

  it('should handle error when loading cart', () => {
    const consoleSpy = spyOn(console, 'error');
    mockCartService.getCart.and.returnValue(throwError(() => new Error('Test error')));

    component.ngOnInit();

    expect(consoleSpy).toHaveBeenCalled();
  });
});
