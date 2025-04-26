import { Routes } from "@angular/router";
import { OpportunitiesComponent } from "./components/opportunities/opportunities.component";
import { ProfileComponent } from "./components/profile/profile.component";
import { NewsComponent } from "./components/news/news.component";
import { SurveysComponent } from "./components/surveys/surveys.component";
import { AdminOpportunitiesComponent } from "./components/admin-opportunities-component/admin-opportunities-component.component";


export const routes: Routes = [
  { path: "", redirectTo: "oportunidades", pathMatch: "full" },
  { path: "perfil", component: ProfileComponent },
  { path: "oportunidades", component: OpportunitiesComponent },
  { path: "noticias", component: NewsComponent },
  { path: "encuestas", component: SurveysComponent },
  { path: "admin/oportunidades", component: AdminOpportunitiesComponent }
];