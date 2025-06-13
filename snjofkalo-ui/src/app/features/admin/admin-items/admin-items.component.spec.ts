import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminItemsComponent } from './admin-items.component';
import { AdminService } from '../../../core/services/admin.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ItemWithDetails } from '../../../core/models/item.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PagedApiResponse } from '../../../core/models/api-response.model';

describe('AdminItemsComponent', () => {
  let component: AdminItemsComponent;
  let fixture: ComponentFixture<AdminItemsComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockItems: ItemWithDetails[] = [
    {
      idItem: 1,
      itemCategoryID: 1,
      categoryName: 'Test Category',
      title: 'Test Item 1',
      description: 'Test Description 1',
      stockQuantity: 10,
      price: 100,
      isActive: true,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sellerUserID: 1,
      sellerName: 'Test Seller',
      isApproved: true,
      itemStatus: 'active',
      rejectionReason: undefined,
      commissionRate: 0.1,
      platformFee: 0.05,
      approvalDate: new Date().toISOString(),
      approvedByAdminName: 'Admin User',
      images: [],
      isUserGenerated: true,
      needsApproval: false,
      itemSource: 'user',
      estimatedCommission: 9.99,
      estimatedSellerEarnings: 89.99,
      availabilityStatus: 'in_stock',
      agreeToTerms: true,
      imageCount: 0
    }
  ];

  beforeEach(async () => {
    const adminSpy = jasmine.createSpyObj('AdminService', ['getAllItems']);
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AdminItemsComponent],
      providers: [
        { provide: AdminService, useValue: adminSpy },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    adminServiceSpy = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminItemsComponent);
    component = fixture.componentInstance;
    const mockResponse: PagedApiResponse<ItemWithDetails[]> = {
      success: true,
      message: 'Success',
      data: {
        data: mockItems,
        totalCount: mockItems.length,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1
      },
      errors: null
    };
    adminServiceSpy.getAllItems.and.returnValue(of(mockResponse));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load items on init', () => {
    fixture.detectChanges();
    expect(adminServiceSpy.getAllItems).toHaveBeenCalledWith(1, 10);
    expect(component.items).toEqual(mockItems);
    expect(component.totalPages).toBe(1);
  });

  it('should handle errors when loading items', () => {
    adminServiceSpy.getAllItems.and.returnValue(throwError(() => ({
      message: 'Failed to load items'
    })));
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Failed to load items');
  });

  it('should navigate to pending approvals', () => {
    fixture.detectChanges();
    component.goToPendingApprovals();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/pending-approvals']);
  });

  it('should change page when clicking previous', () => {
    component.currentPage = 2;
    fixture.detectChanges();
    
    component.prevPage();
    expect(component.currentPage).toBe(1);
    expect(adminServiceSpy.getAllItems).toHaveBeenCalledWith(1, 10);
  });

  it('should not change page if out of bounds', () => {
    component.currentPage = 1;
    component.totalPages = 1;
    fixture.detectChanges();
    
    component.prevPage();
    expect(component.currentPage).toBe(1);
    
    component.nextPage();
    expect(component.currentPage).toBe(1);
  });
});
