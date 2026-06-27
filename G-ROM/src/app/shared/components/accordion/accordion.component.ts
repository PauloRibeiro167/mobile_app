import { Component, Input, ChangeDetectionStrategy, TemplateRef, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonAccordion, IonAccordionGroup, IonItem, IonLabel } from '@ionic/angular/standalone';
import type { DadosAcordion, CampoAcordion, SecaoAcordion } from './types';
import {
  AccordionLayoutGrid2x2Component,
  AccordionLayoutGrid2x2IconsComponent,
  AccordionLayoutColunaUnicaComponent,
  AccordionLayoutColumnsGroupsComponent,
  AccordionLayoutCartoesAgrupadosComponent,
  AccordionLayoutGaleriaImagensComponent
} from './layouts';

@Component({
  selector: 'app-resultado-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    IonAccordion,
    IonAccordionGroup,
    IonItem,
    IonLabel,
    AccordionLayoutGrid2x2Component,
    AccordionLayoutGrid2x2IconsComponent,
    AccordionLayoutColunaUnicaComponent,
    AccordionLayoutColumnsGroupsComponent,
    AccordionLayoutCartoesAgrupadosComponent,
    AccordionLayoutGaleriaImagensComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultadoAccordionComponent {
  @Input() dados!: DadosAcordion;

  /**
   * Verifica se deve renderizar um layout específico
   */
  deveRenderizarLayout(secao: SecaoAcordion, layout: string): boolean {
    return secao?.layout === layout;
  }

  /**
   * Organiza campos em linhas para grid
   */
  obterLinhas(campos: CampoAcordion[], colunasPorLinha: number): CampoAcordion[][] {
    const linhas: CampoAcordion[][] = [];
    for (let i = 0; i < campos.length; i += colunasPorLinha) {
      linhas.push(campos.slice(i, i + colunasPorLinha));
    }
    return linhas;
  }

  /**
   * Função trackBy para seções do accordion
   */
  rastrearPorSecao(index: number, secao: SecaoAcordion): string {
    return secao.id || index.toString();
  }

  /**
   * Função trackBy para campos
   */
  rastrearPorCampo(index: number, campo: CampoAcordion): string {
    return campo.id || index.toString();
  }

  /**
   * Bloqueia o scroll do body quando o modal está aberto
   */
  bloquearScrollCorpo(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }
  }

  /**
   * Desbloqueia o scroll do body quando o modal é fechado
   */
  desbloquearScrollCorpo(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  }

  /**
   * Renderiza um modal no body da página para garantir z-index máximo
   * Retorna o elemento modal criado para cleanup
   */
  renderizarModalNoCorpo(modelo: TemplateRef<any>, vcr: ViewContainerRef, cdr: ChangeDetectorRef): HTMLElement | null {
    if (!modelo || typeof document === 'undefined') {
      return null;
    }

    try {
      // Cria uma view embeddada do template do modal
      const visaoEmbutida = modelo.createEmbeddedView({});
      
      // Cria um container div para o modal
      const containerModal = document.createElement('div');
      containerModal.id = 'modal-container';
      containerModal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 999999 !important;
        pointer-events: auto !important;
      `;

      // Anexa os nós da view ao container
      visaoEmbutida.rootNodes.forEach(no => {
        if (no) {
          containerModal.appendChild(no);
        }
      });

      // Adiciona o container ao body
      document.body.appendChild(containerModal);

      // Detecta mudanças na view
      visaoEmbutida.detectChanges();

      return containerModal;

    } catch (erro) {
      console.error('Erro ao renderizar modal no body:', erro);
      return null;
    }
  }

  /**
   * Remove o modal do body
   */
  removerModalDoCorpo(elementoModal: HTMLElement): void {
    if (elementoModal && typeof document !== 'undefined') {
      try {
        if (document.body.contains(elementoModal)) {
          document.body.removeChild(elementoModal);
        }
      } catch (erro) {
        console.warn('Erro ao remover modal do body:', erro);
      }
    }
  }
}
