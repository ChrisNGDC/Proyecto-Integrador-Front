import { Component, signal, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { JobOpportunity } from "../../models/job-opportunity"; // Asegúrate que la ruta sea correcta
import { JobCardComponent } from "../job-card/job-card.component";
import { OpportunityService } from "../../services/opportunities.services"; // Asegúrate que la ruta sea correcta

@Component({
  selector: "app-opportunities",
  standalone: true,
  imports: [CommonModule, JobCardComponent, ReactiveFormsModule, FormsModule],
  templateUrl: "./opportunities.component.html",
  styleUrls: ["./opportunities.component.css"]
})
export class OpportunitiesComponent implements OnInit {

  form!: FormGroup;
  public opportunityService = inject(OpportunityService);

  activeTab = signal<"view" | "publish" | "detail">("view");
  publicationType = signal<"vacante" | "servicio">("vacante");
  categories = signal<string[]>(["Todos", "Backend", "FrontEnd", "QA", "Datos", "Devops", "UX/UI", "Mobile"]);
  modalities = signal<string[]>(["Remoto", "Presencial", "Híbrida"]);
  selectedOpportunity = signal<JobOpportunity | null>(null);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      company: ['', Validators.required],
      title: ['', Validators.required],
      modality: ['Remoto', Validators.required],
      category: ['', Validators.required],
      description: [''], // Campo opcional
      contactEmail: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.opportunityService.loadOpportunities();    
    this.opportunityService.filterByCategory("Todos");       
  }

  // --- Getters para acceder a los datos del servicio ---
  get jobs() {
    return this.opportunityService.jobs;
  }

  get filteredJobs() {
    return this.opportunityService.filteredJobs;
  }

  // --- Manejo de Pestañas y Vistas ---
  setActiveTab(tab: "view" | "publish" | "detail") {
    this.activeTab.set(tab);
    if (tab !== 'detail') {
      this.selectedOpportunity.set(null);
    }
  }

  viewJobDetails(jobId: string) {
    const job = this.opportunityService.jobs().find(j => j.id === Number(jobId));
    if (job) {
      this.selectedOpportunity.set(job);
      this.setActiveTab('detail');
    } else {
      this.showNotification(`No se encontró la oportunidad con ID: ${jobId}`, "error");
    }
  }

  // --- MÉTODOS DE VALIDACIÓN Y NOTIFICACIÓN ---

  /**
   * Valida si un campo del formulario es inválido y ha sido tocado por el usuario.
   * @param controlName El nombre del control en el FormGroup.
   * @returns 'true' si el control es inválido y ha sido tocado/modificado.
   */
  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  /**
   * Muestra una notificación temporal en la pantalla.
   */
  private showNotification(message: string, type: "success" | "warning" | "error" = "success") {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.className = `fixed bottom-4 left-4 py-2 px-4 rounded shadow-lg z-50 notification-fade bg-${
      type === "success" ? "green-500" : type === "warning" ? "yellow-500" : "red-500"
    } text-white`;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add("opacity-0");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  }

  /**
   * Marca todos los controles de un FormGroup como 'touched' de forma recursiva.
   */
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  // --- LÓGICA DE ENVÍO DE FORMULARIO ---

  submitForm() {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      this.showNotification("Por favor, completa todos los campos obligatorios.", "error");
      return;
    }

    const newJob: Omit<JobOpportunity, 'id' | 'publicationDate'> = {
      company: this.form.value.company,
      title: this.form.value.title,
      modality: this.form.value.modality,
      category: this.form.value.category,
      type: this.publicationType(),
      contactEmail: this.form.value.contactEmail,
      description: this.form.value.description || undefined,
    };

    this.opportunityService.addOpportunity(newJob as JobOpportunity).subscribe({
      next: () => {
        this.showNotification("¡Oportunidad publicada con éxito!", "success");
        this.opportunityService.loadOpportunities();
        this.form.reset({ modality: 'Remoto', category: '' }); // Resetea el formulario
        this.setActiveTab('view');
      },
      error: (error) => {
        this.showNotification("Error al publicar la oportunidad. Inténtalo de nuevo.", "error");
        console.error('Error al publicar oportunidad:', error);
      }
    });
  }
}