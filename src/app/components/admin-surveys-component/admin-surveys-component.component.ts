

import { Component, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SurveyService } from '../../services/survey.service';
import { ISurvey, IQuestion, ITemplate } from '../../models/survey';
import { v4 as uuidv4 } from 'uuid';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Router, RouterModule } from "@angular/router";


@Component({
  selector: 'app-admin-surveys',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
    ModalComponent,
    RouterModule,
  ],
  templateUrl: './admin-surveys-component.component.html',
  styleUrl: './admin-surveys-component.component.css',
})
export class AdminSurveysComponent implements OnInit {
  // === Propiedades para la gestión de pestañas ===
  activeTab = signal<'list' | 'add' | 'edit' | 'preview' | 'templates' | 'addTemplate' | 'editTemplate'>('list');
  sourceTabForPreview: 'list' | 'add' | 'edit' | 'preview' | 'templates' | 'addTemplate' | 'editTemplate' | null = null;

  // === Propiedades para Encuestas ===
  surveys = signal<ISurvey[]>([]);
  filteredSurveys = signal<ISurvey[]>([]);

  searchTerm: string = '';
  categoryFilter: string | null = null;
  statusFilter: 'active' | 'inactive' | null = null;

  surveyForm!: FormGroup;
  questionForm!: FormGroup;
  editForm!: FormGroup;
  editQuestionForm!: FormGroup;

  editingSurvey: ISurvey | null = null;
  previewingSurvey: ISurvey | null = null;
  previewResponses: { [key: string]: any } = {};

  // === Propiedades para Plantillas ===
  surveyTemplates = signal<ITemplate[]>([]);
  templateForm!: FormGroup;
  templateQuestionForm!: FormGroup;

  editingTemplate: ITemplate | null = null;

