import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingApprovalsComponent } from './pending-approvals.component';
import { ItemsService } from '../../../core/services/items.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ItemWithDetails, ItemApprovalRequest } from '../../../core/models/item.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';

describe('PendingApprovalsComponent', () => {
  let component: PendingApprovalsComponent;
  let fixture: ComponentFixture<PendingApprovalsComponent>;
  let itemsServiceSpy: jasmine.SpyObj<ItemsService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockItem: ItemWithDetails = {
    idItem: 1,
    itemCategoryID: 1,
    categoryName: 'Test Category',
    title: 'Test Item',
    description: 'Test Description',
    stockQuantity: 10,
    price: 100,
    isActive: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerUserID: 1,
    sellerName: 'Test Seller',
    isApproved: false,
    itemStatus: 'Pending',
    rejectionReason: undefined,
    commissionRate: 0.1,
    platformFee: 0.05,
    approvalDate: undefined,
    approvedByAdminName: undefined,
    images: [],
    isUserGenerated: true,
    needsApproval: true,
    itemSource: 'user',
    estimatedCommission: 10,
    estimatedSellerEarnings: 90,
    availabilityStatus: 'in_stock',
    agreeToTerms: true,
    imageCount: 0
  };

  beforeEach(async () => {
    const itemsSpy = jasmine.createSpyObj('ItemsService', ['getPendingApprovals', 'approveItem', 'rejectItem']);
    const snackBarSpyObj = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        PendingApprovalsComponent,
        NoopAnimationsModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatPaginatorModule
      ],
      providers: [
        { provide: ItemsService, useValue: itemsSpy },
        { provide: MatSnackBar, useValue: snackBarSpyObj }
      ]
    }).compileComponents();

    itemsServiceSpy = TestBed.inject(ItemsService) as jasmine.SpyObj<ItemsService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingApprovalsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pending items on init', () => {
    const mockResponse = {
      items: [mockItem],
      totalCount: 1
    };

    itemsServiceSpy.getPendingApprovals.and.returnValue(of(mockResponse));
    fixture.detectChanges();

    expect(itemsServiceSpy.getPendingApprovals).toHaveBeenCalledWith(1, 10);
    expect(component.items).toEqual([mockItem]);
    expect(component.totalCount).toBe(1);
    expect(component.totalPages).toBe(1);
  });

  it('should handle error when loading items', () => {
    itemsServiceSpy.getPendingApprovals.and.returnValue(throwError(() => new Error('Failed to load items')));
    fixture.detectChanges();

    expect(itemsServiceSpy.getPendingApprovals).toHaveBeenCalledWith(1, 10);
    expect(component.items).toEqual([]);
    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to load items', 'Close', { duration: 5000 });
  });

  it('should approve item', () => {
    const mockResponse: ItemApprovalRequest = {
      itemId: '1',
      sellerId: '1',
      status: 'approved',
      requestedAt: new Date(),
      processedAt: new Date()
    };

    itemsServiceSpy.approveItem.and.returnValue(of(mockResponse));
    itemsServiceSpy.getPendingApprovals.and.returnValue(of({ items: [], totalCount: 0 }));
    component.approveItem(mockItem.idItem);

    expect(itemsServiceSpy.approveItem).toHaveBeenCalledWith(mockItem.idItem.toString());
    expect(snackBarSpy.open).toHaveBeenCalledWith('Item approved successfully', 'Close', { duration: 5000 });
    expect(itemsServiceSpy.getPendingApprovals).toHaveBeenCalled();
  });

  it('should reject item', () => {
    const mockResponse = {
      success: true,
      message: 'Item rejected successfully',
      data: null,
      errors: null
    };

    itemsServiceSpy.rejectItem.and.returnValue(of(mockResponse));
    itemsServiceSpy.getPendingApprovals.and.returnValue(of({ items: [], totalCount: 0 }));
    component.rejectItem(mockItem.idItem);

    expect(itemsServiceSpy.rejectItem).toHaveBeenCalledWith(mockItem.idItem.toString(), 'Rejected by admin');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Item rejected successfully', 'Close', { duration: 5000 });
    expect(itemsServiceSpy.getPendingApprovals).toHaveBeenCalled();
  });

  it('should handle error when approving item', () => {
    itemsServiceSpy.approveItem.and.returnValue(throwError(() => new Error('Failed to approve item')));
    component.approveItem(mockItem.idItem);

    expect(itemsServiceSpy.approveItem).toHaveBeenCalledWith(mockItem.idItem.toString());
    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to approve item', 'Close', { duration: 5000 });
  });

  it('should handle error when rejecting item', () => {
    itemsServiceSpy.rejectItem.and.returnValue(throwError(() => new Error('Failed to reject item')));
    component.rejectItem(mockItem.idItem);

    expect(itemsServiceSpy.rejectItem).toHaveBeenCalledWith(mockItem.idItem.toString(), 'Rejected by admin');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to reject item', 'Close', { duration: 5000 });
  });
});
