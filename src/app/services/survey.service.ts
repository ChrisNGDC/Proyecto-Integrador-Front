import { Injectable, signal } from "@angular/core"
import type { Survey, SurveyResponse, SurveyTemplate, SurveyQuestion } from "../models/survey"

@Injectable({
  providedIn: "root",
})
export class SurveyService {
  // Datos de encuestas
  private surveys = signal<Survey[]>([
    {
      id: 1,
      title: "Finalización de Carrera",
      description: "Encuesta para evaluar la experiencia académica de los egresados",
      category: "finalizacion",
      questions: [
        {
          id: 1,
          text: "¿Consideras que la formación académica recibida fue adecuada para tu desarrollo profesional?",
          type: "checkbox",
          required: true,
          description: "Evalúa si los conocimientos adquiridos son aplicables en tu trabajo actual",
        },
        {
          id: 2,
          text: "¿Las materias cursadas fueron relevantes para tu campo laboral actual?",
          type: "checkbox",
          required: true,
        },
        {
          id: 3,
          text: "¿Tuviste dificultades para completar tu trabajo final o tesis?",
          type: "checkbox",
          required: false,
        },
        {
          id: 4,
          text: "Si tuviste dificultades, ¿cuáles fueron?",
          type: "text",
          required: false,
          conditionalLogic: {
            parentQuestionId: 3,
            showOnValue: true,
          },
        },
        {
          id: 5,
          text: "¿Recibiste apoyo adecuado de tutores y profesores durante la etapa final de tu carrera?",
          type: "checkbox",
          required: true,
        },
      ],
      active: true,
      createdAt: new Date("2025-01-15"),
      theme: "default",
      responseCount: 45,
      completionRate: 78,
      expirationDate: new Date("2025-06-15"),
      targetAudience: ["Informática", "Sistemas", "Computación"],
    },
    {
      id: 2,
      title: "Empleabilidad",
      description: "Encuesta sobre la situación laboral actual de los egresados",
      category: "empleabilidad",
      questions: [
        {
          id: 1,
          text: "¿Cuánto tiempo te llevó conseguir tu primer empleo relacionado con tu carrera?",
          type: "radio",
          options: ["Menos de 3 meses", "3-6 meses", "6-12 meses", "Más de 12 meses"],
          required: true,
        },
        {
          id: 2,
          text: "¿Tu trabajo actual está relacionado con tu formación académica?",
          type: "checkbox",
          required: true,
        },
        {
          id: 3,
          text: "¿En qué área específica trabajas?",
          type: "select",
          options: [
            "Desarrollo de software",
            "Infraestructura",
            "Seguridad informática",
            "Gestión de proyectos",
            "Análisis de datos",
            "Otro",
          ],
          required: true,
          conditionalLogic: {
            parentQuestionId: 2,
            showOnValue: true,
          },
        },
        {
          id: 4,
          text: "¿Consideras que tu salario es acorde a tu nivel de formación?",
          type: "checkbox",
          required: false,
        },
        {
          id: 5,
          text: "¿Cuándo comenzaste tu trabajo actual?",
          type: "date",
          required: false,
        },
      ],
      active: true,
      createdAt: new Date("2025-02-20"),
      theme: "blue",
      responseCount: 32,
      completionRate: 65,
      expirationDate: new Date("2025-07-20"),
      targetAudience: ["Todas las carreras"],
    },
    {
      id: 3,
      title: "Satisfacción con la Universidad",
      description: "Evaluación de la satisfacción general con la experiencia universitaria",
      category: "satisfaccion",
      questions: [
        {
          id: 1,
          text: "¿Recomendarías estudiar en esta universidad?",
          type: "radio",
          options: [
            "Definitivamente sí",
            "Probablemente sí",
            "No estoy seguro",
            "Probablemente no",
            "Definitivamente no",
          ],
          required: true,
        },
        {
          id: 2,
          text: "¿Por qué no recomendarías la universidad?",
          type: "text",
          required: false,
          conditionalLogic: {
            parentQuestionId: 1,
            showOnValue: "Probablemente no",
          },
        },
        {
          id: 3,
          text: "¿Qué aspectos de la universidad consideras que deberían mejorar?",
          type: "text",
          required: false,
        },
        {
          id: 4,
          text: "¿Cómo calificarías la calidad de la enseñanza?",
          type: "rating",
          required: true,
        },
      ],
      active: true,
      createdAt: new Date("2025-03-10"),
      theme: "green",
      responseCount: 56,
      completionRate: 82,
      expirationDate: new Date("2025-08-10"),
      targetAudience: ["Informática", "Sistemas", "Computación", "Ingeniería"],
    },
    {
      id: 4,
      title: "Empleabilidad",
      description: "Encuesta sobre la situación laboral actual de los egresados",
      category: "empleabilidad",
      questions: [
        {
          id: 1,
          text: "¿Cuánto tiempo te llevó conseguir tu primer empleo relacionado con tu carrera?",
          type: "radio",
          options: ["Menos de 3 meses", "3-6 meses", "6-12 meses", "Más de 12 meses"],
          required: true,
        },
        {
          id: 2,
          text: "¿Tu trabajo actual está relacionado con tu formación académica?",
          type: "checkbox",
          required: true,
        },
        {
          id: 3,
          text: "¿En qué área específica trabajas?",
          type: "select",
          options: [
            "Desarrollo de software",
            "Infraestructura",
            "Seguridad informática",
            "Gestión de proyectos",
            "Análisis de datos",
            "Otro",
          ],
          required: true,
          conditionalLogic: {
            parentQuestionId: 2,
            showOnValue: true,
          },
        },
        {
          id: 4,
          text: "¿Consideras que tu salario es acorde a tu nivel de formación?",
          type: "checkbox",
          required: false,
        },
        {
          id: 5,
          text: "¿Cuándo comenzaste tu trabajo actual?",
          type: "date",
          required: false,
        },
      ],
      active: true,
      createdAt: new Date("2025-02-20"),
      theme: "blue",
      responseCount: 32,
      completionRate: 65,
      expirationDate: new Date("2025-07-20"),
      targetAudience: ["Todas las carreras"],
    },
  ])

