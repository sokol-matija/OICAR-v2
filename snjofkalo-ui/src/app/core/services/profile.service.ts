import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserProfile, ChangePasswordRequest } from '../models/user.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/users`;
  private authApiUrl = `${environment.apiUrl}/auth`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) { }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/profile`, this.httpOptions).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch user profile');
        }
      }),
      catchError(this.handleError)
    );
  }

  updateUserProfile(userProfile: UserProfile): Observable<UserProfile> {
    return this.http.put<ApiResponse<UserProfile>>(`${this.apiUrl}/profile`, userProfile, this.httpOptions).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to update user profile');
        }
      }),
      catchError(this.handleError)
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.authApiUrl}/change-password`, request, this.httpOptions).pipe(
      map(response => {
        if (response.success) {
          return response;
        } else {
          throw new Error(response.message || 'Failed to change password');
        }
      }),
      catchError(this.handleError)
    );
  }

  requestAnonymization(reason: string, notes?: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/profile/request-anonymization`, { 
      reason, 
      notes: notes || '',
      confirmRequest: true 
    }, this.httpOptions).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to request anonymization');
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
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