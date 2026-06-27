/**
 * MÓDULO DE ÁREA SEGURA - UI Service
 * 
 * ✅ Princípio 2.1 (SRP): Responsabilidade única = Gerenciar insets de área segura
 * ✅ Princípio 1.2: Importação via alias @services/UI/area-segura
 * 
 * Responsabilidades:
 * - Detectar insets de área segura (notch, statusbar, etc)
 * - Fornecer valores reativos para layout responsivo
 * - Compatibilidade com Capacitor
 */

export { SafeAreaService, SafeAreaInsets } from './safe-area.service';
