import { Component, signal, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { JobOpportunity } from "../../models/job-opportunity";
import { JobCardComponent } from "../job-card/job-card.component";
import { OpportunityService } from "../../services/opportunities.services"; // Importa el servicio

@Component({
  selector: "app-opportunities",
  standalone: true,
  imports: [CommonModule, JobCardComponent, ReactiveFormsModule, FormsModule], 
  templateUrl: "./opportunities.component.html",
  styleUrls: ["./opportunities.component.css"]
})
export class OpportunitiesComponent implements OnInit {

  form!: FormGroup;
  public opportunityService = inject(OpportunityService); // Inyecta el servicio
  activeTab = signal<"view" | "publish">("view");
  publicationType = signal<"vacante" | "servicio">("vacante");
  categories = signal<string[]>(["Todos", "Backend", "FrontEnd", "QA", "Datos", "Devops", "UX/UI", "Mobile"]); 
  modalities = signal<string[]>(["Remoto", "Presencial", "Híbrida"]); 

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      company: ['', Validators.required],
      title: ['', Validators.required],
      modality: ['Remoto', Validators.required],
      category: ['', Validators.required],
      description: [''],
  
    });
  }

  ngOnInit(): void {
    this.opportunityService.loadOpportunities();
  }

  // Getters para acceder a los signals del servicio de forma reactiva en el template
  get jobs() {
    return this.opportunityService.jobs;
  }

  get filteredJobs() {
    return this.opportunityService.filteredJobs;
  }

  setActiveTab(tab: "view" | "publish") {
    this.activeTab.set(tab);
  }


  submitForm() {
    if (this.form.invalid) {
      // Opcional: Marcar campos tocados para mostrar errores de validación
      Object.values(this.form.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    const newJob: Omit<JobOpportunity, 'id' | 'publicationDate'> = {
      // id: Date.now(), // La API debería generar el ID
      company: this.form.value.company,
      title: this.form.value.title,
      modality: this.form.value.modality,
      category: this.form.value.category,
      // publicationDate: new Date(), // La API debería establecer la fecha
      type: this.publicationType(),
      description: this.publicationType() === 'servicio' ? this.form.value.description : undefined,
    };

    this.opportunityService.addOpportunity(newJob as JobOpportunity).subscribe({
      next: () => {
        this.opportunityService.loadOpportunities(); // Recargar la lista desde el backend
        this.form.reset({ modality: 'Remoto' });
        this.setActiveTab('view');
        // Opcional: Mostrar una notificación de éxito
      },
      error: (error) => {
        console.error('Error al publicar oportunidad:', error);
        // Opcional: Mostrar una notificación de error
      }
    });
  }
}