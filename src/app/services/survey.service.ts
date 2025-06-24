
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';


import { ISurvey, ISurveyResponse, IQuestion, ITemplate } from '../models/survey';

// Interfaz para el payload de submitSurveyResponse
interface SubmitResponsePayload {
  userId: string; // El ID de usuario (de localStorage)
  answers: { [questionId: string]: any };
}

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private apiUrl = 'https://ny0vljaa9i.execute-api.us-east-1.amazonaws.com'; // ¡Verifica esta URL!

  constructor(private http: HttpClient) {}

  // --- Métodos de administración para Encuestas (Surveys) ---
  getSurveys(): Observable<ISurvey[]> {
    console.log('[DEBUG SERVICE] Solicitando encuestas a:', `${this.apiUrl}/admin/surveys`);
    return this.http.get<ISurvey[]>(`${this.apiUrl}/admin/surveys`).pipe(
      tap(surveys => console.log('[DEBUG SERVICE] Encuestas recibidas:', surveys)), // LOG AÑADIDO
      catchError(this.handleError)
    );
  }

  createSurvey(surveyData: ISurvey): Observable<ISurvey> {
    console.log('[DEBUG SERVICE] Enviando para crear encuesta. URL:', `${this.apiUrl}/admin/surveys`, 'Payload:', surveyData);
    return this.http.post<ISurvey>(`${this.apiUrl}/admin/surveys`, surveyData).pipe(
      tap(response => console.log('[DEBUG SERVICE] Respuesta de creación de encuesta:', response)), // LOG AÑADIDO
      catchError(this.handleError)
    );
  }

  updateSurvey(surveyId: string, surveyData: Partial<ISurvey>): Observable<ISurvey> {
    console.log('[DEBUG SERVICE] Enviando para actualizar encuesta. URL:', `${this.apiUrl}/admin/surveys/${surveyId}`, 'Payload:', surveyData);
    return this.http.put<ISurvey>(`${this.apiUrl}/admin/surveys/${surveyId}`, surveyData).pipe(
      tap(response => console.log('[DEBUG SERVICE] Respuesta de actualización de encuesta:', response)), // LOG AÑADIDO
      catchError(this.handleError)
    );
  }

  toggleSurveyStatus(surveyId: string, active: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/surveys/${surveyId}/status`, { active }).pipe(
      catchError(this.handleError)
    );
  }

  deleteSurvey(surveyId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/surveys/${surveyId}`).pipe(
      catchError(this.handleError)
    );
  }

  getSurveyById(surveyId: string): Observable<ISurvey> {
    console.log('[DEBUG SERVICE] Solicitando encuesta por ID:', `${this.apiUrl}/admin/surveys/${surveyId}`);
    return this.http.get<ISurvey>(`${this.apiUrl}/admin/surveys/${surveyId}`).pipe(
      tap(survey => console.log('[DEBUG SERVICE] Encuesta por ID recibida:', survey)), // LOG AÑADIDO
      catchError(this.handleError)
    );
  }

  getSurveyResponses(surveyId: string): Observable<ISurveyResponse[]> {
    return this.http.get<ISurveyResponse[]>(`${this.apiUrl}/admin/surveys/${surveyId}/responses`).pipe(
      catchError(this.handleError)
    );
  }


  // --- Métodos de administración para Plantillas (Templates) ---

  getTemplates(): Observable<ITemplate[]> {
    console.log('[DEBUG SERVICE] Cargando plantillas de:', `${this.apiUrl}/admin/templates`);
    return this.http.get<ITemplate[]>(`${this.apiUrl}/admin/templates`).pipe(
      tap(templates => console.log('[DEBUG SERVICE] Plantillas disponibles recibidas:', templates)),
      catchError(this.handleError)
    );
  }

  getTemplateById(templateId: string): Observable<ITemplate> {
    console.log('[DEBUG SERVICE] Cargando plantilla por ID:', `${this.apiUrl}/admin/templates/${templateId}`);
    return this.http.get<ITemplate>(`${this.apiUrl}/admin/templates/${templateId}`).pipe(
      tap(template => console.log('[DEBUG SERVICE] Plantilla recibida:', template)),
      catchError(this.handleError)
    );
  }

  // Omitimos 'id', 'createdAt', 'updatedAt' ya que el backend los generará
  createTemplate(templateData: Omit<ITemplate, 'id' | 'createdAt' | 'updatedAt'>): Observable<ITemplate> {
    console.log('[DEBUG SERVICE] Creando plantilla. URL:', `${this.apiUrl}/admin/templates`, 'Payload:', templateData);
    return this.http.post<ITemplate>(`${this.apiUrl}/admin/templates`, templateData).pipe(
      tap(response => console.log('[DEBUG SERVICE] Respuesta de creación de plantilla:', response)),
      catchError(this.handleError)
    );
  }

  updateTemplate(templateId: string, templateData: Partial<ITemplate>): Observable<ITemplate> {
    console.log('[DEBUG SERVICE] Actualizando plantilla. URL:', `${this.apiUrl}/admin/templates/${templateId}`, 'Payload:', templateData);
    return this.http.put<ITemplate>(`${this.apiUrl}/admin/templates/${templateId}`, templateData).pipe(
      tap(response => console.log('[DEBUG SERVICE] Respuesta de actualización de plantilla:', response)),
      catchError(this.handleError)
    );
  }

  deleteTemplate(templateId: string): Observable<any> {
    console.log('[DEBUG SERVICE] Eliminando plantilla. URL:', `${this.apiUrl}/admin/templates/${templateId}`);
    return this.http.delete<any>(`${this.apiUrl}/admin/templates/${templateId}`).pipe(
      tap(response => console.log('[DEBUG SERVICE] Respuesta de eliminación de plantilla:', response)),
      catchError(this.handleError)
    );
  }


  // --- Métodos para el uso público ---
  getAvailableSurveys(): Observable<ISurvey[]> {
    console.log('[DEBUG SERVICE] Solicitando encuestas públicas a:', `${this.apiUrl}/public/surveys`);
    return this.http.get<ISurvey[]>(`${this.apiUrl}/public/surveys`).pipe(
      tap(surveys => console.log('[DEBUG SERVICE] Encuestas públicas disponibles recibidas:', surveys)), // LOG AÑADIDO
      catchError(this.handleError)
    );
  }

  getPublicSurveyById(surveyId: string): Observable<ISurvey> {
    console.log('[DEBUG SERVICE] Solicitando encuesta pública por ID:', `${this.apiUrl}/public/surveys/${surveyId}`);
    return this.http.get<ISurvey>(`${this.apiUrl}/public/surveys/${surveyId}`).pipe(
      tap(survey => console.log('[DEBUG SERVICE] Encuesta pública por ID recibida:', survey)), // LOG AÑADIDO
      catchError(this.handleError)
    );
  }

  checkIfUserResponded(surveyId: string, userId: string): Observable<{ hasResponded: boolean, message?: string }> {
    return this.http.get<{ hasResponded: boolean, message?: string }>(
      `${this.apiUrl}/public/surveys/${surveyId}/responses/${userId}`
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.log(`[DEBUG SERVICE] 404 para surveyId: ${surveyId}, userId: ${userId}. Interpretando como NO respondida.`);
          return of({ hasResponded: false, message: 'No response found.' });
        }
        console.error('[ERROR SERVICE] Error real en checkIfUserResponded (no 404):', error);
        return throwError(() => new Error(`Error checking response status: ${error.message || error.statusText}`));
      })
    );
  }

  submitSurveyResponse(surveyId: string, payload: SubmitResponsePayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/public/surveys/${surveyId}/responses`, payload).pipe(
      catchError(this.handleError)
    );
  }

  // Manejo de Errores Centralizado
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido del cliente o del servidor.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente o de red: ${error.error.message}`;
    } else {
      errorMessage = `Error del servidor: Código ${error.status}, mensaje: ${error.message}`;
      if (error.error && typeof error.error === 'object' && (error.error as any).error) {
        const detail = (error.error as any).error;
        if (typeof detail === 'string') {
          errorMessage += ` - Detalle: ${detail}`;
        }
      } else if (error.error && typeof error.error === 'string') {
        errorMessage += ` - Detalle: ${error.error}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
