import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonGrid, IonRow, IonCol, IonItem, IonLabel } from '@ionic/angular/standalone';
import type { SecaoAcordion, CampoAcordion } from '../types';


@Component({
  selector: 'app-accordion-layout-columns-groups',
  template: `
    <ion-grid class="columns-groups">
      <ion-row>
        <ion-col size="6" *ngFor="let campo of secao.campos; trackBy: rastrear">
          <ion-item lines="none">
            <ion-label>
              <h3 class="text-secondary">{{ campo.rotulo }}</h3>
              <p class="text-gray-600">{{ campo.valor }}</p>
            </ion-label>
          </ion-item>
        </ion-col>
      </ion-row>
    </ion-grid>
  `,
  standalone: true,
  imports: [CommonModule, IonGrid, IonRow, IonCol, IonItem, IonLabel]
})
export class AccordionLayoutColumnsGroupsComponent {
  @Input() secao!: SecaoAcordion;

  rastrear(index: number, campo: CampoAcordion): string {
    return campo.id;
  }
}