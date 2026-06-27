import { Injectable, inject } from '@angular/core';
import { SafeAreaService } from '@services';
import { ThemeService } from '@services';
import { fromEvent, combineLatest } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppLifecycleService {
  private safeAreaService = inject(SafeAreaService);
  private themeService = inject(ThemeService);

  setupDynamicListeners(): void {
    // Combina listeners para resize e mudança de tema do dispositivo
    combineLatest([
      fromEvent(window, 'resize').pipe(startWith(null)),
      fromEvent(window.matchMedia('(prefers-color-scheme: dark)'), 'change').pipe(startWith(null))
    ]).subscribe(() => {
      this.safeAreaService.updateSafeArea();
      // Atualiza classe do tema se necessário (delegado ao ThemeService)
    });
  }
}