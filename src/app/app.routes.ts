import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminGuard } from './guards/admin.guard';
import { UserGuard } from './guards/user.guard';


export const routes: Routes = [
    { path: '', component: LoginComponent },
    {
      path: 'admin-dashboard',
      component: AdminDashboardComponent,
      canActivate: [AdminGuard],
    },
    {
      path: 'user-dashboard',
      component: UserDashboardComponent,
      canActivate: [UserGuard],
    },
    {
      path: 'login',
      component: LoginComponent,
    },   
    { path: '**', redirectTo: '/login' }
  ];

