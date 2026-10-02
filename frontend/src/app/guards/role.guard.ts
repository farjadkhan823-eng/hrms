import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// shared check: login first, then role
const checkRole = (role: 'admin' | 'employee') => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
  if (auth.user()?.role === role) return true;

  // wrong role: send to own home page
  return router.createUrlTree([auth.isAdmin() ? '/dashboard' : '/profile']);
};

export const adminGuard: CanActivateFn = () => checkRole('admin');
export const employeeGuard: CanActivateFn = () => checkRole('employee');
