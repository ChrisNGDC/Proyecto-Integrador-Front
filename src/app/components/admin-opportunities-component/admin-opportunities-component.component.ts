import { Component, OnInit, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, AbstractControl } from "@angular/forms"; // Importa AbstractControl
import type { JobOpportunity } from "../../models/job-opportunity";
import { OpportunityService } from "../../services/opportunities.services";
import type { Company } from "../../models/company.model";
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: "app-admin-opportunities",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: "./admin-opportunities-component.component.html",
  styleUrls: ["./admin-opportunities-component.component.css"],
})
export class AdminOpportunitiesComponent implements OnInit {
  // Inyección del servicio de oportunidades
  private opportunityService = inject(OpportunityService);
  private fb = inject(FormBuilder); // Inyectar FormBuilder en lugar de en el constructor

  // Estado de la pestaña activa en el panel de administración
  activeTab = signal<"list" | "add" | "edit" | "preview">("list");

  // Formulario reactivo para agregar nuevas oportunidades
  opportunityForm: FormGroup;

  // Lista de oportunidades obtenida del servicio (signal)
  opportunities = this.opportunityService.jobs;

  // Lista de empresas (HARDCODEADA - considerar obtener de un backend en el futuro)
  companies = signal<Company[]>([
    { id: 1, name: "Globant", industry: "Tecnología", contactEmail: "rrhh@globant.com" },
    { id: 2, name: "G&L Group", industry: "Consultoría IT", contactEmail: "careers@glgroup.com" },
    { id: 3, name: "IT Patagonia", industry: "Tecnología", contactEmail: "jobs@itpatagonia.com" },
    { id: 4, name: "Gobierno de la ciudad", industry: "Sector Público", contactEmail: "recursoshumanos@buenosaires.gob.ar" },
    { id: 5, name: "Accenture", industry: "Consultoría", contactEmail: "talent@accenture.com" },
    { id: 6, name: "MercadoLibre", industry: "E-commerce", contactEmail: "careers@mercadolibre.com" },
    { id: 7, name: "Freelancer", industry: "Independiente", contactEmail: "contacto@freelancer.com" },
  ]);

  // Categorías disponibles para las oportunidades
  categories = signal<string[]>(["Backend", "FrontEnd", "QA", "Datos", "Devops", "UX/UI", "Mobile"]);

  // Modalidades disponibles para las oportunidades
  modalities = signal<string[]>(["Remoto", "Presencial", "Híbrida"]);

  // Tipos de publicación (vacante o servicio)
  publicationTypes = signal<{ value: "vacante" | "servicio"; label: string }[]>([
    { value: "vacante", label: "Vacante laboral" },
    { value: "servicio", label: "Servicio/Proyecto" },
  ]);

  // Signals para los filtros de la lista de oportunidades
  searchTerm = signal<string>("");
  categoryFilter = signal<string | null>(null);
  modalityFilter = signal<string | null>(null);
  typeFilter = signal<"vacante" | "servicio" | null>(null);
  statusFilter = signal<string | null>(null);

  // Oportunidad que se está editando
  editingOpportunity: JobOpportunity | null = null;
  // Formulario reactivo para la edición (se crea dinámicamente)
  editForm: FormGroup | null = null;

  // Oportunidad que se está previsualizando
  previewingOpportunity: JobOpportunity | null = null;

  // Requisito temporal para añadir a la lista de requisitos
  newRequirement = "";

  constructor() {
    // Inicialización del formulario de agregar oportunidad
    this.opportunityForm = this.fb.group({
      title: ["", Validators.required],
      company: ["", Validators.required],
      category: ["", Validators.required],
      modality: ["", Validators.required],
      type: ["vacante", Validators.required],
      description: [""],
      location: [""],
      salary: [""],
      contactEmail: ["", Validators.email],
      active: [true], // Por defecto, una nueva oportunidad es activa
      requirements: [[] as string[]] // Inicializa como un array vacío de strings
    });
  }

  ngOnInit(): void {
    // Al cargar el componente de administración, cargar TODAS las oportunidades (activas e inactivas)
    this.opportunityService.loadOpportunities(true); // <--- CAMBIO CLAVE AQUÍ
  }

