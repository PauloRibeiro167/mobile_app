import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { business, call, create, lockClosed, logOut, mail, person, personCircle, camera, } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { ModalComponent } from '@components';
import { AuthService } from '@services';
import { UserService, UserProfile } from '@services/api/user/user.service';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { PerfilTabComponent } from './components/perfil-tab/perfil-tab.component';
import { DesempenhoTabComponent } from './components/desempenho-tab/desempenho-tab.component';
import { AcompanhamentoTabComponent } from './components/acompanhamento-tab/acompanhamento-tab.component';
import { ConquistasTabComponent } from './components/conquistas-tab/conquistas-tab.component';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.css'],
  standalone: true,
  imports: [ CommonModule, IonicModule, ModalComponent, TabBarComponent, PerfilTabComponent, DesempenhoTabComponent, AcompanhamentoTabComponent, ConquistasTabComponent, ],
})
export class PerfilPage implements OnInit, OnDestroy {
  @ViewChild('modalRef') modal!: ModalComponent;

  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  userProfile: UserProfile | null = null;
  private userProfileSubscription?: Subscription;

  activeTab: string = 'perfil';

  constructor() {
    addIcons({
      person,
      personCircle,
      mail,
      call,
      business,
      create,
      lockClosed,
      logOut,
      camera,
    });
  }

  ngOnInit(): void {
    this.userProfileSubscription = this.userService
      .getUserProfile()
      .subscribe((usuario) => {
        this.userProfile = usuario;
      });
  }

  ngOnDestroy(): void {
    this.userProfileSubscription?.unsubscribe();
  }

  get currentSession() {
    return this.authService.getSessaoAtual();
  }

  private performLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  async editProfile() {
    if (this.modal) {
      this.modal.showAlert(
        'Em breve',
        'Esta funcionalidade estará disponível em breve.',
        'create'
      );
    } else {
      console.error('PerfilPage.editProfile - modal ViewChild not available');
    }
  }

  async changePassword() {
    if (this.modal) {
      this.modal.showAlert(
        'Em breve',
        'Esta funcionalidade estará disponível em breve.',
        'lock-closed'
      );
    } else {
      console.error(
        'PerfilPage.changePassword - modal ViewChild not available'
      );
    }
  }

  async openLogoutModal() {
    if (this.modal) {
      this.modal.showConfirm(
        'Deseja sair?',
        'Você deseja realmente encerrar sua sessão?',
        'log-out-outline',
        () => {
          this.performLogout();
        },
        () => {
          // Cancel callback
        }
      );
    } else {
      console.error(
        'PerfilPage.openLogoutModal - modal ViewChild not available'
      );
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    // Aqui você pode adicionar lógica para navegar para outras páginas ou alterar o conteúdo
    // Por exemplo: this.router.navigate([`/${tab}`]);
  }
}
