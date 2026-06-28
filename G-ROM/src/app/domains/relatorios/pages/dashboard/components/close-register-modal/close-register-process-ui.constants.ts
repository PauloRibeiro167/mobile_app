import type { FechamentoProcessoTipo } from '@domains/gestao-caixa/models/register-closing.types';

export interface CloseRegisterProcessUiConfig {
  eyebrow: string;
  title: string;
  amountLabel: string;
  amountHint: string;
  submitLabel: string;
  successLabel: string;
  divergenceLabel: string;
  divergenceHint: string;
  revalidateLabel: string;
}

export const OPERATOR_CLOSING_PROCESS_UI: CloseRegisterProcessUiConfig = {
  eyebrow: 'Fechamento de caixa',
  title: 'Registrar valor final do caixa',
  amountLabel: 'Informe apenas o dinheiro físico contado no caixa.',
  amountHint: 'Cartão, débito e PIX entram automaticamente no registro final.',
  submitLabel: 'Validar fechamento',
  successLabel: 'O registro final do caixa foi salvo com sucesso.',
  divergenceLabel: 'O registro foi enviado para reavaliação do gerente.',
  divergenceHint:
    'A divergência foi registrada e o gerente precisa autorizar a recontagem.',
  revalidateLabel: 'Aguardando gerente',
};

export const MANAGER_REVIEW_PROCESS_UI: CloseRegisterProcessUiConfig = {
  eyebrow: 'Reavaliação gerencial',
  title: 'Recontar valor físico do caixa',
  amountLabel: 'Confira novamente o dinheiro físico e registre a nova contagem.',
  amountHint:
    'Use este processo somente após autorização gerencial para reavaliação.',
  submitLabel: 'Confirmar reavaliação',
  successLabel: 'A reavaliação do caixa foi registrada com sucesso.',
  divergenceLabel: 'A reavaliação foi concluída e a divergência permanece registrada.',
  divergenceHint:
    'O histórico da recontagem ficou salvo para auditoria do fechamento.',
  revalidateLabel: 'Reavaliar novamente',
};

export const CLOSE_REGISTER_PROCESS_UI: Record<
  FechamentoProcessoTipo,
  CloseRegisterProcessUiConfig
> = {
  'operator-closing': OPERATOR_CLOSING_PROCESS_UI,
  'manager-review': MANAGER_REVIEW_PROCESS_UI,
};
