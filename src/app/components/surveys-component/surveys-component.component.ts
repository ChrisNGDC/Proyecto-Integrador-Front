import { Component, signal, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { SurveyService } from "../../services/survey.service"
import type { Survey, SurveyQuestion } from "../../models/survey"

@Component({
  selector: "app-surveys",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./surveys-component.component.html",
  styleUrls: ["./surveys-component.component.css"],
})
export class SurveysComponent implements OnInit {
  // Encuestas disponibles para el egresado
  availableSurveys = signal<Survey[]>([])

  // Estado de la encuesta actual
  currentSurvey = signal<Survey | null>(null)
  currentStep = signal<number>(0)
  responses: { [key: number]: any } = {}
  progress = signal<number>(0)

  // Historial de encuestas completadas
  completedSurveys = signal<number[]>([])

  // Notificaciones
  notifications = signal<{ id: number; message: string; type: string; date: Date }[]>([
    {
      id: 1,
      message: "Nueva encuesta disponible: Empleabilidad",
      type: "info",
      date: new Date(),
    },
  ])

  constructor(private surveyService: SurveyService) {}

  ngOnInit() {
    // Cargar encuestas disponibles
    this.availableSurveys.set(
      this.surveyService
        .getSurveys()()
        .filter((survey) => survey.active),
    )

    // Cargar encuestas completadas
    this.completedSurveys.set(this.surveyService.getCompletedSurveys()())

    // Comprobar si hay una encuesta en progreso al cargar
    const currentSurveyId = localStorage.getItem("currentSurvey")
    if (currentSurveyId) {
      const surveyId = Number.parseInt(currentSurveyId, 10)
      const survey = this.surveyService.getSurveyById(surveyId)

      if (survey) {
        this.currentSurvey.set(survey)
        this.currentStep.set(Number.parseInt(localStorage.getItem("currentStep") || "0", 10))

        // Cargar respuestas guardadas
        const savedResponses = this.surveyService.loadPartialResponse(surveyId)
        if (savedResponses) {
          this.responses = savedResponses

        this.updateProgress()
      }
    }
  }


   // CAMBIO: Verificar si hay una encuesta de prueba desde la vista de administrador
   const testSurveyJson = localStorage.getItem("testSurvey")
   if (testSurveyJson) {
     try {
       const testSurvey = JSON.parse(testSurveyJson)
       // Agregar la encuesta a las disponibles si no existe ya
       const exists = this.availableSurveys().some((s) => s.id === testSurvey.id)
       if (!exists) {
         this.availableSurveys.update((surveys) => [...surveys, testSurvey])

         // Mostrar notificación
         this.notifications.update((notifications) => [
           ...notifications,
           {
             id: Date.now(),
             message: `Encuesta de prueba "${testSurvey.title}" disponible`,
             type: "info",
             date: new Date(),
           },
         ])

         // Iniciar la encuesta de prueba automáticamente
         setTimeout(() => {
           this.startSurvey(testSurvey)
           // Limpiar localStorage después de iniciar
           localStorage.removeItem("testSurvey")
         }, 500)
       }
     } catch (e) {
       console.error("Error al cargar encuesta de prueba:", e)
     }
   }
 }

  startSurvey(survey: Survey) {
    this.currentSurvey.set({ ...survey })
    this.currentStep.set(0)
    this.responses = {}

    // Cargar respuestas guardadas si existen
    const savedResponses = this.surveyService.loadPartialResponse(survey.id)
    if (savedResponses) {
      this.responses = { ...savedResponses }
    }

    this.updateProgress()

    // Guardar estado actual en localStorage
    this.saveCurrentState()

    // Registrar evento de analítica
    this.logAnalyticsEvent("survey_started", { surveyId: survey.id, surveyTitle: survey.title })
  }

  nextStep() {
    if (!this.currentSurvey()) return

    // Validar respuestas requeridas en el paso actual
    const currentQuestions = this.getCurrentQuestions()
    for (const question of currentQuestions) {
      if (question.required && this.responses[question.id] === undefined) {
        this.showNotification("Por favor responde todas las preguntas obligatorias antes de continuar.", "error")
        return
      }
    }

    // Guardar progreso
    this.saveProgress()

    // Avanzar al siguiente paso
    if (this.currentStep() < this.getTotalSteps() - 1) {
      this.currentStep.set(this.currentStep() + 1)

      // Registrar evento de analítica
      this.logAnalyticsEvent("survey_step_completed", {
        surveyId: this.currentSurvey()!.id,
        step: this.currentStep(),
      })
    } else {
      // Encuesta completada
      this.submitSurvey()
    }

    this.updateProgress()
    this.saveCurrentState()
  }

  prevStep() {
    if (this.currentStep() > 0) {
      this.currentStep.set(this.currentStep() - 1)
      this.updateProgress()
      this.saveCurrentState()
    }
  }

  saveProgress() {
    if (!this.currentSurvey()) return

    // Guardar respuestas actuales
    this.surveyService.savePartialResponse(this.currentSurvey()!.id, this.responses)

    // Mostrar notificación
    this.showNotification("Progreso guardado", "success")

    // Registrar evento de analítica
    this.logAnalyticsEvent("survey_progress_saved", {
      surveyId: this.currentSurvey()!.id,
      progress: this.progress(),
    })
  }

  submitSurvey() {
    if (!this.currentSurvey()) return

    // Simular envío al servidor con un pequeño retraso
    setTimeout(() => {
      // Agregar la respuesta
      this.surveyService.addSurveyResponse({
        surveyId: this.currentSurvey()!.id,
        respondentId: "current_user", // En una implementación real, se usaría el ID del usuario actual
        completedAt: new Date(),
        answers: this.responses,
        partiallyCompleted: false,
      })

      // Eliminar respuestas guardadas para esta encuesta
      this.surveyService.clearPartialResponse(this.currentSurvey()!.id)

      // Eliminar estado actual
      localStorage.removeItem("currentSurvey")
      localStorage.removeItem("currentStep")

      // Actualizar encuestas completadas
      this.completedSurveys.set(this.surveyService.getCompletedSurveys()())

      // Mostrar mensaje de éxito
      this.showThankYouMessage()

      // Registrar evento de analítica
      this.logAnalyticsEvent("survey_completed", {
        surveyId: this.currentSurvey()!.id,
        timeSpent: this.calculateTimeSpent(),
      })

      // Volver a la lista de encuestas
      this.currentSurvey.set(null)

      // Actualizar la lista de encuestas disponibles
      this.availableSurveys.set(
        this.surveyService
          .getSurveys()()
          .filter((survey) => survey.active),
      )
    }, 1500)
  }

  showThankYouMessage() {
    const modal = document.createElement("div")
    modal.className = "fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
    modal.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div class="text-center">
          <div class="text-green-500 text-5xl mb-4">✓</div>
          <h3 class="text-xl font-bold mb-2">¡Gracias por completar la encuesta!</h3>
          <p class="text-gray-600 mb-4">Tus respuestas son muy valiosas para nosotros y nos ayudarán a mejorar.</p>
          <button id="closeThankYouModal" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Volver a la lista
          </button>
        </div>
      </div>
    `
    document.body.appendChild(modal)

    document.getElementById("closeThankYouModal")?.addEventListener("click", () => {
      document.body.removeChild(modal)
    })

    // Animación de confeti (simulada)
    this.showConfetti()
  }

  showConfetti() {
    // Simulación simple de confeti con elementos DOM
    const confettiContainer = document.createElement("div")
    confettiContainer.className = "fixed inset-0 pointer-events-none z-40"
    document.body.appendChild(confettiContainer)

    const colors = ["#f44336", "#2196f3", "#ffeb3b", "#4caf50", "#9c27b0"]

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div")
      confetti.className = "absolute w-2 h-6 opacity-80 confetti"
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.left = Math.random() * 100 + "vw"
      confetti.style.top = -20 + "px"
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`
      confetti.style.animationDuration = Math.random() * 3 + 2 + "s"
      confetti.style.animationDelay = Math.random() * 2 + "s"
      confettiContainer.appendChild(confetti)
    }

    // Eliminar después de la animación
    setTimeout(() => {
      document.body.removeChild(confettiContainer)
    }, 5000)
  }

  updateProgress() {
    if (!this.currentSurvey()) return

    const totalQuestions = this.currentSurvey()!.questions.length
    const answeredQuestions = Object.keys(this.responses).length

    this.progress.set(Math.round((answeredQuestions / totalQuestions) * 100))
  }

  saveCurrentState() {
    if (!this.currentSurvey()) return

    localStorage.setItem("currentSurvey", this.currentSurvey()!.id.toString())
    localStorage.setItem("currentStep", this.currentStep().toString())
  }

  // Obtener preguntas para el paso actual (simulando paginación)
  getCurrentQuestions(): SurveyQuestion[] {
    if (!this.currentSurvey()) return []

    const questionsPerStep = 3
    const startIndex = this.currentStep() * questionsPerStep

    // Filtrar preguntas basadas en lógica condicional
    return this.currentSurvey()!
      .questions.slice(startIndex, startIndex + questionsPerStep)
      .filter((question) => this.shouldShowQuestion(question))
  }

  // Obtener el número total de pasos
  getTotalSteps(): number {
    if (!this.currentSurvey()) return 0

    const questionsPerStep = 3
    return Math.ceil(this.currentSurvey()!.questions.length / questionsPerStep)
  }

  // Verificar si hay respuestas guardadas para una encuesta
  hasSavedResponses(surveyId: number): boolean {
    return !!this.surveyService.loadPartialResponse(surveyId)
  }

  // Calcular el progreso de una encuesta guardada
  getSavedProgress(surveyId: number): number {
    const saved = this.surveyService.loadPartialResponse(surveyId)
    if (!saved) return 0

    const survey = this.surveyService.getSurveyById(surveyId)
    if (!survey) return 0

    const totalQuestions = survey.questions.length
    const answeredQuestions = Object.keys(saved).length

    return Math.round((answeredQuestions / totalQuestions) * 100)
  }

  // Verificar si una encuesta ya fue completada
  isCompleted(surveyId: number): boolean {
    return this.surveyService.isSurveyCompleted(surveyId)
  }

  // Verificar si una pregunta condicional debe mostrarse
  shouldShowQuestion(question: SurveyQuestion): boolean {
    if (!question.conditionalLogic) return true

    const { parentQuestionId, showOnValue } = question.conditionalLogic

    // Si la pregunta padre no tiene respuesta, no mostrar
    if (this.responses[parentQuestionId] === undefined) return false

    // Comparar con el valor esperado
    return this.responses[parentQuestionId] === showOnValue
  }

  // Calcular tiempo estimado para completar la encuesta
  getEstimatedTime(survey: Survey): number {
    // Estimación simple: 30 segundos por pregunta
    return Math.ceil((survey.questions.length * 30) / 60)
  }

  // Calcular tiempo transcurrido en la encuesta actual
  calculateTimeSpent(): number {
    // En una implementación real, se guardaría el tiempo de inicio
    return 3 // Minutos (simulado)
  }

  // Registrar eventos de analítica
  logAnalyticsEvent(eventName: string, eventData: any) {
    // En una implementación real, esto enviaría datos a un servicio de analítica
    console.log("Analytics Event:", eventName, eventData)
  }

  // Método para mostrar notificaciones
  showNotification(message: string, type: "success" | "warning" | "error" = "success") {
    const notification = document.createElement("div")
    notification.textContent = message
    notification.setAttribute("role", "alert") // Para accesibilidad
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

  // Método para manejar atajos de teclado
  handleKeyboardNavigation(event: KeyboardEvent) {
    if (!this.currentSurvey()) return

    if (event.key === "ArrowRight" || event.key === "Enter") {
      this.nextStep()
    } else if (event.key === "ArrowLeft") {
      this.prevStep()
    } else if (event.key === "Escape") {
      if (confirm("¿Desea salir de la encuesta? El progreso se guardará automáticamente.")) {
        this.saveProgress()
        this.currentSurvey.set(null)
      }
    }
  }

  // Método para eliminar notificaciones
  dismissNotification(id: number) {
    this.notifications.update((notifications) => notifications.filter((n) => n.id !== id))
  }
}
