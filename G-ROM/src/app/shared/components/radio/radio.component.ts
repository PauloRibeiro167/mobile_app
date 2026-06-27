import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, forwardRef, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type RadioDirection = 'horizontal' | 'vertical';
export type RadioSize = 'small' | 'medium' | 'large';
export type RadioVariant = 'default' | 'outline' | 'filled';
export type RadioColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
export type RadioValidationRule = (value: unknown) => boolean | string;

export interface RadioOption {
  label: string;
  value: unknown;
  disabled?: boolean;
  description?: string;
  icon?: string;
}

export interface RadioConfig {
  direction?: RadioDirection;
  size?: RadioSize;
  variant?: RadioVariant;
  color?: RadioColor;
  showLabels?: boolean;
  showDescriptions?: boolean;
  allowDeselect?: boolean;
  required?: boolean;
  customClass?: string;
  label?: string;
  placeholder?: string;
}

type ResolvedRadioConfig = Required<RadioConfig>;

const DEFAULT_CONFIG: ResolvedRadioConfig = {
  direction: 'vertical',
  size: 'medium',
  variant: 'default',
  color: 'primary',
  showLabels: true,
  showDescriptions: false,
  allowDeselect: false,
  required: false,
  customClass: '',
  label: '',
  placeholder: 'Selecione uma opção',
};

function createDefaultConfig(): ResolvedRadioConfig {
  return { ...DEFAULT_CONFIG };
}

export class RadioBuilder {
  private config: RadioConfig = createDefaultConfig();

  static create(): RadioBuilder {
    return new RadioBuilder();
  }

  direction(direction: RadioDirection): RadioBuilder {
    this.config.direction = direction;
    return this;
  }

  size(size: RadioSize): RadioBuilder {
    this.config.size = size;
    return this;
  }

  variant(variant: RadioVariant): RadioBuilder {
    this.config.variant = variant;
    return this;
  }

  color(color: RadioColor): RadioBuilder {
    this.config.color = color;
    return this;
  }

  showLabels(showLabels: boolean): RadioBuilder {
    this.config.showLabels = showLabels;
    return this;
  }

  showDescriptions(showDescriptions: boolean): RadioBuilder {
    this.config.showDescriptions = showDescriptions;
    return this;
  }

  allowDeselect(allowDeselect: boolean): RadioBuilder {
    this.config.allowDeselect = allowDeselect;
    return this;
  }

  required(required: boolean): RadioBuilder {
    this.config.required = required;
    return this;
  }

  label(label: string): RadioBuilder {
    this.config.label = label;
    return this;
  }

  placeholder(placeholder: string): RadioBuilder {
    this.config.placeholder = placeholder;
    return this;
  }

  customClass(customClass: string): RadioBuilder {
    this.config.customClass = customClass;
    return this;
  }

  build(): RadioConfig {
    return { ...this.config };
  }
}

export class RadioOptionsFactory {
  static createTipoPropriedade(): RadioOption[] {
    return [
      { label: 'Residencial', value: 'residencial', icon: 'bi bi-house-door' },
      { label: 'Comercial', value: 'comercial', icon: 'bi bi-building' },
      { label: 'Industrial', value: 'industrial', icon: 'bi bi-gear' },
    ];
  }

  static createSituacaoImovel(): RadioOption[] {
    return [
      { label: 'Ativo', value: 'ativo', description: 'Imóvel ativo no sistema' },
      { label: 'Inativo', value: 'inativo', description: 'Imóvel inativo' },
      { label: 'Isento', value: 'isento', description: 'Imóvel isento de tributos' },
      { label: 'Suspenso', value: 'suspenso', description: 'Imóvel com suspensão temporária' },
    ];
  }

  static createStatusPagamento(): RadioOption[] {
    return [
      { label: 'Pago', value: 'pago', icon: 'bi bi-check-circle' },
      { label: 'Pendente', value: 'pendente', icon: 'bi bi-clock' },
      { label: 'Atrasado', value: 'atrasado', icon: 'bi bi-exclamation-triangle' },
    ];
  }

  static createFromArray(
    values: Array<Record<string, unknown> | string | number | boolean>,
    labelKey?: string,
    valueKey?: string
  ): RadioOption[] {
    return values.map((item, index) => {
      if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
        return {
          label: String(item),
          value: item,
        };
      }

      return {
        label: labelKey ? String(item[labelKey] ?? `Opção ${index + 1}`) : `Opção ${index + 1}`,
        value: valueKey ? item[valueKey] : item,
      };
    });
  }
}

@Component({
  selector: 'app-radio',
  standalone: true,
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.css'],
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true,
    },
  ],
})
export class RadioComponent implements ControlValueAccessor, OnInit, OnChanges {
  private static instanceCounter = 0;

  @Input() options: RadioOption[] = [];
  @Input() name: string = '';
  @Input() disabled: boolean = false;
  @Input() config: Partial<RadioConfig> = {};
  @Input() initialValue: unknown = null;
  @Input() placeholder: string = '';
  @Input() errorMessage: string = '';
  @Input() validationRules: RadioValidationRule[] = [];
  @Input() label: string = '';

  @Output() valueChange = new EventEmitter<unknown>();
  @Output() optionSelected = new EventEmitter<RadioOption>();
  @Output() validationChange = new EventEmitter<boolean>();
  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();

