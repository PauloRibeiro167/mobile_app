import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonGrid, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonRow, IonCol } from '@ionic/angular/standalone';
import type { SecaoAcordion, CampoAcordion } from '../types';


@Component({
  selector: 'app-accordion-layout-cartoes-agrupados',
  template: `
    <ion-grid class="p-2">
      <ion-card class="m-2">
        <ion-card-header class="bg-primary">
          <ion-card-title class="text-white">
            {{ secao.titulo }}
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-row>
            <ion-col size="6" *ngFor="let campo of secao.campos; trackBy: rastrear">
              <div class="bg-light p-2 border rounded">
                <div class="text-label text-gray-600 mb-1">{{ campo.rotulo }}</div>
                <div class="text-body font-medium">{{ campo.valor }}</div>
              </div>
            </ion-col>
          </ion-row>
        </ion-card-content>
      </ion-card>
    </ion-grid>
  `,
  standalone: true,
  imports: [CommonModule, IonGrid, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonRow, IonCol]
})
export class AccordionLayoutCartoesAgrupadosComponent {
  @Input() secao!: SecaoAcordion;

  rastrear(index: number, campo: CampoAcordion): string {
    return campo.id;
  }
}
