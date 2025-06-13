import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
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

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'currentUserValue']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        TestModule,
        FormsModule,
        RouterTestingModule.withRoutes([
          { path: 'items', component: LoginComponent } // Mock route for testing
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

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture.detectChanges();
  });

  it('should handle successful login', async () => {
    mockAuthService.login.and.returnValue(of(true));
    component.username = 'testuser';
    component.password = 'password123';

    component.onLogin();
    await fixture.whenStable();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    });
    expect(location.path()).toBe('/items');
  });

  it('should handle login error', () => {
    const errorMessage = 'Invalid credentials';
    mockAuthService.login.and.returnValue(throwError(() => new Error(errorMessage)));
    component.username = 'testuser';
    component.password = 'wrongpassword';

    component.onLogin();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'wrongpassword'
    });
    expect(component.error).toBe(errorMessage);
  });
}); 