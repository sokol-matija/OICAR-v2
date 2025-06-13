import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseOrder } from '../models/shared.types';
import { OrderWithDetails } from '../models/order.model';
import { ApiResponse } from '../models/api-response.model';
import { tap, map } from 'rxjs/operators';

interface PaginatedResponse<T> {
  data: T[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(orderData: any): Observable<ApiResponse<OrderWithDetails>> {
    return this.http.post<ApiResponse<OrderWithDetails>>(this.apiUrl, orderData);
  }

  getOrders(): Observable<BaseOrder[]> {
    return this.http.get<BaseOrder[]>(this.apiUrl);
  }

  getOrderById(orderId: number): Observable<BaseOrder> {
    return this.http.get<BaseOrder>(`${this.apiUrl}/${orderId}`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<BaseOrder> {
    return this.http.patch<BaseOrder>(`${this.apiUrl}/${orderId}/status`, { status });
  }

  cancelOrder(orderId: number): Observable<BaseOrder> {
    return this.http.post<BaseOrder>(`${this.apiUrl}/${orderId}/cancel`, {});
  }

  // Customer endpoints
  getMyOrders(): Observable<OrderWithDetails[]> {
    return this.http.get<ApiResponse<PaginatedResponse<OrderWithDetails>>>(`${this.apiUrl}/my`).pipe(
      tap(response => {
      }),
      map(response => {
        return response.data.data;
      })
    );
  }

  // Seller endpoints
  getMySellerOrders(): Observable<BaseOrder[]> {
    return this.http.get<BaseOrder[]>(`${this.apiUrl}/seller/my`);
  }

  // Admin endpoints
  getAllOrders(): Observable<BaseOrder[]> {
    return this.http.get<BaseOrder[]>(`${this.apiUrl}/admin/all`);
  }
} 