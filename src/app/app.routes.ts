import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminGuard } from './guards/admin.guard';
import { UserGuard } from './guards/user.guard';
import { NoticiasUserComponent } from './components/noticias/noticias-user/noticias-user.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { SurveysComponent } from './components/surveys-component/surveys-component.component';
import { OpportunitiesComponent } from './components/opportunities/opportunities.component';
import { NoticiasAdminComponent } from './components/noticias/noticias-admin/noticias-admin.component';
import { EgresadosComponent } from './components/egresados/egresados.component';
import { AdminSurveysComponent } from './components/admin-surveys-component/admin-surveys-component.component';
import { AdminOpportunitiesComponent } from './components/admin-opportunities-component/admin-opportunities-component.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { SurveyResultsComponent } from './components/survey-results/survey-results.component'; // <-- NUEVA IMPORTACIÓN

export const routes: Routes = [

  { path: '', component: LoginComponent, outlet: 'primary' },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'noticias', pathMatch: 'full' },
      {
        path: 'noticias',
        component: NoticiasAdminComponent,
      },
      {
        path: 'egresados',
        component: EgresadosComponent,
      },
      {
        path: 'admin/encuestas',
        component: AdminSurveysComponent,
      },
      {
        path: 'admin/encuestas/results/:id', // <-- NUEVA RUTA DE RESULTADOS DENTRO DE ADMIN
        component: SurveyResultsComponent,
      },
      {
        path: 'oportunidades',
        component: AdminOpportunitiesComponent,
      },
    ]
  },
  {
    path: 'user-dashboard',
    component: UserDashboardComponent,
    canActivate: [UserGuard],
    children: [
      { path: '', redirectTo: 'noticias', pathMatch: 'full' },
      {
        path: 'noticias',
        component: NoticiasUserComponent,
      },
      {
        path: 'perfil',
        component: PerfilComponent,
      },
      {
        path: 'encuestas',
        component: SurveysComponent,
      },
      {
        path: 'encuestas/:id', // <-- RUTA PARA DETALLE DE ENCUESTA PÚBLICA
        component: SurveysComponent,
      },
      {
        path: 'oportunidades',
        component: OpportunitiesComponent,
      },
      { path: 'cambiar-contrasena', component: ChangePasswordComponent },
    ]
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  // Rutas públicas que no están anidadas en dashboards (si las necesitas, como el login)
  // Las rutas de encuestas públicas ya están manejadas dentro de user-dashboard
  // { path: "encuestas", component: SurveysComponent }, // Ya está en user-dashboard
  // { path: "encuestas/:id", component: SurveysComponent }, // Ya está en user-dashboard

  { path: '**', redirectTo: '/login', outlet: 'primary' },
];
