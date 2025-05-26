///<reference types="@angular/localize" />
///<reference types="@angular/localize" />
import { bootstrapApplication } from '@angular/platform-browser';
import { authConfig } from './app/auth/auth.config';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { Amplify } from 'aws-amplify';

// Configuración de Amplify
Amplify.configure(authConfig);

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ],
});
