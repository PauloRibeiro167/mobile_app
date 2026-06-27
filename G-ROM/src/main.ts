import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';


// Imports do projeto
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Polyfill para JIT
import '@angular/compiler';

// Importar e registrar Swiper
import { register } from 'swiper/element/bundle';
register();

function isExtensionNoise(value: unknown): boolean {
  const text = typeof value === 'string'
    ? value
    : value instanceof Error
      ? `${value.message} ${value.stack ?? ''}`
      : JSON.stringify(value);

  return (
    text.includes('Could not establish connection. Receiving end does not exist.') ||
    text.includes('content-script-start.js') ||
    text.includes('chrome-extension://') ||
    text.includes('moz-extension://')
  );
}

// Inicialização da aplicação
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
}).catch(err => {
  if (isExtensionNoise(err)) {
    return;
  }

  console.error('Erro ao inicializar aplicação:', err);
});

// Tratamento de erros globais
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (isExtensionNoise(reason)) {
    event.preventDefault();
    return;
  }

  console.error('Promise rejeitada:', { reason, stack: reason?.stack });
});

window.onerror = (message, source, lineno, colno, error) => {
  if (isExtensionNoise(message) || isExtensionNoise(source) || isExtensionNoise(error)) {
    return true;
  }

  console.error('Erro global:', { message, source, lineno, colno, error, stack: error?.stack });
  return false;
};
