/**
 * SERVIÇOS DE UI - Índice Central
 * 
 * ✅ Princípio 2.1: Separação por Feature (cada módulo = responsabilidade única)
 * ✅ Princípio 1.2: Importações via aliases para acesso rápido
 * ✅ Princípio 1.3: Estrutura plana, categórica e intuitiva
 * 
 * Estrutura:
 * ├── accordion/        ← Componente Accordion (expandir/colapsar, formatação)
 * ├── temas/            ← Gerenciamento de tema (claro/escuro)
 * ├── area-segura/      ← Insets de área segura (notch, statusbar)
 * ├── modal/            ← Orquestração de modais
 * └── inicializacao/    ← Ciclo de vida e setup da app
 * 
 * ============================================
 * GUIA DE IMPORTAÇÃO
 * ============================================
 * 
 * // Accordion (expandir/colapsar, formatação, mascaramento)
 * import { AccordionService } from '@services/UI/accordion/orchestration';
 * import { AccordionFormattingService } from '@services/UI/accordion/formatting';
 * import { FieldFilterRegistry } from '@services/UI/accordion/filtering';
 * 
 * // Temas
 * import { ThemeService } from '@services/UI/temas';
 * 
 * // Área Segura
 * import { SafeAreaService } from '@services/UI/area-segura';
 * 
 * // Modal
 * import { ModalService } from '@services/UI/modal';
 * 
 * // Inicialização
 * import { AppInitializationService, AppLifecycleService } from '@services/UI/inicializacao';
 * 
 * ============================================
 * EXEMPLO INTEGRADO
 * ============================================
 * 
 * @Component(...)
 * export class ResultadoPesquisaComponent {
 *   private accordion = inject(AccordionService);
 *   private modal = inject(ModalService);
 *   private theme = inject(ThemeService);
 *   private safeArea = inject(SafeAreaService);
 * 
 *   ngOnInit() {
 *     // Expandir seção do accordion
 *     this.accordion.expandSection('dados-pessoais');
 *     
 *     // Mostrar modal de confirmação
 *     this.modal.show('confirmacao', { message: 'Tem certeza?' });
 *   }
 * }
 */

// Accordion - Expandir/colapsar, formatação e mascaramento de dados
export * from './accordion';

// Temas - Gerenciamento de tema claro/escuro
export * from './temas';

// Área Segura - Insets para notch, statusbar, etc
export * from './area-segura';

// Modal - Orquestração de modais
export * from './modal';

// Inicialização - Ciclo de vida e setup da aplicação
export * from './inicializacao';
