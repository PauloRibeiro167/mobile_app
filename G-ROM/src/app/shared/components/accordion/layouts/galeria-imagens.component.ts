import { Component, Input, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef, inject, ViewContainerRef, TemplateRef, EmbeddedViewRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton } from '@ionic/angular/standalone';
import { SafeImagePipe } from '@shared/pipes/safe-image.pipe';
import { ResultadoAccordionComponent } from '../accordion.component';
import type { CampoAcordion } from '../types';
import type { Swiper } from 'swiper';

/** Layout de galeria de imagens para accordion. Exibe imagens em carousel com navegação e indicador de posição */
@Component({
  selector: 'app-accordion-layout-galeria-imagens',
  template: `
    <div class="galeria-imagens">

      <!-- Container das imagens -->
      <ng-container *ngIf="camposComFachada.length > 0; else semImagens">
        <div class="carousel-container">
          <swiper-container
            #containerSwiper
            slides-per-view="1"
            space-between="20"
            navigation="false"
            pagination="true"
            pagination-clickable="true"
            pagination-dynamic-bullets="true"
            loop="false"
            allow-touch-move="true"
            centered-slides="true"
            (slidechange)="aoMudarSlide()"
            class="imagens-swiper p-0">
            
            @for (campo of camposComFachada; track rastrearPorCampo($index, campo)) {
              <swiper-slide class="text-primary">
                <div class="card mb-5 p-0 border-primary position-relative">
                  <!-- Ícone/Botão expandir flutuando no canto superior direito -->
                  <ion-button
                    class="btn-expandir float-top-right mt-5 mr-3 "
                    fill="clear"
                    size="small"
                    (click)="abrirImagemCompleta(campo)"
                    aria-label="Expandir imagem">
                    <i class="bi bi-arrows-fullscreen text-fixed-white size-3"></i>
                  </ion-button>
                  
                  <!-- Container da imagem -->
                  <div class="position-relative overflow-hidden max-vh-40">
                    <img
                      [src]="campo.valor | safeImage"
                      [alt]="campo.rotulo"
                      class="vw-100 vh-100"
                      loading="lazy"
                    />
                  </div>

                  <!-- Informações da imagem -->
                  <div class="text-center mb-2 mt-3 px-3">
                    <h4 class="title text-primary mb-2">{{ campo.rotulo }}</h4>
                    <p class="text-center mb-3" *ngIf="campo.icone">
                      <span class="text-secondary">{{ campo.icone }}</span>
                    </p>
                  </div>
                </div>
              </swiper-slide>
            }
          </swiper-container>
        </div>
      </ng-container>

      <!-- Estado vazio -->
      <ng-template #semImagens>
        <div class="flex-center">
          <div class="icone-vazio text-center mt-6">
            <i class="bi bi-images mt-5  text-center text-primary size-4"></i>
            <p class="text-secondary font-bold">Sem imagem de fachada</p>
          </div>
        </div>
      </ng-template>
    </div>

    <!-- Template do modal - será renderizado no body via JavaScript -->
    <ng-template #modeloModal>
      @if (mostrarModalImagem && imagemSelecionada) {
        <div class="info-modal galeria-modal-imagem">
          <div class="focus-overlay" (click)="fecharImagemCompleta()">
            <div class="focus-content modal-imagem-content max-vh-90" (click)="$event.stopPropagation()">
              <!-- Header do modal -->
              <div class="focus-header flex-between">
                <div class="header-info">
                  <h3 class="text-fixed-white mb-0 fs-5 font-bold fw-semibold">{{ imagemSelecionada.rotulo }}</h3>
                  @if (campos.length > 1) {
                    <small class="text-fixed-white font-bold d-block mt-1">
                      Imagem {{ slideAtual }} de {{ camposComFachada.length }}
                    </small>
                  }
                </div>
                <ion-button 
                  fill="clear" 
                  size="small"
                  (click)="fecharImagemCompleta()">
                  <i class="bi bi-x-lg font-bold text-fixed-white size-2"></i>
                </ion-button>
              </div>

              <!-- Conteúdo principal - carousel de imagens -->
              <div class="carousel-modal-container">
                <swiper-container
                  id="swiper-modal"
                  slides-per-view="1"
                  space-between="20"
                  navigation="true"
                  pagination="true"
                  pagination-clickable="true"
                  pagination-dynamic-bullets="true"
                  loop="false"
                  allow-touch-move="true"
                  centered-slides="true"
                  (slidechange)="aoMudarSlideModal()"
                  class="modal-imagens-swiper">
                  
                  @for (campo of camposComFachada; track rastrearPorCampo($index, campo)) {
                    <swiper-slide>
                      <img 
                        [src]="campo.valor | safeImage" 
                        [alt]="campo.rotulo"
                        class="w-100"
                        (load)="aoCarregarImagem()"
                        (error)="aoErroImagem()"
                      />
                    </swiper-slide>
                  }
                </swiper-container>
              </div>

              <!-- Footer com descrição adicional -->
              @if (imagemSelecionada.icone && imagemSelecionada.icone !== imagemSelecionada.rotulo) {
                <div class="focus-footer">
                  <div class="text-center">
                    <p class="text-white-75 mb-0 fs-6">{{ imagemSelecionada.icone }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </ng-template>
  `,

  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    SafeImagePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionLayoutGaleriaImagensComponent implements AfterViewInit, OnDestroy {
  @Input() campos: CampoAcordion[] = [];
  @Input() accordionPai?: ResultadoAccordionComponent;
  @Input() fotoFachada?: string;
  @ViewChild('containerSwiper', { read: ElementRef }) containerSwiper!: ElementRef;
  @ViewChild('modeloModal', { read: TemplateRef }) modeloModal!: TemplateRef<any>;

  slideAtual = 1;
  imagemSelecionada: CampoAcordion | null = null;
  mostrarModalImagem = false;
  private swiper?: Swiper;
  private swiperModal?: Swiper;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly vcr = inject(ViewContainerRef);
  private foiDestruido = false;
  private elementoModal?: HTMLElement;
  private visaoEmbutida?: EmbeddedViewRef<any>;

  /**
   * Retorna os campos incluindo a foto da fachada se existir
   */
  get camposComFachada(): CampoAcordion[] {
    const campos = [...this.campos];
    if (this.fotoFachada) {
      campos.unshift({
        id: 'fachada',
        rotulo: 'Fachada',
        valor: this.fotoFachada,
        icone: 'Imagem da fachada do imóvel'
      });
    }
    return campos;
  }

  /**
   * Função trackBy para campos
   */
  rastrearPorCampo(indice: number, campo: CampoAcordion): any {
    return campo?.id ?? indice;
  }

  ngAfterViewInit(): void {
    // Pequeno delay para garantir que o Swiper seja inicializado corretamente
    setTimeout(() => {
      if (this.containerSwiper?.nativeElement && !this.foiDestruido) {
        this.swiper = this.containerSwiper.nativeElement.swiper;
        
        // Define slide inicial
        this.atualizarSlideAtual();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.foiDestruido = true;
    this.swiper = undefined;
    this.swiperModal = undefined;
    
    // Garante que o modal seja removido e o scroll desbloqueado
    if (this.mostrarModalImagem) {
      this.removerModalDoCorpo();
      this.desbloquearScrollCorpo();
    }
  }

  /**
   * Atualiza o indicador de posição quando o slide muda
   */
  aoMudarSlide(): void {
    if (!this.foiDestruido) {
      this.atualizarSlideAtual();
      
      // Se o modal estiver aberto, sincroniza com o swiper do modal
      if (this.mostrarModalImagem && this.swiperModal) {
        const indiceAtivo = this.swiper?.activeIndex || 0;
        this.swiperModal.slideTo(indiceAtivo, 0);
      }
    }
  }

  /**
   * Atualiza o indicador de posição quando o slide do modal muda
   */
  aoMudarSlideModal(): void {
    if (!this.foiDestruido && this.swiperModal) {
      const indiceAtivo = this.swiperModal.activeIndex;
      this.slideAtual = indiceAtivo + 1;
      this.imagemSelecionada = this.camposComFachada[indiceAtivo];
      
      // Sincroniza com o swiper principal
      if (this.swiper) {
        this.swiper.slideTo(indiceAtivo, 0); // Sem animação para evitar loop
      }
      
      if (!this.foiDestruido) {
        this.cdr.detectChanges();
        // Atualiza a view embeddada se existir
        if (this.visaoEmbutida) {
          this.visaoEmbutida.detectChanges();
        }
      }
    }
  }

  /**
   * Calcula e atualiza o número do slide atual
   * Sem loop, usa activeIndex diretamente
   */
  private atualizarSlideAtual(): void {
    if (!this.swiper || this.camposComFachada.length === 0 || this.foiDestruido) {
      this.slideAtual = 1;
      return;
    }

    try {
      // Sem loop, activeIndex é confiável (0-based)
      this.slideAtual = this.swiper.activeIndex + 1;
      
      // Força detecção de mudanças no Angular apenas se não foi destruído
      if (!this.foiDestruido) {
        this.cdr.detectChanges();
      }
      
    } catch (erro) {
      console.warn('Erro ao atualizar slide atual:', erro);
      this.slideAtual = 1;
    }
  }

  /**
   * Abre modal com imagem em tamanho completo
   */
  abrirImagemCompleta(campo: CampoAcordion): void {    
    this.imagemSelecionada = campo;
    this.mostrarModalImagem = true;
    
    // Atualiza o slideAtual baseado na imagem selecionada
    const indice = this.camposComFachada.findIndex(c => c.id === campo.id);
    if (indice >= 0) {
      this.slideAtual = indice + 1;
    }
        
    // Bloqueia o scroll do body
    this.bloquearScrollCorpo();
    
    // Bloqueia touch no swiper principal
    if (this.swiper) {
      this.swiper.allowTouchMove = false;
    }
    
    // Força detecção de mudanças para mostrar o modal
    if (!this.foiDestruido) {
      this.cdr.detectChanges();
      // Renderiza o modal no body após a detecção de mudanças
      setTimeout(() => this.renderizarModalNoCorpo(), 0);
    }
  }

  /**
   * Fecha o modal de visualização da imagem
   */
  fecharImagemCompleta(): void {
    // Remove o modal do body primeiro
    this.removerModalDoCorpo();
    
    this.mostrarModalImagem = false;
    this.imagemSelecionada = null;
    
    // Desbloqueia o scroll do body
    this.desbloquearScrollCorpo();
    
    // Desbloqueia touch no swiper principal
    if (this.swiper) {
      this.swiper.allowTouchMove = true;
    }
    
    // Força detecção de mudanças
    if (!this.foiDestruido) {
      this.cdr.detectChanges();
    }
  }

  /**
   * Bloqueia o scroll do body quando o modal está aberto
   */
  private bloquearScrollCorpo(): void {
    if (this.accordionPai) {
      this.accordionPai.bloquearScrollCorpo();
    } else {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      }
    }
  }

  /**
   * Desbloqueia o scroll do body quando o modal é fechado
   */
  private desbloquearScrollCorpo(): void {
    if (this.accordionPai) {
      this.accordionPai.desbloquearScrollCorpo();
    } else {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    }
  }

  /**
   * Handler para quando a imagem carrega com sucesso
   */
  aoCarregarImagem(evento?: Event): void {
    try {
      // Se tivermos o evento, valida se a imagem foi carregada corretamente
      const img = evento?.target as HTMLImageElement | null;

      if (img) {
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          throw new Error('Imagem inválida ou com dimensões zero após load.');
        }
      }

      // Se chegou aqui, a imagem carregou corretamente — garante refresh da view
      if (!this.foiDestruido) {
        this.cdr.detectChanges();
      }
    } catch (erro) {
      console.warn('Erro ao carregar imagem no modal:', erro);
      try {
        this.fecharImagemCompleta();
      } catch (e) {
        console.error('Erro ao fechar modal após falha no load da imagem:', e);
      }
    }
  }

  /** Handler para quando há erro no carregamento da imagem */
  aoErroImagem(): void {
    console.warn('Erro ao carregar imagem no modal');
  }

  /** Renderiza o modal no body da página para garantir z-index máximo */
  private renderizarModalNoCorpo(): void {
    if (!this.mostrarModalImagem || !this.modeloModal || typeof document === 'undefined') {
      return;
    }

    try {
      // Remove modal existente se houver
      this.removerModalDoCorpo();

      if (this.accordionPai) {
        // Usa o método do pai para renderizar
        this.elementoModal = this.accordionPai.renderizarModalNoCorpo(this.modeloModal, this.vcr, this.cdr) || undefined;
      } else {
        // Lógica própria se não houver pai
        const visaoEmbutida = this.modeloModal.createEmbeddedView({});
        
        this.visaoEmbutida = visaoEmbutida;

        const containerModal = document.createElement('div');
        containerModal.id = 'galeria-modal-container';
        containerModal.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 999999 !important;
          pointer-events: auto !important;
        `;

        visaoEmbutida.rootNodes.forEach(no => {
          if (no) {
            containerModal.appendChild(no);
          }
        });

        document.body.appendChild(containerModal);
        
        this.elementoModal = containerModal;

        visaoEmbutida.detectChanges();
      }

      // Inicializa o swiper do modal
      setTimeout(() => {
        const elementoSwiperModal = document.getElementById('swiper-modal') as any;
        if (elementoSwiperModal) {
          this.swiperModal = elementoSwiperModal.swiper;
          // Define o slide inicial baseado na imagemSelecionada
          if (this.swiperModal) {
            const indice = this.campos.findIndex(c => c.id === this.imagemSelecionada?.id);
            if (indice >= 0) {
              this.swiperModal.slideTo(indice, 0);
            }
          }
        }
      }, 100);

    } catch (erro) {
      console.error('Erro ao renderizar modal no body:', erro);
    }
  }

  /**
   * Remove o modal do body
   */
  private removerModalDoCorpo(): void {
    if (this.elementoModal) {
      if (this.accordionPai) {
        this.accordionPai.removerModalDoCorpo(this.elementoModal);
      } else {
        if (typeof document !== 'undefined') {
          try {
            if (document.body.contains(this.elementoModal)) {
              document.body.removeChild(this.elementoModal);
            }
          } catch (erro) {
            console.warn('Erro ao remover modal do body:', erro);
          }
        }
      }
      this.elementoModal = undefined;
    }
  }
}
