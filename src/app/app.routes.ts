import { Routes } from '@angular/router';
import { EgresadosComponent } from './components/egresados/egresados.component';

export const routes: Routes = [
  { 
    path: 'egresados', 
    component: EgresadosComponent 
  },
  { 
    path: 'perfil', 
    loadComponent: () => import('./components/perfil/perfil.component').then(m => m.PerfilComponent)
  },
  { path: '', redirectTo: 'egresados', pathMatch: 'full' },
  { path: '**', redirectTo: 'egresados' }
];