  // Datos de respuestas
  private surveyResponses = signal<SurveyResponse[]>([
    // Respuestas simuladas para la encuesta 1
    ...Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,
      surveyId: 1,
      respondentId: `user${i + 1}`,
      completedAt: new Date(2025, 0, 15 + Math.floor(Math.random() * 30)),
      answers: {
        1: Math.random() > 0.3,
        2: Math.random() > 0.4,
        3: Math.random() > 0.5,
        4: Math.random() > 0.5 ? "Falta de tiempo y recursos" : null,
        5: Math.random() > 0.2,
      },
      partiallyCompleted: Math.random() > 0.78,
    })),
    // Respuestas para la encuesta 2
    ...Array.from({ length: 32 }, (_, i) => ({
      id: i + 46,
      surveyId: 2,
      respondentId: `user${i + 20}`,
      completedAt: new Date(2025, 1, 20 + Math.floor(Math.random() * 30)),
      answers: {
        1: ["Menos de 3 meses", "3-6 meses", "6-12 meses", "Más de 12 meses"][Math.floor(Math.random() * 4)],
        2: Math.random() > 0.25,
        3: [
          "Desarrollo de software",
          "Infraestructura",
          "Seguridad informática",
          "Gestión de proyectos",
          "Análisis de datos",
          "Otro",
        ][Math.floor(Math.random() * 6)],
        4: Math.random() > 0.5,
        5: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      },
      partiallyCompleted: Math.random() > 0.65,
    })),
    // Respuestas para la encuesta 3
    ...Array.from({ length: 56 }, (_, i) => ({
      id: i + 78,
      surveyId: 3,
      respondentId: `user${i + 40}`,
      completedAt: new Date(2025, 2, 10 + Math.floor(Math.random() * 30)),
      answers: {
        1: ["Definitivamente sí", "Probablemente sí", "No estoy seguro", "Probablemente no", "Definitivamente no"][
          Math.floor(Math.random() * 5)
        ],
        2: Math.random() > 0.8 ? "Falta de actualización en contenidos" : null,
        3: Math.random() > 0.4 ? "Infraestructura y equipamiento" : "Actualización de planes de estudio",
        4: Math.floor(Math.random() * 5) + 1,
      },
      partiallyCompleted: Math.random() > 0.82,
    })),
  ])

  // Plantillas predefinidas para encuestas
  private surveyTemplates = signal<SurveyTemplate[]>([
    {
      name: "Evaluación de Carrera",
      description: "Plantilla básica para evaluar la experiencia académica",
      category: "finalizacion",
      questions: [
        { text: "¿La carrera cumplió con tus expectativas?", type: "checkbox", required: true },
        { text: "¿Cómo calificarías la calidad de la enseñanza?", type: "rating", required: true },
        { text: "¿Qué aspectos mejorarías de la carrera?", type: "text", required: false },
      ],
    },
    {
      name: "Inserción Laboral",
      description: "Plantilla para evaluar la situación laboral de egresados",
      category: "empleabilidad",
      questions: [
        { text: "¿Estás trabajando actualmente?", type: "checkbox", required: true },
        {
          text: "¿Cuánto tiempo te llevó conseguir tu primer empleo?",
          type: "radio",
          options: ["Menos de 3 meses", "3-6 meses", "6-12 meses", "Más de 12 meses"],
          required: true,
        },
        { text: "¿Tu trabajo está relacionado con tu carrera?", type: "checkbox", required: true },
        {
          text: "¿En qué área específica trabajas?",
          type: "select",
          options: [
            "Desarrollo de software",
            "Infraestructura",
            "Seguridad informática",
            "Gestión de proyectos",
            "Análisis de datos",
            "Otro",
          ],
          required: true,
          conditionalLogic: {
            parentQuestionId: 3,
            showOnValue: true,
          },
        },
      ],
    },
    {
      name: "Evaluación de Satisfacción",
      description: "Plantilla para medir la satisfacción con la universidad",
      category: "satisfaccion",
      questions: [
        {
          text: "¿Recomendarías estudiar en esta universidad?",
          type: "radio",
          options: [
            "Definitivamente sí",
            "Probablemente sí",
            "No estoy seguro",
            "Probablemente no",
            "Definitivamente no",
          ],
          required: true,
        },
        {
          text: "¿Por qué no recomendarías la universidad?",
          type: "text",
          required: false,
          conditionalLogic: {
            parentQuestionId: 1,
            showOnValue: "Probablemente no",
          },
        },
        { text: "Califica la calidad de las instalaciones", type: "rating", required: true },
        { text: "Califica la atención administrativa", type: "rating", required: true },
        { text: "¿Qué sugerencias tienes para mejorar?", type: "text", required: false },
      ],
    },
    {
      name: "Evaluación de Carrera",
      description: "Plantilla básica para evaluar la experiencia académica",
      category: "finalizacion",
      questions: [
        { text: "¿La carrera cumplió con tus expectativas?", type: "checkbox", required: true },
        { text: "¿Cómo calificarías la calidad de la enseñanza?", type: "rating", required: true },
        { text: "¿Qué aspectos mejorarías de la carrera?", type: "text", required: false },
      ],
    },
  ])

  // Audiencias disponibles para segmentación
  private availableAudiences = signal<string[]>([
    "Desarrollo de software",
    "Analista de Sistemas",
    "Ciencias de Computación",
    "Todas las carreras",
  ])

  // Historial de encuestas completadas por el usuario actual
  private completedSurveys = signal<number[]>([])

  constructor() {
    // Cargar encuestas completadas del localStorage
    const completed = localStorage.getItem("completedSurveys")
    if (completed) {
      this.completedSurveys.set(JSON.parse(completed))
    }
  }

  // Métodos para obtener datos
  getSurveys() {
    return this.surveys
  }

  getSurveyResponses() {
    return this.surveyResponses
  }

  getSurveyTemplates() {
    return this.surveyTemplates
  }

  getAvailableAudiences() {
    return this.availableAudiences
  }

  getCompletedSurveys() {
    return this.completedSurveys
  }

   // Método para obtener una encuesta por ID
   getSurveyById(id: number): Survey | undefined {
    // CAMBIO: Si es una encuesta de prueba desde localStorage
    if (id === 0) {
      const testSurveyJson = localStorage.getItem("testSurvey")
      if (testSurveyJson) {
        try {
          return JSON.parse(testSurveyJson)
        } catch (e) {
          console.error("Error al cargar encuesta de prueba:", e)
        }
      }
    }

    return this.surveys().find((survey) => survey.id === id)
  }

  // Método para obtener respuestas de una encuesta específica
  getSurveyResponsesBySurveyId(surveyId: number): SurveyResponse[] {
    return this.surveyResponses().filter((response) => response.surveyId === surveyId)
  }

  // Método para agregar una nueva encuesta
  addSurvey(survey: Omit<Survey, "id">) {
    const newId = this.surveys().length ? Math.max(...this.surveys().map((s) => s.id)) + 1 : 1

    const newSurvey: Survey = {
      ...survey,
      id: newId,
      createdAt: new Date(),
      responseCount: 0,
      completionRate: 0,
    }

    this.surveys.update((surveys) => [...surveys, newSurvey])
    return newSurvey
  }

  // Método para actualizar una encuesta existente
  updateSurvey(updatedSurvey: Survey) {
    this.surveys.update((surveys) => surveys.map((survey) => (survey.id === updatedSurvey.id ? updatedSurvey : survey)))
  }

  // Método para eliminar una encuesta
  deleteSurvey(surveyId: number) {
    this.surveys.update((surveys) => surveys.filter((survey) => survey.id !== surveyId))
    // También eliminar las respuestas asociadas
    this.surveyResponses.update((responses) => responses.filter((response) => response.surveyId !== surveyId))
  }

  // Método para duplicar una encuesta
  duplicateSurvey(surveyId: number) {
    const surveyToDuplicate = this.getSurveyById(surveyId)
    if (!surveyToDuplicate) return null

    const newId = Math.max(...this.surveys().map((s) => s.id)) + 1

    const duplicatedSurvey: Survey = {
      ...JSON.parse(JSON.stringify(surveyToDuplicate)),
      id: newId,
      title: `${surveyToDuplicate.title} (copia)`,
      createdAt: new Date(),
      active: false,
      responseCount: 0,
      completionRate: 0,
    }

    this.surveys.update((surveys) => [...surveys, duplicatedSurvey])
    return duplicatedSurvey
  }

  // Método para cambiar el estado activo/inactivo de una encuesta
  toggleSurveyActive(surveyId: number) {
    this.surveys.update((surveys) =>
      surveys.map((survey) => {
        if (survey.id === surveyId) {
          return { ...survey, active: !survey.active }
        }
        return survey
      }),
    )
  }

  // Método para agregar una respuesta a una encuesta
  addSurveyResponse(response: Omit<SurveyResponse, "id">) {
    const newId = this.surveyResponses().length ? Math.max(...this.surveyResponses().map((r) => r.id)) + 1 : 1

    const newResponse: SurveyResponse = {
      ...response,
      id: newId,
    }

    this.surveyResponses.update((responses) => [...responses, newResponse])

    // Actualizar estadísticas de la encuesta
    this.updateSurveyStats(response.surveyId)

    // Si la encuesta está completada, agregarla a la lista de completadas
    if (!response.partiallyCompleted) {
      this.markSurveyAsCompleted(response.surveyId)
    }

    return newResponse
  }

  // Método para marcar una encuesta como completada
  markSurveyAsCompleted(surveyId: number) {
    if (!this.completedSurveys().includes(surveyId)) {
      const updated = [...this.completedSurveys(), surveyId]
      this.completedSurveys.set(updated)
      localStorage.setItem("completedSurveys", JSON.stringify(updated))
    }
  }

  // Método para actualizar las estadísticas de una encuesta
  private updateSurveyStats(surveyId: number) {
    const responses = this.getSurveyResponsesBySurveyId(surveyId)
    const totalResponses = responses.length
    const completedResponses = responses.filter((r) => !r.partiallyCompleted).length
    const completionRate = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0

    this.surveys.update((surveys) =>
      surveys.map((survey) => {
        if (survey.id === surveyId) {
          return {
            ...survey,
            responseCount: totalResponses,
            completionRate: completionRate,
          }
        }
        return survey
      }),
    )
  }

  // Método para guardar respuestas parciales
  savePartialResponse(surveyId: number, answers: { [questionId: number]: any }) {
    const key = `survey_${surveyId}_partial`
    localStorage.setItem(
      key,
      JSON.stringify({
        surveyId,
        answers,
        savedAt: new Date(),
      }),
    )
  }

  // Método para cargar respuestas parciales
  loadPartialResponse(surveyId: number): { [questionId: number]: any } | null {
    const key = `survey_${surveyId}_partial`
    const saved = localStorage.getItem(key)
    if (saved) {
      const data = JSON.parse(saved)
      return data.answers
    }
    return null
  }

  // Método para eliminar respuestas parciales
  clearPartialResponse(surveyId: number) {
    const key = `survey_${surveyId}_partial`
    localStorage.removeItem(key)
  }

  // Método para verificar si una encuesta ya fue completada por el usuario
  isSurveyCompleted(surveyId: number): boolean {
    return this.completedSurveys().includes(surveyId)
  }

  // Método para exportar una encuesta como JSON
  exportSurveyAsJson(surveyId: number): string {
    const survey = this.getSurveyById(surveyId)
    if (!survey) return ""
    return JSON.stringify(survey, null, 2)
  }

  // Método para importar una encuesta desde JSON
  importSurveyFromJson(jsonData: string): Survey | null {
    try {
      const surveyData = JSON.parse(jsonData)

      // Validar estructura básica
      if (!surveyData.title || !surveyData.description || !Array.isArray(surveyData.questions)) {
        throw new Error("El formato JSON no es válido")
      }

      return this.addSurvey({
        title: surveyData.title,
        description: surveyData.description,
        category: surveyData.category || "otro",
        questions: surveyData.questions,
        active: false,
        createdAt: new Date(),
        theme: surveyData.theme || "default",
        targetAudience: surveyData.targetAudience || [],
      })
    } catch (error) {
      console.error("Error al importar encuesta:", error)
      return null
    }
  }

  // Método para exportar resultados de una encuesta como CSV
  exportSurveyResultsAsCsv(surveyId: number): string {
    const survey = this.getSurveyById(surveyId)
    const responses = this.getSurveyResponsesBySurveyId(surveyId)

    if (!survey || responses.length === 0) return ""

    // Crear encabezados
    let csvContent = "ID,Fecha,Completada"

    // Agregar encabezados de preguntas
    survey.questions.forEach((q: SurveyQuestion) => {
      csvContent += `,${q.text.replace(/,/g, ";")}`
    })

    csvContent += "\n"

    // Agregar filas de datos
    responses.forEach((r) => {
      csvContent += `${r.id},${r.completedAt.toISOString()},${!r.partiallyCompleted}`

      // Agregar respuestas
      survey.questions.forEach((q) => {
        const answer = r.answers[q.id]
        let formattedAnswer = ""

        if (answer === null || answer === undefined) {
          formattedAnswer = ""
        } else if (typeof answer === "boolean") {
          formattedAnswer = answer ? "Sí" : "No"
        } else if (answer instanceof Date) {
          formattedAnswer = answer.toLocaleDateString()
        } else {
          formattedAnswer = String(answer).replace(/,/g, ";")
        }

        csvContent += `,${formattedAnswer}`
      })

      csvContent += "\n"
    })

    return csvContent
  }
}
