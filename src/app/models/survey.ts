

export interface IQuestion {
  id: string;
  text: string;
  description?: string;
  type: 'checkbox' | 'radio' | 'select' | 'text' | 'rating' | 'date';
  required?: boolean; // Hago required opcional, ya que en el form se maneja con Validators
  options?: string[];
  
}

export interface ISurvey {
  id?: string;         // Hago ID opcional para cuando se crea una nueva encuesta (aún sin ID)
  title: string;
  description?: string; 
  category?: string;   
  theme?: string;     
  expirationDate?: string;
  targetAudience?: string[];
  questions: IQuestion[];
  active?: boolean;    
  createdAt?: string;   
  updatedAt?: string;   
  // NUEVA PROPIEDAD: Indica si el usuario actual ya ha respondido a esta encuesta
  hasRespondedForCurrentUser?: boolean;
}

export interface ISurveyResponse {
  id: string;          // Esto es el surveyId en DynamoDB (clave de partición)
  responseId?: string; // Esto es el ID único de cada respuesta (clave de ordenación), opcional al crear
  userId?: string;     
  answers: { [questionId: string]: any }; // Las respuestas: clave=ID de pregunta, valor=respuesta
  submittedAt?: string;
}

// === NUEVA INTERFAZ PARA PLANTILLAS ===
export interface ITemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  questions: IQuestion[]; // Las plantillas también tienen preguntas
  createdAt?: string;
  updatedAt?: string;
}
