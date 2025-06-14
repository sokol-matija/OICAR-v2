import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { routes } from '../../app.routes';
import { TestModule } from '../../../test.module';
import { Component } from '@angular/core';
import { authGuard, publicGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/admin.guard';

// Mock components for testing
@Component({ template: '' })
class MockComponent {}

describe('Navigation Integration Tests', () => {
  let router: Router;
  let location: Location;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          {
            path: '',
            component: MockComponent,
            canActivate: [publicGuard]
          },
          {
            path: 'login',
            component: MockComponent,
            canActivate: [publicGuard]
          },
          {
            path: 'items',
            component: MockComponent,
            canActivate: [authGuard]
          },
          {
            path: 'cart',
            component: MockComponent,
            canActivate: [authGuard]
          },
          {
            path: 'profile',
            component: MockComponent,
            canActivate: [authGuard]
          },
          {
            path: 'admin',
            children: [
              {
                path: 'logs',
                component: MockComponent,
                canActivate: [authGuard, adminGuard]
              },
              {
                path: 'users',
                component: MockComponent,
                canActivate: [authGuard, adminGuard]
              },
              {
                path: 'items',
                component: MockComponent,
                canActivate: [authGuard, adminGuard]
              }
            ]
          },
          {
            path: 'checkout',
            component: MockComponent,
            canActivate: [authGuard]
          }
        ]),
        TestModule
      ],
      declarations: [MockComponent],
      providers: [AuthService]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    authService = TestBed.inject(AuthService);
  });

  describe('Public Routes', () => {
    it('should allow access to landing page when not logged in', fakeAsync(() => {
      spyOn(authService, 'isLoggedIn').and.returnValue(false);
      
      router.navigate(['/']);
      tick();
      
      expect(location.path()).toBe('/');
    }));

    it('should redirect to items when accessing landing page while logged in', fakeAsync(() => {
      spyOn(authService, 'isLoggedIn').and.returnValue(true);
      
      router.navigate(['/']);
      tick();
      
      expect(location.path()).toBe('/items');
    }));

    it('should allow access to login page when not logged in', fakeAsync(() => {
      spyOn(authService, 'isLoggedIn').and.returnValue(false);
      
      router.navigate(['/login']);
      tick();
      
      expect(location.path()).toBe('/login');
    }));

    it('should redirect to items when accessing login page while logged in', fakeAsync(() => {
      spyOn(authService, 'isLoggedIn').and.returnValue(true);
      
      router.navigate(['/login']);
      tick();
      
      expect(location.path()).toBe('/items');
    }));
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route while not logged in', fakeAsync(() => {
      spyOn(authService, 'isLoggedIn').and.returnValue(false);
      
      router.navigate(['/items']);
      tick();
      
      expect(location.path()).toBe('/login');
    }));

    it('should allow access to protected route when logged in', fakeAsync(() => {
      spyOn(authService, 'isLoggedIn').and.returnValue(true);
      
      router.navigate(['/items']);
      tick();
      
      expect(location.path()).toBe('/items');
    }));

    it('should allow access to cart when logged in', fakeAsync(() => {
      spyOn(authService, 'isLoggedIn').and.returnValue(true);
      
      router.navigate(['/cart']);
      tick();
      
      expect(location.path()).toBe('/cart');
    }));

    it('should allow access to profile when logged in', fakeAsync(() => {
      spyOn(authService, 'isLoggedIn').and.returnValue(true);
      
      router.navigate(['/profile']);
      tick();
      
      expect(location.path()).toBe('/profile');
    }));
  });

  describe('Admin Routes', () => {
    beforeEach(() => {
      spyOn(authService, 'isLoggedIn').and.returnValue(true);
    });

    it('should allow access to admin routes when user is admin', fakeAsync(() => {
      spyOn(authService, 'isAdmin').and.returnValue(true);
      
      router.navigate(['/admin/logs']);
      tick();
      
      expect(location.path()).toBe('/admin/logs');
    }));

    it('should allow access to admin users page when user is admin', fakeAsync(() => {
      spyOn(authService, 'isAdmin').and.returnValue(true);
      
      router.navigate(['/admin/users']);
      tick();
      
      expect(location.path()).toBe('/admin/users');
    }));

    it('should allow access to admin items page when user is admin', fakeAsync(() => {
      spyOn(authService, 'isAdmin').and.returnValue(true);
      
      router.navigate(['/admin/items']);
      tick();
      
      expect(location.path()).toBe('/admin/items');
    }));
  });

  describe('Navigation Between Routes', () => {
    beforeEach(() => {
      spyOn(authService, 'isLoggedIn').and.returnValue(true);
    });

    it('should navigate from items to cart', fakeAsync(() => {
      router.navigate(['/items']);
      tick();
      expect(location.path()).toBe('/items');
      
      router.navigate(['/cart']);
      tick();
      expect(location.path()).toBe('/cart');
    }));

    it('should navigate from cart to checkout', fakeAsync(() => {
      router.navigate(['/cart']);
      tick();
      expect(location.path()).toBe('/cart');
      
      router.navigate(['/checkout']);
      tick();
      expect(location.path()).toBe('/checkout');
    }));

    it('should navigate from admin logs to admin users', fakeAsync(() => {
      spyOn(authService, 'isAdmin').and.returnValue(true);
      
      router.navigate(['/admin/logs']);
      tick();
      expect(location.path()).toBe('/admin/logs');
      
      router.navigate(['/admin/users']);
      tick();
      expect(location.path()).toBe('/admin/users');
    }));
  });
}); 