import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ItemsService } from '../../core/services/items.service';
import { ItemListComponent } from '../../features/items/item-list/item-list.component';
import { environment } from '../../../environments/environment';
import { ItemWithDetails } from '../../core/models/item.model';

describe('Item List Integration Tests', () => {
  let component: ItemListComponent;
  let fixture: ComponentFixture<ItemListComponent>;
  let itemsService: ItemsService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockItems: ItemWithDetails[] = [
    {
      idItem: 1,
      itemCategoryID: 1,
      categoryName: 'Electronics',
      title: 'Test Item 1',
      description: 'Test Description 1',
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
    },
    {
      idItem: 2,
      itemCategoryID: 2,
      categoryName: 'Books',
      title: 'Test Item 2',
      description: 'Test Description 2',
      stockQuantity: 5,
      price: 29.99,
      isActive: true,
      isFeatured: false,
      isApproved: true,
      itemStatus: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sellerUserID: 2,
      sellerName: 'Another Seller',
      commissionRate: 0.05,
      platformFee: 0.02,
      images: [],
      isUserGenerated: false,
      needsApproval: false,
      itemSource: 'seller',
      estimatedCommission: 1.49,
      estimatedSellerEarnings: 28.49,
      availabilityStatus: 'In Stock',
      imageCount: 0
    }
  ];

  const mockCategories = [
    { idItemCategory: 1, categoryName: 'Electronics' },
    { idItemCategory: 2, categoryName: 'Books' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'items/:id', component: ItemListComponent } // Mock route for testing
        ]),
        HttpClientTestingModule,
        FormsModule,
        MatCardModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
        ToastModule
      ],
      declarations: [],
      providers: [ItemsService, MessageService]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    itemsService = TestBed.inject(ItemsService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load items with pagination', fakeAsync(() => {
    // Arrange
    const mockResponse = {
      success: true,
      data: {
        data: mockItems,
        totalPages: 2,
        pageNumber: 1,
        totalCount: 20
      }
    };

    // Act
    fixture.detectChanges(); // This triggers ngOnInit
    tick();

    // Assert
    const itemsReq = httpMock.expectOne(`${environment.apiUrl}/items?pageNumber=1&pageSize=12`);
    expect(itemsReq.request.method).toBe('GET');
    itemsReq.flush(mockResponse);

    const categoriesReq = httpMock.expectOne(`${environment.apiUrl}/categories`);
    expect(categoriesReq.request.method).toBe('GET');
    categoriesReq.flush({ success: true, data: mockCategories });

    expect(component.items).toEqual(mockItems);
    expect(component.totalPages).toBe(2);
    expect(component.totalItems).toBe(20);
  }));

  it('should filter items by category', fakeAsync(() => {
    // Arrange
    const mockResponse = {
      success: true,
      data: {
        data: [mockItems[0]], // Only Electronics item
        totalPages: 1,
        pageNumber: 1,
        totalCount: 1
      }
    };

    // Act
    fixture.detectChanges(); // This triggers ngOnInit
    tick();

    // Handle initial requests
    httpMock.expectOne(`${environment.apiUrl}/items?pageNumber=1&pageSize=12`).flush({
      success: true,
      data: {
        data: mockItems,
        totalPages: 2,
        pageNumber: 1,
        totalCount: 20
      }
    });
    httpMock.expectOne(`${environment.apiUrl}/categories`).flush({
      success: true,
      data: mockCategories
    });

    // Now test category filter
    component.selectedCategory = 1; // Electronics category
    component.onCategoryChange();
    tick();

    // Assert
    const req = httpMock.expectOne(`${environment.apiUrl}/items?categoryId=1&pageNumber=1&pageSize=12`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(component.items).toEqual([mockItems[0]]);
    expect(component.totalPages).toBe(1);
    expect(component.totalItems).toBe(1);
  }));

  it('should search items by query', fakeAsync(() => {
    // Arrange
    const mockResponse = {
      success: true,
      data: {
        data: [mockItems[0]], // Only matching item
        totalPages: 1,
        pageNumber: 1,
        totalCount: 1
      }
    };

    // Act
    fixture.detectChanges(); // This triggers ngOnInit
    tick();

    // Handle initial requests
    httpMock.expectOne(`${environment.apiUrl}/items?pageNumber=1&pageSize=12`).flush({
      success: true,
      data: {
        data: mockItems,
        totalPages: 2,
        pageNumber: 1,
        totalCount: 20
      }
    });
    httpMock.expectOne(`${environment.apiUrl}/categories`).flush({
      success: true,
      data: mockCategories
    });

    // Now test search
    component.searchQuery = 'Test Item 1';
    component.onSearch();
    tick();

    // Assert
    const req = httpMock.expectOne(`${environment.apiUrl}/items?title=Test+Item+1&pageNumber=1&pageSize=12`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(component.items).toEqual([mockItems[0]]);
    expect(component.totalPages).toBe(1);
    expect(component.totalItems).toBe(1);
  }));

  it('should load categories on init', fakeAsync(() => {
    // Arrange
    const mockResponse = {
      success: true,
      data: mockCategories
    };

    // Act
    fixture.detectChanges(); // This triggers ngOnInit
    tick();

    // Handle initial requests
    httpMock.expectOne(`${environment.apiUrl}/items?pageNumber=1&pageSize=12`).flush({
      success: true,
      data: {
        data: mockItems,
        totalPages: 2,
        pageNumber: 1,
        totalCount: 20
      }
    });
    const categoriesReq = httpMock.expectOne(`${environment.apiUrl}/categories`);
    expect(categoriesReq.request.method).toBe('GET');
    categoriesReq.flush(mockResponse);

    // Assert
    expect(component.categories).toEqual(mockCategories);
  }));

  it('should handle page changes', fakeAsync(() => {
    // Arrange
    const mockResponse = {
      success: true,
      data: {
        data: mockItems,
        totalPages: 2,
        pageNumber: 2,
        totalCount: 20
      }
    };

    // Act
    fixture.detectChanges(); // This triggers ngOnInit
    tick();

    // Handle initial requests
    httpMock.expectOne(`${environment.apiUrl}/items?pageNumber=1&pageSize=12`).flush({
      success: true,
      data: {
        data: mockItems,
        totalPages: 2,
        pageNumber: 1,
        totalCount: 20
      }
    });
    httpMock.expectOne(`${environment.apiUrl}/categories`).flush({
      success: true,
      data: mockCategories
    });

    // Now test page change
    component.onPageChange(2);
    tick();

    // Assert
    const req = httpMock.expectOne(`${environment.apiUrl}/items?pageNumber=2&pageSize=12`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(component.currentPage).toBe(2);
    expect(component.items).toEqual(mockItems);
  }));

  it('should handle error when loading items', fakeAsync(() => {
    // Arrange
    const errorResponse = {
      success: false,
      message: 'Failed to load items'
    };

    // Act
    fixture.detectChanges(); // This triggers ngOnInit
    tick();

    // Handle initial requests
    const itemsReq = httpMock.expectOne(`${environment.apiUrl}/items?pageNumber=1&pageSize=12`);
    expect(itemsReq.request.method).toBe('GET');
    itemsReq.flush(errorResponse, { status: 500, statusText: 'Server Error' });

    httpMock.expectOne(`${environment.apiUrl}/categories`).flush({
      success: true,
      data: mockCategories
    });

    // Assert
    expect(component.items).toEqual([]);
    expect(component.totalPages).toBe(1);
    expect(component.totalItems).toBe(0);
  }));
}); 