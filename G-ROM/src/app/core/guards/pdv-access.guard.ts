import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { PdvAccessService } from '@services/api';
import { Router } from '@angular/router';

export const pdvAccessGuard: CanActivateFn = async () => {
  const pdvAccessService = inject(PdvAccessService);
  const router = inject(Router);

  await pdvAccessService.initialize();

  return pdvAccessService.canAccessPdvDirectly()
    ? true
    : router.createUrlTree(['/home']);
};
