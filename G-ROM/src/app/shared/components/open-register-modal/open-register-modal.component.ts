import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, } from '@angular/forms';
import { IonModal, IonSpinner } from '@ionic/angular/standalone';
import { AberturaCaixaResponse, PdvAccessOrigin, PdvAccessService, } from '@services/api';
import { AuthService } from '@services';

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
    fundoTroco: [50, [Validators.required, Validators.min(0)]],
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
      const response = await this.pdvAccessService.confirmOpening(
        this.aberturaForm.controls.fundoTroco.getRawValue(),
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

  private resetForm(): void {
    const draft = this.pdvAccessService.getOpeningDraft(this.origem);

    this.enviando = false;
    this.aberturaForm.reset({
      fundoTroco: draft.fundoTrocoSugerido,
      observacoes: draft.observacoesPadrao,
    });
  }
}
