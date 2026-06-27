import { AlertType } from '@components';

export function showSearchSuccessAlert(openAlertFn: (type: AlertType, data: any) => void): void {
  openAlertFn('success', { message: 'Pesquisa realizada com sucesso! Os dados foram salvos no seu histórico.' });
}

export function showExemploInscricao(openAlertFn: (type: AlertType) => void): void {
  openAlertFn('example');
}

export async function mostrarErros(openAlertFn: (type: AlertType, data: any) => void, erros: string[]): Promise<void> {
  openAlertFn('error', { errors: erros });
}

export function handleAlertAction(role: string, showExemploInscricaoFn: () => void, validarCamposFn: () => void, handleConfirmActionFn: () => void): void {
  switch (role) {
    case 'example':
      setTimeout(() => showExemploInscricaoFn(), 100);
      break;
    case 'validate':
      validarCamposFn();
      break;
    case 'confirm':
      handleConfirmActionFn();
      break;
    case 'cancel':
      break;
    default:
      break;
  }
}

export function handleConfirmAction(currentAlertType: AlertType, executarLimpezaFn: () => void): void {
  if (currentAlertType === 'warning') {
    executarLimpezaFn();
  }
}

export function executarLimpeza(clearFormFn: () => void, openAlertFn: (type: AlertType, data: any) => void): void {
  clearFormFn();
  openAlertFn('success', { message: 'Campos limpos com sucesso!' });
}
