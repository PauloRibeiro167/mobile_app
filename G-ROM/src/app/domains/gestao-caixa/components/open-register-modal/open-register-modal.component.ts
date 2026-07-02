import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { IonModal, IonSpinner } from '@ionic/angular/standalone';
import type { AberturaCaixaResponse } from '@domains/gestao-caixa/types/register-opening.types';
import { PdvAccessOrigin, PdvAccessService } from '@domains/pdv/services/pdv-access.service';
import { AuthService } from '@services';
import { formatCurrencyBRL } from '../../../../core/utils/currency.utils';

@Component({
  selector: 'app-open-register-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonModal, IonSpinner],
  templateUrl: './open-register-modal.component.html',
})
export class OpenRegisterModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly pdvAccessService = inject(PdvAccessService);
  private readonly authService = inject(AuthService);

  @Output() closed = new EventEmitter<void>();
  @Output() opened = new EventEmitter<AberturaCaixaResponse>();

  readonly aberturaForm = this.formBuilder.nonNullable.group({
    fundoTroco: [
      this.formatarValorMonetario(50),
      [Validators.required, this.validarValorMonetario.bind(this)],
    ],
    observacoes: ['', [Validators.maxLength(180)]],
  });

  enviando = false;
  private isOpenInternal = false;

  @Input() origem: PdvAccessOrigin = 'quick-actions';

  @Input() set isOpen(value: boolean) {
    this.isOpenInternal = value;

    if (value) {
      this.resetForm();
    }
  }

  get isOpen(): boolean {
    return this.isOpenInternal;
  }

  get usuarioAtualLabel(): string {
    return this.authService.getUsuarioLogado()?.nome ?? 'Operador';
  }

  get horarioAtualLabel(): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Fortaleza',
    }).format(new Date());
  }

  async submit(): Promise<void> {
    if (this.aberturaForm.invalid) {
      this.aberturaForm.markAllAsTouched();
      return;
    }

    this.enviando = true;

    try {
      const fundoTroco = this.parseValorMonetario(
        this.aberturaForm.controls.fundoTroco.getRawValue()
      );
      const response = await this.pdvAccessService.confirmOpening(
        fundoTroco,
        this.aberturaForm.controls.observacoes.getRawValue(),
        this.origem
      );
      this.opened.emit(response);
    } finally {
      this.enviando = false;
    }
  }

  close(): void {
    this.closed.emit();
  }

  formatarMoeda(event: Event): void {
    const input = event.target as HTMLInputElement | null;

    if (!input) {
      return;
    }

    const valorFormatado = this.formatarValorMonetario(input.value);
    input.value = valorFormatado;
    this.aberturaForm.controls.fundoTroco.setValue(valorFormatado, {
      emitEvent: false,
    });
  }

  private resetForm(): void {
    const draft = this.pdvAccessService.getOpeningDraft(this.origem);

    this.enviando = false;
    this.aberturaForm.reset({
      fundoTroco: this.formatarValorMonetario(draft.fundoTrocoSugerido),
      observacoes: draft.observacoesPadrao,
    });
  }

  private formatarValorMonetario(valor: string | number): string {
    if (typeof valor === 'number' && Number.isFinite(valor)) {
      return formatCurrencyBRL(valor);
    }

    const apenasDigitos = String(valor).replace(/\D/g, '');
    const valorEmCentavos = apenasDigitos ? Number(apenasDigitos) : 0;

    return formatCurrencyBRL(valorEmCentavos / 100);
  }

  private parseValorMonetario(valor: string): number {
    const apenasDigitos = valor.replace(/\D/g, '');

    if (!apenasDigitos) {
      return 0;
    }

    return Number(apenasDigitos) / 100;
  }

  private validarValorMonetario(
    control: AbstractControl<string>
  ): ValidationErrors | null {
    const valor = this.parseValorMonetario(control.value ?? '');

    if (valor < 0) {
      return { min: true };
    }

    return null;
  }
}
