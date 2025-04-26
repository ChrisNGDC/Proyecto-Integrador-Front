import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobOpportunity } from "../../models/job-opportunity";
import { JobCardComponent } from "../job-card/job-card.component";

@Component({
  selector: "app-opportunities",
  standalone: true,
  imports: [CommonModule, JobCardComponent, ReactiveFormsModule],
  templateUrl: "./opportunities.component.html",
  styleUrls: ["./opportunities.component.css"]
})
export class OpportunitiesComponent {

  form!: FormGroup;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      company: ['', Validators.required],
      title: ['', Validators.required],
      modality: ['Remoto', Validators.required],
      category: ['', Validators.required],
      description: ['']
    });
  }

  activeTab = signal<"view" | "publish">("view");
  publicationType = signal<"vacante" | "servicio">("vacante");
  categories = signal<string[]>(["Todos","Backend", "FrontEnd", "QA", "Datos", "Devops"]);
  selectedCategory = signal<string | null>(null);

  jobs = signal<JobOpportunity[]>([
    {
      id: 1,
      company: "Globant",
      title: "Desarrollador backend Ssr 3 años de experiencia",
      modality: "Híbrida",
      publicationDate: new Date(),
      category: "QA",
      type: "vacante",
      description:"ded"
    },
    {
      id: 2,
      company: "G&L Group",
      title: "Desarrollador backend Trainee",
      modality: "Presencial",
      publicationDate: new Date(),
      category: "Backend",
        type: "vacante",
      description:"ded"

    },
    {
      id: 3,
      company: "IT Patagonia",
      title: "Desarrollador backend Junior 1 - 2 años de exp.",
      modality: "Híbrida",
      publicationDate: new Date(),
      category: "Backend",
      type: "vacante",
      description:"ded"
    },
    {
      id: 4,
      company: "Gobierno de la ciudad",
      title: "Desarrollador backend Junior +6 meses de exp.",
      modality: "Presencial",
      publicationDate: new Date(),
      category: "Backend",
      type: "servicio",
      description:"ded"
    },
  ]);

  filteredJobs = signal<JobOpportunity[]>(this.jobs());

  setActiveTab(tab: "view" | "publish") {
    this.activeTab.set(tab);
  }

  filterByCategory(category: string) {
    if (category === 'Todos') {
      this.selectedCategory.set(null); // Limpiar la selección de cualquier otra categoría
      this.filteredJobs.set(this.jobs()); // Mostrar todas las oportunidades
    } 
  else {
      this.selectedCategory.set(category);
      this.filteredJobs.set(this.jobs().filter((job) => job.category === category));
    }
    
  }

  submitForm() {
    if (this.form.invalid) return;

    const newJob: JobOpportunity = {
      id: Date.now(), // id único temporal
      company: this.form.value.company,
      title: this.form.value.title,
      modality: this.form.value.modality,
      category: this.form.value.category,
      publicationDate: new Date(),
      type: this.publicationType(), 
      description: this.publicationType() === 'servicio' ? this.form.value.description : undefined
    };

    this.jobs.update(jobs => [...jobs, newJob]);
    this.filteredJobs.set(this.jobs());

    this.form.reset({ modality: 'Remoto' });
    this.setActiveTab('view');
  }
}
