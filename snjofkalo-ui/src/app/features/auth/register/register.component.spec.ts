import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TestModule } from '../../../../test.module';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Location } from '@angular/common';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['register', 'currentUserValue']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        TestModule,
        FormsModule,
        RouterTestingModule.withRoutes([
          { path: 'login', component: RegisterComponent },
          { path: 'items', component: RegisterComponent } // Added items route
        ]),
        MatCardModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture.detectChanges();
  });

  it('should handle successful registration', async () => {
    mockAuthService.register.and.returnValue(of(true));
    component.username = 'newuser';
    component.firstName = 'New';
    component.lastName = 'User';
    component.email = 'newuser@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.phoneNumber = '1234567890';

    component.onRegister();
    await fixture.whenStable();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      username: 'newuser',
      firstName: 'New',
      lastName: 'User',
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      phoneNumber: '1234567890'
    });
    expect(component.successMessage).toBe('Registration successful! You can now log in.');
    
    // Wait for the navigation timeout
    await new Promise(resolve => setTimeout(resolve, 2000));
    expect(location.path()).toBe('/login');
  });

  it('should handle registration error', () => {
    const errorMessage = 'Registration failed';
    mockAuthService.register.and.returnValue(throwError(() => new Error(errorMessage)));
    component.username = 'newuser';
    component.firstName = 'New';
    component.lastName = 'User';
    component.email = 'newuser@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.phoneNumber = '1234567890';

    component.onRegister();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      username: 'newuser',
      firstName: 'New',
      lastName: 'User',
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      phoneNumber: '1234567890'
    });
    expect(component.error).toBe(errorMessage);
  });
}); 