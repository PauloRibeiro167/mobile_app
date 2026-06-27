import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonGrid, IonRow, IonCol, IonItem, IonLabel } from '@ionic/angular/standalone';
import type { SecaoAcordion, CampoAcordion } from '../types';

@Component({
  selector: 'app-accordion-layout-grid-2x2-icons',
  template: `
    <ion-grid class="grid-2x2-icons bg-background">
      <ion-row *ngFor="let linha of obterLinhas(secao.campos, 2); trackBy: rastrearLinha">
        <ion-col *ngFor="let campo of linha; trackBy: rastrearCampo" size="6" class="flex-center-all">
          <ion-item class="rounded-sm bg-none mb-2">
            <div class="flex-column flex-center">
              <i *ngIf="campo.icone" [class]="'bi bi-' + campo.icone + ' text-primary mb-2 size-4'"></i>
              <ion-label class="text-center">
                <h3 class="text-secondary mt-2">{{ campo.rotulo }}</h3>
                <p class="text-gray-600 mt-2">{{ campo.valor }}</p>
              </ion-label>
            </div>
          </ion-item>
        </ion-col>
      </ion-row>
    </ion-grid>
  `,
  standalone: true,
  imports: [CommonModule, IonGrid, IonRow, IonCol, IonItem, IonLabel]
})
export class AccordionLayoutGrid2x2IconsComponent {
  @Input() secao!: SecaoAcordion;

  obterLinhas(campos: CampoAcordion[], colunasPorLinha: number): CampoAcordion[][] {
    const linhas: CampoAcordion[][] = [];
    for (let i = 0; i < campos.length; i += colunasPorLinha) {
      linhas.push(campos.slice(i, i + colunasPorLinha));
    }
    return linhas;
  }

  rastrearLinha(index: number): number {
    return index;
  }

  rastrearCampo(index: number, campo: CampoAcordion): string {
    return campo.id;
  }
}