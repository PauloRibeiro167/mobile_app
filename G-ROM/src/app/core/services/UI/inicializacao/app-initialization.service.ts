import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AnimationController } from '@ionic/angular';
import { ThemeService } from '@services';

@Injectable({
  providedIn: 'root'
})
export class AppInitializationService {
  private platform = inject(Platform);
  private animationCtrl = inject(AnimationController);
  private themeService = inject(ThemeService);

  async initializeApp(): Promise<void> {
    
    await this.platform.ready();
    
    if (Capacitor.isNativePlatform()) {
      this.configureStatusBar();
      
      if (this.platform.is('android')) {
        await this.playEntryAnimations();
      }
      // Nota: updateThemeClass() agora é chamado no componente para definir themeClass
    } else {
    }
    
  }

  private configureStatusBar(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const statusBarStyle = prefersDark ? Style.Dark : Style.Light;
    StatusBar.setStyle({ style: statusBarStyle });
  }

  private async playEntryAnimations(): Promise<void> {
    const animations = [
      { selector: 'ion-app', from: 'opacity: 0; transform: scale(0.95)', to: 'opacity: 1; transform: scale(1)', duration: 800 },
      { selector: '.header', from: 'transform: translateY(-20px); opacity: 0', to: 'transform: translateY(0); opacity: 1', duration: 500 },
      { selector: '.bottom-tab-bar', from: 'transform: translateY(20px); opacity: 0', to: 'transform: translateY(0); opacity: 1', duration: 400 },
      { selector: 'ion-router-outlet', from: 'opacity: 0; transform: translateX(10px)', to: 'opacity: 1; transform: translateX(0)', duration: 600 },
    ];

    for (const anim of animations) {
      await this.animateElement(anim.selector, anim);
    }
  }

  private async animateElement(selector: string, config: { from: string; to: string; duration: number }): Promise<void> {
    const element = document.querySelector(selector);
    if (element) {
      const animation = this.animationCtrl.create()
        .addElement(element)
        .duration(config.duration)
        .fromTo('style', config.from, config.to);
      await animation.play();
    }
  }
}