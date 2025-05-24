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
        path: 'encuestas',
        component: AdminSurveysComponent,
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
  { path: '**', redirectTo: '/login', outlet: 'primary' },
];