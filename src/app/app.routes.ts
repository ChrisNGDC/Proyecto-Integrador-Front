import { Routes } from "@angular/router";
import { OpportunitiesComponent } from "./components/opportunities/opportunities.component";
import { ProfileComponent } from "./components/profile/profile.component";
import { NewsComponent } from "./components/news/news.component";
import { SurveysComponent } from "./components/surveys/surveys.component";
import { AdminOpportunitiesComponent } from "./components/admin-opportunities-component/admin-opportunities-component.component";


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