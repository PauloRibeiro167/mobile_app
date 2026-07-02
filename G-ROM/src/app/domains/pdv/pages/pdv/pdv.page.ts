import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ModalController, AlertController } from '@ionic/angular/standalone';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { firstValueFrom } from 'rxjs';
import { PaymentModalComponent } from './components/payment-modal/payment-modal.component';
import { SuccessModalComponent } from './components/success-modal/success-modal.component';
import { PdvProductReaderComponent } from './components/pdv-product-reader/pdv-product-reader.component';
import { PdvCartListComponent } from './components/pdv-cart-list/pdv-cart-list.component';
import { PdvFooterComponent } from './components/pdv-footer/pdv-footer.component';
import { PdvCashWithdrawalService } from '@domains/pdv/services/pdv-cash-withdrawal.service';
import { CartItem, PdvStore } from '@domains/pdv/state/pdv.store';
import { AuthService } from '@services';
import { PdvSaleSubmissionService } from '@domains/pdv/services/pdv-sale-submission.service';
import { CartItemView, ConfirmedSale, PaymentMethod } from '@domains/pdv/types/pdv.types';
import { ModalComponent } from '@components';

@Component({
  selector: 'app-pdv',
  templateUrl: './pdv.page.html',
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, PdvProductReaderComponent, PdvCartListComponent, PdvFooterComponent, ModalComponent],
  providers: [DecimalPipe, AlertController, ModalController, PdvCashWithdrawalService]
})
export class PdvPage implements OnInit, OnDestroy {
  protected Math = Math;
  manualBarcode: string = '';
  currentTime: string = '';
  paymentMethod: PaymentMethod | null = null;
  isSubmitting = false;
  isClearCartModalOpen = false;
  clearCartReason = 'Limpeza manual';
  private clockInterval: any;

  // Injetar dependências usando a API de inject
  private alertCtrl = inject(AlertController);
  private modalCtrl = inject(ModalController);
  private authService = inject(AuthService);
  private pdvSaleSubmissionService = inject(PdvSaleSubmissionService);
  private pdvCashWithdrawalService = inject(PdvCashWithdrawalService);
  readonly pdvStore = inject(PdvStore);

  get cartItems(): CartItem[] {
    return this.pdvStore.cartItems;
  }

  get totalVenda(): number {
    return this.pdvStore.totalVenda;
  }

  get cartItemViews(): CartItemView[] {
    return this.cartItems.map(item => ({
      sku: String(item.id),
      nome: item.nome,
      preco: item.preco,
      quantidade: item.quantidade,
      barcode: item.barcode,
      subtotal: item.preco * item.quantidade,
    }));
  }

  get totalItensCarrinho(): number {
    return this.cartItems.reduce((total, item) => total + item.quantidade, 0);
  }

  ngOnInit() {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    this.checkPermissions();
  }

  ngOnDestroy() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.pdvCashWithdrawalService.clear();
  }

  private updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  async checkPermissions() {
    try {
      const status = await BarcodeScanner.checkPermissions();
      if (status.camera !== 'granted') {
        await BarcodeScanner.requestPermissions();
      }
    } catch (e) {
      console.warn('Scanner não suportado neste ambiente (Web/Simulador)');
    }
  }

  async startScan() {
    try {
      // Configura o scanner para ler múltiplos formatos comuns
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.Ean13, BarcodeFormat.Ean8, BarcodeFormat.QrCode, BarcodeFormat.Code128]
      });

      if (barcodes.length > 0) {
        this.processBarcode(barcodes[0].displayValue);
      }
    } catch (e) {
      console.error('Erro ao abrir scanner:', e);
      this.presentAlert('Erro', 'O scanner não pôde ser iniciado. Verifique as permissões da câmera.');
    }
  }

  processBarcode(barcode: string) {
    this.pdvStore.processBarcode(barcode);
  }

  addItemToCart(item: CartItem) {
    this.pdvStore.addItemToCart(item);
  }

  updateQty(index: number, delta: number) {
    this.pdvStore.updateQty(index, delta);
  }

  onUpdateQuantity(event: { sku: string; delta: number }) {
    const index = this.cartItems.findIndex(item => String(item.id) === event.sku);
    if (index > -1) {
      this.pdvStore.updateQty(index, event.delta);
    }
  }

  addManualItem() {
    if (!this.manualBarcode) return;
    this.processBarcode(this.manualBarcode);
    this.manualBarcode = '';
  }

  async clearCart(reason: string = 'Limpeza manual') {
    if (this.cartItems.length === 0) return;
    this.clearCartReason = reason;
    this.isClearCartModalOpen = true;
  }

  closeClearCartModal(): void {
    this.isClearCartModalOpen = false;
  }

  confirmClearCart(): void {
    this.pdvStore.recordCanceledSale(this.clearCartReason);
    this.pdvStore.clearCart();
    this.paymentMethod = null;
    this.isClearCartModalOpen = false;
  }

  async choosePayment() {
    const modal = await this.modalCtrl.create({
      component: PaymentModalComponent,
      componentProps: { totalVenda: this.totalVenda },
      cssClass: 'premium-modal',
      showBackdrop: true,
      backdropDismiss: true,
      canDismiss: true,
    });
    
    await modal.present();

    const { data } = await modal.onDidDismiss<PaymentMethod>();
    if (data) {
      this.paymentMethod = data;
    } else {
      this.pdvStore.recordCanceledSale('Abandono no checkout (modal fechado)');
    }
  }

  async onConcludeSale() {
    if (!this.paymentMethod) return;
    this.isSubmitting = true;
    try {
      const confirmedSale = this.buildConfirmedSale(this.paymentMethod);
      await firstValueFrom(this.pdvSaleSubmissionService.submitSale(confirmedSale));
      await this.confirmPayment(this.paymentMethod);
    } catch (error) {
      console.error('Erro ao enviar venda para o servidor:', error);
      await this.presentAlert(
        'Erro ao concluir venda',
        'Nao foi possivel enviar os dados da venda para o servidor. Tente novamente.',
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  private async confirmPayment(method: PaymentMethod) {
    const modal = await this.modalCtrl.create({
      component: SuccessModalComponent,
      componentProps: { 
        totalVenda: this.totalVenda,
        method
      },
      cssClass: 'premium-modal-success'
    });
    
    await modal.present();
    
    modal.onWillDismiss().then(() => {
      // Na conclusão com sucesso, limpamos sem registrar como cancelada
      this.pdvStore.completeSuccessfulSale();
      this.paymentMethod = null;
    });
  }

  async testScan() {
    // Simula um escaneamento bem sucedido para teste na Web
    const fakeBarcodes = ['7891234567890', '7895556667778', '7899990001112'];
    const randomBarcode = fakeBarcodes[Math.floor(Math.random() * fakeBarcodes.length)];
    this.processBarcode(randomBarcode);
  }

  cancelSale() {
    this.clearCart('Cancelamento solicitado pelo operador');
  }

  private buildConfirmedSale(method: PaymentMethod): ConfirmedSale {
    const operadorId = this.authService.getUsuarioLogado()?.email ?? 'operador-demo';

    return {
      operadorId,
      formaPagamento: method,
      valorTotal: this.totalVenda,
      totalItens: this.totalItensCarrinho,
      itens: this.cartItemViews.map((item) => ({
        sku: item.sku,
        nome: item.nome,
        barcode: item.barcode,
        quantidade: item.quantidade,
        precoUnitario: item.preco,
        subtotal: item.subtotal,
      })),
      dataHoraConfirmacao: new Date().toISOString(),
    };
  }

  private async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
