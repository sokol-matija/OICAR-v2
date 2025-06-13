import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const sellerGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isSeller()) {
    return true;
  }

  return router.parseUrl('/');
}; 