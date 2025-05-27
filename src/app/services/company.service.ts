import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Company } from '../models/company.model'; // Asegúrate de crear este modelo
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private http = inject(HttpClient);

  // ¡Asegúrate de que esta URL sea correcta!
  private apiUrl = 'https://xzozan252g.execute-api.us-east-1.amazonaws.com/companies';

  companies = signal<Company[]>([]);

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
      // Agrega aquí tus headers de autenticación si son necesarios
      // 'x-api-key': 'tu-api-key',
      // 'Authorization': 'Bearer <token>'
    })
  };

  // Cargar todas las compañías desde la API
  loadCompanies(): void {
    this.http.get<Company[]>(this.apiUrl).subscribe({
      next: (companies) => {
        this.companies.set(companies);
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        // Aquí podrías agregar lógica para manejar el error
      }
    });
  }

  // Crear una nueva compañía en la API
  addCompany(company: Omit<Company, 'id'>): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, company);
  }

  // Obtener una compañía por su ID desde la API
  getCompanyById(id: number): Observable<Company | undefined> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`);
  }

  // Actualizar una compañía existente en la API (PUT)
  updateCompany(company: Company): Observable<Company> {
    return this.http.put<Company>(this.apiUrl, company);
  }

  // Actualizar parcialmente una compañía existente en la API (PATCH)
  patchCompany(id: number, company: Partial<Omit<Company, 'id'>>): Observable<Company> {
    return this.http.patch<Company>(`${this.apiUrl}/${id}`, company);
  }

  // Eliminar una compañía de la API
  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}