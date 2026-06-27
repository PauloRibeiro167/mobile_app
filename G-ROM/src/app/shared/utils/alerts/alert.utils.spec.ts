import {
  showSearchSuccessAlert,
  showExemploInscricao,
  mostrarErros,
  handleAlertAction,
  handleConfirmAction,
  executarLimpeza
} from './alert.utils';

describe('Alert Utils', () => {
  let openAlertFnSpy: jasmine.Spy;
  let showExemploInscricaoFnSpy: jasmine.Spy;
  let validarCamposFnSpy: jasmine.Spy;
  let handleConfirmActionFnSpy: jasmine.Spy;
  let executarLimpezaFnSpy: jasmine.Spy;
  let clearFormFnSpy: jasmine.Spy;

  beforeEach(() => {
    openAlertFnSpy = jasmine.createSpy('openAlertFn');
    showExemploInscricaoFnSpy = jasmine.createSpy('showExemploInscricaoFn');
    validarCamposFnSpy = jasmine.createSpy('validarCamposFn');
    handleConfirmActionFnSpy = jasmine.createSpy('handleConfirmActionFn');
    executarLimpezaFnSpy = jasmine.createSpy('executarLimpezaFn');
    clearFormFnSpy = jasmine.createSpy('clearFormFn');
  });

  describe('showSearchSuccessAlert', () => {
    it('should call openAlertFn with success type and message', () => {
      showSearchSuccessAlert(openAlertFnSpy);

      expect(openAlertFnSpy).toHaveBeenCalledWith('success', {
        message: 'Pesquisa realizada com sucesso! Os dados foram salvos no seu histórico.'
      });
    });
  });

  describe('showExemploInscricao', () => {
    it('should call openAlertFn with example type', () => {
      showExemploInscricao(openAlertFnSpy);

      expect(openAlertFnSpy).toHaveBeenCalledWith('example');
    });
  });

  describe('mostrarErros', () => {
    it('should call openAlertFn with error type and errors', async () => {
      const erros = ['Erro 1', 'Erro 2'];

      await mostrarErros(openAlertFnSpy, erros);

      expect(openAlertFnSpy).toHaveBeenCalledWith('error', { errors: erros });
    });
  });

  describe('handleAlertAction', () => {
    it('should call showExemploInscricaoFn when role is example', (done) => {
      handleAlertAction('example', showExemploInscricaoFnSpy, validarCamposFnSpy, handleConfirmActionFnSpy);

      setTimeout(() => {
        expect(showExemploInscricaoFnSpy).toHaveBeenCalled();
        done();
      }, 150);
    });

    it('should call validarCamposFn when role is validate', () => {
      handleAlertAction('validate', showExemploInscricaoFnSpy, validarCamposFnSpy, handleConfirmActionFnSpy);

      expect(validarCamposFnSpy).toHaveBeenCalled();
    });

    it('should call handleConfirmActionFn when role is confirm', () => {
      handleAlertAction('confirm', showExemploInscricaoFnSpy, validarCamposFnSpy, handleConfirmActionFnSpy);

      expect(handleConfirmActionFnSpy).toHaveBeenCalled();
    });

    it('should do nothing when role is cancel', () => {
      handleAlertAction('cancel', showExemploInscricaoFnSpy, validarCamposFnSpy, handleConfirmActionFnSpy);

      expect(showExemploInscricaoFnSpy).not.toHaveBeenCalled();
      expect(validarCamposFnSpy).not.toHaveBeenCalled();
      expect(handleConfirmActionFnSpy).not.toHaveBeenCalled();
    });

    it('should do nothing when role is unknown', () => {
      handleAlertAction('unknown', showExemploInscricaoFnSpy, validarCamposFnSpy, handleConfirmActionFnSpy);

      expect(showExemploInscricaoFnSpy).not.toHaveBeenCalled();
      expect(validarCamposFnSpy).not.toHaveBeenCalled();
      expect(handleConfirmActionFnSpy).not.toHaveBeenCalled();
    });
  });

  describe('handleConfirmAction', () => {
    it('should call executarLimpezaFn when currentAlertType is warning', () => {
      handleConfirmAction('warning', executarLimpezaFnSpy);

      expect(executarLimpezaFnSpy).toHaveBeenCalled();
    });

    it('should not call executarLimpezaFn when currentAlertType is not warning', () => {
      handleConfirmAction('success', executarLimpezaFnSpy);

      expect(executarLimpezaFnSpy).not.toHaveBeenCalled();
    });
  });

  describe('executarLimpeza', () => {
    it('should call clearFormFn and openAlertFn with success', () => {
      executarLimpeza(clearFormFnSpy, openAlertFnSpy);

      expect(clearFormFnSpy).toHaveBeenCalled();
      expect(openAlertFnSpy).toHaveBeenCalledWith('success', {
        message: 'Campos limpos com sucesso!'
      });
    });
  });
});