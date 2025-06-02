import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader'; 
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { environment } from '../environments/environment';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CustomOverlayContainer } from './theme/utils/custom-overlay-container';

export function HttpLoaderFactory(httpClient: HttpClient) { 
  return new TranslateHttpLoader(httpClient, environment.url +'/i18n/', '.json');
} 

import { InputFileConfig, InputFileModule } from './theme/components/input-file/input-file.module';
const config: InputFileConfig = {
  fileAccept: '*'
};

import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { UsersData } from './common/data/users-data';

export const appConfig: ApplicationConfig = {
  providers: [ 
    provideHttpClient(withFetch()),
    provideRouter(
      routes,
      withViewTransitions(),
      withPreloading(PreloadAllModules),  // comment this line for enable lazy-loading
    ),    
    provideClientHydration(),
    provideAnimationsAsync(),    
    importProvidersFrom([ 
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }),
      InputFileModule.forRoot(config), 
      InMemoryWebApiModule.forRoot(UsersData, { passThruUnknownUrl: true, delay: 1000 })
    ]),
    { provide: OverlayContainer, useClass: CustomOverlayContainer }   
  ]
};
