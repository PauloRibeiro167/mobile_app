import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { 
  IonContent, IonMenu, IonList, IonItem, IonLabel, IonAvatar, MenuController
} from '@ionic/angular/standalone';
import { DashboardService } from '../../../core/services/api/dashboard/dashboard.service';
import { UserService } from '../../../core/services/api/user/user.service';
import { AppViewDefinition, AuthService } from '@services';
import { MenuToggleButtonComponent } from '../menu-toggle-button/menu-toggle-button.component';

interface MenuSection {
  title: string;
  items: AppViewDefinition[];
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  standalone: true,
  imports: [ 
    CommonModule, IonContent, IonMenu, IonList, RouterModule, IonItem, IonLabel, IonAvatar, MenuToggleButtonComponent
  ],
})
export class MenuComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private dashboardService = inject(DashboardService);
  private menuCtrl = inject(MenuController);
  private router = inject(Router);
  
  userProfile$ = this.userService.getUserProfile();
  dashboardData$ = this.dashboardService.getDashboardData();
  session$ = this.authService.sessao$;

  closeMenu() {
    this.menuCtrl.close();
  }

  buildMenuSections(views: AppViewDefinition[]): MenuSection[] {
    const grouped = views.reduce<Record<string, AppViewDefinition[]>>((accumulator, view) => {
      accumulator[view.section] ||= [];
      accumulator[view.section].push(view);
      return accumulator;
    }, {});

    return Object.entries(grouped).map(([title, items]) => ({
      title,
      items,
    }));
  }

  isActiveRoute(route: string): boolean {
    const currentUrl = this.router.url.split('?')[0].replace(/\/+$/, '');
    const targetRoute = route.replace(/\/+$/, '');
    return currentUrl === targetRoute;
  }

  async logout(): Promise<void> {
    await this.menuCtrl.close();
    this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
