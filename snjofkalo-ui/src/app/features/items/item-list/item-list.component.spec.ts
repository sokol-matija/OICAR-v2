import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ItemListComponent } from './item-list.component';
import { ItemsService } from '../../../core/services/items.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { of, throwError } from 'rxjs';
import { ItemWithDetails } from '../../../core/models/item.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

describe('ItemListComponent', () => {
  let component: ItemListComponent;
  let fixture: ComponentFixture<ItemListComponent>;
  let mockItemsService: jasmine.SpyObj<ItemsService>;
  let mockCartService: jasmine.SpyObj<CartService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockItem: ItemWithDetails = {
    idItem: 1,
    itemCategoryID: 1,
    categoryName: 'Test Category',
    title: 'Test Item',
    description: 'Test Description',
    stockQuantity: 10,
    price: 99.99,
    isActive: true,
    isFeatured: false,
    isApproved: true,
    itemStatus: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerUserID: 1,
    sellerName: 'Test Seller',
    commissionRate: 0.05,
    platformFee: 0.02,
    images: [],
    isUserGenerated: false,
    needsApproval: false,
    itemSource: 'seller',
    estimatedCommission: 4.99,
    estimatedSellerEarnings: 94.99,
    availabilityStatus: 'In Stock',
    imageCount: 0
  };

  const mockCategories = [
    { idItemCategory: 1, categoryName: 'Category 1' },
    { idItemCategory: 2, categoryName: 'Category 2' }
  ];

  const mockUser = {
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
  };

  beforeEach(async () => {
    mockItemsService = jasmine.createSpyObj('ItemsService', ['getItems', 'getCategories']);
    mockCartService = jasmine.createSpyObj('CartService', ['addToCart']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'isAdmin']);

    mockItemsService.getItems.and.returnValue(of({
      items: [mockItem],
      totalPages: 3,
      currentPage: 1,
      totalItems: 1
    }));

    mockItemsService.getCategories.and.returnValue(of(mockCategories));
    mockCartService.addToCart.and.returnValue(of(true));
    mockAuthService.getCurrentUser.and.returnValue(mockUser);
    mockAuthService.isAdmin.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [
        ItemListComponent,
        RouterTestingModule,
        FormsModule,
        ToastModule
      ],
      providers: [
        { provide: ItemsService, useValue: mockItemsService },
        { provide: CartService, useValue: mockCartService },
        { provide: AuthService, useValue: mockAuthService },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load items and categories on init', () => {
    expect(mockItemsService.getItems).toHaveBeenCalled();
    expect(mockItemsService.getCategories).toHaveBeenCalled();
    expect(component.items).toEqual([mockItem]);
    expect(component.categories).toEqual(mockCategories);
  });

  it('should handle search', () => {
    component.searchQuery = 'test';
    component.onSearch();
    expect(mockItemsService.getItems).toHaveBeenCalledWith(
      jasmine.objectContaining({ searchQuery: 'test' })
    );
  });

  it('should handle category change', () => {
    component.selectedCategory = 1;
    component.onCategoryChange();
    expect(mockItemsService.getItems).toHaveBeenCalledWith(
      jasmine.objectContaining({ categoryId: 1 })
    );
  });

  it('should handle page change', () => {
    // Reset the spy to clear previous calls
    mockItemsService.getItems.calls.reset();
    
    // Set up the component state
    component.totalPages = 3;
    component.currentPage = 1;
    
    // Call onPageChange
    component.onPageChange(2);
    
    // Verify the service was called with the correct page number
    expect(mockItemsService.getItems).toHaveBeenCalledWith(
      jasmine.objectContaining({ pageNumber: 2 })
    );
  });

  it('should add item to cart', () => {
    component.addToCart(mockItem.idItem);
    expect(mockCartService.addToCart).toHaveBeenCalledWith(mockItem.idItem, 1);
    expect(component.itemAddToCartFeedback[mockItem.idItem].success).toBeTrue();
  });

  it('should handle add to cart error', () => {
    mockCartService.addToCart.and.returnValue(throwError(() => ({ error: { message: 'Error' } })));
    component.addToCart(mockItem.idItem);
    expect(component.itemAddToCartFeedback[mockItem.idItem].success).toBeFalse();
  });

  it('should show request form when requested', () => {
    expect(component.showRequestForm).toBeFalse();
    component.openRequestForm();
    expect(component.showRequestForm).toBeTrue();
  });

  it('should hide request form when closed', () => {
    component.showRequestForm = true;
    component.onRequestFormClose();
    expect(component.showRequestForm).toBeFalse();
  });

  it('should reload items after request submission', () => {
    // Reset the spy to clear previous calls
    mockItemsService.getItems.calls.reset();
    
    component.onRequestSubmitted();
    
    expect(mockItemsService.getItems).toHaveBeenCalled();
  });
}); 