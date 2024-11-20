import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideMockStore} from '@ngrx/store/testing';
import {provideStore} from '@ngrx/store';
import {rootReducer} from './store';
import {provideStoreDevtools} from '@ngrx/store-devtools';
import {environment} from '../environments/environment';
import {provideTranslateService, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http:HttpClient){
  debugger;
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
      })
    ]),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    // provideClientHydration(),
    provideHttpClient(),
    provideAnimations(),
    provideMockStore(),
    provideTranslateService(),
    provideStore(rootReducer),
    provideStoreDevtools({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    })
  ],
};
