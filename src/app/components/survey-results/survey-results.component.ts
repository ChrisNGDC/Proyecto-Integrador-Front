
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, Observable, combineLatest, interval, Subscription } from 'rxjs';
import { takeUntil, switchMap, tap, filter, startWith } from 'rxjs/operators';

// Importa tu servicio de encuestas y las interfaces de modelos
import { SurveyService } from '../../services/survey.service';
import { ISurvey, IQuestion, ISurveyResponse } from '../../models/survey';

// IMPORTS DE CHART.JS DIRECTOS
import { Chart, registerables, ChartConfiguration, ChartData, ChartType, ChartOptions } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

// IMPORTE PARA EXCEL (SheetJS)
import * as XLSX from 'xlsx';

// Registrar los elementos de Chart.js necesarios globalmente.
Chart.register(...registerables);
Chart.register(DataLabelsPlugin);

interface IProcessedQuestionResult {
  questionText: string;
  type: string;
  chartType: ChartType | 'none';
  chartData?: ChartData;
  chartOptions?: ChartOptions;
  chartPlugins?: any[];
  rawData: string[];
  averageRating?: string;
  chartInstance?: Chart;
}


@Component({
  selector: 'app-survey-results',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './survey-results.component.html',
  styleUrls: ['./survey-results.component.css']
})
export class SurveyResultsComponent implements OnInit, AfterViewInit, OnDestroy {
  surveyId: string | null = null;
  survey: ISurvey | null = null;
  responses: ISurveyResponse[] = [];

  isLoading = true;
  errorMessage: string | null = null;

  processedQuestionResults: { [questionId: string]: IProcessedQuestionResult } = {};

  private destroy$ = new Subject<void>();
  private initialLoadComplete = false;

