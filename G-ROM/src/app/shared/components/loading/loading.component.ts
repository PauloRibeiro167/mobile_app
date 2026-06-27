import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { tailChase } from 'ldrs';

// Registrar o componente globalmente apenas se não existir
if (!customElements.get('l-tail-chase')) {
  tailChase.register();
}

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoadingComponent {
  @Input() isVisible: boolean = false;
  @Input() message: string = 'Carregando...';
  @Input() size: string = '40';
  @Input() color: string = 'var(--ion-color-primary)';
  @Input() speed: string = '1.75';
  @Input() customClass?: string; 
  @Input() debugText?: string; 
}