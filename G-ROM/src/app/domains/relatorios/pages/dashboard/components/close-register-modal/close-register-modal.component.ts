import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonModal, IonSpinner } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';

import { RegisterClosingService } from '@services/api/dashboard/register-closing/register-closing.service';
import { RegisterClosingReviewService } from '@services/api/dashboard/register-closing/register-closing-review.service';
import { RegisterClosingManagerNotificationService } from '@services/api/dashboard/register-closing/register-closing-manager-notification.service';
import type { AberturaCaixaResponse } from '@domains/gestao-caixa/models/register-opening.types';
import type {
  FechamentoCaixaPayload,
  FechamentoProcessoTipo,
  FechamentoNotaPdf,
  FechamentoCaixaResponse,
  FechamentoSolicitacaoReavaliacao,
} from '@domains/gestao-caixa/models/register-closing.types';
import {
  DailySalesPerformanceService,
  RecentSalesService,
  RegisterSessionService,
} from '@services/api';
import {
  CLOSE_REGISTER_PROCESS_UI,
  type CloseRegisterProcessUiConfig,
} from './close-register-process-ui.constants';

@Component({
  selector: 'app-close-register-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonModal,
    IonSpinner,
    CurrencyPipe,
  ],
  templateUrl: './close-register-modal.component.html',
})
export class CloseRegisterModalComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly registerClosingService = inject(RegisterClosingService);
  private readonly registerClosingReviewService = inject(RegisterClosingReviewService);
  private readonly registerClosingManagerNotificationService = inject(RegisterClosingManagerNotificationService);
  private readonly registerSessionService = inject(RegisterSessionService);
  private readonly recentSalesService = inject(RecentSalesService);
  private readonly dailySalesPerformanceService = inject(DailySalesPerformanceService);
  private keyboardListeners: Array<{ remove: () => Promise<void> }> = [];

  @Output() closed = new EventEmitter<void>();

  readonly fechamentoForm = this.formBuilder.nonNullable.group({
    dinheiro: [0, [Validators.required, Validators.min(0)]],
    observacoes: ['Fechamento do turno atual.', [Validators.maxLength(180)]],
  });

  private isOpenInternal = false;
  notaFechamento: FechamentoNotaPdf | null = null;
  resultado: FechamentoCaixaResponse | null = null;
  ultimoPayload: FechamentoCaixaPayload | null = null;
  reviewRequest: FechamentoSolicitacaoReavaliacao | null = null;
  enviando = false;
  keyboardVisible = false;
  dinheiroMascara = '0,00';
  @Input() processType: FechamentoProcessoTipo = 'operator-closing';

  @Input() set isOpen(value: boolean) {
    this.isOpenInternal = value;
    if (value) {
      this.resetFlow();
    }
  }

  get isOpen(): boolean {
    return this.isOpenInternal;
  }

  get houveDivergencia(): boolean {
    return this.resultado?.resultadoFinal === 'QUEBRA_DE_CAIXA';
  }

  get processUi(): CloseRegisterProcessUiConfig {
    return CLOSE_REGISTER_PROCESS_UI[this.processType];
  }

  get canRevalidate(): boolean {
    if (this.processType !== 'manager-review') {
      return false;
    }

    return this.registerClosingReviewService.canReevaluate(this.reviewRequest);
  }

  get aberturaAtual(): AberturaCaixaResponse | null {
    return this.registerSessionService.getCurrentSession();
  }

  get valoresEsperados() {
    return this.registerClosingService.getExpectedValues();
  }

  ngOnInit(): void {
    void this.setupKeyboardListeners();
  }

  ngOnDestroy(): void {
    void this.removeKeyboardListeners();
  }

  async submit(): Promise<void> {
    if (this.fechamentoForm.invalid) {
      this.fechamentoForm.markAllAsTouched();
      return;
    }

    this.enviando = true;
    await this.registerSessionService.initialize();

    if (!this.registerSessionService.hasOpenSession()) {
      this.enviando = false;
      return;
    }

    this.ultimoPayload = this.registerClosingService.buildPayload(
      this.fechamentoForm.controls.dinheiro.getRawValue(),
      this.fechamentoForm.controls.observacoes.getRawValue()
    );

    try {
      this.resultado = await firstValueFrom(
        this.registerClosingService.submitBlindClosing(this.ultimoPayload)
      );
      this.notaFechamento = this.registerClosingService.buildClosingNote(
        this.ultimoPayload,
        this.resultado
      );
      const painelVendas = await firstValueFrom(
        this.recentSalesService.getRecentSalesPanel()
      );
      await this.dailySalesPerformanceService.closeBusinessDay({
        dataOperacao: painelVendas.dataOperacao,
        totalVendas: painelVendas.totalVendas,
        valorTotal: painelVendas.valorTotal,
        totalPromissorias: painelVendas.totalPromissorias,
      });

      if (this.houveDivergencia) {
        await this.handleDivergenceWorkflow();
      }

      this.registerSessionService.closeCurrentSession();
    } finally {
      this.enviando = false;
    }
  }

  gerarNotaPdf(): void {
    if (!this.ultimoPayload || !this.resultado) {
      return;
    }

    this.registerClosingService.openClosingNotePdf(
      this.ultimoPayload,
      this.resultado
    );
  }

  close(): void {
    this.closed.emit();
  }

  handleMoneyInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 9);
    const value = Number(digits || '0') / 100;

    this.fechamentoForm.controls.dinheiro.setValue(value);
    this.dinheiroMascara = this.formatCurrencyDigits(value);
    input.value = this.dinheiroMascara;
  }

  handleMoneyFocus(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = this.dinheiroMascara;
  }

  private resetFlow(): void {
    this.notaFechamento = null;
    this.resultado = null;
    this.ultimoPayload = null;
    this.reviewRequest = null;
    this.enviando = false;
    this.keyboardVisible = false;
    this.dinheiroMascara = '0,00';
    this.fechamentoForm.reset({
      dinheiro: 0,
      observacoes: 'Fechamento do turno atual.',
    });
  }

  private formatCurrencyDigits(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private async handleDivergenceWorkflow(): Promise<void> {
    if (!this.ultimoPayload || !this.resultado) {
      return;
    }

    if (this.processType === 'operator-closing') {
      this.reviewRequest = await this.registerClosingReviewService.openManagerReview({
        payload: this.ultimoPayload,
        response: this.resultado,
      });
      await this.registerClosingManagerNotificationService.notifyPendingManagerReview(
        this.reviewRequest
      );
      return;
    }

    if (this.reviewRequest) {
      await this.registerClosingReviewService.completeManagerReview({
        requestId: this.reviewRequest.id,
        gerenteId: this.ultimoPayload.operadorId,
        valorReavaliado: this.ultimoPayload.valoresInformados.dinheiro,
        resultadoReavaliacao: this.resultado.resultadoFinal,
      });
    }
  }

  private async setupKeyboardListeners(): Promise<void> {
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('Keyboard')) {
      this.keyboardVisible = false;
      return;
    }

    const willShow = await Keyboard.addListener('keyboardWillShow', () => {
      this.keyboardVisible = true;
    });

    const didHide = await Keyboard.addListener('keyboardDidHide', () => {
      this.keyboardVisible = false;
    });

    this.keyboardListeners = [willShow, didHide];
  }

  private async removeKeyboardListeners(): Promise<void> {
    await Promise.all(this.keyboardListeners.map((listener) => listener.remove()));
    this.keyboardListeners = [];
  }
}
