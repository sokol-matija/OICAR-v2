import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BaseCartItem, BaseItem } from '../models/shared.types';
import { Item, ItemImage } from '../models/item.model';
import { CartItemWithDetails } from '../models/cart.model';

interface AddToCartRequest {
  itemId: number;
  quantity: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any | null;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartItemsSubject = new BehaviorSubject<CartItemWithDetails[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) {}

  getCart(): Observable<CartItemWithDetails[]> {
    return this.http.get<ApiResponse<{ items: CartItemWithDetails[] }>>(`${this.apiUrl}`, this.httpOptions).pipe(
      map(apiResponse => {
        if (apiResponse && apiResponse.success && apiResponse.data) {
          const cartItemsData = apiResponse.data.items;
          const itemsToMap = Array.isArray(cartItemsData) ? cartItemsData : [];

          const validItems = itemsToMap.map(item => {
            const rawItem = item.item || {}; // This is the nested 'item' object that might be empty

            const mappedItem: Item = {
              idItem: item.itemId || rawItem.idItem || 0, // Prioritize item.itemId, then rawItem.idItem
              itemCategoryId: rawItem.itemCategoryId || 0,
              sellerUserId: rawItem.sellerUserId ?? undefined,
              title: item.itemTitle || rawItem.title || 'Unknown Title', // Prioritize itemTitle from CartItemWithDetails
              description: rawItem.description || 'No description available.', // Description is likely only in nested item
              stockQuantity: rawItem.stockQuantity || 0, // Stock quantity is likely only in nested item
              price: item.itemPrice || rawItem.price || 0, // Prioritize itemPrice from CartItemWithDetails
              isActive: rawItem.isActive ?? false,
              isFeatured: rawItem.isFeatured ?? false,
              isApproved: rawItem.isApproved ?? false,
              approvedByAdminId: rawItem.approvedByAdminId ?? undefined,
              approvalDate: rawItem.approvalDate ?? undefined,
              rejectionReason: rawItem.rejectionReason ?? undefined,
              itemStatus: rawItem.itemStatus || 'Unknown',
              commissionRate: rawItem.commissionRate ?? undefined,
              platformFee: rawItem.platformFee ?? undefined,
              createdAt: rawItem.createdAt || new Date().toISOString(),
              updatedAt: rawItem.updatedAt || new Date().toISOString(),
              images: Array.isArray(rawItem.images) ? rawItem.images : [] // Images are likely only in nested item
            };


            return {
              ...item,
              item: mappedItem
            };
          });
          this.cartItemsSubject.next(validItems);
          return validItems;
        } else {
          return [];
        }
      }),
      catchError(this.handleError)
    );
  }

  addToCart(itemId: number, quantity: number): Observable<boolean> {
    const requestBody: AddToCartRequest = {
      itemId: itemId,
      quantity: quantity
    };

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/items`, requestBody, this.httpOptions).pipe(
      map(response => {
        if (response.success) {
          return true;
        } else {
          throw new Error(response.message || 'Failed to add item to cart');
        }
      }),
      catchError(this.handleError)
    );
  }

  updateCartItem(cartItemId: number, quantity: number): Observable<CartItemWithDetails> {
    return this.http.put<CartItemWithDetails>(`${this.apiUrl}/${cartItemId}`, { quantity }).pipe(
      map(updatedItem => {
        const currentItems = this.cartItemsSubject.value;
        const index = currentItems.findIndex(item => item.idCartItem === cartItemId);
        if (index !== -1) {
          currentItems[index] = updatedItem;
          this.cartItemsSubject.next([...currentItems]);
        }
        return updatedItem;
      })
    );
  }

  removeFromCart(cartItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cartItemId}`).pipe(
      map(() => {
        const currentItems = this.cartItemsSubject.value;
        this.cartItemsSubject.next(currentItems.filter(item => item.idCartItem !== cartItemId));
      })
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}`).pipe(
      map(() => {
        this.cartItemsSubject.next([]);
      })
    );
  }

  getCartTotal(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => items.reduce((total, item) => total + (item.item.price * item.quantity), 0))
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && typeof error.error === 'object' && 'message' in error.error) {
        errorMessage = `Error: ${error.error.message}`;
        if (error.error.errors) {
          errorMessage += `\nDetails: ${JSON.stringify(error.error.errors)}`;
        }
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
} 