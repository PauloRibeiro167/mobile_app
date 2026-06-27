import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@services';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  async canActivate(): Promise<boolean> {
    await this.authService.initialize();

    if (this.authService.isAuthenticated()) {
      return true;
    }

    await this.router.navigate(['/login']);
    return false;
  }
}