  private pollingIntervalMs = 50000; // 50 segundos para un mejor rendimiento
  private pollingSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyService: SurveyService
  ) {}

  ngOnInit(): void {
    this.surveyId = this.route.snapshot.paramMap.get('id');
    if (this.surveyId) {
      this.startPolling(this.surveyId);
    } else {
      this.errorMessage = 'ID de encuesta no proporcionado.';
      this.isLoading = false;
    }
  }

  ngAfterViewInit(): void {
    if (this.survey && this.responses.length > 0 && !this.isLoading && this.initialLoadComplete) {
      setTimeout(() => {
        this.drawCharts();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    for (const questionId in this.processedQuestionResults) {
      if (this.processedQuestionResults.hasOwnProperty(questionId)) {
        this.processedQuestionResults[questionId].chartInstance?.destroy();
      }
    }
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startPolling(surveyId: string): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }

    this.pollingSubscription = interval(this.pollingIntervalMs).pipe(
      startWith(0),
      switchMap(() => {
        this.isLoading = true;
        this.errorMessage = null;
        return combineLatest([
          this.surveyService.getSurveyById(surveyId),
          this.surveyService.getSurveyResponses(surveyId)
        ]);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([survey, responses]) => {
        this.survey = survey;
        this.responses = responses;
        console.log('Polling: Respuestas actualizadas. Longitud:', this.responses.length);
        this.processResponses();
        this.isLoading = false;
        this.initialLoadComplete = true;
        setTimeout(() => {
          this.drawCharts();
        }, 0);
      },
      error: (err) => {
        console.error('Error durante el polling de resultados de la encuesta:', err);
        this.errorMessage = 'No se pudieron cargar los resultados de la encuesta. Inténtalo de nuevo.';
        this.isLoading = false;
        this.initialLoadComplete = true;
      }
    });
  }

  refreshData(): void {
    if (this.surveyId) {
      if (this.pollingSubscription) {
        this.pollingSubscription.unsubscribe();
      }
      this.loadSurveyResultsImmediate(this.surveyId);
    }
  }

  private loadSurveyResultsImmediate(surveyId: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    combineLatest([
      this.surveyService.getSurveyById(surveyId),
      this.surveyService.getSurveyResponses(surveyId)
    ]).pipe(
      filter(([survey, responses]) => survey !== null && responses !== null),
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([survey, responses]) => {
        this.survey = survey;
        this.responses = responses;
        console.log('Carga manual: Respuestas cargadas. Longitud actual:', this.responses.length);
        this.processResponses();
        this.isLoading = false;
        this.initialLoadComplete = true;
        setTimeout(() => {
          this.drawCharts();
        }, 0);
        this.startPolling(surveyId);
      },
      error: (err) => {
        console.error('Error al cargar resultados de la encuesta (manual):', err);
        this.errorMessage = 'No se pudieron cargar los resultados de la encuesta. Inténtalo de nuevo más tarde.';
        this.isLoading = false;
        this.initialLoadComplete = true;
        this.startPolling(surveyId);
      }
    });
  }


  processResponses(): void {
    if (!this.survey) {
      console.warn('No hay encuesta para procesar.');
      this.processedQuestionResults = {};
      return;
    }

    for (const questionId in this.processedQuestionResults) {
      if (this.processedQuestionResults.hasOwnProperty(questionId)) {
        this.processedQuestionResults[questionId].chartInstance?.destroy();
      }
    }

    this.processedQuestionResults = {};

    if (this.responses.length === 0) {
      return;
    }

    this.survey.questions.forEach(question => {
      const initialResult: IProcessedQuestionResult = {
        questionText: question.text,
        type: question.type,
        chartType: 'none',
        rawData: [],
      };
      this.processedQuestionResults[question.id] = initialResult;

      const currentQuestionResult = this.processedQuestionResults[question.id];

      if (question.type === 'radio' || question.type === 'select') {
        const optionCounts: { [key: string]: number } = {};
        question.options?.forEach(option => optionCounts[option] = 0);
        optionCounts['Sin Respuesta'] = 0;

        this.responses.forEach(response => {
          const answer = response.answers[question.id];
          if (answer && typeof answer === 'string' && optionCounts.hasOwnProperty(answer)) {
            optionCounts[answer]++;
          } else {
            optionCounts['Sin Respuesta']++;
          }
        });

        const labels = Object.keys(optionCounts);
        const data = Object.values(optionCounts);
        const colors = this.getChartColors(labels.length);

        currentQuestionResult.chartType = 'pie';
        currentQuestionResult.chartData = {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: colors,
              hoverOffset: 4,
              borderWidth: 1,
              borderColor: '#ffffff',
            },
          ],
        };
        currentQuestionResult.chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: false,
              text: question.text,
              font: { size: 16 }
            },
            legend: {
              position: 'right',
              labels: {
                font: {
                  size: 14
                }
              }
            },
            datalabels: {
                formatter: (value: number, ctx: any) => {
                    const sum = (ctx.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
                    const percentage = (value * 100 / sum).toFixed(1) + '%';
                    return percentage;
                },
                color: '#fff',
                font: {
                    weight: 'bold',
                    size: 14
                }
            }
          }
        };
        currentQuestionResult.chartPlugins = [DataLabelsPlugin];

      } else if (question.type === 'checkbox') {
          const optionCounts: { [key: string]: number } = {
            'Sí': 0,
            'No': 0,
            'Sin Respuesta': 0
          };

          this.responses.forEach(response => {
            const answer = response.answers[question.id];
            if (answer === true) {
              optionCounts['Sí']++;
            } else if (answer === false) {
              optionCounts['No']++;
            } else {
              optionCounts['Sin Respuesta']++;
            }
          });

          const labels = ['Sí', 'No', 'Sin Respuesta'];
          const data = [optionCounts['Sí'], optionCounts['No'], optionCounts['Sin Respuesta']];
          const colors = ['#4CAF50', '#FF5722', '#9E9E9E'];

          currentQuestionResult.chartType = 'bar';
          currentQuestionResult.chartData = {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(color => this.adjustColor(color, -20)),
                borderWidth: 1,
                borderRadius: 5,
              },
            ],
          };
          currentQuestionResult.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'x',
            plugins: {
              title: {
                display: false,
                text: question.text,
                font: { size: 16 }
              },
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += context.parsed.y + ' respuestas';
                    }
                    return label;
                  }
                }
              }
            },
            // MOVED 'scales' TO THE TOP LEVEL OF chartOptions
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Opción',
                  font: { size: 14, weight: 'bold' },
                  color: '#4A5568'
                },
                grid: {
                  display: false
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Número de Respuestas',
                  font: { size: 14, weight: 'bold' },
                  color: '#4A5568'
                },
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                  font: { size: 12 }
                },
                grid: {
                  color: '#E2E8F0'
                }
              }
            }
          };

      } else if (question.type === 'rating') {
        const ratingCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let totalRating = 0;
        let numRatings = 0;

        this.responses.forEach(response => {
          const rating = response.answers[question.id];
          if (typeof rating === 'number' && rating >= 1 && rating <= 5) {
            ratingCounts[rating]++;
            totalRating += rating;
            numRatings++;
          }
        });

        const labels = ['1 Estrella', '2 Estrellas', '3 Estrellas', '4 Estrellas', '5 Estrellas'];
        const data = labels.map((_, index) => ratingCounts[index + 1] || 0);

        currentQuestionResult.chartType = 'bar';
        currentQuestionResult.chartData = {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: ['#FDD835', '#FBC02D', '#F9A825', '#F57F17', '#F0C200'],
              borderColor: ['#FDD835', '#FBC02D', '#F9A825', '#F57F17', '#F0C200'],
              borderWidth: 1,
              borderRadius: 5,
            },
          ],
        };
        currentQuestionResult.chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'x',
          plugins: {
            title: {
              display: false,
              text: question.text,
              font: { size: 16 }
            },
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                      label += ': ';
                  }
                  if (context.parsed.y !== null) {
                      label += context.parsed.y + ' respuestas';
                  }
                  return label;
                }
              }
            }
          },
          // MOVED 'scales' TO THE TOP LEVEL OF chartOptions
          scales: {
            x: {
              title: {
                display: true,
                text: 'Calificación (Estrellas)',
                font: { size: 14, weight: 'bold' },
                color: '#4A5568'
            },
              grid: {
                display: false
              }
            },
            y: {
              title: {
                display: true,
                text: 'Frecuencia',
                font: { size: 14, weight: 'bold' },
                color: '#4A5568'
              },
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                font: { size: 12 }
              },
              grid: {
                color: '#E2E8F0'
              }
            }
          }
        };
        currentQuestionResult.averageRating = numRatings > 0 ? (totalRating / numRatings).toFixed(2) : 'N/A';

      } else if (question.type === 'text' || question.type === 'date') {
        this.responses.forEach(response => {
          const answer = response.answers[question.id];
          if (answer) {
            currentQuestionResult.rawData.push(answer);
          }
        });
        currentQuestionResult.chartType = 'none';
      }
    });
  }

  drawCharts(): void {
    for (const questionId in this.processedQuestionResults) {
      if (this.processedQuestionResults.hasOwnProperty(questionId)) {
        this.processedQuestionResults[questionId].chartInstance?.destroy();
      }
    }

    if (!this.survey || this.responses.length === 0) {
      return;
    }

    this.survey.questions.forEach(question => {
      const result = this.processedQuestionResults[question.id];
      if (result && result.chartType !== 'none' && result.chartData && result.chartOptions) {
        const canvasElement = document.getElementById(`chart-${question.id}`) as HTMLCanvasElement;
        if (canvasElement) {
          const ctx = canvasElement.getContext('2d');
          if (ctx) {
            result.chartInstance = new Chart(ctx, {
              type: result.chartType as ChartType,
              data: result.chartData,
              options: result.chartOptions,
              plugins: result.chartPlugins || []
            });
          } else {
            console.error(`ERROR: No se pudo obtener el contexto 2D para el canvas de la pregunta ${question.id}`);
          }
        } else {
          console.warn(`WARN: Elemento canvas con id 'chart-${question.id}' no encontrado en el DOM.`);
        }
      }
    });
  }

  getChartColors(count: number): string[] {
    const palette = [
      '#6366F1',
      '#EF4444',
      '#FBBF24',
      '#10B981',
      '#8B5CF6',
      '#3B82F6',
      '#EC4899',
      '#F97316',
      '#6B7280',
      '#14B8A6',
      '#D946EF',
      '#A855F7',
    ];
    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  }

  private adjustColor(hex: string, lum: number): string {
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;

    let rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i*2,2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00"+c).substr(c.length);
    }
    return rgb;
  }

  goBackToList(): void {
    this.router.navigate(['/admin/encuestas']);
  }

  private cleanExcelName(name: string): string {
    let cleanedName = name.replace(/[\\/?*[\]:]/g, '_');
    cleanedName = cleanedName.substring(0, 31);
    cleanedName = cleanedName.replace(/^_|_$/g, '');
    return cleanedName || 'Hoja';
  }

  exportToExcel(): void {
    if (!this.survey || this.responses.length === 0) {
      console.warn('No hay datos de encuesta o respuestas para exportar.');
      return;
    }

    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    const ws_summary_data: any[][] = [];

    ws_summary_data.push(['Resultados de la Encuesta: ' + this.survey.title]);
    ws_summary_data.push([this.survey.description || '']);
    ws_summary_data.push([]);
    ws_summary_data.push(['Total de Respuestas Recibidas:', this.responses.length]);
    ws_summary_data.push([]);
    ws_summary_data.push(['Pregunta', 'Tipo', 'Categoría/Opción', 'Valor/Conteo', 'Calificación Promedio (Si aplica)']);

    const ws_text_date_data: any[][] = [['Pregunta', 'Respuesta Completa']];


    this.survey.questions.forEach(question => {
      const result = this.processedQuestionResults[question.id];
      if (result) {
        if (result.type === 'radio' || result.type === 'select') {
          if (result.chartData && result.chartData.labels && result.chartData.datasets && result.chartData.datasets[0]) {
            const labels = result.chartData.labels as string[];
            const data = result.chartData.datasets[0].data as number[];
            labels.forEach((label, index) => {
              ws_summary_data.push([
                question.text,
                'Opción Múltiple',
                label,
                data[index]
              ]);
            });
          }
        } else if (result.type === 'checkbox') {
            if (result.chartData && result.chartData.labels && result.chartData.datasets && result.chartData.datasets[0]) {
                const labels = result.chartData.labels as string[];
                const data = result.chartData.datasets[0].data as number[];
                labels.forEach((label, index) => {
                    ws_summary_data.push([
                        question.text,
                        'Selección Múltiple',
                        label,
                        data[index]
                    ]);
                });
            }
        } else if (result.type === 'rating') {
          if (result.averageRating) {
            ws_summary_data.push([
              question.text,
              'Calificación',
              'Promedio',
              result.averageRating,
              ''
            ]);
          }
          if (result.chartData && result.chartData.labels && result.chartData.datasets && result.chartData.datasets[0]) {
              const labels = result.chartData.labels as string[];
              const data = result.chartData.datasets[0].data as number[];
              labels.forEach((label, index) => {
                ws_summary_data.push([
                    question.text,
                    'Calificación Individual',
                    `${label} Estrellas`,
                    data[index],
                    ''
                ]);
            });
          }
        } else if (result.type === 'text' || result.type === 'date') {
          result.rawData.forEach(response => {
            ws_text_date_data.push([question.text, response]);
          });
        }
      }
    });

    const ws_summary: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_summary_data);
    XLSX.utils.book_append_sheet(wb, ws_summary, this.cleanExcelName('Resumen de Encuesta'));

    if (ws_text_date_data.length > 1) {
      const ws_text_date: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_text_date_data);
      XLSX.utils.book_append_sheet(wb, ws_text_date, this.cleanExcelName('Respuestas de Texto y Fecha'));
    }

    const cleanedSurveyTitle = this.cleanExcelName(this.survey.title);
    const fileName = `Resultados_Encuesta_${cleanedSurveyTitle}.xlsx`;

    XLSX.writeFile(wb, fileName);
  }
}
