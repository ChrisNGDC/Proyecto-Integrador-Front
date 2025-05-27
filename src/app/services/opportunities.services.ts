import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'; // Importa HttpParams
import { JobOpportunity } from '../models/job-opportunity';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators'; // Para un mejor manejo de errores

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {

  private http = inject(HttpClient);

  apiUrl = 'https://9ic7sy5v34.execute-api.us-east-1.amazonaws.com/job-opportunities';

  jobs = signal<JobOpportunity[]>([]);
  filteredJobs = signal<JobOpportunity[]>([]);
  selectedCategory = signal<string | null>(null);

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    })
  };

  // Cargar todas las oportunidades, ahora con un parámetro para "isAdmin"
  loadOpportunities(isAdmin: boolean = false): void {
    let params = new HttpParams();
    if (isAdmin) {
      params = params.set('status', 'all'); // Añade el parámetro de consulta
    }

    this.http.get<JobOpportunity[]>(this.apiUrl, { params: params }).pipe( // Pasa los parámetros
      catchError(error => {
        console.error('Error al cargar oportunidades:', error);
        return []; // Retorna un array vacío o maneja el error como prefieras
      })
    ).subscribe(jobs => {
      this.jobs.set(jobs);
      this.filteredJobs.set(jobs);
    });
  }

  // ... el resto de tus métodos (addOpportunity, updateOpportunity, filterByCategory)
  // no necesitan cambios a menos que el updateOpportunity necesite el ID de la URL
  // que en ese caso ya lo estas manejando

  addOpportunity(job: JobOpportunity): Observable<JobOpportunity> {
    return this.http.post<JobOpportunity>(this.apiUrl, job).pipe(
      catchError(error => {
        console.error('Error al agregar oportunidad:', error);
        throw error; // Propaga el error para que el componente lo maneje
      })
    );
  }

  updateOpportunity(job: JobOpportunity): Observable<JobOpportunity> {
    return this.http.put<JobOpportunity>(`${this.apiUrl}/${job.id}`, job).pipe(
      catchError(error => {
        console.error('Error al actualizar oportunidad:', error);
        throw error; // Propaga el error
      })
    );
  }

  filterByCategory(category: string) {
    if (category === 'Todos') {
      this.selectedCategory.set(null);
      this.filteredJobs.set(this.jobs());
    } else {
      this.selectedCategory.set(category);
      this.filteredJobs.set(this.jobs().filter(job => job.category === category));
    }
  }
}