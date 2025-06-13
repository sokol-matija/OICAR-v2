import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Item, ItemWithDetails, ItemApprovalRequest } from '../models/item.model';

interface ItemSearchRequest {
  searchQuery?: string;
  categoryId?: number;
  sortBy?: string;
  pageNumber?: number;
  pageSize?: number;
  isActive?: boolean;
  isApproved?: boolean;
  itemStatus?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any | null;
}

// Represents the structure of the data field inside the ApiResponse for paginated items from backend
interface BackendItemPaginationData<T> {
  data: T[]; // The actual list of items
  totalPages: number;
  pageNumber: number; // Corresponds to currentPage
  totalCount: number; // Corresponds to totalItems
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// This is what the service will output and what the component expects for paginated items
interface PaginatedResponse<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private apiUrl = environment.apiUrl;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) {}

  // Public endpoints
  getItems(params: {
    searchQuery?: string;
    categoryId?: number;
    sortBy?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<PaginatedResponse<ItemWithDetails>> {
    const queryParams = new URLSearchParams();
    if (params.searchQuery) queryParams.set('title', params.searchQuery);
    if (params.categoryId) queryParams.set('categoryId', params.categoryId.toString());
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.pageNumber) queryParams.set('pageNumber', params.pageNumber.toString());
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());

    const url = `${this.apiUrl}/items?${queryParams.toString()}`;
    console.log('Making API call to:', url);

    return this.http.get<ApiResponse<BackendItemPaginationData<ItemWithDetails>>>(
      url, 
      this.httpOptions
    ).pipe(
      tap(response => {
        console.log('Raw API response:', response);
      }),
      map(apiResponse => {
        if (apiResponse && apiResponse.success && apiResponse.data) {
          const backendData = apiResponse.data;
          return {
            items: backendData.data || [],
            totalPages: backendData.totalPages,
            currentPage: backendData.pageNumber,
            totalItems: backendData.totalCount
          } as PaginatedResponse<ItemWithDetails>;
        } else {
          return { items: [], totalPages: 1, currentPage: 1, totalItems: 0 };
        }
      }),
      catchError(this.handleError)
    );
  }

  getItemById(id: string): Observable<ItemWithDetails> {
    return this.http.get<ApiResponse<ItemWithDetails>>(`${this.apiUrl}/items/${id}`, this.httpOptions).pipe(
      map(response => {
        if (response && response.success && response.data) {
          return response.data;
        } else {
          throw new Error('Failed to get item by ID');
        }
      }),
      catchError(this.handleError)
    );
  }

  // New: Get featured items
  getFeaturedItems(): Observable<ItemWithDetails[]> {
    return this.http.get<ApiResponse<ItemWithDetails[]>>(`${this.apiUrl}/items/featured`).pipe(
      map(response => {
        if (response && response.success && response.data) {
          return response.data;
        } else {
          return [];
        }
      }),
      catchError(this.handleError)
    );
  }

  // Seller endpoints
  createItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'images'>): Observable<Item> {
    return this.http.post<ApiResponse<Item>>(`${this.apiUrl}/items/seller`, item).pipe(
      map(response => {
        if (response && response.success && response.data) {
          return response.data;
        } else {
          throw new Error('Failed to create item');
        }
      }),
      catchError(this.handleError)
    );
  }

  updateItem(id: string, item: Partial<Item>): Observable<Item> {
    return this.http.put<ApiResponse<Item>>(`${this.apiUrl}/items/seller/${id}`, item).pipe(
      map(response => {
        if (response && response.success && response.data) {
          return response.data;
        } else {
          throw new Error('Failed to update item');
        }
      }),
      catchError(this.handleError)
    );
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/items/seller/${id}`).pipe(
      map(response => {
        if (response && response.success) {
          return;
        } else {
          throw new Error('Failed to delete item');
        }
      }),
      catchError(this.handleError)
    );
  }

  getMyItems(): Observable<ItemWithDetails[]> {
    return this.http.get<ApiResponse<ItemWithDetails[]>>(`${this.apiUrl}/items/seller/my-items`).pipe(
      map(response => {
        if (response && response.success && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  // Admin endpoints
  getPendingApprovals(pageNumber: number = 1, pageSize: number = 20): Observable<{ items: ItemWithDetails[], totalCount: number }> {
    return this.http.get<ApiResponse<{ data: ItemWithDetails[], totalCount: number, pageNumber: number, pageSize: number }>>(`${this.apiUrl}/items/pending-approval?pageNumber=${pageNumber}&pageSize=${pageSize}`).pipe(
      map(response => {
        if (response && response.success && response.data) {
          return {
            items: response.data.data,
            totalCount: response.data.totalCount
          };
        }
        throw new Error(response?.message || 'Failed to load pending approvals');
      }),
      catchError(this.handleError)
    );
  }

  approveItem(itemId: string, notes?: string): Observable<ItemApprovalRequest> {
    return this.http.post<ApiResponse<ItemApprovalRequest>>(`${this.apiUrl}/items/${itemId}/approve`, { notes }).pipe(
      map(response => {
        if (response && response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to approve item');
      }),
      catchError(this.handleError)
    );
  }

  rejectItem(itemId: string, notes: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/items/${itemId}/reject`, { 
      rejectionReason: notes,
      allowResubmission: true
    }).pipe(
      map(response => {
        if (response && response.success) {
          return response;
        }
        throw new Error(response?.message || 'Failed to reject item');
      }),
      catchError(this.handleError)
    );
  }

  getCategories(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/categories`, this.httpOptions).pipe(
      map(response => {
        if (response && response.success && response.data) {
          return response.data;
        } else {
          return [];
        }
      }),
      catchError(this.handleError)
    );
  }

  createItemRequest(item: Partial<ItemWithDetails>): Observable<any> {
    const request = {
      title: item.title,
      description: item.description,
      itemCategoryID: item.itemCategoryID,
      price: item.price,
      stockQuantity: item.stockQuantity,
      isActive: true,
      isApproved: false,
      itemStatus: 'Pending',
      isUserGenerated: true,
      needsApproval: true,
      agreeToTerms: item.agreeToTerms,
      desiredCommissionRate: 0.05,
      images: item.images?.map(img => ({
        imageData: img.imageData,
        fileName: img.fileName,
        contentType: img.contentType,
        imageOrder: img.imageOrder
      }))
    };


    return this.http.post<ApiResponse<ItemWithDetails>>(`${this.apiUrl}/items/seller`, request).pipe(
      map(response => {
        if (response && response.success && response.data) {
          return response.data;
        }
        throw new Error(response?.message || 'Failed to create item request');
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 