  /**
   * Establece la pestaña activa en el panel de administración.
   * @param tab La pestaña a activar ("list", "add", "edit", "preview").
   */
  setActiveTab(tab: "list" | "add" | "edit" | "preview") {
    this.activeTab.set(tab);
    if (tab === "add") {
      this.resetForm(); // Reinicia el formulario al ir a la pestaña de añadir
    }
    if (tab !== "preview") {
      this.previewingOpportunity = null; // Limpia la previsualización si no estamos en esa pestaña
    }
    // Al salir de la edición, limpiar el formulario de edición
    if (tab !== "edit") {
      this.editingOpportunity = null;
      this.editForm = null;
    }
  }

  /**
   * Reinicia el formulario de agregar oportunidad a sus valores por defecto.
   */
  resetForm() {
    this.opportunityForm.reset({
      title: "",
      company: "",
      category: "",
      modality: "",
      type: "vacante",
      description: "",
      location: "",
      salary: "",
      contactEmail: "",
      active: true,
      requirements: []
    });
    this.newRequirement = ""; // Limpia el campo de nuevo requisito
  }

  /**
   * Obtiene el formulario activo actualmente (oportunidad o edición).
   * @returns El FormGroup activo.
   */
  getCurrentlyActiveForm(): FormGroup {
    return this.activeTab() === "edit" && this.editForm ? this.editForm : this.opportunityForm;
  }

  /**
   * Añade un nuevo requisito a la lista de requisitos del formulario activo.
   */
  addRequirement() {
    if (!this.newRequirement.trim()) return; // No añadir requisitos vacíos
    const currentForm = this.getCurrentlyActiveForm();
    const requirementsControl = currentForm.get('requirements') as AbstractControl<string[]>; // Obtener el control de requisitos
    const currentRequirements = requirementsControl.value || []; // Obtener los requisitos actuales

    requirementsControl.patchValue([...currentRequirements, this.newRequirement.trim()]); // Añadir el nuevo requisito
    this.newRequirement = ""; // Limpiar el campo de entrada
  }

  /**
   * Elimina un requisito de la lista de requisitos del formulario activo.
   * @param index El índice del requisito a eliminar.
   */
  removeRequirement(index: number) {
    const currentForm = this.getCurrentlyActiveForm();
    const requirementsControl = currentForm.get('requirements') as AbstractControl<string[]>;
    const currentRequirements = requirementsControl.value || [];

    const updatedRequirements = currentRequirements.filter((_, i) => i !== index);
    requirementsControl.patchValue(updatedRequirements); // Actualizar los requisitos
  }

  /**
   * Agrega una nueva oportunidad laboral/servicio.
   */
  addOpportunity() {
    if (this.opportunityForm.invalid) {
      this.markFormGroupTouched(this.opportunityForm);
      this.showNotification("Por favor complete todos los campos obligatorios", "error");
      return;
    }

    const formValue = this.opportunityForm.value;
    const newOpportunity: Omit<JobOpportunity, 'id' | 'publicationDate'> = {
      title: formValue.title,
      company: formValue.company,
      modality: formValue.modality,
      category: formValue.category,
      type: formValue.type,
      description: formValue.description,
      requirements: formValue.requirements || [],
      location: formValue.location,
      salary: formValue.salary,
      contactEmail: formValue.contactEmail,
      active: formValue.active
    };

    this.opportunityService.addOpportunity(newOpportunity as JobOpportunity).subscribe({
      next: (response) => {
        console.log('Job opportunity created:', response);
        // Recarga la lista de oportunidades (con el parámetro true para el admin)
        this.opportunityService.loadOpportunities(true);
        this.showNotification("Oportunidad laboral creada exitosamente");
        this.resetForm();
        this.setActiveTab("list");
      },
      error: (error) => {
        console.error('Error creating job opportunity:', error);
        this.showNotification("Error al crear la oportunidad laboral", "error");
      }
    });
  }

