import { Component, Input, Output, EventEmitter, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonAlert, IonModal, IonContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, bulbOutline, businessOutline, checkmarkCircleOutline, closeCircle, documentTextOutline, helpCircleOutline, informationCircleOutline, personCircleOutline, searchOutline, warning, warningOutline, logOutOutline } from 'ionicons/icons'; import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type AlertType = 'cpf' | 'inscricao' | 'dica' | 'info' | 'example' | 'error' | 'success' | 'warning' | 'custom';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  standalone: true,
  imports: [CommonModule, IonModal, IonContent]
})
export class AlertComponent implements OnChanges {
  private sanitizer = inject(DomSanitizer);

  @Input() type: AlertType = 'custom';
  @Input() data: any = null;
  @Input() isOpen = false;
  @Output() buttonClick = new EventEmitter<{role: string, data?: any}>();
  @Output() alertClosed = new EventEmitter<void>();

  header: string = '';
  subHeader: string = '';
  message: string = '';
  htmlMessage: boolean = true;
  buttons: any[] = [{ text: 'Fechar', cssClass: 'alert-button-confirm' }];
  icon: string = '';
  headerColor: string = '';
  backdropDismiss: boolean = true;
  translucent: boolean = true;
  animated: boolean = true;
  mode: 'ios' | 'md' | undefined = 'md';
  keyboardClose: boolean = true;
  triggerId: string = '';
  inputs: any[] = [];
  alertConfig: any = {};
  safeMessage!: SafeHtml;


  constructor() {
    addIcons({logOutOutline,'alertCircleOutline':alertCircleOutline,'bulbOutline':bulbOutline,'businessOutline':businessOutline,'checkmarkCircleOutline':checkmarkCircleOutline,'closeCircle':closeCircle,'documentTextOutline':documentTextOutline,'helpCircleOutline':helpCircleOutline,'informationCircleOutline':informationCircleOutline,'lightbulbOutline':bulbOutline,'personCircleOutline':personCircleOutline,'searchOutline':searchOutline,'warning':warning,'warningOutline':warningOutline});
  }

