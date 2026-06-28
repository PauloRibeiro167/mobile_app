import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { PdvAccessService } from '@domains/pdv/services/pdv-access.service';
import { Router } from '@angular/router';

export const pdvAccessGuard: CanActivateFn = async () => {
  const pdvAccessService = inject(PdvAccessService);
  const router = inject(Router);

  await pdvAccessService.initialize();

  return pdvAccessService.canAccessPdvDirectly()
    ? true
    : router.createUrlTree(['/home']);
};
