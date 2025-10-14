import { provideServerRendering } from '@angular/ssr';
import { mergeApplicationConfig, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { FlexLayoutServerModule } from '@ngbracket/ngx-layout/server';
import { appConfig } from './app.config';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {LoaderInterceptor} from "./theme/utils/loader-interceptor";
import {AuthInterceptor} from "./theme/utils/auth-interceptor";

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    importProvidersFrom(FlexLayoutServerModule),
    // provideHttpClient(
    //   withFetch(),
    //   // withInterceptors([AuthInterceptor,LoaderInterceptor])
    //   )
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