  // === Propiedades Generales ===
  lastSaved = signal<Date | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);


  showDeleteConfirmationModal: boolean = false;
  surveyToDelete: ISurvey | null = null;
  templateToDelete: ITemplate | null = null;
  deleteConfirmationMessage: string = '';

  showModalInput: boolean = false;
  modalInputTitle: string = '';
  modalInputMessage: string = '';
  modalInputPlaceholder: string = '';
  modalInputCurrentValue: string = ''; 
  modalInputCallback: ((value: string | null) => void) | null = null;

  showMessageModal: boolean = false;
  modalMessageTitle: string = '';
  modalMessage: string = '';

  constructor(private fb: FormBuilder, private surveyService: SurveyService) {}

  ngOnInit(): void {
    this.initForms();
    this.loadSurveys();
    this.loadTemplates();
  }

  // === Métodos de Gestión de Pestañas ===
  setActiveTab(tab: 'list' | 'add' | 'edit' | 'preview' | 'templates' | 'addTemplate' | 'editTemplate'): void {
    this.activeTab.set(tab);
    if (tab === 'add') {
      this.resetAddForm();
    } else if (tab === 'list') {
      this.loadSurveys();
    } else if (tab === 'templates') {
      this.loadTemplates();
    } else if (tab === 'addTemplate') {
      this.resetAddTemplateForm();
    }
  }

  // === Métodos de Carga (Encuestas y Plantillas) ===
  loadSurveys(): void {
    this.loading.set(true);
    this.error.set(null);
    console.log('Iniciando carga de encuestas...');
    this.surveyService.getSurveys().subscribe({
      next: (data: ISurvey[]) => {
        console.log('Datos brutos de encuestas cargados desde el backend (AdminSurveysComponent):', JSON.parse(JSON.stringify(data)));
        this.surveys.set(data.sort((a: ISurvey, b: ISurvey) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        }));
        this.applyFilters();
        this.loading.set(false);
        console.log('Encuestas procesadas y filtradas (AdminSurveysComponent):', this.filteredSurveys());
      },
      error: (err: any) => {
        console.error('Error al cargar encuestas (AdminSurveysComponent):', err);
        this.error.set('Error al cargar encuestas. Inténtalo de nuevo.');
        this.loading.set(false);
      },
    });
  }


  loadTemplates(): void {
    this.loading.set(true);
    this.error.set(null);
    this.surveyService.getTemplates().subscribe({
      next: (data: ITemplate[]) => {
        console.log('Datos brutos de plantillas cargadas desde el backend (AdminSurveysComponent):', JSON.parse(JSON.stringify(data)));
        this.surveyTemplates.set(data.sort((a: ITemplate, b: ITemplate) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        }));
        this.loading.set(false);
        console.log('Plantillas procesadas (AdminSurveysComponent):', this.surveyTemplates());
      },
      error: (err: any) => {
        console.error('Error al cargar plantillas (AdminSurveysComponent):', err);
        this.error.set('No se pudieron cargar las plantillas de encuesta.');
        this.loading.set(false);
        this.showErrorMessage('Error de Carga', 'No se pudieron cargar las plantillas de encuesta.');
      }
    });
  }

  applyFilters(): void {
    let tempSurveys = this.surveys();

    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempSurveys = tempSurveys.filter(
        (survey) =>
          survey.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          survey.description?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (this.categoryFilter) {
      tempSurveys = tempSurveys.filter((survey) => survey.category === this.categoryFilter);
    }

    if (this.statusFilter !== null) {
      const isActive = this.statusFilter === 'active';
      tempSurveys = tempSurveys.filter((survey) => !!survey.active === isActive);
    }

    this.filteredSurveys.set(tempSurveys);
  }

  // === Inicialización de Formularios ===
  initForms(): void {
    this.surveyForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['satisfaccion', Validators.required],
      theme: ['default', Validators.required],
      expirationDate: [null],
      questions: this.fb.array([]),
    });

    this.questionForm = this.fb.group({
      id: [uuidv4()],
      text: ['', Validators.required],
      description: [''],
      type: ['text', Validators.required],
      required: [false],
      options: this.fb.array([]),
      // conditionalLogic: [null], // Eliminado
    });

    this.editForm = this.fb.group({
      id: [''],
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['satisfaccion', Validators.required],
      theme: ['default', Validators.required],
      expirationDate: [null],
      questions: this.fb.array([]),
      active: [true],
    });

    this.editQuestionForm = this.fb.group({
      id: [uuidv4()],
      text: ['', Validators.required],
      description: [''],
      type: ['text', Validators.required],
      required: [false],
      options: this.fb.array([]),
      // conditionalLogic: [null], // Eliminado
    });

    this.templateForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['satisfaccion', Validators.required],
      questions: this.fb.array([]),
    });

    this.templateQuestionForm = this.fb.group({
      id: [uuidv4()],
      text: ['', Validators.required],
      description: [''],
      type: ['text', Validators.required],
      required: [false],
      options: this.fb.array([]),
      // conditionalLogic: [null], // Eliminado
    });
  }

  private createQuestionFormGroup(question: IQuestion | any): FormGroup {
    const optionsArray = Array.isArray(question.options) ? question.options : [];
    return this.fb.group({
      id: [question.id || uuidv4()],
      text: [question.text, Validators.required],
      description: [question.description || ''],
      type: [question.type, Validators.required],
      required: [question.required || false],
      options: this.fb.array(optionsArray.map((o: string) => this.fb.control(o))),
    });
  }

  getOptionsFormArray(questionForm: FormGroup): FormArray {
    return questionForm.get('options') as FormArray;
  }

  asFormControl(control: AbstractControl): FormControl {
    return control as FormControl;
  }

  // === Getters para FormArrays de Preguntas de Encuestas ===
  get questionsFormArray(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  get editQuestionsFormArray(): FormArray {
    return this.editForm.get('questions') as FormArray;
  }

  get questionOptionsFormArray(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  get editQuestionOptionsFormArray(): FormArray {
    return this.editQuestionForm.get('options') as FormArray;
  }

  // === Getters para FormArrays de Preguntas de Plantillas ===
  get templateQuestionsFormArray(): FormArray {
    return this.templateForm.get('questions') as FormArray;
  }

  get templateQuestionOptionsFormArray(): FormArray {
    return this.templateQuestionForm.get('options') as FormArray;
  }

  // === Métodos para Opciones de Preguntas ===
  addOptionToQuestion(formType: 'add' | 'edit' = 'add'): void {
    const optionsArray = formType === 'add' ? this.questionOptionsFormArray : this.editQuestionOptionsFormArray;
    optionsArray.push(this.fb.control(''));
    this.lastSaved.set(new Date());
    console.log(`Opciones actuales (${formType}):`, optionsArray.value);
  }

  removeOptionFromQuestion(index: number, formType: 'add' | 'edit' = 'add'): void {
    const optionsArray = formType === 'add' ? this.questionOptionsFormArray : this.editQuestionOptionsFormArray;
    optionsArray.removeAt(index);
    this.lastSaved.set(new Date());
    console.log(`Opciones actuales (${formType}) después de eliminar:`, optionsArray.value);
  }

  addOptionToTemplateQuestion(): void {
    this.templateQuestionOptionsFormArray.push(this.fb.control(''));
    this.lastSaved.set(new Date());
    console.log('Opciones actuales de la plantilla:', this.templateQuestionOptionsFormArray.value);
  }

  removeOptionFromTemplateQuestion(index: number): void {
    this.templateQuestionOptionsFormArray.removeAt(index);
    this.lastSaved.set(new Date());
    console.log('Opciones actuales de la plantilla después de eliminar:', this.templateQuestionOptionsFormArray.value);
  }

  // === Métodos para Añadir/Eliminar Preguntas ===
  addQuestion(formType: 'add' | 'edit' = 'add'): void {
    let sourceQuestionForm: FormGroup;
    let targetQuestionsArray: FormArray;

    if (formType === 'add') {
      sourceQuestionForm = this.questionForm;
      targetQuestionsArray = this.questionsFormArray;
    } else {
      sourceQuestionForm = this.editQuestionForm;
      targetQuestionsArray = this.editQuestionsFormArray;
    }

    sourceQuestionForm.markAllAsTouched();

    if (sourceQuestionForm.valid) {
      const newQuestionData = sourceQuestionForm.value as IQuestion;
      console.log(`Datos de la NUEVA pregunta (${formType}) ANTES de añadir al FormArray:`, JSON.parse(JSON.stringify(newQuestionData)));
      const newQuestionGroup = this.createQuestionFormGroup(newQuestionData);
      targetQuestionsArray.push(newQuestionGroup);

      sourceQuestionForm.reset({
        id: uuidv4(),
        text: '',
        description: '',
        type: 'text',
        required: false,
      });
      (sourceQuestionForm.get('options') as FormArray).clear();

      this.lastSaved.set(new Date());
      console.log(`Preguntas actuales en ${formType} form (después de añadir):`, targetQuestionsArray.value);
    } else {
      this.showErrorMessage('Validación de Pregunta', 'Por favor, completa el texto y tipo de la pregunta antes de añadirla.');
      if (this.questionsFormArray.length === 0) {
        console.warn('Intento de añadir encuesta sin preguntas.');
      }
    }
  }

  removeQuestion(index: number, formType: 'add' | 'edit' = 'add'): void {
    const targetQuestionsArray = formType === 'add' ? this.questionsFormArray : this.editQuestionsFormArray;
    if (targetQuestionsArray.length > 0) {
      targetQuestionsArray.removeAt(index);
      this.lastSaved.set(new Date());
      console.log(`Pregunta eliminada. Preguntas restantes (${formType}):`, targetQuestionsArray.value);
    }
  }

  duplicateQuestion(question: IQuestion, formType: 'add' | 'edit' = 'add'): void {
    const duplicatedQuestion: IQuestion = { ...question, id: uuidv4() };
    if (duplicatedQuestion.options) {
      duplicatedQuestion.options = [...duplicatedQuestion.options];
    }

    const targetQuestionsArray = formType === 'add' ? this.questionsFormArray : this.editQuestionsFormArray;
    targetQuestionsArray.push(this.createQuestionFormGroup(duplicatedQuestion));

    this.lastSaved.set(new Date());
    console.log(`Pregunta duplicada. Preguntas actuales (${formType}):`, targetQuestionsArray.value);
  }

  dropQuestion(event: CdkDragDrop<IQuestion[]>, formType: 'add' | 'edit' = 'add'): void {
    const targetQuestionsArray = formType === 'add' ? this.questionsFormArray : this.editQuestionsFormArray;

    const questionsAsArray = targetQuestionsArray.controls.map(control => control.value as IQuestion);
    moveItemInArray(questionsAsArray, event.previousIndex, event.currentIndex);

    targetQuestionsArray.clear();
    questionsAsArray.forEach((q: IQuestion) => {
      targetQuestionsArray.push(this.createQuestionFormGroup(q));
    });

    this.lastSaved.set(new Date());
    console.log(`Orden de preguntas cambiado (${formType}):`, targetQuestionsArray.value);
  }

  addTemplateQuestion(): void {
    this.templateQuestionForm.markAllAsTouched();

    if (this.templateQuestionForm.valid) {
      const newQuestionData = this.templateQuestionForm.value as IQuestion;
      console.log('Datos de la NUEVA pregunta (plantilla) ANTES de añadir al FormArray:', JSON.parse(JSON.stringify(newQuestionData)));
      const newQuestionGroup = this.createQuestionFormGroup(newQuestionData);
      this.templateQuestionsFormArray.push(newQuestionGroup);

      this.templateQuestionForm.reset({
        id: uuidv4(),
        text: '',
        description: '',
        type: 'text',
        required: false,
      });
      this.templateQuestionOptionsFormArray.clear();

      this.lastSaved.set(new Date());
      console.log('Preguntas actuales de la plantilla (después de añadir):', this.templateQuestionsFormArray.value);
    } else {
      this.showErrorMessage('Validación de Pregunta', 'Por favor, completa el texto y tipo de la pregunta antes de añadirla a la plantilla.');
    }
  }

  removeTemplateQuestion(index: number): void {
    if (this.templateQuestionsFormArray.length > 0) {
      this.templateQuestionsFormArray.removeAt(index);
      this.lastSaved.set(new Date());
      console.log('Plantilla: Pregunta eliminada. Preguntas restantes:', this.templateQuestionsFormArray.value);
    }
  }

  duplicateTemplateQuestion(question: IQuestion): void {
    const duplicatedQuestion: IQuestion = { ...question, id: uuidv4() };
    if (duplicatedQuestion.options) {
      duplicatedQuestion.options = [...duplicatedQuestion.options];
    }
    this.templateQuestionsFormArray.push(this.createQuestionFormGroup(duplicatedQuestion));
    this.lastSaved.set(new Date());
    console.log('Plantilla: Pregunta duplicada. Preguntas actuales:', this.templateQuestionsFormArray.value);
  }

  dropTemplateQuestion(event: CdkDragDrop<IQuestion[]>): void {
    const questionsAsArray = this.templateQuestionsFormArray.controls.map(control => control.value as IQuestion);
    moveItemInArray(questionsAsArray, event.previousIndex, event.currentIndex);

    this.templateQuestionsFormArray.clear();
    questionsAsArray.forEach((q: IQuestion) => {
      this.templateQuestionsFormArray.push(this.createQuestionFormGroup(q));
    });
    this.lastSaved.set(new Date());
    console.log('Plantilla: Orden de preguntas cambiado:', this.templateQuestionsFormArray.value);
  }


  // === Reset de Formularios ===
  resetAddForm(): void {
    this.surveyForm.reset({
      title: '',
      description: '',
      category: 'satisfaccion',
      theme: 'default',
      expirationDate: null,
      questions: [],
    });
    this.questionsFormArray.clear();

    this.questionForm.reset({
      id: uuidv4(),
      text: '',
      description: '',
      type: 'text',
      required: false,
    });
    this.questionOptionsFormArray.clear();

    this.lastSaved.set(null);
    console.log('Formulario de creación de encuesta reiniciado.');
  }

  resetAddTemplateForm(): void {
    this.templateForm.reset({
      id: '',
      name: '',
      description: '',
      category: 'satisfaccion',
      questions: [],
    });
    this.templateQuestionsFormArray.clear();

    this.templateQuestionForm.reset({
      id: uuidv4(),
      text: '',
      description: '',
      type: 'text',
      required: false,
    });
    this.templateQuestionOptionsFormArray.clear();

    this.editingTemplate = null;
    this.lastSaved.set(null);
    console.log('Formulario de creación de plantilla reiniciado.');
  }

  // === Métodos de CRUD para Encuestas ===
  addSurvey(): void {
    this.surveyForm.markAllAsTouched();
    if (this.surveyForm.valid && this.questionsFormArray.length > 0) {
      this.loading.set(true);
      this.error.set(null);
      const newSurveyData: ISurvey = {
        ...this.surveyForm.value,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: uuidv4()
      };

      console.log('Datos COMPLETOS de la encuesta ANTES de enviar a crear (AdminSurveysComponent):', JSON.parse(JSON.stringify(newSurveyData)));
      this.surveyService.createSurvey(newSurveyData).subscribe({
        next: (response: ISurvey) => {
          this.showSuccessMessage('Éxito', 'Encuesta creada exitosamente!');
          this.resetAddForm();
          this.setActiveTab('list');
          this.loading.set(false);
          console.log('Respuesta de creación de encuesta (AdminSurveysComponent):', response);
        },
        error: (err: any) => {
          console.error('Error al crear encuesta (AdminSurveysComponent):', err);
          this.error.set('Error al crear la encuesta. Por favor, inténtalo de nuevo.');
          this.showErrorMessage('Error de Creación', 'Error al crear la encuesta. Por favor, inténtalo de nuevo.');
          this.loading.set(false);
        },
      });
    } else {
      this.showErrorMessage('Error de Formulario', 'Por favor, completa todos los campos obligatorios y añade al menos una pregunta.');
      if (this.questionsFormArray.length === 0) {
        console.warn('Intento de añadir encuesta sin preguntas.');
      }
    }
  }

  startEdit(survey: ISurvey): void {
    this.editingSurvey = { ...survey };
    console.log('Encuesta SELECCIONADA para editar (AdminSurveysComponent):', JSON.parse(JSON.stringify(survey)));
    this.editForm.patchValue({
      id: survey.id,
      title: survey.title,
      description: survey.description,
      category: survey.category,
      theme: survey.theme,
      expirationDate: survey.expirationDate ? new Date(survey.expirationDate).toISOString().split('T')[0] : null,
      active: survey.active,
    });

    const editQuestions = this.editForm.get('questions') as FormArray;
    editQuestions.clear();
    survey.questions?.forEach((q) => {
      editQuestions.push(this.createQuestionFormGroup(q));
    });
    console.log('Preguntas en formulario de edición (AdminSurveysComponent) después de cargar:', editQuestions.value);

    this.editQuestionForm.reset({
      id: uuidv4(),
      text: '',
      description: '',
      type: 'text',
      required: false,
    });
    (this.editQuestionForm.get('options') as FormArray).clear();

    this.setActiveTab('edit');
  }

  saveEdit(): void {
    this.editForm.markAllAsTouched();
    if (this.editForm.valid && this.editQuestionsFormArray.length > 0) {
      this.loading.set(true);
      this.error.set(null);
      const updatedSurveyData: Partial<ISurvey> = {
        ...this.editForm.value,
        updatedAt: new Date().toISOString(),
        expirationDate: this.editForm.get('expirationDate')?.value ?
          new Date(this.editForm.get('expirationDate')?.value).toISOString() : null,
      };
      const surveyId = updatedSurveyData.id;
      delete updatedSurveyData.id;

      if (!surveyId) {
        this.showErrorMessage('Error de Edición', 'No se encontró el ID de la encuesta para actualizar.');
        this.loading.set(false);
        return;
      }
      console.log('Datos COMPLETOS de la encuesta ANTES de enviar a actualizar (AdminSurveysComponent):', JSON.parse(JSON.stringify(updatedSurveyData)));
      this.surveyService.updateSurvey(surveyId, updatedSurveyData).subscribe({
        next: (response: ISurvey) => {
          this.showSuccessMessage('Éxito', 'Encuesta actualizada exitosamente!');
          this.editingSurvey = null;
          this.setActiveTab('list');
          this.loading.set(false);
          console.log('Respuesta de actualización de encuesta (AdminSurveysComponent):', response);
        },
        error: (err: any) => {
          console.error('Error al actualizar encuesta (AdminSurveysComponent):', err);
          this.error.set('Error al actualizar la encuesta. Por favor, inténtalo de nuevo.');
          this.showErrorMessage('Error de Actualización', 'Error al actualizar la encuesta. Por favor, inténtalo de nuevo.');
          this.loading.set(false);
        },
      });
    } else {
      this.showErrorMessage('Error de Edición', 'Por favor, completa todos los campos obligatorios y asegúrate de tener preguntas.');
      if (this.editQuestionsFormArray.length === 0) {
        console.warn('Intento de guardar encuesta sin preguntas en edición.');
      }
    }
  }

  cancelEdit(): void {
    this.editingSurvey = null;
    this.setActiveTab('list');
    console.log('Edición de encuesta cancelada.');
  }

  toggleActive(survey: ISurvey): void {
    this.loading.set(true);
    this.error.set(null);
    const newStatus = !survey.active;
    this.surveyService.toggleSurveyStatus(survey.id!, newStatus).subscribe({
      next: (response: any) => {
          this.showSuccessMessage('Estado Actualizado', `Encuesta ${newStatus ? 'activada' : 'desactivada'} exitosamente!`);
          this.loadSurveys();
          this.loading.set(false);
          console.log(`Estado de encuesta toggled. ID: ${survey.id}, Nuevo estado: ${newStatus}`);
      },
      error: (err: any) => {
          console.error('Error al cambiar estado (AdminSurveysComponent):', err);
          this.error.set('Error al cambiar el estado de la encuesta.');
          this.showErrorMessage('Error de Estado', 'Error al cambiar el estado de la encuesta.');
          this.loading.set(false);
      },
    });
  }

  isDeleteSurveyModalOpen(): boolean {
    return this.showDeleteConfirmationModal && this.surveyToDelete !== null;
  }

  isDeleteTemplateModalOpen(): boolean {
    return this.showDeleteConfirmationModal && this.templateToDelete !== null;
  }

  showDeleteConfirm(survey: ISurvey): void {
    this.surveyToDelete = survey;
    this.templateToDelete = null; // Asegúrate de que solo uno esté activo
    this.deleteConfirmationMessage = `¿Estás seguro de que deseas eliminar la encuesta '${survey.title}'? Esta acción no se puede deshacer.`;
    this.showDeleteConfirmationModal = true;
    console.log('Modal de confirmación de eliminación de encuesta mostrado.');
  }

  confirmDeleteSurvey(): void {
    if (this.surveyToDelete) {
      this.loading.set(true);
      this.error.set(null);
      this.surveyService.deleteSurvey(this.surveyToDelete.id!).subscribe({
        next: () => {
          this.showSuccessMessage('Éxito', 'Encuesta eliminada exitosamente.');
          this.loadSurveys();
          this.loading.set(false);
          this.surveyToDelete = null;
          this.deleteConfirmationMessage = '';
          console.log('Encuesta eliminada.');
        },
        error: (err: any) => {
          console.error('Error al eliminar encuesta (AdminSurveysComponent):', err);
          this.error.set('Error al eliminar la encuesta. Por favor, inténtalo de nuevo.');
          this.showErrorMessage('Error de Eliminación', 'Error al eliminar la encuesta. Por favor, inténtalo de nuevo.');
          this.loading.set(false);
        },
      });
    } else if (this.templateToDelete) { // Lógica para eliminar plantilla
      this.loading.set(true);
      this.error.set(null);
      this.surveyService.deleteTemplate(this.templateToDelete.id!).subscribe({
        next: () => {
          this.showSuccessMessage('Éxito', 'Plantilla eliminada exitosamente.');
          this.loadTemplates();
          this.loading.set(false);
          this.templateToDelete = null;
          this.deleteConfirmationMessage = '';
          console.log('Plantilla eliminada.');
        },
        error: (err: any) => {
          console.error('Error al eliminar plantilla (AdminSurveysComponent):', err);
          this.error.set('Error al eliminar la plantilla. Inténtalo de nuevo.');
          this.showErrorMessage('Error de Eliminación', 'Error al eliminar la plantilla. Inténtalo de nuevo.');
          this.loading.set(false);
        },
      });
    }
    this.showDeleteConfirmationModal = false;
  }

  cancelDeleteSurvey(): void {
    this.showDeleteConfirmationModal = false;
    this.surveyToDelete = null;
    this.templateToDelete = null; // Clear both just in case
    this.deleteConfirmationMessage = '';
    console.log('Eliminación de encuesta/plantilla cancelada.');
  }

  // === Métodos de CRUD para Plantillas ===
  startAddTemplate(): void {
    this.resetAddTemplateForm();
    this.setActiveTab('addTemplate');
    console.log('Iniciando adición de nueva plantilla.');
  }

  startEditTemplate(template: ITemplate): void {
    this.editingTemplate = { ...template };
    console.log('Plantilla SELECCIONADA para editar (AdminSurveysComponent):', JSON.parse(JSON.stringify(template)));
    this.templateForm.patchValue({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
    });

    this.templateQuestionsFormArray.clear();
    template.questions?.forEach((q) => {
      this.templateQuestionsFormArray.push(this.createQuestionFormGroup(q));
    });
    console.log('Preguntas en formulario de edición de plantilla (AdminSurveysComponent) después de cargar:', this.templateQuestionsFormArray.value);

    this.templateQuestionForm.reset({
      id: uuidv4(),
      text: '',
      description: '',
      type: 'text',
      required: false,
    });
    this.templateQuestionOptionsFormArray.clear();

    this.setActiveTab('editTemplate');
  }

  saveTemplate(): void {
    this.templateForm.markAllAsTouched();
    if (this.templateForm.valid && this.templateQuestionsFormArray.length > 0) {
      this.loading.set(true);
      this.error.set(null);

      const templateData: Partial<ITemplate> = {
        ...this.templateForm.value,
        questions: this.templateQuestionsFormArray.value,
      };

      if (this.editingTemplate?.id) {
        const templateId = this.editingTemplate.id;
        templateData.updatedAt = new Date().toISOString();
        delete templateData.id;

        console.log('Datos COMPLETOS de la plantilla ANTES de enviar a actualizar (AdminSurveysComponent):', JSON.parse(JSON.stringify(templateData)));
        this.surveyService.updateTemplate(templateId, templateData).subscribe({
          next: (response: ITemplate) => {
            this.showSuccessMessage('Éxito', 'Plantilla actualizada exitosamente!');
            this.editingTemplate = null;
            this.setActiveTab('templates');
            this.loadTemplates();
            this.loading.set(false);
            console.log('Respuesta de actualización de plantilla (AdminSurveysComponent):', response);
          },
          error: (err: any) => {
            console.error('Error al actualizar plantilla (AdminSurveysComponent):', err);
            this.error.set('Error al actualizar la plantilla. Inténtalo de nuevo.');
            this.showErrorMessage('Error de Actualización', 'Error al actualizar la plantilla. Inténtalo de nuevo.');
            this.loading.set(false);
          },
        });
      } else {
        const newTemplateData: Omit<ITemplate, 'id' | 'createdAt' | 'updatedAt'> = {
          name: templateData.name!,
          description: templateData.description!,
          category: templateData.category!,
          questions: templateData.questions!,
        };
        console.log('Datos COMPLETOS de la plantilla ANTES de enviar a crear (AdminSurveysComponent):', JSON.parse(JSON.stringify(newTemplateData)));
        this.surveyService.createTemplate(newTemplateData).subscribe({
          next: (response: ITemplate) => {
            this.showSuccessMessage('Éxito', 'Plantilla creada exitosamente!');
            this.resetAddTemplateForm();
            this.setActiveTab('templates');
            this.loadTemplates();
            this.loading.set(false);
            console.log('Respuesta de creación de plantilla (AdminSurveysComponent):', response);
          },
          error: (err: any) => {
            console.error('Error al crear plantilla (AdminSurveysComponent):', err);
            this.error.set('Error al crear la plantilla. Inténtalo de nuevo.');
            this.showErrorMessage('Error de Creación', 'Error al crear la plantilla. Inténtalo de nuevo.');
            this.loading.set(false);
          },
        });
      }
    } else {
      this.showErrorMessage('Error de Formulario', 'Por favor, completa todos los campos obligatorios y añade al menos una pregunta a la plantilla.');
    }
  }

  cancelTemplateEdit(): void {
    this.editingTemplate = null;
    this.resetAddTemplateForm();
    this.setActiveTab('templates');
    console.log('Edición de plantilla cancelada.');
  }

  showDeleteTemplateConfirm(template: ITemplate): void {
    this.templateToDelete = template;
    this.surveyToDelete = null; // Asegúrate de que solo uno esté activo
    this.deleteConfirmationMessage = `¿Estás seguro de que deseas eliminar la plantilla '${template.name}'? Esto no afectará a las encuestas ya creadas con ella.`;
    this.showDeleteConfirmationModal = true;
    console.log('Modal de confirmación de eliminación de plantilla mostrado.');
  }

  // === Métodos de Previsualización ===
  previewSurvey(surveyData: any): void {
    this.previewingSurvey = { ...surveyData };
    this.previewResponses = {};

    this.sourceTabForPreview = this.activeTab();
    this.activeTab.set('preview');
    console.log('Datos de la encuesta en PREVISUALIZACIÓN (AdminSurveysComponent):', JSON.parse(JSON.stringify(this.previewingSurvey)));
    console.log('Preguntas en PREVISUALIZACIÓN (AdminSurveysComponent):', JSON.parse(JSON.stringify(this.previewingSurvey?.questions)));
  }

  // shouldShowQuestion método eliminado (ya no hay lógica condicional)
  shouldShowQuestion(question: IQuestion, responses: { [key: string]: any }): boolean {
    return true; // Si no hay lógica condicional, la pregunta siempre se muestra
  }

  // === Aplicar Plantilla a Encuesta ===
  applyTemplate(template: ITemplate, isEdit: boolean = false): void {
    this.modalInputTitle = 'Confirmar Aplicación de Plantilla';
    this.modalInputMessage = `¿Estás seguro de que quieres aplicar la plantilla '${template.name}'? Se reemplazarán TODAS las preguntas actuales de la encuesta.`;
    this.modalInputPlaceholder = ''; // Eliminamos el placeholder
    this.modalInputCurrentValue = ''; // Aseguramos que el valor esté vacío al abrir
    this.showModalInput = true;

    this.modalInputCallback = (confirmationValue: string | null) => {
      // Si confirmationValue es null (del botón de Cancelar), entonces cancela.
      // Si es cualquier otro valor (del botón de Confirmar), entonces procede.
      if (confirmationValue === null) {
        this.showInfoMessage('Cancelado', 'Aplicación de plantilla cancelada.');
      } else {
        const targetForm = isEdit ? this.editForm : this.surveyForm;
        const currentQuestions = (targetForm.get('questions') as FormArray);
        currentQuestions.clear();

        template.questions.forEach(q => {
          const questionToAdd: IQuestion = { ...q, id: uuidv4() };
          currentQuestions.push(this.createQuestionFormGroup(questionToAdd));
        });

        this.lastSaved.set(new Date());
        this.showInfoMessage('Plantilla Aplicada', `Plantilla "${template.name}" aplicada exitosamente.`);
        console.log(`Plantilla "${template.name}" aplicada. Preguntas en formulario:`, currentQuestions.value);

        const questionFormToReset = isEdit ? this.editQuestionForm : this.questionForm;
        questionFormToReset.reset({
          id: uuidv4(),
          text: '',
          description: '',
          type: 'text',
          required: false,

        });
        (questionFormToReset.get('options') as FormArray).clear();
      }
      this.showModalInput = false; // Cierra el modal
      this.modalInputCallback = null; // Limpia el callback
    };
  }

  handleModalInputConfirm(): void {
    if (this.modalInputCallback) {
      this.modalInputCallback('confirmed'); 
    }
  }

  handleModalInputCancel(): void {
    if (this.modalInputCallback) {
      this.modalInputCallback(null);
    }
  }

  // === Métodos de Modal de Mensajes ===
  showSuccessMessage(title: string, message: string): void {
    this.modalMessageTitle = title;
    this.modalMessage = message;
    this.showMessageModal = true;
    console.log(`Mensaje de Éxito: ${title} - ${message}`);
  }

  showErrorMessage(title: string, message: string): void {
    this.modalMessageTitle = title;
    this.modalMessage = message;
    this.showMessageModal = true;
    console.error(`Mensaje de Error: ${title} - ${message}`);
  }

  showInfoMessage(title: string, message: string): void {
    this.modalMessageTitle = title;
    this.modalMessage = message;
    this.showMessageModal = true;
    console.log(`Mensaje de Información: ${title} - ${message}`);
  }
}
