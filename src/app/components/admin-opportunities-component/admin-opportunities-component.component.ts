import { Component, signal } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule,  FormBuilder, FormGroup, Validators, FormsModule } from "@angular/forms"
import type { JobOpportunity } from "../../models/job-opportunity"

interface Company {
  id: number
  name: string
  logo?: string
  website?: string
  industry: string
  contactEmail?: string
}

@Component({
  selector: "app-admin-opportunities",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./admin-opportunities-component.component.html",
  styleUrls: ["./admin-opportunities-component.component.css"],
})
export class AdminOpportunitiesComponent {
  activeTab = signal<"list" | "add" | "edit" | "preview">("list")

  // Formulario reactivo para nueva oportunidad
  opportunityForm: FormGroup

  constructor(private fb: FormBuilder) {
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
      active: [true],
    })
  }

  // Lista de oportunidades
  opportunities = signal<JobOpportunity[]>([
    {
      id: 1,
      company: "Globant",
      title: "Desarrollador backend Ssr 3 años de experiencia",
      modality: "Híbrida",
      publicationDate: new Date("2025-01-15"),
      category: "Backend",
      type: "vacante",
      description:
        "Buscamos desarrollador backend con experiencia en Node.js y bases de datos SQL/NoSQL para unirse a nuestro equipo de desarrollo.",
      requirements: [
        "3+ años de experiencia en desarrollo backend",
        "Conocimientos sólidos de Node.js",
        "Experiencia con bases de datos SQL y NoSQL",
        "Inglés intermedio/avanzado",
      ],
      location: "Buenos Aires, Argentina",
      salary: "Competitivo",
      contactEmail: "rrhh@globant.com",
      active: true,
    },
    {
      id: 2,
      company: "G&L Group",
      title: "Desarrollador backend Trainee",
      modality: "Presencial",
      publicationDate: new Date("2025-02-10"),
      category: "Backend",
      type: "vacante",
      description:
        "Oportunidad para desarrolladores recién graduados que deseen iniciar su carrera en el desarrollo backend.",
      requirements: [
        "Conocimientos básicos de programación",
        "Interés en desarrollo backend",
        "Capacidad de aprendizaje rápido",
      ],
      location: "Córdoba, Argentina",
      salary: "A convenir",
      contactEmail: "careers@glgroup.com",
      active: true,
    },
    {
      id: 3,
      company: "IT Patagonia",
      title: "Desarrollador backend Junior 1 - 2 años de exp.",
      modality: "Híbrida",
      publicationDate: new Date("2025-02-20"),
      category: "Backend",
      type: "vacante",
      description: "Buscamos desarrollador backend junior para proyectos innovadores en el sector financiero.",
      requirements: [
        "1-2 años de experiencia en desarrollo",
        "Conocimientos de Java o Python",
        "Bases de datos relacionales",
      ],
      location: "Remoto (Argentina)",
      salary: "Según experiencia",
      contactEmail: "jobs@itpatagonia.com",
      active: true,
    },
    {
      id: 4,
      company: "Gobierno de la ciudad",
      title: "Desarrollador backend Junior +6 meses de exp.",
      modality: "Presencial",
      publicationDate: new Date("2025-03-05"),
      category: "Backend",
      type: "servicio",
      description: "Oportunidad para formar parte del equipo de desarrollo de aplicaciones gubernamentales.",
      requirements: ["6+ meses de experiencia", "Conocimientos de .NET o Java", "Residir en CABA o alrededores"],
      location: "Ciudad de Buenos Aires, Argentina",
      salary: "Según escala salarial pública",
      contactEmail: "recursoshumanos@buenosaires.gob.ar",
      active: false,
    },
    {
      id: 5,
      company: "Accenture",
      title: "Frontend Developer React",
      modality: "Remoto",
      publicationDate: new Date("2025-03-10"),
      category: "FrontEnd",
      type: "vacante",
      description: "Buscamos desarrollador frontend con experiencia en React para proyectos internacionales.",
      requirements: [
        "2+ años de experiencia con React",
        "HTML, CSS, JavaScript avanzado",
        "Inglés intermedio/avanzado",
      ],
      location: "Remoto (Latam)",
      salary: "Competitivo + beneficios",
      contactEmail: "talent@accenture.com",
      active: true,
    },
    {
      id: 6,
      company: "MercadoLibre",
      title: "QA Automation Engineer",
      modality: "Híbrida",
      publicationDate: new Date("2025-03-15"),
      category: "QA",
      type: "vacante",
      description:
        "Únete al equipo de QA de MercadoLibre para desarrollar y mantener frameworks de automatización de pruebas.",
      requirements: [
        "Experiencia en automatización de pruebas",
        "Conocimientos de Selenium, Cypress o similares",
        "Programación en Java o Python",
      ],
      location: "Buenos Aires, Argentina",
      salary: "Competitivo + beneficios",
      contactEmail: "careers@mercadolibre.com",
      active: true,
    },
    {
      id: 7,
      company: "Freelancer",
      title: "Diseño de sitio web para empresa de turismo",
      modality: "Remoto",
      publicationDate: new Date("2025-03-20"),
      category: "FrontEnd",
      type: "servicio",
      description:
        "Se busca desarrollador frontend para diseñar y desarrollar sitio web responsive para empresa de turismo.",
      requirements: [
        "Experiencia en diseño web",
        "Conocimientos de HTML, CSS y JavaScript",
        "Portfolio de trabajos previos",
      ],
      location: "Remoto",
      salary: "Proyecto - $1500 USD",
      contactEmail: "contacto@turismoaventura.com",
      active: true,
    },
  ])

  // Lista de empresas
  companies = signal<Company[]>([
    { id: 1, name: "Globant", industry: "Tecnología", contactEmail: "rrhh@globant.com" },
    { id: 2, name: "G&L Group", industry: "Consultoría IT", contactEmail: "careers@glgroup.com" },
    { id: 3, name: "IT Patagonia", industry: "Tecnología", contactEmail: "jobs@itpatagonia.com" },
    {
      id: 4,
      name: "Gobierno de la ciudad",
      industry: "Sector Público",
      contactEmail: "recursoshumanos@buenosaires.gob.ar",
    },
    { id: 5, name: "Accenture", industry: "Consultoría", contactEmail: "talent@accenture.com" },
    { id: 6, name: "MercadoLibre", industry: "E-commerce", contactEmail: "careers@mercadolibre.com" },
    { id: 7, name: "Freelancer", industry: "Independiente", contactEmail: "contacto@freelancer.com" },
  ])

  // Categorías disponibles
  categories = signal<string[]>(["Backend", "FrontEnd", "QA", "Datos", "Devops", "UX/UI", "Mobile", "Todos" ])

  // Modalidades disponibles
  modalities = signal<string[]>(["Remoto", "Presencial", "Híbrida"])

  // Tipos de publicación
  publicationTypes = signal<{ value: "vacante" | "servicio"; label: string }[]>([
    { value: "vacante", label: "Vacante laboral" },
    { value: "servicio", label: "Servicio/Proyecto" },
  ])

  // Filtros
  searchTerm = signal<string>("")
  categoryFilter = signal<string | null>(null)
  modalityFilter = signal<string | null>(null)
  typeFilter = signal<"vacante" | "servicio" | null>(null)
  statusFilter = signal<string | null>(null)

  // Oportunidad en edición
  editingOpportunity: JobOpportunity | null = null
  editForm: FormGroup | null = null

  // Oportunidad en previsualización
  previewingOpportunity: JobOpportunity | null = null

  // Nuevo requisito temporal
  newRequirement = ""

  setActiveTab(tab: "list" | "add" | "edit" | "preview") {
    this.activeTab.set(tab)

    if (tab === "add") {
      this.resetForm()
    }

    if (tab !== "preview") {
      this.previewingOpportunity = null
    }
  }

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
    })
    this.newRequirement = ""
  }

  addRequirement() {
    if (!this.newRequirement.trim()) return

    const currentRequirements = this.getCurrentRequirements()
    currentRequirements.push(this.newRequirement.trim())

    this.newRequirement = ""
  }

  removeRequirement(index: number) {
    const currentRequirements = this.getCurrentRequirements()
    currentRequirements.splice(index, 1)
  }

  getCurrentRequirements(): string[] {
    if (this.activeTab() === "edit" && this.editingOpportunity) {
      if (!this.editingOpportunity.requirements) {
        this.editingOpportunity.requirements = []
      }
      return this.editingOpportunity.requirements
    } else {
      // Para el formulario de agregar
      if (!this.opportunityForm.value.requirements) {
        this.opportunityForm.value.requirements = []
      }
      return this.opportunityForm.value.requirements
    }
  }

  addOpportunity() {
    if (this.opportunityForm.invalid) {
      this.markFormGroupTouched(this.opportunityForm)
      this.showNotification("Por favor complete todos los campos obligatorios", "error")
      return
    }

    const newId = this.opportunities().length ? Math.max(...this.opportunities().map((o) => o.id)) + 1 : 1

    const formValue = this.opportunityForm.value
    const opportunity: JobOpportunity = {
      id: newId,
      title: formValue.title,
      company: formValue.company,
      modality: formValue.modality,
      category: formValue.category,
      type: formValue.type,
      description: formValue.description,
      requirements: this.opportunityForm.value.requirements || [],
      location: formValue.location,
      salary: formValue.salary,
      contactEmail: formValue.contactEmail,
      publicationDate: new Date(),
      active: formValue.active,
    }

    this.opportunities.update((opportunities) => [...opportunities, opportunity])
    this.showNotification("Oportunidad laboral creada exitosamente")
    this.resetForm()
    this.setActiveTab("list")
  }

  // Marcar todos los campos como tocados para mostrar errores de validación
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched()
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup)
      }
    })
  }

  startEdit(opportunity: JobOpportunity) {
    this.editingOpportunity = { ...opportunity, requirements: [...(opportunity.requirements || [])] }

    // Crear un nuevo formulario para edición
    this.editForm = this.fb.group({
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
    })

    this.setActiveTab("edit")
  }

  saveEdit() {
    if (!this.editingOpportunity || !this.editForm) return

    if (this.editForm.invalid) {
      this.markFormGroupTouched(this.editForm)
      this.showNotification("Por favor complete todos los campos obligatorios", "error")
      return
    }

    const formValue = this.editForm.value
    const updatedOpportunity: JobOpportunity = {
      ...this.editingOpportunity,
      title: formValue.title,
      company: formValue.company,
      modality: formValue.modality,
      category: formValue.category,
      type: formValue.type,
      description: formValue.description,
      location: formValue.location,
      salary: formValue.salary,
      contactEmail: formValue.contactEmail,
      active: formValue.active,
    }

    this.opportunities.update((opportunities) =>
      opportunities.map((o) => (o.id === updatedOpportunity.id ? updatedOpportunity : o)),
    )

    this.showNotification("Oportunidad laboral actualizada exitosamente")
    this.editingOpportunity = null
    this.editForm = null
    this.setActiveTab("list")
  }

  toggleActive(opportunity: JobOpportunity) {
    this.opportunities.update((opportunities) =>
      opportunities.map((o) => (o.id === opportunity.id ? { ...o, active: !o.active } : o)),
    )

    const message = opportunity.active ? "Oportunidad desactivada" : "Oportunidad activada"
    this.showNotification(message)
  }

  deleteOpportunity(opportunityId: number) {
    if (confirm("¿Está seguro de que desea eliminar esta oportunidad laboral? Esta acción no se puede deshacer.")) {
      this.opportunities.update((opportunities) => opportunities.filter((o) => o.id !== opportunityId))
      this.showNotification("Oportunidad laboral eliminada")
    }
  }

  duplicateOpportunity(opportunity: JobOpportunity) {
    const newId = Math.max(...this.opportunities().map((o) => o.id)) + 1

    const duplicatedOpportunity: JobOpportunity = {
      ...opportunity,
      id: newId,
      title: `${opportunity.title} (copia)`,
      publicationDate: new Date(),
      active: false,
    }

    this.opportunities.update((opportunities) => [...opportunities, duplicatedOpportunity])
    this.showNotification("Oportunidad laboral duplicada exitosamente")
  }

  previewOpportunity(opportunity: JobOpportunity) {
    this.previewingOpportunity = { ...opportunity }
    this.setActiveTab("preview")
  }

  // Filtrar oportunidades
  get filteredOpportunities() {
    return this.opportunities().filter((opportunity) => {
      // Filtrar por término de búsqueda
      const matchesSearch =
        this.searchTerm() === "" ||
        opportunity.title.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        opportunity.company.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        opportunity.description?.toLowerCase().includes(this.searchTerm().toLowerCase())

      // Filtrar por categoría
      const matchesCategory = !this.categoryFilter() || opportunity.category === this.categoryFilter()

      // Filtrar por modalidad
      const matchesModality = !this.modalityFilter() || opportunity.modality === this.modalityFilter()

      // Filtrar por tipo
      const matchesType = !this.typeFilter() || opportunity.type === this.typeFilter()

      // Filtrar por estado
      const matchesStatus =
        !this.statusFilter() ||
        (this.statusFilter() === "active" && opportunity.active) ||
        (this.statusFilter() === "inactive" && !opportunity.active)

      return matchesSearch && matchesCategory && matchesModality && matchesType && matchesStatus
    })
  }

  // Método para mostrar notificaciones
  showNotification(message: string, type: "success" | "warning" | "error" = "success") {
    const notification = document.createElement("div")
    notification.textContent = message
    notification.className = `fixed bottom-4 left-4 py-2 px-4 rounded shadow-lg z-50 notification-fade`

    // Aplicar color según tipo
    if (type === "success") {
      notification.classList.add("bg-green-500", "text-white")
    } else if (type === "warning") {
      notification.classList.add("bg-yellow-500", "text-white")
    } else if (type === "error") {
      notification.classList.add("bg-red-500", "text-white")
    }

    document.body.appendChild(notification)

    // Eliminar después de 3 segundos
    setTimeout(() => {
      notification.classList.add("opacity-0")
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 500)
    }, 3000)
  }

  // Obtener el email de contacto de la empresa seleccionada
  getCompanyEmail(companyName: string): string {
    if (!companyName) return ""

    const company = this.companies().find((c) => c.name === companyName)
    return company?.contactEmail || ""
  }

  // Actualizar el email de contacto cuando se selecciona una empresa
  updateContactEmail() {
    const companyName = this.opportunityForm.get("company")?.value
    const email = this.getCompanyEmail(companyName)

    if (email && !this.opportunityForm.get("contactEmail")?.value) {
      this.opportunityForm.patchValue({ contactEmail: email })
    }
  }

  // Actualizar el email de contacto cuando se selecciona una empresa en el formulario de edición
  updateEditContactEmail() {
    if (!this.editForm) return

    const companyName = this.editForm.get("company")?.value
    const email = this.getCompanyEmail(companyName)

    if (email && !this.editForm.get("contactEmail")?.value) {
      this.editForm.patchValue({ contactEmail: email })
    }
  }

  // Obtener el tipo de publicación como texto
  getPublicationTypeLabel(type: "vacante" | "servicio"): string {
    return type === "vacante" ? "Vacante laboral" : "Servicio/Proyecto"
  }
}
