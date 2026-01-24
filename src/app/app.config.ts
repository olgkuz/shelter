import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura'; // или другая тема

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),

    // если будешь ходить в API
    provideHttpClient(),

    // нужно для анимаций PrimeNG (кнопки, диалоги и т.п.)
    provideAnimationsAsync(),

    // глобальная конфигурация PrimeNG + тема
    providePrimeNG({
      theme: {
        preset: Aura,
        // options не обязательно, можно убрать
        options: {
          prefix: 'p',
          darkModeSelector: 'system',
          cssLayer: false
        }
      },
      ripple: true,          // включить ripple-эффект
      // inputVariant: 'filled' // если хочешь "залитые" инпуты
    })
  ]
};
