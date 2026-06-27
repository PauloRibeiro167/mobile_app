import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { AuthService, PreferencesService } from '@services';
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
  private authService = inject(AuthService);
  private preferencesService = inject(PreferencesService);
  private readonly rememberedUserKey = 'rememberedUser';

  readonly DEFAULT_USER = {
    email: 'teste@teste.com',
    password: '123456'
  };

  email: string = this.DEFAULT_USER.email;
  password: string = this.DEFAULT_USER.password;
  rememberMe: boolean = false;
  isLoading: boolean = false;
  showPassword: boolean = false;

  title: string = 'Sistema G-Room';

  async ngOnInit(): Promise<void> {
    await this.authService.initialize();

    if (this.authService.isAuthenticated()) {
      await this.router.navigate(['/home']);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    if (!this.email || !this.password) {
      return;
    }

    this.isLoading = true;

    try {
      const success = await this.authService.login(this.email, this.password);

      if (success) {
        if (this.rememberMe) {
          await this.preferencesService.setJson(this.rememberedUserKey, {
            email: this.email,
            rememberMe: true
          });
        } else {
          await this.preferencesService.remove(this.rememberedUserKey);
        }

        await this.router.navigate(['/home']);
      }
    } catch (error) {
      await this.alertController.create({
        header: 'Falha no login',
        message: 'Nao foi possivel entrar agora. Verifique suas credenciais e tente novamente.',
        buttons: ['OK']
      }).then(alert => alert.present());
    } finally {
      this.isLoading = false;
    }
  }

  async forgotPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar Senha',
      message: `Para o usuário padrão, use:<br><strong>Email:</strong> ${this.DEFAULT_USER.email}<br><strong>Senha:</strong> ${this.DEFAULT_USER.password}`,
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
    const rememberedUser = await this.preferencesService.getJson<{
      email: string;
      rememberMe: boolean;
    } | null>(this.rememberedUserKey, null);

    if (rememberedUser) {
      this.email = rememberedUser.email;
      this.rememberMe = rememberedUser.rememberMe;
    }
  }
}
