// src/app/components/user-survey/surveys-component.component.ts

import { Component, OnInit, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SurveyService } from '../../services/survey.service';
// ConditionalLogic ha sido removido del modelo y ya no se importa aquí
import { ISurvey, IQuestion } from '../../models/survey';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { v4 as uuidv4 } from 'uuid';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-user-survey',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
    DatePipe
  ],
  templateUrl: './surveys-component.component.html',
  styleUrls: ['./surveys-component.component.css'],
})
export class SurveysComponent implements OnInit {
  availableSurveys = signal<ISurvey[]>([]);
  currentSurvey = signal<ISurvey | null>(null);
  activeSurveyId = signal<string | null>(null);

  surveyResponseForm!: FormGroup;

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  showSuccessMessage = signal<boolean>(false);
  hasResponded = signal<boolean>(false);
  isLoadingCheck = signal<boolean>(true); // Para controlar el spinner/mensaje de verificación inicial

  private anonymousUserId!: string;

  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Usar un efecto para reaccionar a los cambios de activeSurveyId
    effect(() => {
      const currentId = this.activeSurveyId();
      console.log('[EFFECT] activeSurveyId changed to:', currentId);
      // Cuando activeSurveyId cambia a null (volviendo a la lista), cargamos las encuestas disponibles.
      // Cuando cambia a un ID, se encarga loadSurveyDetails.
      if (currentId === null) {
        this.loadAvailableSurveys();
      }
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit: Iniciando componente. showSuccessMessage:', this.showSuccessMessage());
    this.showSuccessMessage.set(false);

    this.ensureAnonymousUserId();

    // Solo suscribirse a paramMap. Se encarga de llamar a loadSurveyDetails o actualizar activeSurveyId
    this.route.paramMap.subscribe((params) => {
      const surveyId = params.get('id');
      console.log('ngOnInit paramMap.subscribe: surveyId:', surveyId);
      if (surveyId) {
        this.activeSurveyId.set(surveyId); // Esto disparará el efecto si el ID cambia
        this.loadSurveyDetails(surveyId);
      } else {
        this.activeSurveyId.set(null); // Esto disparará el efecto para cargar la lista
      }
    });
  }

  ensureAnonymousUserId(): void {
    let storedUserId = localStorage.getItem('anonSurveyUserId');
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem('anonSurveyUserId', storedUserId);
    }
    this.anonymousUserId = storedUserId;
    console.log('Using anonymous user ID:', this.anonymousUserId);
  }

  loadAvailableSurveys(): void {
    console.log('[FLOW] loadAvailableSurveys: Iniciando carga de lista de encuestas.');
    this.loading.set(true);
    this.error.set(null);
    this.showSuccessMessage.set(false);
    this.isLoadingCheck.set(true);

    this.surveyService.getAvailableSurveys().pipe(
      tap(surveys => console.log('[DEBUG FE] Encuestas brutas recibidas:', surveys)),
      switchMap((surveys: ISurvey[]) => {
        if (surveys.length === 0) {
          this.isLoadingCheck.set(false);
          console.log('[DEBUG FE] No hay encuestas disponibles. Devolviendo array vacío.');
          return of([]);
        }

        const surveyChecks: Observable<ISurvey>[] = surveys.map(survey => {
          if (!survey.id) {
            console.warn(`[WARNING FE] Encuesta sin ID encontrada, saltando verificación de respuesta:`, survey);
            return of({ ...survey, hasRespondedForCurrentUser: false });
          }
          return this.surveyService.checkIfUserResponded(survey.id, this.anonymousUserId).pipe(
            map(response => {
              console.log(`[DEBUG FE] CheckIfUserResponded para encuesta ${survey.id} (${survey.title}): hasResponded = ${response.hasResponded}`);
              return { ...survey, hasRespondedForCurrentUser: response.hasResponded };
            }),
            catchError(err => {
              console.error(`[ERROR FE] al verificar respuesta para encuesta ${survey.id} (${survey.title}):`, err);
              return of({ ...survey, hasRespondedForCurrentUser: false });
            })
          );
        });
        return forkJoin(surveyChecks).pipe(
          tap(results => {
            this.isLoadingCheck.set(false);
            console.log('[DEBUG FE] Todas las verificaciones de forkJoin completadas. isLoadingCheck: false');
          })
        );
      }),
      catchError((err) => {
        console.error('[ERROR FE] en loadAvailableSurveys (principal): Error al cargar encuestas disponibles:', err);
        this.error.set('Error al cargar encuestas disponibles. Por favor, inténtalo de nuevo.');
        this.loading.set(false);
        this.isLoadingCheck.set(false);
        return of([]);
      })
    ).subscribe({
      next: (data: ISurvey[]) => {
        this.availableSurveys.set(data);
        this.loading.set(false);
        console.log('[FLOW] loadAvailableSurveys: Encuestas cargadas con estado de respuesta. Cantidad:', data.length);
        data.forEach(s => console.log(`[DEBUG FE] Estado final de Survey en lista: ${s.id} (${s.title}): hasRespondedForCurrentUser = ${s.hasRespondedForCurrentUser}`));
      },
      error: (err) => {
        console.error('ERROR final de suscripción en loadAvailableSurveys:', err);
      },
    });
  }

