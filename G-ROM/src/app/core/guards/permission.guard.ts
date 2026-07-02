import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '@services';

export const permissionGuard: CanActivateFn = async (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.initialize();

  const requiredViewId = route.data?.['requiredViewId'] as string | undefined;
  if (!requiredViewId) {
    return true;
  }

  return authService.canAccessView(requiredViewId)
    ? true
    : router.createUrlTree([authService.getFallbackRoute()]);
};
