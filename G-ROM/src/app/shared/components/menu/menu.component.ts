import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { 
  IonContent, IonMenu, IonList, IonItem, IonLabel, IonAvatar, MenuController
} from '@ionic/angular/standalone';
import { DashboardService } from '../../../core/services/api/dashboard/dashboard.service';
import { UserService } from '../../../core/services/api/user/user.service';
import { AuthService } from '@services';
import { MenuToggleButtonComponent } from '../menu-toggle-button/menu-toggle-button.component';

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

  closeMenu() {
    this.menuCtrl.close();
  }

  async logout(): Promise<void> {
    await this.menuCtrl.close();
    this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
