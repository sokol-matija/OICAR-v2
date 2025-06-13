import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService } from './profile.service';
import { environment } from '../../../environments/environment';
import { UserProfile, ChangePasswordRequest } from '../models/user.model';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProfileService]
    });

    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get user profile', () => {
    const mockProfile: UserProfile = {
      idUser: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '1234567890',
      isAdmin: false,
      isSeller: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      failedLoginAttempts: 0,
      requestedAnonymization: false
    };

    const mockResponse = {
      success: true,
      message: 'Profile retrieved successfully',
      data: mockProfile,
      errors: null
    };

    service.getUserProfile().subscribe(profile => {
      expect(profile).toEqual(mockProfile);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/profile`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update user profile', () => {
    const updatedProfile: UserProfile = {
      idUser: 1,
      username: 'testuser',
      email: 'updated@example.com',
      firstName: 'Updated',
      lastName: 'User',
      phoneNumber: '9876543210',
      isAdmin: false,
      isSeller: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      failedLoginAttempts: 0,
      requestedAnonymization: false
    };

    const mockResponse = {
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
      errors: null
    };

    service.updateUserProfile(updatedProfile).subscribe(profile => {
      expect(profile).toEqual(updatedProfile);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/profile`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('should change password', () => {
    const passwordRequest: ChangePasswordRequest = {
      currentPassword: 'oldpass123',
      newPassword: 'newpass123',
      confirmNewPassword: 'newpass123'
    };

    const mockResponse = {
      success: true,
      message: 'Password changed successfully',
      data: null,
      errors: null
    };

    service.changePassword(passwordRequest).subscribe(response => {
      expect(response.success).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/change-password`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should handle profile update error', () => {
    const profile: UserProfile = {
      idUser: 1,
      username: 'testuser',
      email: 'invalid-email',
      firstName: 'Test',
      lastName: 'User',
      isAdmin: false,
      isSeller: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      failedLoginAttempts: 0,
      requestedAnonymization: false
    };

    const mockErrorResponse = {
      success: false,
      message: 'Invalid email format',
      data: null,
      errors: ['Email must be a valid email address']
    };

    service.updateUserProfile(profile).subscribe({
      next: () => fail('Should have failed'),
      error: (error) => {
        expect(error.message).toContain('Invalid email format');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/profile`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockErrorResponse, { status: 400, statusText: 'Bad Request' });
  });
}); 