  startSurvey(surveyId: string): void {
    console.log('[FLOW] startSurvey: Navegando a encuesta:', surveyId);
    this.showSuccessMessage.set(false);
    this.error.set(null);
    this.hasResponded.set(false);
    this.isLoadingCheck.set(true);
    this.router.navigate(['/encuestas', surveyId]);
  }

  loadSurveyDetails(surveyId: string): void {
    console.log('[FLOW] loadSurveyDetails: Cargando detalles para ID:', surveyId);
    this.loading.set(true);
    this.error.set(null);
    this.isLoadingCheck.set(true);

    this.surveyService.checkIfUserResponded(surveyId, this.anonymousUserId).pipe(
      tap(response => console.log(`[DEBUG FE] loadSurveyDetails: Respuesta de verificación para ${surveyId}: ${JSON.stringify(response)}`)),
      switchMap(response => {
        this.hasResponded.set(response.hasResponded);
        this.isLoadingCheck.set(false);

        console.log(`[DEBUG FE] loadSurveyDetails: Survey ${surveyId} - user hasResponded: ${response.hasResponded}`);

        if (this.hasResponded()) {
          console.log('[FLOW] loadSurveyDetails: Usuario ya ha respondido. Deshabilitando formulario.');
          this.error.set('Ya has respondido a esta encuesta desde este dispositivo. ¡Gracias por tu participación!');
          this.currentSurvey.set(null);
          this.loading.set(false);
          return of(null); // No cargar la encuesta si ya respondió
        } else {
          console.log('[FLOW] loadSurveyDetails: Usuario NO ha respondido. Cargando encuesta...');
          return this.surveyService.getPublicSurveyById(surveyId).pipe(
            tap(survey => console.log('[DEBUG FE] Encuesta pública cargada:', survey)),
            catchError(err => {
              console.error('[ERROR FE] en loadSurveyDetails: Error al cargar detalles de la encuesta:', err);
              const errorMessageDetail = err instanceof Error ? err.message : JSON.stringify(err);
              this.error.set('Encuesta no encontrada o no disponible. Detalles: ' + errorMessageDetail);
              this.currentSurvey.set(null);
              this.activeSurveyId.set(null);
              this.loading.set(false);
              return of(null);
            })
          );
        }
      })
    ).subscribe({
      next: (survey) => {
        if (survey) { // Solo if survey no es null (si el usuario no había respondido)
          console.log('[FLOW] loadSurveyDetails: Encuesta cargada exitosamente. Título:', survey.title);
          this.currentSurvey.set(survey);
          this.initResponseForm(survey);
          this.surveyResponseForm.enable();
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('[ERROR FE] final de suscripción en loadSurveyDetails:', err);
        // Este error se maneja en el catchError del pipe superior, aquí solo para un log final
      }
    });
  }

  initResponseForm(survey: ISurvey): void {
    console.log('[FLOW] initResponseForm: Inicializando formulario para', survey.title);
    const formControls: { [key: string]: any } = {};
    survey.questions.forEach((question) => {
      formControls[question.id] = [
        this.getInitialValueForQuestionType(question.type),
        question.required ? Validators.required : null,
      ];
    });
    this.surveyResponseForm = this.fb.group(formControls);
    this.surveyResponseForm.disable();
  }

  getInitialValueForQuestionType(type: IQuestion['type']): any {
    switch (type) {
      case 'checkbox':
        return false;
      case 'rating':
        return 0;
      case 'select':
        return null;
      default:
        return null;
    }
  }

  // shouldShowQuestion eliminado por completo
  // ya que no hay lógica condicional
  shouldShowQuestion(question: IQuestion, currentResponses: { [key: string]: any }): boolean {
    return true;
  }

  submitResponse(): void {
    console.log('[FLOW] submitResponse: Intentando enviar respuestas.');
    this.surveyResponseForm.markAllAsTouched();

    // Revalidar el formulario después de marcar todo como tocado para que los errores se muestren correctamente
    if (this.surveyResponseForm.invalid) {
      console.log('[DEBUG FE] submitResponse: Formulario inválido. Mostrando errores.');
      this.error.set('Por favor, completa todas las preguntas obligatorias.');
      return;
    }

    if (this.hasResponded()) {
      console.log('[DEBUG FE] submitResponse: hasResponded es TRUE. Ya se ha respondido. Deteniendo envío.');
      this.error.set('Ya has respondido a esta encuesta desde este dispositivo. ¡Gracias por tu participación!');
      this.surveyResponseForm.disable();
      return;
    }

    const filteredResponses: { [key: string]: any } = {};
    this.currentSurvey()?.questions.forEach(question => {
      // Como shouldShowQuestion ahora siempre es true, simplemente incluimos todas las preguntas
      const control = this.surveyResponseForm.get(question.id);
      if (control) { // Siempre debería existir el control si la pregunta está en el formulario
        if (control.value !== null && control.value !== undefined && control.value !== '' && !(Array.isArray(control.value) && control.value.length === 0)) {
          filteredResponses[question.id] = control.value;
        } else if (question.type === 'checkbox' && control.value === false) {
          // Si es un checkbox y su valor es false (desmarcado), inclúyelo
          filteredResponses[question.id] = false;
        }
        // No necesitamos manejar control.pristine aquí si no usamos lógica condicional para el envío
      }
    });
    console.log('[DEBUG FE] submitResponse: Respuestas filtradas:', filteredResponses);

    // Re-validación de preguntas obligatorias visible (ahora todas son visibles)
    let allRequiredQuestionsAnswered = true;
    this.currentSurvey()?.questions.forEach(question => {
      if (question.required) { // Ya no necesitamos shouldShowQuestion aquí
        const responseValue = filteredResponses[question.id];
        if (responseValue === null || responseValue === undefined || responseValue === '' || (Array.isArray(responseValue) && responseValue.length === 0)) {
          allRequiredQuestionsAnswered = false;
          // Marcar el control específico con error para visualización
          this.surveyResponseForm.get(question.id)?.markAsTouched();
          this.surveyResponseForm.get(question.id)?.setErrors({ 'required': true });
        }
      }
    });

    if (!allRequiredQuestionsAnswered) {
      this.error.set('Por favor, completa todas las preguntas obligatorias.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const responsePayload = {
      userId: this.anonymousUserId,
      answers: filteredResponses,
    };

    this.surveyService.submitSurveyResponse(this.activeSurveyId()!, responsePayload).subscribe({
      next: (response) => {
        console.log('[FLOW] Respuestas enviadas exitosamente:', response);
        this.loading.set(false);
        this.showSuccessMessage.set(true);
        this.hasResponded.set(true);
        this.surveyResponseForm.disable();
        this.surveyResponseForm.reset();
        // Al enviar con éxito, actualizamos el estado de la encuesta en la lista para que se marque como respondida
        this.updateSurveyStatusInList(this.activeSurveyId()!, true);
      },
      error: (err) => {
        console.error('[ERROR FE] en submitResponse: Error al enviar respuestas:', err);
        this.loading.set(false);
        if (err.status === 409) {
          console.log(`[DEBUG FE] submitResponse: Recibido 409 Conflict. Asumiendo que la encuesta ya fue respondida por este usuario.`);
          this.error.set('Ya has respondido a esta encuesta desde este dispositivo. ¡Gracias por tu participación!');
          this.hasResponded.set(true);
          this.surveyResponseForm.disable();
          this.updateSurveyStatusInList(this.activeSurveyId()!, true);
        } else {
          this.error.set('Error al enviar tu respuesta. Por favor, inténtalo de nuevo. Detalles: ' + (err.message || 'Error desconocido del servidor.'));
        }
      },
    });
  }

  setRating(questionId: string, rating: number): void {
    if (this.surveyResponseForm.enabled) {
      this.surveyResponseForm.get(questionId)?.setValue(rating);
    }
  }

  private updateSurveyStatusInList(surveyId: string, responded: boolean): void {
    console.log(`[DEBUG FE] Actualizando estado de encuesta ${surveyId} en la lista: hasRespondedForCurrentUser: ${responded}`);
    this.availableSurveys.update(surveys => {
      const updatedSurveys = surveys.map(survey =>
        survey.id === surveyId ? { ...survey, hasRespondedForCurrentUser: responded } : survey
      );
      console.log('[DEBUG FE] Nuevo array availableSurveys después de la actualización (antes de devolver):', updatedSurveys);
      return updatedSurveys;
    });
  }

  goBackToList(): void {
    console.log('[FLOW] goBackToList: Volviendo a la lista de encuestas.');
    this.router.navigate(['/encuestas']);
    this.activeSurveyId.set(null); // Esto disparará el efecto para recargar la lista
    this.currentSurvey.set(null);
    this.showSuccessMessage.set(false);
    this.error.set(null);
    this.hasResponded.set(false);
    this.isLoadingCheck.set(false);
    // Ya no llamamos a loadAvailableSurveys() aquí, el 'effect' lo hará cuando activeSurveyId cambie a null
    console.log('[FLOW] goBackToList: showSuccessMessage después de volver:', this.showSuccessMessage());
  }
}
