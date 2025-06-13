import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getToken();

  let authReq = req;
  if (authToken) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });
  }

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Handle 401 error, e.g., redirect to login
        console.error('Unauthorized request:', error);
        // You might want to trigger a logout or redirect to login here
        // authService.logout(); // This might cause a circular dependency if not handled carefully
        // window.location.href = '/login';
      }
      return throwError(() => error);
    })
  );
}; 