import { Component, signal, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { type CdkDragDrop, moveItemInArray, CdkDragHandle, CdkDropList, CdkDrag } from "@angular/cdk/drag-drop"
import { Chart, registerables } from "chart.js"
import { SurveyService } from "../../services/survey.service"
import type { Survey, SurveyQuestion, SurveyResponse, SurveyTemplate } from "../../models/survey"

// Registrar componentes de Chart.js
Chart.register(...registerables)

interface NotificationSettings {
  enabled: boolean
  initialDelay: number // días
  reminderFrequency: number // días
  maxReminders: number
}

@Component({
  selector: "app-admin-surveys-component",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CdkDropList, CdkDrag, CdkDragHandle],
  templateUrl:"./admin-surveys-component.component.html",
  styleUrls: ["./admin-surveys-component.component.css"],
})
export class AdminSurveysComponent implements OnInit, OnDestroy {
  activeTab = signal<"list" | "add" | "edit" | "preview" | "analytics" | "settings" | "import">("list")

  // Datos de encuestas y respuestas
  surveys = signal<Survey[]>([])
  surveyResponses = signal<SurveyResponse[]>([])
  surveyTemplates = signal<SurveyTemplate[]>([])
  availableAudiences = signal<string[]>([])

  // Formulario para nueva encuesta
  surveyForm: FormGroup
  questionForm: FormGroup

  // Encuesta en edición
  editingSurvey: Survey | null = null
  editForm: FormGroup | null = null
  editQuestionForm: FormGroup | null = null

  // Encuesta en previsualización
  previewingSurvey: Survey | null = null
  previewResponses: { [key: number]: any } = {}

  // Encuesta para análisis
  analyticsSurvey: Survey | null = null

  // Configuración de notificaciones
  notificationSettings: NotificationSettings = {
    enabled: true,
    initialDelay: 3, // días después de publicar la encuesta
    reminderFrequency: 7, // cada 7 días
    maxReminders: 3, // máximo 3 recordatorios
  }

  // Variables para guardar automáticamente
  autoSaveInterval: any
  lastSaved = signal<Date | null>(null)
  isDirty = signal<boolean>(false)

  // Filtros para la lista de encuestas
  searchTerm = signal<string>("")
  categoryFilter = signal<string | null>(null)
  statusFilter = signal<string | null>(null)

  // Variables para gráficos
  charts: { [key: string]: Chart } = {}

