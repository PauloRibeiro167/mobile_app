import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { MockUserDefinition } from '@services';
import { AutenticacaoFacadeService } from '../../services/autenticacao-facade.service';
import { LoginFormState } from '../../services/login-form.service';
import { LoginFormCardComponent } from './components/login-form-card/login-form-card.component';
import { LoginHeroComponent } from './components/login-hero/login-hero.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css'],
  standalone: true,
  imports: [CommonModule, IonicModule, LoginHeroComponent, LoginFormCardComponent]
})

export class LoginPage implements OnInit {
  private alertController = inject(AlertController);
  private router = inject(Router);
  private autenticacaoFacadeService = inject(AutenticacaoFacadeService);

  readonly mockUsers = this.autenticacaoFacadeService.getMockUsers();
  readonly DEFAULT_USER = {
    email: this.mockUsers[0]?.email ?? '',
    password: this.mockUsers[0]?.password ?? ''
  };

  formState: LoginFormState = this.autenticacaoFacadeService.buildInitialFormState();

  title: string = 'Sistema G-Room';

  get email(): string {
    return this.formState.email;
  }

  set email(value: string) {
    this.formState = { ...this.formState, email: value };
  }

  get password(): string {
    return this.formState.password;
  }

  set password(value: string) {
    this.formState = { ...this.formState, password: value };
  }

  get rememberMe(): boolean {
    return this.formState.rememberMe;
  }

  set rememberMe(value: boolean) {
    this.formState = { ...this.formState, rememberMe: value };
  }

  get isLoading(): boolean {
    return this.formState.isLoading;
  }

  get showPassword(): boolean {
    return this.formState.showPassword;
  }

  async ngOnInit(): Promise<void> {
    await this.autenticacaoFacadeService.initializeAuth();

    if (this.autenticacaoFacadeService.isAuthenticated()) {
      await this.router.navigate([this.autenticacaoFacadeService.getFallbackRoute()]);
    }
  }

  togglePasswordVisibility() {
    this.formState = this.autenticacaoFacadeService.togglePassword(this.formState);
  }

  async login() {
    if (!this.email || !this.password) {
      return;
    }

    this.formState = this.autenticacaoFacadeService.setLoading(this.formState, true);

    try {
      const success = await this.autenticacaoFacadeService.login(this.formState);

      if (success) {
        await this.autenticacaoFacadeService.persistRememberedUser(this.formState);

        await this.router.navigate([this.autenticacaoFacadeService.getFallbackRoute()]);
        return;
      }

      await this.alertController.create({
        header: 'Credenciais inválidas',
        message: 'Escolha um dos usuários de simulação ou revise o e-mail e a senha.',
        buttons: ['OK']
      }).then(alert => alert.present());
    } catch (error) {
      await this.alertController.create({
        header: 'Falha no login',
        message: 'Nao foi possivel entrar agora. Verifique suas credenciais e tente novamente.',
        buttons: ['OK']
      }).then(alert => alert.present());
    } finally {
      this.formState = this.autenticacaoFacadeService.setLoading(this.formState, false);
    }
  }

  async forgotPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar Senha',
      message: `Escolha qualquer usuário da lista de simulação.<br><strong>Senha padrão:</strong> 123456`,
      buttons: ['OK']
    });

    await alert.present();
  }

  async register() {
    const alert = await this.alertController.create({
      header: 'Cadastro',
      message: 'Funcionalidade de cadastro em desenvolvimento.',
      buttons: ['OK']
    });

    await alert.present();
  }

  async loginWithGoogle() {
    const alert = await this.alertController.create({
      header: 'Login com Google',
      message: 'Funcionalidade de login com Google em desenvolvimento.',
      buttons: ['OK']
    });

    await alert.present();
  }

  async loginWithFacebook() {
    const alert = await this.alertController.create({
      header: 'Login com Facebook',
      message: 'Funcionalidade de login com Facebook em desenvolvimento.',
      buttons: ['OK']
    });

    await alert.present();
  }

  async ionViewDidEnter(): Promise<void> {
    this.formState = await this.autenticacaoFacadeService.loadRememberedUser(this.formState);
  }

  fillMockUser(user: MockUserDefinition): void {
    this.formState = this.autenticacaoFacadeService.fillWithMockUser(this.formState, user);
  }
}
