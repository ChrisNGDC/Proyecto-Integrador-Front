import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private apiUrl = `${environment.apiUrl}/perfil`;
  private useMock = environment.useMocks;

  constructor(private http: HttpClient,
              private authService: AuthService
  ) { }

  obtenerPerfil(): Observable<Usuario> {
    const userEmail = this.authService.getStoredEmail();
    if (!userEmail) {
      return throwError(() => new Error('No se encontró el email del usuario'));
    }

    if (this.useMock) {
      // Mock de datos de perfil
      const mockUsuario: Usuario = {
        nombre: 'Usuario Mock',
        fotoPerfil: 'https://randomuser.me/api/portraits/lego/1.jpg',
        datos: {
          nombreCompleto: 'Juan Pérez Mock',
          telefono: '11-98765432',
          email: userEmail,
          titulo: 'Ingeniero en Sistemas Mock',
          anioRecibido: '2020',
          poseeExperienciaLaboral: 'Sí',
          ubicacion: 'Buenos Aires, Argentina'
        },
        descripcion: 'Descripción mock del usuario para pruebas'
      };
      
      // Simulamos un delay de red
      return of(mockUsuario).pipe(delay(500));
    }
    return this.http.get<Usuario>(`${this.apiUrl}?email=${encodeURIComponent(userEmail)}`).pipe(
      catchError(this.handleError)
    );
  }

  subirFotoPerfil(archivo: File): Observable<{fotoPerfil: string}> {
    const formData = new FormData();
    formData.append('foto', archivo);
    return this.http.post<{fotoPerfil: string}>(`${this.apiUrl}/foto`, formData).pipe(
      catchError(this.handleError)
    );
  }

  actualizarDatosPersonales(datos: Partial<Usuario['datos']>): Observable<Usuario> {
    if (this.useMock) {
      // Mock de actualización
      const mockUsuario: Usuario = {
        nombre: 'Usuario Actualizado',
        fotoPerfil: 'https://randomuser.me/api/portraits/lego/1.jpg',
        datos: {
          ...datos as any, // Usamos los datos enviados
          titulo: 'Ingeniero en Sistemas Mock', // Mantenemos estos valores
          anioRecibido: '2020',
          poseeExperienciaLaboral: 'Sí'
        },
        descripcion: 'Descripción mock del usuario para pruebas'
      };
      return of(mockUsuario).pipe(delay(500));
    }
    return this.http.patch<Usuario>(`${this.apiUrl}/datos-personales`, datos).pipe(
      catchError(this.handleError)
    );
  }

  actualizarDatosProfesionales(datos: Partial<Usuario['datos']>): Observable<Usuario> {
    if (this.useMock) {
      // Mock de actualización
      const mockUsuario: Usuario = {
        nombre: 'Usuario Actualizado',
        fotoPerfil: 'https://randomuser.me/api/portraits/lego/1.jpg',
        datos: {
          nombreCompleto: 'Juan Pérez Mock',
          telefono: '11-98765432',
          email: this.authService.getStoredEmail() || '',
          ...datos as any, // Usamos los datos enviados
          ubicacion: 'Buenos Aires, Argentina'
        },
        descripcion: 'Descripción mock del usuario para pruebas'
      };
      return of(mockUsuario).pipe(delay(500));
    }

    return this.http.patch<Usuario>(`${this.apiUrl}/datos-profesionales`, datos).pipe(
      catchError(this.handleError)
    );
  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en PerfilService:', error);
    return throwError(() => new Error('Error al procesar la solicitud'));
  }
}