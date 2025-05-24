import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Egresado } from '../models/egresado';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EgresadosService {
  private readonly API_URL = 'https://o24myvon19.execute-api.us-east-1.amazonaws.com/egresados';

  constructor(private http: HttpClient) {}

  getEgresados(): Observable<Egresado[]> {
    return this.http.get<Egresado[]>(this.API_URL);
  }

  deactivateEgresado(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  createEgresado(egresado: Partial<Egresado>): Observable<Egresado> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Egresado>(this.API_URL, egresado, { headers });
  }

  updateEgresado(id: number | string, egresado: Partial<Egresado>): Observable<Egresado> {
    return this.http.patch<Egresado>(`${this.API_URL}/${id}`, egresado);
  }
}
