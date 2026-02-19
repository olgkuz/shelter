import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../../servises/admin-auth';

export const adminAuthGuard: CanActivateFn = (_, state) => {
  const authService = inject(AdminAuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/admin/login'], {
    queryParams: { redirect: state.url }
  });
};