  selectedValue: unknown = null;
  mergedConfig: RadioConfig = createDefaultConfig();
  uniqueId: string;
  isValid: boolean = true;
  isTouched: boolean = false;
  currentErrors: string[] = [];

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    RadioComponent.instanceCounter += 1;
    this.uniqueId = `radio-${RadioComponent.instanceCounter}-${Date.now()}`;
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] || changes['config'] || changes['label'] || changes['placeholder']) {
      this.initializeComponent();
    }

    if (changes['initialValue'] && !changes['initialValue'].firstChange) {
      this.selectedValue = changes['initialValue'].currentValue;
      this.validateCurrentValue();
    }
  }

  get groupLabel(): string {
    return this.label || this.mergedConfig.label || '';
  }

  get resolvedPlaceholder(): string {
    return this.placeholder || this.mergedConfig.placeholder || '';
  }

  get inputName(): string {
    return this.name || this.uniqueId;
  }

  onRadioChange(value: unknown): void {
    if (this.disabled) {
      return;
    }

    const nextValue =
      this.mergedConfig.allowDeselect && this.selectedValue === value ? null : value;

    this.selectedValue = nextValue;
    this.isTouched = true;

    this.validateCurrentValue();
    this.emitModelChanges(nextValue);

    const selectedOption = this.findOptionByValue(nextValue);
    if (selectedOption) {
      this.optionSelected.emit(selectedOption);
    }
  }

  onFocus(): void {
    this.focused.emit();
  }

  onBlur(): void {
    this.isTouched = true;
    this.validateCurrentValue();
    this.onTouched();
    this.blurred.emit();
  }

  isOptionSelected(option: RadioOption): boolean {
    return this.selectedValue === option.value;
  }

  isOptionDisabled(option: RadioOption): boolean {
    return this.disabled || option.disabled === true;
  }

  getContainerClasses(): string {
    const classes = [
      'radio-container',
      `radio-${this.mergedConfig.direction}`,
      `radio-${this.mergedConfig.size}`,
      `radio-${this.mergedConfig.variant}`,
      `radio-${this.mergedConfig.color}`,
    ];

    if (this.disabled) {
      classes.push('radio-disabled');
    }

    if (!this.isValid) {
      classes.push('radio-invalid');
    }

    if (this.mergedConfig.customClass) {
      classes.push(this.mergedConfig.customClass);
    }

    return classes.join(' ');
  }

  getOptionClasses(option: RadioOption): string {
    const classes = ['radio-wrapper'];

    if (this.isOptionDisabled(option)) {
      classes.push('disabled');
    }

    if (this.isOptionSelected(option)) {
      classes.push('selected');
    }

    return classes.join(' ');
  }

  getErrorMessage(): string {
    if (this.errorMessage) {
      return this.errorMessage;
    }

    return this.currentErrors[0] ?? '';
  }

  reset(): void {
    this.selectedValue = null;
    this.isTouched = false;
    this.currentErrors = [];
    this.isValid = true;
    this.emitModelChanges(null);
    this.validationChange.emit(true);
  }

  setValue(value: unknown): void {
    this.selectedValue = value;
    this.validateCurrentValue();
    this.emitModelChanges(value);
  }

  updateOptions(newOptions: RadioOption[]): void {
    this.options = newOptions;
    this.validateOptions();
    this.validateCurrentValue();
  }

  updateConfig(newConfig: Partial<RadioConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.syncConfig();
    this.validateCurrentValue();
  }

  writeValue(value: unknown): void {
    this.selectedValue = value;
    this.validateCurrentValue();
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private initializeComponent(): void {
    this.syncConfig();
    this.applyInitialValue();
    this.validateOptions();
    this.validateCurrentValue();
  }

  private syncConfig(): void {
    this.mergedConfig = {
      ...createDefaultConfig(),
      ...this.config,
      label: this.label || this.config.label || DEFAULT_CONFIG.label,
      placeholder: this.placeholder || this.config.placeholder || DEFAULT_CONFIG.placeholder,
    };
  }

  private applyInitialValue(): void {
    if (this.initialValue !== null && this.initialValue !== undefined) {
      this.selectedValue = this.initialValue;
    }
  }

  private validateOptions(): void {
    if (this.options.length === 0) {
      console.warn('RadioComponent: nenhuma opção foi fornecida.');
      return;
    }

    const uniqueValues = new Set(this.options.map((option) => option.value));
    if (uniqueValues.size !== this.options.length) {
      console.warn('RadioComponent: valores duplicados detectados nas opções.');
    }
  }

  private validateCurrentValue(): void {
    this.currentErrors = [];
    this.isValid = true;

    if (this.mergedConfig.required && this.isEmptyValue(this.selectedValue)) {
      this.currentErrors.push('Este campo é obrigatório');
    }

    if (!this.isEmptyValue(this.selectedValue) && !this.findOptionByValue(this.selectedValue)) {
      this.currentErrors.push('Valor selecionado não é válido');
    }

    for (const rule of this.validationRules) {
      const result = rule(this.selectedValue);
      if (result !== true) {
        this.currentErrors.push(typeof result === 'string' ? result : 'Valor inválido');
      }
    }

    this.isValid = this.currentErrors.length === 0;
    this.validationChange.emit(this.isValid);
  }

  private emitModelChanges(value: unknown): void {
    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
  }

  private findOptionByValue(value: unknown): RadioOption | undefined {
    return this.options.find((option) => option.value === value);
  }

  private isEmptyValue(value: unknown): boolean {
    return value === null || value === undefined;
  }
}
