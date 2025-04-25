import { Routes } from '@angular/router';
import { NoticiasUserComponent } from './pages/noticias/noticias-user/noticias-user.component';
import { NoticiasAdminComponent } from './pages/noticias/noticias-admin/noticias-admin.component';

export const routes: Routes = [
  { path: 'noticias-users', component: NoticiasUserComponent },
  { path: 'noticias-admin', component: NoticiasAdminComponent },
];
