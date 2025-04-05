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
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {FeatherModule} from 'angular-feather';
import {allIcons} from 'angular-feather/icons';
import {provideFlatpickrDefaults} from 'angularx-flatpickr';
import {authInterceptorProviders} from './core/helpers/auth.interceptor';
import {provideToastr} from 'ngx-toastr';
import {CalendarModule, DateAdapter} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {authenticationReducer} from './store/Authentication/authentication.reducer';
import {provideClientHydration} from '@angular/platform-browser';
import {provideEffects} from '@ngrx/effects';
import {AuthenticationEffects} from './store/Authentication/authentication.effects';
import {CKEditorModule} from 'ckeditor4-angular';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

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
      CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
      CKEditorModule
    ]),

    provideMockStore(),
    provideStore({
      ...rootReducer,
      auth: authenticationReducer
    }),
    provideEffects([
      AuthenticationEffects
    ]),
    provideRouter(routes),
    authInterceptorProviders,
    // provideHttpClient(),
    provideAnimations(),
    provideToastr(),
    provideStoreDevtools({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    provideHttpClient(withInterceptorsFromDi()),
    provideFlatpickrDefaults(),
    provideClientHydration(), provideAnimationsAsync(),
  ],
};

// provideTranslateService(),