  /**
   * Marca todos los controles de un FormGroup como tocados para mostrar errores de validación.
   * @param formGroup El FormGroup a marcar.
   */
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  /**
   * Inicia el proceso de edición de una oportunidad.
   * @param opportunity La oportunidad a editar.
   */
  startEdit(opportunity: JobOpportunity) {
    // Clonar la oportunidad para evitar mutaciones directas y asegurar que los requisitos son un array
    this.editingOpportunity = { ...opportunity, requirements: [...(opportunity.requirements || [])] };

    // Crear y poblar el formulario de edición con los datos de la oportunidad
    this.editForm = this.fb.group({
      id: [opportunity.id], // Asegúrate de que el ID esté en el formulario de edición para el PUT
      title: [opportunity.title, Validators.required],
      company: [opportunity.company, Validators.required],
      category: [opportunity.category, Validators.required],
      modality: [opportunity.modality, Validators.required],
      type: [opportunity.type, Validators.required],
      description: [opportunity.description || ""],
      location: [opportunity.location || ""],
      salary: [opportunity.salary || ""],
      contactEmail: [opportunity.contactEmail || "", Validators.email],
      active: [opportunity.active !== undefined ? opportunity.active : true],
      requirements: [opportunity.requirements || []]
    });

    this.setActiveTab("edit");
  }

  /**
   * Guarda los cambios de una oportunidad editada.
   */
  saveEdit() {
    if (!this.editingOpportunity || !this.editForm) return; // Asegurarse de que hay una oportunidad y un formulario de edición

    if (this.editForm.invalid) {
      this.markFormGroupTouched(this.editForm);
      this.showNotification("Por favor complete todos los campos obligatorios", "error");
      return;
    }

    const formValue = this.editForm.value;
    const updatedOpportunity: JobOpportunity = {
      // Usar el ID de la oportunidad original para la actualización
      id: this.editingOpportunity.id,
      title: formValue.title,
      company: formValue.company,
      modality: formValue.modality,
      category: formValue.category,
      type: formValue.type,
      description: formValue.description,
      requirements: formValue.requirements || [],
      location: formValue.location,
      salary: formValue.salary,
      contactEmail: formValue.contactEmail,
      active: formValue.active,
      // La fecha de publicación no se actualiza en el PUT, se mantiene la original
      publicationDate: this.editingOpportunity.publicationDate
    };

    this.opportunityService.updateOpportunity(updatedOpportunity).subscribe({
      next: (response) => {
        console.log('Job opportunity updated:', response);
        // Recarga la lista de oportunidades (con el parámetro true para el admin)
        this.opportunityService.loadOpportunities(true);
        this.showNotification("Oportunidad laboral actualizada exitosamente");
        this.editingOpportunity = null; // Limpiar oportunidad en edición
        this.editForm = null; // Limpiar formulario de edición
        this.setActiveTab("list");
      },
      error: (error) => {
        console.error('Error updating job opportunity:', error);
        this.showNotification("Error al actualizar la oportunidad laboral", "error");
      }
    });
  }

  /**
   * Cambia el estado (activo/inactivo) de una oportunidad.
   * @param opportunity La oportunidad a la que se le cambiará el estado.
   */
  toggleActive(opportunity: JobOpportunity) {
    // Crea una copia de la oportunidad y cambia el estado 'active'
    this.opportunityService.updateOpportunity({ ...opportunity, active: !opportunity.active }).subscribe({
      next: (response) => {
        console.log('Job opportunity status updated:', response);
        // Recarga la lista de oportunidades (con el parámetro true para el admin)
        this.opportunityService.loadOpportunities(true);
        const message = opportunity.active ? "Oportunidad desactivada" : "Oportunidad activada";
        this.showNotification(message);
      },
      error: (error) => {
        console.error('Error updating job opportunity status:', error);
        this.showNotification("Error al cambiar el estado de la oportunidad", "error");
      }
    });
  }

