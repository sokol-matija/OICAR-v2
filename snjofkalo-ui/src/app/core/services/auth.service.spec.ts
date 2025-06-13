import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for isLoggedIn when no token exists', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should login successfully', () => {
    const loginData = {
      username: 'testuser',
      password: 'password123'
    };

    const mockResponse = {
      success: true,
      message: 'Login successful',
      data: {
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
        username: 'testuser',
        email: 'test@example.com',
        isAdmin: false,
        userId: '1'
      },
      errors: null
    };

    service.login(loginData).subscribe(result => {
      expect(result).toBeTrue();
      expect(service.isLoggedIn()).toBeTrue();
      expect(service.getToken()).toBe('fake-jwt-token');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should register successfully', () => {
    const registerData = {
      username: 'newuser',
      firstName: 'New',
      lastName: 'User',
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    };

    const mockResponse = {
      success: true,
      message: 'Registration successful',
      data: {
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
        username: 'newuser',
        email: 'new@example.com',
        isAdmin: false,
        userId: '1'
      },
      errors: null
    };

    service.register(registerData).subscribe(result => {
      expect(result).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should logout successfully', () => {
    // First login to set up the tokens
    localStorage.setItem('jwtToken', 'fake-token');
    localStorage.setItem('refreshToken', 'fake-refresh-token');
    localStorage.setItem('currentUser', JSON.stringify({ username: 'testuser' }));

    service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBeNull();
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should handle login error', () => {
    const loginData = {
      username: 'testuser',
      password: 'wrongpassword'
    };

    const mockErrorResponse = {
      success: false,
      message: 'Invalid credentials',
      data: null,
      errors: ['Invalid username or password']
    };

    service.login(loginData).subscribe({
      next: () => fail('Should have failed'),
      error: (error) => {
        expect(error.message).toContain('Invalid credentials');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockErrorResponse, { status: 401, statusText: 'Unauthorized' });
  });
}); 