import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, UserLogin, UserRegistration } from '../models/user.model';
import { environment } from '../../../environments/environment';

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
}

interface AuthResponseData {
  token: string;
  refreshToken: string;
  username: string;
  email: string;
  isAdmin: boolean;
  userId: string;
  user?: {
    isAdmin: boolean;
    // Include other user properties if they exist here
    // e.g., firstName: string; lastName: string;
  };
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
  errors: any | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    withCredentials: true // Crucial for sending cookies/credentials
  };

  private readonly JWT_TOKEN_KEY = 'jwtToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly CURRENT_USER_KEY = 'currentUser';

  private currentUserSubject: BehaviorSubject<any | null>;
  public currentUser: Observable<any | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('currentUser') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  public getToken(): string | null {
    return localStorage.getItem(this.JWT_TOKEN_KEY);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  public isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  isAdmin(): boolean {
    // Check if currentUserValue exists and if the isAdmin property from the nested user object is true
    return this.currentUserValue && this.currentUserValue.user && this.currentUserValue.user.isAdmin === true;
  }

  isSeller(): boolean {
    // Always return true to make all users appear as sellers
    return true;
  }

  public login(request: LoginRequest): Observable<boolean> {
    console.log('AuthService - Login request:', request);
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request, this.httpOptions).pipe(
      map(response => {
        console.log('AuthService - Login response:', response);
        if (response.success && response.data && response.data.token) {
          const userData = { 
            ...response.data, 
            // Prioritize isAdmin from nested user object if available, otherwise use top-level data.isAdmin
            isAdmin: !!(response.data.user && response.data.user.isAdmin) || !!response.data.isAdmin 
          };
          localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userData));
          localStorage.setItem(this.JWT_TOKEN_KEY, response.data.token);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.data.refreshToken);
          this.currentUserSubject.next(userData);
          return true;
        } else {
          const errorMessage = response.message || 'Login failed';
          console.error('Login error:', errorMessage, response.errors);
          throw new Error(errorMessage);
        }
      }),
      catchError(error => {
        console.error('AuthService - Login error:', error);
        return this.handleError(error);
      })
    );
  }

  register(request: RegisterRequest): Observable<boolean> {
    console.log('AuthService - Register request:', request);
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request, this.httpOptions).pipe(
      map(response => {
        console.log('AuthService - Register response:', response);
        if (response.success) {
          console.log('Registration successful:', response.message);
          return true;
        } else {
          const errorMessage = response.message || 'Registration failed';
          console.error('Registration error:', errorMessage, response.errors);
          throw new Error(errorMessage);
        }
      }),
      catchError(error => {
        console.error('AuthService - Register error:', error);
        return this.handleError(error);
      })
    );
  }

  logout(): void {
    // Invalidate tokens on the server if necessary (e.g., blacklist refresh token)
    // For now, just clear local storage
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem(this.JWT_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserSubject.next(null);
    console.log('User logged out.');
    // Optionally, redirect to login page
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side Error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage = `Error: ${error.error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
} 