  /**
   * Duplica una oportunidad existente.
   * @param opportunity La oportunidad a duplicar.
   */
  duplicateOpportunity(opportunity: JobOpportunity) {
    const duplicatedOpportunity: Omit<JobOpportunity, 'id' | 'publicationDate'> = {
      ...opportunity,
      title: `${opportunity.title} (copia)`, // Añade "(copia)" al título
      active: false, // La copia se crea como inactiva por defecto
    };

    this.opportunityService.addOpportunity(duplicatedOpportunity as JobOpportunity).subscribe({
      next: (response) => {
        console.log('Job opportunity duplicated:', response);
        // Recarga la lista de oportunidades (con el parámetro true para el admin)
        this.opportunityService.loadOpportunities(true);
        this.showNotification("Oportunidad laboral duplicada exitosamente");
      },
      error: (error) => {
        console.error('Error duplicating job opportunity:', error);
        this.showNotification("Error al duplicar la oportunidad laboral", "error");
      }
    });
  }

  /**
   * Previsualiza una oportunidad.
   * @param opportunity La oportunidad a previsualizar.
   */
  previewOpportunity(opportunity: JobOpportunity) {
    this.previewingOpportunity = { ...opportunity }; // Clonar para previsualizar
    this.setActiveTab("preview");
  }

  /**
   * Getter que devuelve la lista de oportunidades filtradas según los criterios actuales.
   * Utiliza los signals de filtro y el signal de oportunidades del servicio.
   */
  get filteredOpportunities() {
    return this.opportunities().filter((opportunity) => {
      const matchesSearch =
        this.searchTerm() === "" ||
        opportunity.title.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        opportunity.company.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        opportunity.description?.toLowerCase().includes(this.searchTerm().toLowerCase());

      const matchesCategory = !this.categoryFilter() || opportunity.category === this.categoryFilter();
      const matchesModality = !this.modalityFilter() || opportunity.modality === this.modalityFilter();
      const matchesType = !this.typeFilter() || opportunity.type === this.typeFilter();
      const matchesStatus =
        !this.statusFilter() ||
        (this.statusFilter() === "active" && opportunity.active) ||
        (this.statusFilter() === "inactive" && !opportunity.active);

      return matchesSearch && matchesCategory && matchesModality && matchesType && matchesStatus;
    });
  }

  /**
   * Muestra una notificación temporal en la parte inferior izquierda de la pantalla.
   * @param message El mensaje a mostrar.
   * @param type El tipo de notificación ("success", "warning", "error").
   */
  showNotification(message: string, type: "success" | "warning" | "error" = "success") {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.className = `fixed bottom-4 left-4 py-2 px-4 rounded shadow-lg z-50 notification-fade bg-${
      type === "success"
        ? "green-500"
        : type === "warning"
          ? "yellow-500"
          : "red-500"
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
   * Obtiene el email de contacto de una empresa por su nombre.
   * @param companyName El nombre de la empresa.
   * @returns El email de contacto de la empresa o una cadena vacía si no se encuentra.
   */
  getCompanyEmail(companyName: string): string {
    if (!companyName) return "";
    const company = this.companies().find((c) => c.name === companyName);
    return company?.contactEmail || "";
  }

  /**
   * Actualiza el email de contacto en el formulario de agregar oportunidad
   * cuando se selecciona una empresa.
   */
  updateContactEmail() {
    const companyName = this.opportunityForm.get("company")?.value;
    const email = this.getCompanyEmail(companyName);
    if (email && !this.opportunityForm.get("contactEmail")?.value) {
      this.opportunityForm.patchValue({ contactEmail: email });
    }
  }

  /**
   * Actualiza el email de contacto en el formulario de edición
   * cuando se selecciona una empresa.
   */
  updateEditContactEmail() {
    if (!this.editForm) return;
    const companyName = this.editForm.get("company")?.value;
    const email = this.getCompanyEmail(companyName);
    if (email && !this.editForm.get("contactEmail")?.value) {
      this.editForm.patchValue({ contactEmail: email });
    }
  }

  /**
   * Obtiene la etiqueta legible para el tipo de publicación.
   * @param type El tipo de publicación ("vacante" o "servicio").
   * @returns La etiqueta correspondiente.
   */
  getPublicationTypeLabel(type: "vacante" | "servicio"): string {
    return type === "vacante" ? "Vacante laboral" : "Servicio/Proyecto";
  }
}
