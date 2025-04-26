import { Routes } from '@angular/router';
import { SurveysComponent } from './components/surveys-component/surveys-component.component';
import { AdminSurveysComponent } from './components/admin-surveys-component/admin-surveys-component.component';


export const routes: Routes = [
    { path: "", redirectTo: "encuestas", pathMatch: "full" },
    { path: "encuestas", component: SurveysComponent },
    { path: "admin/encuestas", component: AdminSurveysComponent },
];
