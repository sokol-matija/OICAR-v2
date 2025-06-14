import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

export const setupTestEnvironment = () => {
  TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
      HttpClientTestingModule,
      NoopAnimationsModule
    ]
  });
};

export const mockAuthResponse = {
  success: true,
  data: {
    token: 'fake-jwt-token',
    refreshToken: 'fake-refresh-token',
    user: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      isAdmin: false
    }
  }
};

export const mockErrorResponse = {
  success: false,
  message: 'Invalid credentials',
  errors: ['Invalid username or password']
}; 