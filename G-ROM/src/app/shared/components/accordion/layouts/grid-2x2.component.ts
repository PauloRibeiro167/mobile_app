import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonGrid, IonRow, IonCol, IonItem, IonLabel } from '@ionic/angular/standalone';
import type { SecaoAcordion, CampoAcordion } from '../types';

/**
 * LAYOUT GRID 2x2 - Layout de grade 2 colunas
 * 
 * ✅ SRP: Apenas renderiza em formato grid 2x2
 * ✅ Recebe dados já formatados
 */
@Component({
  selector: 'app-accordion-layout-grid-2x2',
  template: `
    <ion-grid>
      <ion-row *ngFor="let linha of obterLinhas(secao.campos, 2); trackBy: rastrearLinha">
        <ion-col *ngFor="let campo of linha; trackBy: rastrearCampo" size="6">
          <ion-item lines="none" class="bg-transparent rounded-sm mb-2">
            <ion-label>
              <h3 class="text-secondary font-semibold mb-1">{{ campo.rotulo }}</h3>
              <p class="text-gray-600 m-0">{{ campo.valor }}</p>
            </ion-label>
          </ion-item>
        </ion-col>
      </ion-row>
    </ion-grid>
  `,
  standalone: true,
  imports: [CommonModule, IonGrid, IonRow, IonCol, IonItem, IonLabel]
})
export class AccordionLayoutGrid2x2Component {
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