  static readonly PRESETS: Record<AlertType, any> = {
    cpf: {
      header: 'CPF/CNPJ do Proprietário',
      subHeader: 'Informações sobre o documento',
      message: `
        <div class="alert-content">
          <p><strong>Formatos aceitos:</strong></p>
          <ul>
            <li><strong>CPF:</strong> 123.456.789-00 ou 12345678900</li>
            <li><strong>CNPJ:</strong> 12.345.678/0001-90 ou 12345678000190</li>
          </ul>
          <div class="alert-tip">
            <ion-icon name="bulb-outline"></ion-icon>
            <span>O sistema aceita com ou sem formatação</span>
          </div>
        </div>
      `,
      icon: 'person-circle-outline',
      headerColor: '#0097a7',
      buttons: [{ text: 'Entendi', role: 'confirm', cssClass: 'alert-button-confirm' }]
    },
    inscricao: {
      header: 'Inscrição Imobiliária',
      subHeader: 'O que é e como encontrar',
      message: `
        <div class="alert-content">
          <p><strong>Definição:</strong></p>
          <p>A inscrição imobiliária é o número único de identificação do imóvel no cadastro municipal.</p>
          
          <p><strong>Onde encontrar:</strong></p>
          <ul>
            <li>Carnê do IPTU</li>
            <li>Escritura do imóvel</li>
            <li>Certidão de cadastro imobiliário</li>
          </ul>
          
          <div class="alert-warning">
            <ion-icon name="warning-outline"></ion-icon>
            <span>Cada município tem seu próprio formato</span>
          </div>
        </div>
      `,
      icon: 'business-outline',
      headerColor: '#0097a7',
      buttons: [
        { 
          text: 'Ver Exemplo', 
          role: 'example',
          cssClass: 'alert-button-secondary' 
        },
        { text: 'Fechar', role: 'cancel', cssClass: 'alert-button-confirm' }
      ]
    },
    example: {
      header: 'Exemplo de Inscrição',
      subHeader: 'Formatos comuns',
      message: `
        <div class="alert-content">
          <div class="example-container">
            <p><strong>Exemplos de formatos:</strong></p>
            <div class="example-item">
              <span class="example-label">Formato 1:</span>
              <code>123.456.789-0</code>
            </div>
            <div class="example-item">
              <span class="example-label">Formato 2:</span>
              <code>12345-001</code>
            </div>
            <div class="example-item">
              <span class="example-label">Formato 3:</span>
              <code>1234567890123</code>
            </div>
          </div>
          
          <div class="alert-info">
            <ion-icon name="information-circle-outline"></ion-icon>
            <span>Digite exatamente como aparece no documento</span>
          </div>
        </div>
      `,
      icon: 'document-text-outline',
      headerColor: '#0097a7',
      buttons: [{ text: 'Entendi', role: 'confirm', cssClass: 'alert-button-confirm' }]
    },
    dica: {
      header: 'Dicas de Pesquisa',
      subHeader: 'Como obter melhores resultados',
      message: `
        <div class="alert-content">
          <div class="tip-section">
            <h4><ion-icon name="search-outline"></ion-icon> Estratégias de busca:</h4>
            <ul>
              <li><strong>Mais preciso:</strong> Use CPF/CNPJ + Inscrição</li>
              <li><strong>Alternativa:</strong> Use apenas um dos campos</li>
              <li><strong>Documento:</strong> Sempre do proprietário atual</li>
            </ul>
          </div>
          
          <div class="tip-section">
            <h4><ion-icon name="checkmark-circle-outline"></ion-icon> Dicas importantes:</h4>
            <ul>
              <li>Confira se os dados estão corretos</li>
              <li>Use documentos atualizados</li>
              <li>Verifique a formatação</li>
            </ul>
          </div>
        </div>
      `,
      icon: 'lightbulb-outline',
      headerColor: '#0097a7',
      buttons: [
        { text: 'Continuar', role: 'confirm', cssClass: 'alert-button-confirm' }
      ]
    },
    info: {
      header: 'Mais informações',
      subHeader: 'Dica de preenchimento',
      message: `
        <div class="alert-content">
          <p>Preencha o campo de inscrição imobiliária para obter resultados mais precisos. Caso não saiba, utilize o CPF/CNPJ do proprietário.</p>
          <div class="alert-info">
            <ion-icon name="information-circle-outline"></ion-icon>
            <span>Você pode pesquisar usando apenas um dos campos</span>
          </div>
        </div>
      `,
      icon: 'help-circle-outline',
      headerColor: '#0097a7',
      buttons: [{ text: 'Fechar', role: 'confirm', cssClass: 'alert-button-confirm' }]
    },
        error: {
          header: 'Dados Inválidos',
          subHeader: 'Corrija os seguintes problemas:',
          message: '<div class="alert-content error-content"><ul class="error-list"><li>Erro desconhecido</li></ul><div class="alert-error"><ion-icon name="warning"></ion-icon><span>Verifique os dados e tente novamente</span></div></div>',
          icon: 'alert-circle-outline',
          headerColor: '#dc2626',
          buttons: [{ text: 'Corrigir', role: 'confirm', cssClass: 'alert-button-confirm' }]
        },
        success: {
          header: 'Sucesso!',
          subHeader: 'Operação realizada com êxito',
          message: '<div class="alert-content"><p>Operação realizada com sucesso!</p><div class="alert-success"><ion-icon name="checkmark-circle-outline"></ion-icon><span>Tudo certo!</span></div></div>',
          icon: 'checkmark-circle-outline',
          headerColor: '#16a34a',
          buttons: [{ text: 'OK', role: 'confirm', cssClass: 'alert-button-confirm' }]
        },
        warning: {
          header: 'Atenção',
          subHeader: 'Informação importante',
          message: '<div class="alert-content"><p>Verifique as informações antes de continuar.</p><div class="alert-warning"><ion-icon name="warning-outline"></ion-icon><span>Prossiga com cuidado</span></div></div>',
          icon: 'warning-outline',
          headerColor: '#d97706',
          buttons: [
            { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-secondary' },
            { text: 'Continuar', role: 'confirm', cssClass: 'alert-button-confirm' }
          ]
        },
        custom: {}
  };


  ngOnChanges() {
    const preset = AlertComponent.PRESETS[this.type] || {};
    this.header = preset.header || '';
    this.subHeader = preset.subHeader || '';
    this.message = preset.message || '';
    this.htmlMessage = true;
    this.buttons = preset.buttons || [{ text: 'Fechar', cssClass: 'alert-button-confirm' }];
    if (this.type === 'inscricao') {
      this.buttons = this.buttons.map(button => {
        if (button.role === 'example') {
          return { ...button, handler: () => { this.buttonClick.emit({role: 'example'}); return false; } };
        }
        return button;
      });
    }
    if (this.type === 'dica') {
      this.buttons = this.buttons.map(button => {
        if (button.role === 'validate') {
          return { ...button, handler: () => { this.buttonClick.emit({role: 'validate'}); return false; } };
        }
        return button;
      });
    }
    this.icon = preset.icon || '';
    this.headerColor = preset.headerColor || '';
    this.backdropDismiss = true;
    this.translucent = true;
    this.animated = true;
    this.mode = undefined;
    this.keyboardClose = true;
    this.triggerId = '';
    this.inputs = [];
    this.alertConfig = preset;
    if (this.type === 'error' && this.data?.errors) {
      this.message = '<div class="alert-content error-content"><ul class="error-list">' +
        this.data.errors.map((erro: string) => `<li><ion-icon name="close-circle"></ion-icon>${erro}</li>`).join('') +
        '</ul><div class="alert-error"><ion-icon name="warning"></ion-icon><span>Verifique os dados e tente novamente</span></div></div>';
    }
    if (this.type === 'success' && this.data?.message) {
      this.message = '<div class="alert-content"><p>' + this.data.message + '</p><div class="alert-success"><ion-icon name="checkmark-circle-outline"></ion-icon><span>Tudo certo!</span></div></div>';
    }
    if (this.data) {
      if (this.data.header) { this.header = this.data.header; }
      if (this.data.subHeader) { this.subHeader = this.data.subHeader; }
      if (this.data.icon) { this.icon = this.data.icon; }
      if (this.data.headerColor) { this.headerColor = this.data.headerColor; }
      if (this.data.buttons) { this.buttons = this.data.buttons; }
      if (this.data.inputs) { this.inputs = this.data.inputs; }
    }
    this.safeMessage = this.sanitizer.bypassSecurityTrustHtml(this.message);
  }

  onButtonClick(event: any) {
    this.buttonClick.emit(event.detail);
    if (event.type === 'didDismiss') {
      this.alertClosed.emit();
    }
  }

  abrirAlerta(tipo: AlertType, dados?: any) {
    this.type = tipo;
    this.data = dados || null;
    this.isOpen = false;
    setTimeout(() => {
      this.isOpen = true;
    }, 10);
  }
}
