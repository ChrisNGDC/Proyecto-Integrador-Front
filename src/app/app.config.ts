import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatCommonModule } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    // Proveedores directos
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    // Es importante mantener provideZoneChangeDetection si tu rama lo usaba para optimizaciones
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Módulos importados a través de importProvidersFrom
    importProvidersFrom(
      BrowserModule,
      MatNativeDateModule,
      MatCommonModule,
      HttpClientModule, // De develop
      ReactiveFormsModule, // De develop
      FormsModule, // De develop
      DragDropModule // De develop
    )
  ]
};
