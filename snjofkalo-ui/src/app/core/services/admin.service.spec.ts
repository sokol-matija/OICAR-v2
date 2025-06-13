import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';
import { environment } from '../../../environments/environment';
import { User, UserProfile } from '../models/user.model';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    idUser: 1,
    username: 'testuser',
    email: 'test@example.com',
    isAdmin: false,
    isSeller: false,
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    failedLoginAttempts: 0,
    requestedAnonymization: false
  };

  const mockUserProfile: UserProfile = {
    ...mockUser,
    sellerInfo: undefined,
    anonymizationRequestDate: undefined,
    anonymizationNotes: undefined
  };

  const mockLog = {
    id: '1',
    level: 'info' as const,
    message: 'Test log',
    timestamp: new Date(),
    action: 'TEST'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });

    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // User Management Tests
  it('should get all users', () => {
    const mockUsers = [mockUser];

    service.getAllUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should get user by id', () => {
    const mockResponse = {
      success: true,
      data: mockUserProfile,
      message: 'Success'
    };

    service.getUserById(1).subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockUserProfile);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update user', () => {
    const updateData = { email: 'updated@example.com' };
    const mockResponse = {
      success: true,
      data: { ...mockUserProfile, ...updateData },
      message: 'Success'
    };

    service.updateUser(1, updateData).subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data.email).toBe(updateData.email);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush(mockResponse);
  });

  // Logs Tests
  it('should get system logs', () => {
    const mockLogs = [mockLog];

    service.getSystemLogs().subscribe(logs => {
      expect(logs).toEqual(mockLogs);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/logs`);
    expect(req.request.method).toBe('GET');
    req.flush(mockLogs);
  });

  it('should get logs by level', () => {
    const mockLogs = [mockLog];

    service.getSystemLogsByLevel('info').subscribe(logs => {
      expect(logs).toEqual(mockLogs);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/logs/level/info`);
    expect(req.request.method).toBe('GET');
    req.flush(mockLogs);
  });

  // Error Handling Test
  it('should handle errors properly', () => {
    const errorMessage = 'Test error';

    service.getAllUsers().subscribe({
      error: (error) => {
        expect(error.message).toContain(errorMessage);
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users`);
    req.flush({ message: errorMessage }, { 
      status: 400, 
      statusText: 'Bad Request' 
    });
  });
}); 