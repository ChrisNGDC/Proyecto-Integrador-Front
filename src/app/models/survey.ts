export interface SurveyQuestion {
  id: number
  text: string
  type: "checkbox" | "radio" | "text" | "rating" | "select" | "date"
  options?: string[]
  required: boolean
  conditionalLogic?: {
    parentQuestionId: number
    showOnValue: any
  }
  description?: string
}

export interface Survey {
  id: number
  title: string
  description: string
  category: "finalizacion" | "empleabilidad" | "satisfaccion" | "otro"
  questions: SurveyQuestion[]
  active: boolean
  createdAt: Date
  expirationDate?: Date
  theme: "default" | "blue" | "green" | "purple" | "dark"
  targetAudience?: string[]
  responseCount?: number
  completionRate?: number
  notificationsSent?: number
  lastNotificationDate?: Date
}

export interface SurveyResponse {
  id: number
  surveyId: number
  respondentId: string
  completedAt: Date
  answers: { [questionId: number]: any }
  partiallyCompleted: boolean
}

export interface SurveyTemplate {
  name: string
  description: string
  category: "finalizacion" | "empleabilidad" | "satisfaccion" | "otro"
  questions: Partial<SurveyQuestion>[]
}
