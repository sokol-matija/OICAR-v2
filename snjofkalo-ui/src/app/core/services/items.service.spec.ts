import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ItemsService } from './items.service';
import { environment } from '../../../environments/environment';
import { Item, ItemWithDetails, ItemApprovalRequest } from '../models/item.model';

describe('ItemsService', () => {
  let service: ItemsService;
  let httpMock: HttpTestingController;

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

  const mockItemResponse: Item = {
    idItem: 1,
    itemCategoryId: 1,
    title: 'Test Item',
    description: 'Test Description',
    stockQuantity: 10,
    price: 99.99,
    isActive: true,
    isFeatured: false,
    isApproved: true,
    itemStatus: 'Active',
    commissionRate: 0.05,
    platformFee: 0.02,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ItemsService]
    });

    service = TestBed.inject(ItemsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get items', () => {
    const mockResponse = {
      success: true,
      message: 'Success',
      data: {
        data: [mockItem],
        totalPages: 1,
        pageNumber: 1,
        totalCount: 1,
        hasNextPage: false,
        hasPreviousPage: false
      },
      errors: null
    };

    service.getItems({}).subscribe(response => {
      expect(response.items).toEqual([mockItem]);
      expect(response.totalPages).toBe(1);
      expect(response.currentPage).toBe(1);
      expect(response.totalItems).toBe(1);
    });

    const req = httpMock.expectOne(req => req.url.startsWith(`${environment.apiUrl}/items`));
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create item', () => {
    const newItem = {
      idItem: 2,
      itemCategoryId: 1,
      title: 'New Item',
      description: 'New Description',
      price: 149.99,
      stockQuantity: 5,
      isActive: true,
      isFeatured: false,
      isApproved: false,
      itemStatus: 'Pending',
      sellerUserId: 1,
      commissionRate: 0.05,
      platformFee: 0.02
    };

    const mockResponse = {
      success: true,
      message: 'Success',
      data: {
        ...newItem,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: []
      },
      errors: null
    };

    service.createItem(newItem).subscribe(item => {
      expect(item).toEqual(mockResponse.data);
    });

    const req = httpMock.expectOne(req => req.url.startsWith(`${environment.apiUrl}/items/seller`));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newItem);
    req.flush(mockResponse);
  });

  it('should get items with pagination', () => {
    const mockResponse = {
      success: true,
      message: 'Success',
      data: {
        data: [mockItem],
        totalPages: 1,
        pageNumber: 1,
        totalCount: 1,
        hasNextPage: false,
        hasPreviousPage: false
      },
      errors: null
    };

    service.getItems({ pageNumber: 1, pageSize: 10 }).subscribe(response => {
      expect(response.items).toEqual([mockItem]);
      expect(response.totalPages).toBe(1);
      expect(response.currentPage).toBe(1);
      expect(response.totalItems).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/items?pageNumber=1&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get item by id', () => {
    const mockResponse = {
      success: true,
      message: 'Success',
      data: mockItem,
      errors: null
    };

    service.getItemById('1').subscribe(item => {
      expect(item).toEqual(mockItem);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/items/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get featured items', () => {
    const mockResponse = {
      success: true,
      message: 'Success',
      data: [mockItem],
      errors: null
    };

    service.getFeaturedItems().subscribe(items => {
      expect(items).toEqual([mockItem]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/items/featured`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update item', () => {
    const updateData = {
      title: 'Updated Item',
      price: 199.99
    };

    const mockResponse = {
      success: true,
      message: 'Success',
      data: { ...mockItemResponse, ...updateData },
      errors: null
    };

    service.updateItem('1', updateData).subscribe(item => {
      expect(item).toEqual({ ...mockItemResponse, ...updateData });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/items/seller/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush(mockResponse);
  });

  it('should delete item', () => {
    const mockResponse = {
      success: true,
      message: 'Success',
      data: null,
      errors: null
    };

    service.deleteItem('1').subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/items/seller/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should get seller items', () => {
    const mockResponse = {
      success: true,
      message: 'Success',
      data: [mockItem],
      errors: null
    };

    service.getMyItems().subscribe(items => {
      expect(items).toEqual([mockItem]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/items/seller/my-items`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get pending approvals', () => {
    const mockResponse = {
      success: true,
      message: 'Success',
      data: {
        data: [mockItem],
        totalCount: 1,
        pageNumber: 1,
        pageSize: 20
      },
      errors: null
    };

    service.getPendingApprovals(1, 20).subscribe(response => {
      expect(response.items).toEqual([mockItem]);
      expect(response.totalCount).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/items/pending-approval?pageNumber=1&pageSize=20`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should approve item', () => {
    const mockApprovalRequest: ItemApprovalRequest = {
      itemId: '1',
      sellerId: '1',
      status: 'approved',
      adminNotes: 'Approved by admin',
      requestedAt: new Date(),
      processedAt: new Date()
    };

    const mockResponse = {
      success: true,
      message: 'Success',
      data: mockApprovalRequest,
      errors: null
    };

    service.approveItem('1', 'Approved by admin').subscribe(response => {
      expect(response).toEqual(mockApprovalRequest);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/items/1/approve`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ notes: 'Approved by admin' });
    req.flush(mockResponse);
  });

  it('should reject item', () => {
    const mockResponse = {
      success: true,
      message: 'Success',
      data: null,
      errors: null
    };

    service.rejectItem('1', 'Invalid item').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/items/1/reject`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      rejectionReason: 'Invalid item',
      allowResubmission: true
    });
    req.flush(mockResponse);
  });

  it('should get categories', () => {
    const mockCategories = [
      {
        idItemCategory: 1,
        categoryName: 'Category 1',
        description: 'Description 1',
        isActive: true,
        sortOrder: 1
      }
    ];

    const mockResponse = {
      success: true,
      message: 'Success',
      data: mockCategories,
      errors: null
    };

    service.getCategories().subscribe(categories => {
      expect(categories).toEqual(mockCategories);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create item request', () => {
    const itemRequest = {
      title: 'Requested Item',
      description: 'Request Description',
      itemCategoryID: 1,
      price: 99.99,
      stockQuantity: 5,
      agreeToTerms: true,
      images: []
    };

    const mockResponse = {
      success: true,
      message: 'Success',
      data: { ...mockItem, ...itemRequest },
      errors: null
    };

    service.createItemRequest(itemRequest).subscribe(response => {
      expect(response).toEqual(mockResponse.data);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/items/seller`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      ...itemRequest,
      isActive: true,
      isApproved: false,
      itemStatus: 'Pending',
      isUserGenerated: true,
      needsApproval: true,
      desiredCommissionRate: 0.05,
      images: []
    });
    req.flush(mockResponse);
  });

  it('should handle error responses', () => {
    const errorResponse = {
      success: false,
      message: 'Error',
      data: null,
      errors: ['Test error']
    };

    service.getItems({}).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const req = httpMock.expectOne(req => req.url.startsWith(`${environment.apiUrl}/items`));
    req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
  });
}); 