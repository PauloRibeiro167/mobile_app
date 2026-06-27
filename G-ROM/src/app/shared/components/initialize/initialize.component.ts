import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton } from '@ionic/angular/standalone';
import { PreferencesService } from '@services';

@Component({
  selector: 'app-initialize',
  templateUrl: './initialize.component.html',
  styleUrls: ['./initialize.component.css'],
  standalone: true,
  imports: [CommonModule, IonButton]
})
export class InitializeComponent implements OnInit {
  private readonly preferencesService = inject(PreferencesService);
  private readonly welcomeKey = 'hasSeenWelcome';

  @Output() complete = new EventEmitter<void>();

  isVisible: boolean = false;
  title: string = 'Bem-vindo!';
  message: string = 'Esta é a sua primeira vez usando o SITFOR. Explore as funcionalidades de consulta ao cadastro imobiliário.';
  buttonText: string = 'Continuar';

  async ngOnInit(): Promise<void> {
    // Verificar se é a primeira vez
    const hasSeenWelcome = await this.preferencesService.getString(this.welcomeKey);
    if (!hasSeenWelcome) {
      this.isVisible = true;
    } else {
      // Se já viu, emitir complete imediatamente
      this.complete.emit();
    }
  }

  async closeWelcome(): Promise<void> {
    this.isVisible = false;
    await this.preferencesService.setString(this.welcomeKey, 'true');
    this.complete.emit();
  }

  onOverlayClick(event: MouseEvent) {
    // Fechar apenas se clicar no overlay (fora do card)
    if ((event.target as HTMLElement).classList.contains('initialize-overlay')) {
      void this.closeWelcome();
    }
  }
}
