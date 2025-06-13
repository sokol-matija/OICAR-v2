import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User, Log, UserProfile, UpdateUserAdminRequest } from '../models/user.model'; // Assuming Log is in user.model.ts or a shared model
import { environment } from '../../../environments/environment';
import { Item, ItemWithDetails } from '../models/item.model'; // Import Item for item details
import { PagedApiResponse } from '../models/api-response.model';
import { UserListResponse } from '../models/shared.types';
import { ApiResponse } from '../models/api-response.model';

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  userId?: string;
  action: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;
  private usersApiUrl = `${environment.apiUrl}/users`;
  private itemsApiUrl = `${environment.apiUrl}/items`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) {}

  // User Management
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/admin/users`).pipe(
      catchError(this.handleError)
    );
  }

  // New method to get a single user by ID with full details (needed for update)
  getUserById(id: number): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.usersApiUrl}/${id}`, this.httpOptions).pipe(
      map(response => {
        if (response.success && response.data) {
          return response;
        } else {
          throw new Error(response.message || 'Failed to fetch user details');
        }
      }),
      catchError(this.handleError)
    );
  }

  updateUser(id: number, userData: Partial<UserProfile>): Observable<ApiResponse<UserProfile>> {
    return this.http.put<ApiResponse<UserProfile>>(`${this.usersApiUrl}/${id}`, userData, this.httpOptions).pipe(
      map(response => {
        if (response.success) {
          return response;
        } else {
          throw new Error(response.message || 'Failed to update user');
        }
      }),
      catchError(this.handleError)
    );
  }

  // New method to promote a user to admin
  promoteUser(userId: number, userData: UpdateUserAdminRequest): Observable<ApiResponse<UserProfile>> {
    return this.http.put<ApiResponse<UserProfile>>(`${this.usersApiUrl}/${userId}`, userData, this.httpOptions).pipe(
      map(response => {
        if (response.success) {
          return response;
        } else {
          throw new Error(response.message || 'Failed to promote user');
        }
      }),
      catchError(this.handleError)
    );
  }

  // Updated deleteUser to use the correct endpoint
  deleteUser(userId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.usersApiUrl}/${userId}`, this.httpOptions).pipe(
      map(response => {
        if (response.success) {
          return response;
        } else {
          throw new Error(response.message || 'Failed to delete user');
        }
      }),
      catchError(this.handleError)
    );
  }

  // Logs & Monitoring
  getSystemLogs(): Observable<SystemLog[]> {
    return this.http.get<SystemLog[]>(`${environment.apiUrl}/admin/logs`).pipe(
      catchError(this.handleError)
    );
  }

  getSystemLogsByLevel(level: SystemLog['level']): Observable<SystemLog[]> {
    return this.http.get<SystemLog[]>(`${environment.apiUrl}/admin/logs/level/${level}`).pipe(
      catchError(this.handleError)
    );
  }

  getSystemLogsByUser(userId: string): Observable<SystemLog[]> {
    return this.http.get<SystemLog[]>(`${environment.apiUrl}/admin/logs/user/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  getSystemLogsByDateRange(startDate: Date, endDate: Date): Observable<SystemLog[]> {
    return this.http.get<SystemLog[]>(`${environment.apiUrl}/admin/logs/date-range`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  getRecentLogs(count: number = 50, level: string | null = null): Observable<Log[]> {
    let params = `?count=${count}`;
    if (level) {
      params += `&level=${level}`;
    }
    return this.http.get<ApiResponse<Log[]>>(`${this.apiUrl}/logs${params}`, this.httpOptions).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch logs');
        }
      }),
      catchError(this.handleError)
    );
  }

  getUsers(pageNumber: number = 1, pageSize: number = 20): Observable<PagedApiResponse<UserListResponse[]>> {
    const params = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return this.http.get<PagedApiResponse<UserListResponse[]>>(`${this.usersApiUrl}${params}`, this.httpOptions).pipe(
      map(response => {
        if (response.success && response.data) {
          // Ensure the data is properly typed and dates are converted
          const typedResponse = {
            ...response,
            data: {
              ...response.data,
              data: response.data.data.map(user => {
                const transformedUser = {
                  ...user,
                  anonymizationRequestDate: user.anonymizationRequestDate ? new Date(user.anonymizationRequestDate) : undefined,
                  createdAt: new Date(user.createdAt)
                };
                return transformedUser;
              })
            }
          };
          return typedResponse;
        } else {
          throw new Error(response.message || 'Failed to fetch users');
        }
      }),
      catchError(this.handleError)
    );
  }

  getAllItems(pageNumber: number = 1, pageSize: number = 20): Observable<PagedApiResponse<ItemWithDetails[]>> {
    const params = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return this.http.get<PagedApiResponse<ItemWithDetails[]>>(`${this.itemsApiUrl}/admin/all${params}`, this.httpOptions).pipe(
      map(response => {
        if (response.success && response.data) {
          return response;
        } else {
          throw new Error(response.message || 'Failed to fetch all items');
        }
      }),
      catchError(this.handleError)
    );
  }

  approveAnonymization(userId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.usersApiUrl}/${userId}/anonymize`, {}, this.httpOptions).pipe(
      map(response => {
        if (response.success) {
          return response;
        } else {
          throw new Error(response.message || 'Failed to approve anonymization');
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && typeof error.error === 'object') {
        // Try to get the error message from the response body
        if ('message' in error.error) {
          errorMessage = error.error.message;
        } else if ('errors' in error.error) {
          errorMessage = Array.isArray(error.error.errors) 
            ? error.error.errors.join(', ')
            : JSON.stringify(error.error.errors);
        }
      } else if (typeof error.error === 'string') {
        // If the error is a string, use it directly
        errorMessage = error.error;
      } else {
        // Fallback to status text if available
        errorMessage = error.statusText || `Error Code: ${error.status}`;
      }
    }
    
    console.error('Error details:', error);
    return throwError(() => new Error(errorMessage));
  }
} 