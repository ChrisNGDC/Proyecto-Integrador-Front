import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject, BehaviorSubject, from } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { Egresado } from '../models/egresado';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private apiUrl = 'https://9wy5h80y5b.execute-api.us-east-1.amazonaws.com';
  private perfilSubject = new BehaviorSubject<Egresado | null>(null);
  public perfil$ = this.perfilSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Obtener perfil completo del usuario actual
  obtenerPerfil(): Observable<Egresado> {
    return from(this.authService.getCurrentUserEmail()).pipe(
      switchMap(userEmail => {
        return this.http.get<Egresado>(`${this.apiUrl}/perfil/${encodeURIComponent(userEmail)}`).pipe(
          catchError(this.handleError),
          tap(perfil => this.perfilSubject.next(perfil)) // Actualiza el subject con los nuevos datos
        );
      })
    );
  }

  // Actualizar datos editables del perfil
  actualizarPerfil(datos: any): Observable<Egresado> {
    return from(this.authService.getCurrentUserEmail()).pipe(
      switchMap(userEmail => {
        return this.http.patch<Egresado>(
          `${this.apiUrl}/perfil/${encodeURIComponent(userEmail)}`, 
          datos
        ).pipe(
          catchError(this.handleError),
          tap(updatedPerfil => {
            // Actualiza el subject con los nuevos datos
            const currentPerfil = this.perfilSubject.value;
            const mergedPerfil = {...currentPerfil, ...updatedPerfil};
            this.perfilSubject.next(mergedPerfil);
          })
        );
      })
    );
  }

  subirFotoPerfil(archivo: File): Observable<{fotoPerfil: string}> {
    const formData = new FormData();
    formData.append('foto', archivo);
    return this.http.post<{fotoPerfil: string}>(`${this.apiUrl}/foto`, formData).pipe(
      catchError(this.handleError),
      tap(result => {
        // Actualiza solo la foto de perfil en el subject
        const currentPerfil = this.perfilSubject.value;
        if (currentPerfil) {
          currentPerfil.fotoPerfil = result.fotoPerfil;
          this.perfilSubject.next(currentPerfil);
        }
      })
    );
  }

  // Forzar recarga de datos
  recargarPerfil(): void {
    this.obtenerPerfil().subscribe();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en PerfilService:', error);
    
    let errorMessage = 'Error al procesar la solicitud';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error?.error) {
        errorMessage = error.error.error;
      } else if (error.status === 403) {
        errorMessage = 'Tu cuenta está desactivada. Por favor contacta al administrador.';
      } else {
        errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}