import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../../core/services/auth.service';
import { LoginComponent } from '../../features/auth/login/login.component';
import { environment } from '../../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';

describe('Login Integration Tests', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'items', component: LoginComponent } // Mock route for testing
        ]),
        HttpClientTestingModule,
        FormsModule,
        MatCardModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule
      ],
      declarations: [],
      providers: [AuthService]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    localStorage.clear(); // Clear any existing auth data
    authService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should redirect to items if already logged in', fakeAsync(() => {
    // Arrange
    const mockUser = { 
      username: 'testuser', 
      isAdmin: false,
      user: { isAdmin: false }
    };
    
    // Set up localStorage first
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('jwtToken', 'fake-token');
    
    // Re-initialize AuthService to pick up the localStorage values
    authService = TestBed.inject(AuthService);
    
    // Manually set the currentUserSubject value
    (authService as any).currentUserSubject.next(mockUser);
    
    console.log('Before test - localStorage:', {
      currentUser: localStorage.getItem('currentUser'),
      jwtToken: localStorage.getItem('jwtToken')
    });
    console.log('AuthService currentUserValue:', authService.currentUserValue);

    const navigateSpy = spyOn(router, 'navigate').and.callThrough();
    console.log('Router spy created');

    // Re-create component after AuthService is initialized
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // Act
    fixture.detectChanges(); // This triggers ngOnInit
    console.log('After first detectChanges');
    
    tick(); // Wait for async operations
    console.log('After tick');
    
    fixture.detectChanges(); // Update view after async operations
    console.log('After second detectChanges');

    // Assert
    console.log('Navigation spy calls:', navigateSpy.calls.all());
    expect(navigateSpy).toHaveBeenCalledWith(['/items']);
  }));

  it('should handle successful login and store auth data', fakeAsync(() => {
    // Arrange
    const mockResponse = {
      success: true,
      message: 'Login successful',
      data: {
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
        username: 'testuser',
        email: 'test@example.com',
        isAdmin: false,
        userId: '1',
        user: { isAdmin: false }
      },
      errors: null
    };
    spyOn(router, 'navigate');

    // Act
    component.username = 'testuser';
    component.password = 'password123';
    component.onLogin();
    tick();

    // Assert
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(localStorage.getItem('jwtToken')).toBe('fake-jwt-token');
    expect(localStorage.getItem('refreshToken')).toBe('fake-refresh-token');
    expect(JSON.parse(localStorage.getItem('currentUser') || '{}')).toEqual(jasmine.objectContaining({
      username: 'testuser',
      email: 'test@example.com'
    }));
    expect(router.navigate).toHaveBeenCalledWith(['/items']);
  }));

  it('should handle failed login and show error message', fakeAsync(() => {
    // Arrange
    const mockErrorResponse = {
      success: false,
      message: 'Invalid credentials',
      data: null,
      errors: ['Invalid username or password']
    };

    // Act
    component.username = 'wronguser';
    component.password = 'wrongpass';
    component.onLogin();
    tick();

    // Assert
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockErrorResponse, { 
      status: 401, 
      statusText: 'Unauthorized'
    });

    expect(component.error).toBe('Error: Invalid credentials');
    expect(localStorage.getItem('jwtToken')).toBeNull();
    expect(localStorage.getItem('currentUser')).toBeNull();
  }));
}); 