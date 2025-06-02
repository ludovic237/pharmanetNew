import { mergeApplicationConfig, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { FlexLayoutServerModule } from '@ngbracket/ngx-layout/server';
import { appConfig } from './app.config';
import { provideHttpClient, withFetch } from '@angular/common/http';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    importProvidersFrom(FlexLayoutServerModule),
    provideHttpClient(withFetch())
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
