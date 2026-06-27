import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonLabel } from '@ionic/angular/standalone';
import type { SecaoAcordion } from '../types';

@Component({
  selector: 'app-accordion-layout-coluna-unica',
  template: `
    <div class="bg-background p-3">
      <ion-label *ngFor="let campo of secao.campos" class="text-secondary d-block">
        <h2 class="text-primary ml-5 fw-bold">{{ campo.valor === 'PNI' ? 'Proprietario não identificado' : campo.valor }}</h2>
      </ion-label>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, IonLabel]
})
export class AccordionLayoutColunaUnicaComponent {
  @Input() secao!: SecaoAcordion;
}
