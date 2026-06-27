import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadioComponent, RadioOption, RadioConfig, RadioBuilder, RadioOptionsFactory } from './radio.component';

describe('RadioComponent', () => {
  let component: RadioComponent;
  let fixture: ComponentFixture<RadioComponent>;

  const mockOptions: RadioOption[] = [
    { label: 'Opção 1', value: 'opt1' },
    { label: 'Opção 2', value: 'opt2', disabled: true },
    { label: 'Opção 3', value: 'opt3', description: 'Descrição da opção 3' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RadioComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialização', () => {
    it('deve gerar uniqueId único', () => {
      const component2 = new RadioComponent();
      expect(component.uniqueId).toBeTruthy();
      expect(component2.uniqueId).toBeTruthy();
      expect(component.uniqueId).not.toBe(component2.uniqueId);
    });

    it('deve mesclar configuração padrão com config fornecida', () => {
      const customConfig: Partial<RadioConfig> = {
        direction: 'horizontal',
        size: 'large',
        color: 'secondary'
      };
      component.config = customConfig;

      component.ngOnInit();

      expect(component.mergedConfig.direction).toBe('horizontal');
      expect(component.mergedConfig.size).toBe('large');
      expect(component.mergedConfig.color).toBe('secondary');
      expect(component.mergedConfig.showLabels).toBe(true); // valor padrão mantido
    });

    it('deve definir valor inicial se fornecido', () => {
      component.initialValue = 'opt1';

      component.ngOnInit();

      expect(component.selectedValue).toBe('opt1');
    });
  });

  describe('Propriedades padrão', () => {
    it('deve ter valores padrão corretos', () => {
      expect(component.disabled).toBe(false);
      expect(component.selectedValue).toBe(null);
      expect(component.isValid).toBe(true);
      expect(component.isTouched).toBe(false);
      expect(component.currentErrors).toEqual([]);
    });
  });

  describe('Métodos de seleção', () => {
    it('deve selecionar opção quando onRadioChange é chamado', () => {
      spyOn(component.valueChange, 'emit');
      spyOn(component.optionSelected, 'emit');

      component.onRadioChange('opt1');

      expect(component.selectedValue).toBe('opt1');
      expect(component.valueChange.emit).toHaveBeenCalledWith('opt1');
      expect(component.optionSelected.emit).toHaveBeenCalledWith(mockOptions[0]);
    });

    it('deve desselecionar opção quando allowDeselect está ativo e mesma opção é clicada', () => {
      component.mergedConfig.allowDeselect = true;
      component.selectedValue = 'opt1';
      spyOn(component.valueChange, 'emit');

      component.onRadioChange('opt1');

      expect(component.selectedValue).toBe(null);
      expect(component.valueChange.emit).toHaveBeenCalledWith(null);
    });

    it('não deve fazer nada quando componente está desabilitado', () => {
      component.disabled = true;
      component.selectedValue = null;

      component.onRadioChange('opt1');

      expect(component.selectedValue).toBe(null);
    });

    it('deve marcar como touched quando onBlur é chamado', () => {
      spyOn(component.blurred, 'emit');

      component.onBlur();

      expect(component.isTouched).toBe(true);
      expect(component.blurred.emit).toHaveBeenCalled();
    });
  });

  describe('Validação de opções', () => {
    it('deve identificar opção selecionada corretamente', () => {
      component.selectedValue = 'opt1';

      expect(component.isOptionSelected(mockOptions[0])).toBe(true);
      expect(component.isOptionSelected(mockOptions[1])).toBe(false);
    });

    it('deve identificar opção desabilitada corretamente', () => {
      component.disabled = false;

      expect(component.isOptionDisabled(mockOptions[0])).toBe(false); // não desabilitada
      expect(component.isOptionDisabled(mockOptions[1])).toBe(true);  // desabilitada na opção
    });

    it('deve desabilitar todas as opções quando componente está desabilitado', () => {
      component.disabled = true;

      expect(component.isOptionDisabled(mockOptions[0])).toBe(true);
      expect(component.isOptionDisabled(mockOptions[1])).toBe(true);
    });
  });

  describe('Validação', () => {
    it('deve validar campo obrigatório corretamente', () => {
      component.mergedConfig.required = true;
      component.selectedValue = null;

      component['validateCurrentValue']();

      expect(component.isValid).toBe(false);
      expect(component.currentErrors).toContain('Este campo é obrigatório');
    });

    it('deve validar valor que não existe nas opções', () => {
      component.selectedValue = 'invalid-value';

      component['validateCurrentValue']();

      expect(component.isValid).toBe(false);
      expect(component.currentErrors).toContain('Valor selecionado não é válido');
    });

    it('deve executar regras de validação customizadas', () => {
      component.validationRules = [
        (value: any) => value === 'opt1' || 'Deve ser opt1'
      ];
      component.selectedValue = 'opt2';

      component['validateCurrentValue']();

      expect(component.isValid).toBe(false);
      expect(component.currentErrors).toContain('Deve ser opt1');
    });
  });

  describe('Classes CSS', () => {
    it('deve gerar classes do container corretamente', () => {
      component.mergedConfig = {
        direction: 'horizontal',
        size: 'large',
        variant: 'outline',
        color: 'success',
        customClass: 'custom-radio'
      };

      const classes = component.getContainerClasses();

      expect(classes).toContain('radio-container');
      expect(classes).toContain('radio-horizontal');
      expect(classes).toContain('radio-large');
      expect(classes).toContain('radio-outline');
      expect(classes).toContain('radio-success');
      expect(classes).toContain('custom-radio');
    });

    it('deve adicionar classe disabled quando componente está desabilitado', () => {
      component.disabled = true;

      const classes = component.getContainerClasses();

      expect(classes).toContain('radio-disabled');
    });

    it('deve adicionar classe invalid quando não é válido', () => {
      component.isValid = false;

      const classes = component.getContainerClasses();

      expect(classes).toContain('radio-invalid');
    });

    it('deve gerar classes da opção corretamente', () => {
      component.selectedValue = 'opt1';

      expect(component.getOptionClasses(mockOptions[0])).toContain('selected');
      expect(component.getOptionClasses(mockOptions[1])).toContain('disabled');
      expect(component.getOptionClasses(mockOptions[2])).not.toContain('selected');
    });
  });

  describe('Métodos públicos', () => {
    it('reset deve limpar estado', () => {
      component.selectedValue = 'opt1';
      component.isTouched = true;
      component.isValid = false;
      spyOn(component.valueChange, 'emit');
      spyOn(component.validationChange, 'emit');

      component.reset();

      expect(component.selectedValue).toBe(null);
      expect(component.isTouched).toBe(false);
      expect(component.isValid).toBe(true);
      expect(component.valueChange.emit).toHaveBeenCalledWith(null);
      expect(component.validationChange.emit).toHaveBeenCalledWith(true);
    });

    it('setValue deve definir valor programaticamente', () => {
      spyOn(component.valueChange, 'emit');

      component.setValue('opt2');

      expect(component.selectedValue).toBe('opt2');
      expect(component.valueChange.emit).toHaveBeenCalledWith('opt2');
    });

    it('updateOptions deve atualizar opções e validar', () => {
      const newOptions = [{ label: 'Nova Opção', value: 'new' }];

      component.updateOptions(newOptions);

      expect(component.options).toEqual(newOptions);
    });

    it('updateConfig deve mesclar configuração', () => {
      const newConfig = { direction: 'horizontal' as const };

      component.updateConfig(newConfig);

      expect(component.mergedConfig.direction).toBe('horizontal');
    });
  });

  describe('ControlValueAccessor', () => {
    it('writeValue deve definir valor interno', () => {
      component.writeValue('opt3');

      expect(component.selectedValue).toBe('opt3');
    });

    it('registerOnChange deve armazenar função', () => {
      const fn = jasmine.createSpy('onChange');

      component.registerOnChange(fn);

      expect(component['onChange']).toBe(fn);
    });

    it('registerOnTouched deve armazenar função', () => {
      const fn = jasmine.createSpy('onTouched');

      component.registerOnTouched(fn);

      expect(component['onTouched']).toBe(fn);
    });

    it('setDisabledState deve atualizar disabled', () => {
      component.setDisabledState(true);

      expect(component.disabled).toBe(true);
    });
  });

  describe('RadioBuilder', () => {
    it('deve criar configuração com valores padrão', () => {
      const config = RadioBuilder.create().build();

      expect(config.direction).toBe('vertical');
      expect(config.size).toBe('medium');
      expect(config.variant).toBe('default');
    });

    it('deve permitir configuração fluente', () => {
      const config = RadioBuilder.create()
        .direction('horizontal')
        .size('large')
        .color('success')
        .allowDeselect(true)
        .build();

      expect(config.direction).toBe('horizontal');
      expect(config.size).toBe('large');
      expect(config.color).toBe('success');
      expect(config.allowDeselect).toBe(true);
    });
  });

  describe('RadioOptionsFactory', () => {
    it('createTipoPropriedade deve retornar opções corretas', () => {
      const options = RadioOptionsFactory.createTipoPropriedade();

      expect(options).toEqual([
        { label: 'Residencial', value: 'residencial', icon: 'bi bi-house-door' },
        { label: 'Comercial', value: 'comercial', icon: 'bi bi-building' },
        { label: 'Industrial', value: 'industrial', icon: 'bi bi-gear' }
      ]);
    });

    it('createSituacaoImovel deve retornar opções com descrições', () => {
      const options = RadioOptionsFactory.createSituacaoImovel();

      expect(options.length).toBe(4);
      expect(options[0]).toEqual({
        label: 'Ativo',
        value: 'ativo',
        description: 'Imóvel ativo no sistema'
      });
    });

    it('createFromArray deve criar opções a partir de array', () => {
      const values = ['A', 'B', 'C'];
      const options = RadioOptionsFactory.createFromArray(values);

      expect(options).toEqual([
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: 'C', value: 'C' }
      ]);
    });

    it('createFromArray deve usar chaves customizadas', () => {
      const values = [
        { name: 'João', id: 1 },
        { name: 'Maria', id: 2 }
      ];
      const options = RadioOptionsFactory.createFromArray(values, 'name', 'id');

      expect(options).toEqual([
        { label: 'João', value: 1 },
        { label: 'Maria', value: 2 }
      ]);
    });
  });

  describe('Event Emitters', () => {
    it('deve ter todos os outputs definidos', () => {
      expect(component.valueChange).toBeTruthy();
      expect(component.optionSelected).toBeTruthy();
      expect(component.validationChange).toBeTruthy();
      expect(component.focused).toBeTruthy();
      expect(component.blurred).toBeTruthy();
    });
  });

  describe('ngOnChanges', () => {
    it('deve reagir a mudanças nas opções', () => {
      spyOn(component as any, 'initializeComponent');

      component.ngOnChanges({
        options: {
          currentValue: [],
          previousValue: mockOptions,
          firstChange: false,
          isFirstChange: () => false
        }
      });

      expect((component as any).initializeComponent).toHaveBeenCalled();
    });

    it('deve atualizar valor inicial quando muda', () => {
      component.ngOnChanges({
        initialValue: {
          currentValue: 'opt2',
          previousValue: null,
          firstChange: false,
          isFirstChange: () => false
        }
      });

      expect(component.selectedValue).toBe('opt2');
    });
  });
});
