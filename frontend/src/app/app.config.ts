import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideMockStore} from '@ngrx/store/testing';
import {provideStore} from '@ngrx/store';
import {rootReducer} from './store';
import {provideStoreDevtools} from '@ngrx/store-devtools';
import {environment} from '../environments/environment';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {provideClientHydration} from '@angular/platform-browser';
import {FeatherModule} from 'angular-feather';
import {allIcons} from 'angular-feather/icons';
import {provideFlatpickrDefaults} from 'angularx-flatpickr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {authInterceptorProviders} from './core/helpers/auth.interceptor';

export function HttpLoaderFactory(http:HttpClient){
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom([
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
        defaultLanguage: 'en',
      }),
      FeatherModule.pick(allIcons),
    ]),
    provideRouter(routes),
    authInterceptorProviders,
    // provideHttpClient(),
    provideAnimations(),
    provideMockStore(),
    provideStore(rootReducer),
    provideStoreDevtools({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    provideHttpClient(withInterceptorsFromDi()),
    // provideClientHydration(),
    provideFlatpickrDefaults(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(),
  ],
};

// provideTranslateService(),