  // Variables para importación/exportación
  importData = ""
  importError = ""
  importSuccess = ""

  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
  ) {
    // Inicializar formulario de encuesta
    this.surveyForm = this.fb.group({
      title: ["", Validators.required],
      description: ["", Validators.required],
      category: ["finalizacion", Validators.required],
      theme: ["default", Validators.required],
      expirationDate: [null],
      targetAudience: [[]],
      active: [true],
      questions: [[]],
    })

    // Inicializar formulario de pregunta
    this.questionForm = this.fb.group({
      text: ["", Validators.required],
      type: ["checkbox", Validators.required],
      required: [false],
      description: [""],
      options: [[]],
      conditionalLogic: [null],
    })
  }

  ngOnInit() {
    // Cargar datos
    this.surveys.set(this.surveyService.getSurveys()())
    this.surveyResponses.set(this.surveyService.getSurveyResponses()())
    this.surveyTemplates.set(this.surveyService.getSurveyTemplates()())
    this.availableAudiences.set(this.surveyService.getAvailableAudiences()())

    // Iniciar guardado automático cuando se está editando
    this.setupAutoSave()
  }

  ngOnDestroy() {
    // Limpiar el intervalo al destruir el componente
    this.clearAutoSave()
  }

  setupAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      if (this.isDirty()) {
        this.saveToLocalStorage()
        this.lastSaved.set(new Date())
        this.isDirty.set(false)
      }
    }, 30000) // Guardar cada 30 segundos si hay cambios
  }

  clearAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }
  }

  saveToLocalStorage() {
    if (this.activeTab() === "add") {
      localStorage.setItem("draftSurvey", JSON.stringify(this.surveyForm.value))
    } else if (this.activeTab() === "edit" && this.editForm) {
      localStorage.setItem("editingSurvey", JSON.stringify(this.editForm.value))
    }
  }

  loadFromLocalStorage() {
    if (this.activeTab() === "add") {
      const savedDraft = localStorage.getItem("draftSurvey")
      if (savedDraft) {
        this.surveyForm.patchValue(JSON.parse(savedDraft))
        this.lastSaved.set(new Date())
        return true
      }
    } else if (this.activeTab() === "edit") {
      const savedEdit = localStorage.getItem("editingSurvey")
      if (savedEdit && this.editForm) {
        this.editForm.patchValue(JSON.parse(savedEdit))
        this.lastSaved.set(new Date())
        return true
      }
    }
    return false
  }

  markAsDirty() {
    this.isDirty.set(true)
  }

  setActiveTab(tab: "list" | "add" | "edit" | "preview" | "analytics" | "settings" | "import") {
    // Si estamos cambiando de pestaña y hay cambios sin guardar, preguntar
    if (this.isDirty() && this.activeTab() !== tab) {
      if (!confirm("Hay cambios sin guardar. ¿Desea continuar sin guardar?")) {
        return
      }
    }

    this.activeTab.set(tab)

    if (tab === "add") {
      // Intentar cargar borrador guardado
      if (!this.loadFromLocalStorage()) {
        this.resetSurveyForm()
      }
    }

    // Limpiar previsualización si salimos de ella
    if (tab !== "preview") {
      this.previewingSurvey = null
      this.previewResponses = {}
    }

    // Si entramos a analytics, inicializar gráficos
    if (tab === "analytics" && this.analyticsSurvey) {
      setTimeout(() => {
        this.initCharts()
      }, 100)
    }
  }

  resetSurveyForm() {
    this.surveyForm.reset({
      title: "",
      description: "",
      category: "finalizacion",
      theme: "default",
      expirationDate: null,
      targetAudience: [],
      active: true,
      questions: [],
    })
    this.resetQuestionForm()
    localStorage.removeItem("draftSurvey")
    this.isDirty.set(false)
  }

  resetQuestionForm() {
    this.questionForm.reset({
      text: "",
      type: "checkbox",
      required: false,
      description: "",
      options: [],
      conditionalLogic: null,
    })
  }

  // Método para manejar el cambio en la selección de audiencia objetivo
    // Método para manejar el cambio en la selección de audiencia objetivo
    toggleAudienceSelection(audience: string, event: any) {
      const isChecked = event.target.checked
  
      // Asegurarse de que targetAudience sea un array
      const currentTargetAudience = this.surveyForm.get("targetAudience")?.value || []
  
      if (isChecked) {
        // Agregar la audiencia si está seleccionada
        if (!currentTargetAudience.includes(audience)) {
          currentTargetAudience.push(audience)
        }
      } else {
        // Remover la audiencia si está deseleccionada
        const index = currentTargetAudience.indexOf(audience)
        if (index !== -1) {
          currentTargetAudience.splice(index, 1)
        }
      }
  
      // Actualizar el valor en el formulario
      this.surveyForm.patchValue({ targetAudience: currentTargetAudience })
      this.markAsDirty()
    }

  // Método para manejar el cambio en la selección de audiencia objetivo en el formulario de edición
  toggleEditAudienceSelection(audience: string, event: any) {
    if (!this.editForm) return

    const isChecked = event.target.checked

    // Asegurarse de que targetAudience sea un array
    const currentTargetAudience = this.editForm.get("targetAudience")?.value || []

    if (isChecked) {
      // Agregar la audiencia si está seleccionada
      if (!currentTargetAudience.includes(audience)) {
        currentTargetAudience.push(audience)
      }
    } else {
      // Remover la audiencia si está deseleccionada
      const index = currentTargetAudience.indexOf(audience)
      if (index !== -1) {
        currentTargetAudience.splice(index, 1)
      }
    }

    // Actualizar el valor en el formulario
    this.editForm.patchValue({ targetAudience: currentTargetAudience })
    this.markAsDirty()
  }

  addQuestion() {
    if (this.questionForm.invalid) {
      this.markFormGroupTouched(this.questionForm)
      this.showNotification("Por favor complete todos los campos obligatorios de la pregunta", "error")
      return
    }

    const formValue = this.questionForm.value

    // Determinar el ID de la nueva pregunta
    let questions: SurveyQuestion[] = []
    if (this.activeTab() === "add") {
      questions = this.surveyForm.value.questions || []
    } else if (this.activeTab() === "edit" && this.editingSurvey) {
      questions = this.editingSurvey.questions || []
    }

    const questionId = questions.length ? Math.max(...questions.map((q) => q.id || 0)) + 1 : 1

    const newQuestion: SurveyQuestion = {
      id: questionId,
      text: formValue.text,
      type: formValue.type,
      options: formValue.type === "radio" || formValue.type === "select" ? formValue.options : undefined,
      required: formValue.required,
      description: formValue.description || undefined,
      conditionalLogic: formValue.conditionalLogic,
    }

    if (this.activeTab() === "add") {
      const currentQuestions = this.surveyForm.value.questions || []
      this.surveyForm.patchValue({ questions: [...currentQuestions, newQuestion] })
    } else if (this.activeTab() === "edit" && this.editingSurvey) {
      this.editingSurvey.questions = [...this.editingSurvey.questions, newQuestion]
    }

    this.resetQuestionForm()
    this.markAsDirty()
  }

  removeQuestion(questionId: number) {
    let questions: SurveyQuestion[] = []

    if (this.activeTab() === "add") {
      questions = this.surveyForm.value.questions || []
    } else if (this.activeTab() === "edit" && this.editingSurvey) {
      questions = this.editingSurvey.questions || []
    }

    // Verificar si hay preguntas condicionales que dependen de esta
    const hasDependent = questions.some((q) => q.conditionalLogic && q.conditionalLogic.parentQuestionId === questionId)

    if (hasDependent) {
      if (
        !confirm(
          "Hay preguntas que dependen de esta. Si la elimina, también se eliminarán las condiciones. ¿Desea continuar?",
        )
      ) {
        return
      }

      // Eliminar las condiciones de las preguntas dependientes
      questions = questions.map((q) => {
        if (q.conditionalLogic && q.conditionalLogic.parentQuestionId === questionId) {
          const { conditionalLogic, ...rest } = q
          return rest
        }
        return q
      })
    }

    // Filtrar la pregunta a eliminar
    const updatedQuestions = questions.filter((q) => q.id !== questionId)

    if (this.activeTab() === "add") {
      this.surveyForm.patchValue({ questions: updatedQuestions })
    } else if (this.activeTab() === "edit" && this.editingSurvey) {
      this.editingSurvey.questions = updatedQuestions
    }

    this.markAsDirty()
  }

  duplicateQuestion(question: SurveyQuestion) {
    let questions: SurveyQuestion[] = []

    if (this.activeTab() === "add") {
      questions = this.surveyForm.value.questions || []
    } else if (this.activeTab() === "edit" && this.editingSurvey) {
      questions = this.editingSurvey.questions || []
    }

    const questionId = Math.max(...questions.map((q) => q.id)) + 1

    const duplicatedQuestion: SurveyQuestion = {
      ...JSON.parse(JSON.stringify(question)),
      id: questionId,
      text: `${question.text} (copia)`,
    }

    if (this.activeTab() === "add") {
      this.surveyForm.patchValue({ questions: [...questions, duplicatedQuestion] })
    } else if (this.activeTab() === "edit" && this.editingSurvey) {
      this.editingSurvey.questions = [...questions, duplicatedQuestion]
    }

    this.markAsDirty()
  }

  addOptionToQuestion() {
    const options = this.questionForm.get("options")?.value || []
    options.push("")
    this.questionForm.patchValue({ options })
  }

  removeOptionFromQuestion(index: number) {
    const options = this.questionForm.get("options")?.value || []
    options.splice(index, 1)
    this.questionForm.patchValue({ options })
  }

  // Método para configurar lógica condicional
  setConditionalLogic() {
    let questions: SurveyQuestion[] = []

    if (this.activeTab() === "add") {
      questions = this.surveyForm.value.questions || []
    } else if (this.activeTab() === "edit" && this.editingSurvey) {
      questions = this.editingSurvey.questions || []
    }

    if (questions.length === 0) {
      alert("Primero debe agregar al menos una pregunta para establecer condiciones.")
      return
    }

    // Obtener preguntas que pueden ser padres (no la actual)
    const potentialParents = questions.filter((q) => q.type === "checkbox" || q.type === "radio" || q.type === "select")

    if (potentialParents.length === 0) {
      alert(
        "No hay preguntas disponibles para establecer condiciones. Necesita preguntas de tipo checkbox, radio o select.",
      )
      return
    }

    // Mostrar diálogo para seleccionar pregunta padre y valor
    const parentId = prompt(
      "Ingrese el ID de la pregunta padre: " + potentialParents.map((p) => `\n${p.id}: ${p.text}`).join(""),
    )

    if (!parentId) return

    const parentQuestion = potentialParents.find((p) => p.id === Number.parseInt(parentId))
    if (!parentQuestion) {
      alert("Pregunta no encontrada.")
      return
    }

    let conditionValue: any

    if (parentQuestion.type === "checkbox") {
      const value = prompt("¿Mostrar cuando la respuesta sea 'Sí'? (s/n)")
      if (!value) return
      conditionValue = value.toLowerCase() === "s"
    } else if (parentQuestion.type === "radio" || parentQuestion.type === "select") {
      if (!parentQuestion.options || parentQuestion.options.length === 0) {
        alert("La pregunta padre no tiene opciones definidas.")
        return
      }

      const optionPrompt =
        "Seleccione la opción que activará esta pregunta: " +
        parentQuestion.options.map((opt, idx) => `\n${idx + 1}: ${opt}`).join("")

      const optionIndex = prompt(optionPrompt)
      if (!optionIndex) return

      const idx = Number.parseInt(optionIndex) - 1
      if (isNaN(idx) || idx < 0 || idx >= parentQuestion.options.length) {
        alert("Opción no válida.")
        return
      }

      conditionValue = parentQuestion.options[idx]
    }

    this.questionForm.patchValue({
      conditionalLogic: {
        parentQuestionId: parentQuestion.id,
        showOnValue: conditionValue,
      },
    })

    this.showNotification("Lógica condicional configurada")
  }

  clearConditionalLogic() {
    this.questionForm.patchValue({ conditionalLogic: null })
    this.showNotification("Lógica condicional eliminada")
  }

  addSurvey() {
    if (this.surveyForm.invalid) {
      this.markFormGroupTouched(this.surveyForm)
      this.showNotification("Por favor complete todos los campos obligatorios", "error")
      return
    }

    const formValue = this.surveyForm.value

    if (!formValue.questions || formValue.questions.length === 0) {
      this.showNotification("Debe agregar al menos una pregunta a la encuesta", "error")
      return
    }

    const newSurvey = this.surveyService.addSurvey({
      title: formValue.title,
      description: formValue.description,
      category: formValue.category,
      questions: formValue.questions,
      active: formValue.active,
      createdAt: new Date(),
      theme: formValue.theme,
      expirationDate: formValue.expirationDate,
      targetAudience: formValue.targetAudience,
    })

    // Actualizar la lista de encuestas
    this.surveys.set(this.surveyService.getSurveys()())

    localStorage.removeItem("draftSurvey")
    this.isDirty.set(false)
    this.resetSurveyForm()
    this.setActiveTab("list")

    // Mostrar notificación de éxito
    this.showNotification("Encuesta creada exitosamente")
  }

  startEdit(survey: Survey) {
    this.editingSurvey = JSON.parse(JSON.stringify(survey)) // Deep copy

    // Crear formulario para edición
    this.editForm = this.fb.group({
      title: [survey.title, Validators.required],
      description: [survey.description, Validators.required],
      category: [survey.category, Validators.required],
      theme: [survey.theme, Validators.required],
      expirationDate: [survey.expirationDate],
      targetAudience: [survey.targetAudience || []],
      active: [survey.active],
    })

    this.setActiveTab("edit")
  }

  saveEdit() {
    if (!this.editingSurvey || !this.editForm) return

    if (this.editForm.invalid) {
      this.markFormGroupTouched(this.editForm)
      this.showNotification("Por favor complete todos los campos obligatorios", "error")
      return
    }

    const formValue = this.editForm.value

    // Actualizar la encuesta con los valores del formulario
    this.editingSurvey.title = formValue.title
    this.editingSurvey.description = formValue.description
    this.editingSurvey.category = formValue.category
    this.editingSurvey.theme = formValue.theme
    this.editingSurvey.expirationDate = formValue.expirationDate
    this.editingSurvey.targetAudience = formValue.targetAudience
    this.editingSurvey.active = formValue.active

    // Guardar los cambios
    this.surveyService.updateSurvey(this.editingSurvey)

    // Actualizar la lista de encuestas
    this.surveys.set(this.surveyService.getSurveys()())

    localStorage.removeItem("editingSurvey")
    this.isDirty.set(false)
    this.editingSurvey = null
    this.editForm = null
    this.setActiveTab("list")

    // Mostrar notificación de éxito
    this.showNotification("Encuesta actualizada exitosamente")
  }

  toggleActive(survey: Survey) {
    this.surveyService.toggleSurveyActive(survey.id)

    // Actualizar la lista de encuestas
    this.surveys.set(this.surveyService.getSurveys()())

    // Mostrar notificación
    const message = survey.active ? "Encuesta desactivada" : "Encuesta activada"
    this.showNotification(message)
  }

  deleteSurvey(surveyId: number) {
    if (confirm("¿Está seguro de que desea eliminar esta encuesta? Esta acción no se puede deshacer.")) {
      this.surveyService.deleteSurvey(surveyId)

      // Actualizar la lista de encuestas
      this.surveys.set(this.surveyService.getSurveys()())

      this.showNotification("Encuesta eliminada")
    }
  }

  duplicateSurvey(survey: Survey) {
    const duplicatedSurvey = this.surveyService.duplicateSurvey(survey.id)

    if (duplicatedSurvey) {
      // Actualizar la lista de encuestas
      this.surveys.set(this.surveyService.getSurveys()())
      this.showNotification("Encuesta duplicada exitosamente")
    }
  }

  previewSurvey(survey: any) {
    // CAMBIO: Ahora maneja tanto encuestas existentes como nuevas desde el formulario
    if (this.activeTab() === "add") {
      const formValue = this.surveyForm.value
      this.previewingSurvey = {
        id: 0, // ID temporal
        title: formValue.title || "Nueva Encuesta",
        description: formValue.description || "Descripción de la encuesta",
        category: formValue.category || "finalizacion",
        questions: formValue.questions || [],
        active: true,
        createdAt: new Date(),
        theme: formValue.theme || "default",
        targetAudience: formValue.targetAudience || [],
      }
    } else {
      // CAMBIO: Copia profunda para evitar modificar la encuesta original
      this.previewingSurvey = JSON.parse(JSON.stringify(survey))
    }

    // CAMBIO: Reiniciar respuestas para la previsualización
    this.previewResponses = {}

    // Cambiar a la pestaña de previsualización
    this.setActiveTab("preview")

    // CAMBIO: Registro para depuración
    console.log("Previsualizando encuesta:", this.previewingSurvey)
  }

  // Método para mostrar el panel de análisis
  showAnalytics(survey: Survey) {
    this.analyticsSurvey = JSON.parse(JSON.stringify(survey))
    this.setActiveTab("analytics")
  }

  // Método para reordenar preguntas
  dropQuestion(event: CdkDragDrop<SurveyQuestion[]>) {
    if (this.activeTab() === "add") {
      const questions = this.surveyForm.value.questions || []
      moveItemInArray(questions, event.previousIndex, event.currentIndex)
      this.surveyForm.patchValue({ questions })
      this.markAsDirty()
    } else if (this.activeTab() === "edit" && this.editingSurvey) {
      moveItemInArray(this.editingSurvey.questions, event.previousIndex, event.currentIndex)
      this.markAsDirty()
    }
  }

  // Método para aplicar una plantilla
  applyTemplate(template: SurveyTemplate) {
    if (confirm("¿Desea aplicar esta plantilla? Se reemplazarán las preguntas actuales.")) {
      // Crear preguntas con IDs únicos
      const questions: SurveyQuestion[] = template.questions.map((q, index) => ({
        id: index + 1,
        text: q.text || "",
        type: q.type || "checkbox",
        options: q.options,
        required: q.required || false,
        description: q.description,
        conditionalLogic: q.conditionalLogic,
      }))

      if (this.activeTab() === "add") {
        this.surveyForm.patchValue({
          category: template.category,
          questions: questions,
        })
      } else if (this.activeTab() === "edit" && this.editingSurvey) {
        this.editingSurvey.category = template.category
        this.editingSurvey.questions = questions
        if (this.editForm) {
          this.editForm.patchValue({ category: template.category })
        }
      }

      this.markAsDirty()
    }
  }

  // Método para exportar resultados
  exportResults(survey: Survey) {
    const csvContent = this.surveyService.exportSurveyResultsAsCsv(survey.id)

    if (!csvContent) {
      this.showNotification("No hay respuestas para exportar", "warning")
      return
    }

    // Crear un enlace de descarga
    const filename = `resultados_${survey.title.toLowerCase().replace(/\s+/g, "_")}.csv`
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    this.showNotification("Resultados exportados exitosamente")
  }

  // Exportar encuesta como JSON
  exportSurvey(survey: Survey) {
    const surveyJson = this.surveyService.exportSurveyAsJson(survey.id)
    const filename = `encuesta_${survey.title.toLowerCase().replace(/\s+/g, "_")}.json`

    const blob = new Blob([surveyJson], { type: "application/json;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    this.showNotification("Encuesta exportada exitosamente")
  }

  // Importar encuesta desde JSON
  importSurvey() {
    this.importError = ""
    this.importSuccess = ""

    try {
      if (!this.importData) {
        this.importError = "Por favor ingrese datos JSON válidos"
        return
      }

      const newSurvey = this.surveyService.importSurveyFromJson(this.importData)

      if (!newSurvey) {
        this.importError = "El formato JSON no es válido. Debe contener title, description y un array de questions."
        return
      }

      // Actualizar la lista de encuestas
      this.surveys.set(this.surveyService.getSurveys()())

      this.importSuccess = "Encuesta importada exitosamente"
      this.importData = ""

      setTimeout(() => {
        this.setActiveTab("list")
      }, 1500)
    } catch (error) {
      this.importError = "Error al procesar el JSON: " + (error as Error).message
    }
  }

  // Inicializar gráficos para análisis
  initCharts() {
    if (!this.analyticsSurvey) return

    // Limpiar gráficos existentes
    Object.values(this.charts).forEach((chart) => chart.destroy())
    this.charts = {}

    // Obtener respuestas para esta encuesta
    const responses = this.surveyService.getSurveyResponsesBySurveyId(this.analyticsSurvey.id)

    if (responses.length === 0) {
      return
    }

    // Gráfico de completitud
    this.createCompletionChart(responses)

    // Gráficos para cada pregunta
    this.analyticsSurvey.questions.forEach((question) => {
      this.createQuestionChart(question, responses)
    })
  }

  // Crear gráfico de completitud
  createCompletionChart(responses: SurveyResponse[]) {
    const completed = responses.filter((r) => !r.partiallyCompleted).length
    const partial = responses.filter((r) => r.partiallyCompleted).length

    const canvas = document.getElementById("completionChart") as HTMLCanvasElement
    if (!canvas) return

    this.charts["completion"] = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ["Completadas", "Parciales"],
        datasets: [
          {
            data: [completed, partial],
            backgroundColor: ["#4CAF50", "#FFC107"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
          title: {
            display: true,
            text: "Estado de Completitud",
          },
        },
      },
    })
  }

  // Crear gráfico para una pregunta específica
  createQuestionChart(question: SurveyQuestion, responses: SurveyResponse[]) {
    const canvas = document.getElementById(`question_${question.id}_chart`) as HTMLCanvasElement
    if (!canvas) return

    // Obtener respuestas para esta pregunta
    const answers = responses
      .filter((r) => r.answers[question.id] !== undefined && r.answers[question.id] !== null)
      .map((r) => r.answers[question.id])

    if (answers.length === 0) return

    let chartType: "bar" | "pie" | "line"
    let labels: string[]
    let data: number[]

    if (question.type === "checkbox") {
      // Para preguntas de sí/no
      const yesCount = answers.filter((a) => a === true).length
      const noCount = answers.filter((a) => a === false).length

      labels = ["Sí", "No"]
      data = [yesCount, noCount]
      chartType = "pie"
    } else if (question.type === "radio" || question.type === "select") {
      // Para preguntas de opción múltiple
      const optionCounts: { [key: string]: number } = {}

      question.options?.forEach((option) => {
        optionCounts[option] = 0
      })

      answers.forEach((answer) => {
        if (typeof answer === "string" && optionCounts[answer] !== undefined) {
          optionCounts[answer]++
        }
      })

      labels = Object.keys(optionCounts)
      data = Object.values(optionCounts)
      chartType = "bar"
    } else if (question.type === "rating") {
      // Para preguntas de calificación
      const ratingCounts = [0, 0, 0, 0, 0]

      answers.forEach((answer) => {
        if (typeof answer === "number" && answer >= 1 && answer <= 5) {
          ratingCounts[answer - 1]++
        }
      })

      labels = ["1", "2", "3", "4", "5"]
      data = ratingCounts
      chartType = "bar"
    } else {
      // Para otros tipos de preguntas, no crear gráfico
      return
    }

    const colors = [
      "#4CAF50",
      "#2196F3",
      "#FFC107",
      "#FF5722",
      "#9C27B0",
      "#3F51B5",
      "#E91E63",
      "#009688",
      "#795548",
      "#607D8B",
    ]

    this.charts[`question_${question.id}`] = new Chart(canvas, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: "Respuestas",
            data: data,
            backgroundColor: colors.slice(0, data.length),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: chartType !== "bar",
            position: "bottom",
          },
          title: {
            display: true,
            text: question.text,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            display: chartType === "bar",
          },
        },
      },
    })
  }

  // Simular envío de notificaciones
  sendNotifications(survey: Survey) {
    if (!this.notificationSettings.enabled) {
      this.showNotification("Las notificaciones están desactivadas", "warning")
      return
    }

    if (!survey.active) {
      this.showNotification("La encuesta debe estar activa para enviar notificaciones", "warning")
      return
    }

    const notificationsSent = survey.notificationsSent || 0

    if (notificationsSent >= this.notificationSettings.maxReminders) {
      this.showNotification("Se ha alcanzado el límite máximo de notificaciones", "warning")
      return
    }

    // Simular envío
    this.surveys.update((surveys) =>
      surveys.map((s) => {
        if (s.id === survey.id) {
          return {
            ...s,
            notificationsSent: (s.notificationsSent || 0) + 1,
            lastNotificationDate: new Date(),
          }
        }
        return s
      }),
    )

    this.showNotification(`Notificaciones enviadas a ${survey.targetAudience?.length || 0} destinatarios`)
  }

  // Filtrar encuestas
  get filteredSurveys() {
    return this.surveys().filter((survey) => {
      // Filtrar por término de búsqueda
      const matchesSearch =
        this.searchTerm() === "" ||
        survey.title.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        survey.description.toLowerCase().includes(this.searchTerm().toLowerCase())

      // Filtrar por categoría
      const matchesCategory = !this.categoryFilter() || survey.category === this.categoryFilter()

      // Filtrar por estado
      const matchesStatus =
        !this.statusFilter() ||
        (this.statusFilter() === "active" && survey.active) ||
        (this.statusFilter() === "inactive" && !survey.active)

      return matchesSearch && matchesCategory && matchesStatus
    })
  }

  // Método para mostrar notificaciones
  showNotification(message: string, type: "success" | "warning" | "error" = "success") {
    // Implementación simple de notificación
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

 // Método para simular respuestas en la previsualización
  setPreviewResponse(questionId: number, value: any) {
    // CAMBIO: Agregado registro para depuración
    console.log(`Respuesta para pregunta ${questionId}:`, value)
    this.previewResponses[questionId] = value

    // CAMBIO: Actualizar las preguntas condicionales que dependen de esta respuesta
    if (this.previewingSurvey) {
      // CAMBIO: Forzar actualización de la vista
      this.previewingSurvey = { ...this.previewingSurvey }
    }
  }

   // Agregar un método para probar la encuesta en la vista de egresados
   testSurveyAsGraduate(survey: Survey) {
    // CAMBIO: Guardar la encuesta en localStorage para que esté disponible en la vista de egresados
    localStorage.setItem("testSurvey", JSON.stringify(survey))

    // CAMBIO: Navegar a la ruta de encuestas de egresados en una nueva pestaña
    window.open("/encuestas", "_blank")

    this.showNotification("Encuesta abierta en la vista de egresados (nueva pestaña)")
  }

  // Verificar si una pregunta condicional debe mostrarse
  shouldShowQuestion(question: SurveyQuestion): boolean {
    if (!question.conditionalLogic) return true

    const { parentQuestionId, showOnValue } = question.conditionalLogic

    // CAMBIO: Si la pregunta padre no tiene respuesta, no mostrar
    if (this.previewResponses[parentQuestionId] === undefined) return false

    const parentResponse = this.previewResponses[parentQuestionId]
    // CAMBIO: Agregado registro para depuración
    console.log(`Evaluando condición: ${parentResponse} === ${showOnValue}`)

    // CAMBIO: Comparar con el valor esperado (manejo especial para booleanos)
    if (typeof showOnValue === "boolean") {
      return parentResponse === showOnValue
    } else if (typeof showOnValue === "string") {
      return String(parentResponse) === showOnValue
    } else {
      return parentResponse === showOnValue
    }
  }

  // Marcar todos los campos de un formulario como tocados para mostrar errores
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched()
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup)
      }
    })
  }
}
