import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PerfilService } from '../../services/perfil.service';
import { Egresado } from '../../models/egresado';
import { CommonModule } from '@angular/common';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ChangePasswordComponent
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  egresado!: Egresado;
  imagenPerfil: string | null = null;
  archivoSeleccionado: File | null = null;
  editandoFoto = false;
  editandoDatosPersonales = false;
  editandoDatosProfesionales = false;
  perfilForm!: FormGroup;
  cargando = true;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private perfilService: PerfilService,
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarDatosPerfil();
  }

  inicializarFormulario(): void {
    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      mail: [{value: '', disabled: true}],
      telefono: [''],
      genero: [''],
      ubicacion: [''],
      perfilLinkedin: [''],
      urlRepositorio: [''],
      experienciaLaboral: [''],
      situacionLaboral: [''],
      carrera: [{value: '', disabled: true}],
      anioEgreso: [{value: '', disabled: true}]
    });
  }

  cargarDatosPerfil(): void {
    this.cargando = true;
    this.perfilService.obtenerPerfil().pipe(
      finalize(() => this.cargando = false)
    ).subscribe({
      next: (egresado: Egresado) => {
        this.egresado = egresado;
        
        this.perfilService.getImage(egresado.id).subscribe({
          next: (res: any) => {
            console.log('Respuesta getImage:', res);
            
            // Verificar si existe res.data y es una cadena válida
            if (res?.data && typeof res.data === 'string') {
              this.imagenPerfil = res.data;
              console.log('Imagen asignada correctamente:', this.imagenPerfil);
            } else {
              console.warn('No se encontró imagen en res.data');
              this.imagenPerfil = null;
            }
          },
          error: (err) => {
            console.error('Error al obtener imagen de perfil:', err);
            this.imagenPerfil = null;
          }
        });

        this.actualizarFormularioConDatos();
      },
      error: (err: Error) => {
        err.message;
        this.mostrarError('Error al cargar el perfil');
      }
    });
  }

  actualizarFormularioConDatos(): void {
    this.perfilForm.patchValue({
      nombre: this.egresado.nombre,
      apellido: this.egresado.apellido,
      mail: this.egresado.mail,
      telefono: this.egresado.telefono,
      genero: this.egresado.genero,
      ubicacion: this.egresado.ubicacion,
      perfilLinkedin: this.egresado.perfilLinkedin,
      urlRepositorio: this.egresado.urlRepositorio,
      experienciaLaboral: this.egresado.experienciaLaboral,
      situacionLaboral: this.egresado.situacionLaboral,
      carrera: this.egresado.carrera,
      anioEgreso: this.egresado.anioEgreso
    });
  }

  guardarCambios(): void {
    if (this.perfilForm.valid) {
      const datosActualizados = {
        nombre: this.perfilForm.get('nombre')?.value,
        apellido: this.perfilForm.get('apellido')?.value,
        telefono: this.perfilForm.get('telefono')?.value,
        genero: this.perfilForm.get('genero')?.value,
        ubicacion: this.perfilForm.get('ubicacion')?.value,
        perfilLinkedin: this.perfilForm.get('perfilLinkedin')?.value,
        urlRepositorio: this.perfilForm.get('urlRepositorio')?.value,
        experienciaLaboral: this.perfilForm.get('experienciaLaboral')?.value,
        situacionLaboral: this.perfilForm.get('situacionLaboral')?.value
      };

      console.log('Datos a enviar:', datosActualizados)

      this.perfilService.actualizarPerfil(datosActualizados).subscribe({
        next: (egresadoActualizado) => {
          console.log('Respuesta del backend:', egresadoActualizado);
          // Actualizar el objeto local con los nuevos datos
          this.egresado = { ...this.egresado, ...egresadoActualizado };
          this.actualizarFormularioConDatos();
          this.cargarDatosPerfil(); 
          this.mostrarExito('Perfil actualizado correctamente');
          this.editandoDatosPersonales = false;
          this.editandoDatosProfesionales = false;
        },
        error: (err) => {
          console.error('Error en la actualización:', err);
          this.mostrarError('Error al actualizar el perfil');
          console.error(err);
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      if (!this.validarArchivo(file)) {
        input.value = '';
        return;
      }
      
      this.archivoSeleccionado = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenPerfil = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  guardarFoto(): void {
    if (this.imagenPerfil && this.archivoSeleccionado) {
      const extension = this.archivoSeleccionado.name.split('.').pop()?.toLowerCase() || 'jpg';
      const nombreArchivo = `${this.egresado.id}.${extension}`;
      const base64Data = this.imagenPerfil.split(',')[1] || this.imagenPerfil;
      
      this.perfilService.saveImage(nombreArchivo, base64Data).subscribe({
        next: () => {
          this.perfilService.getImage(this.egresado.id).subscribe({
            next: (res: any) => {
              this.imagenPerfil = res.data; // Usamos res.data directamente
              this.mostrarExito('Foto de perfil actualizada correctamente');
              this.limpiarEstadoFoto(); // Limpiar todo el estado
            },
            error: (err) => {
              console.error('Error al obtener la imagen:', err);
              this.limpiarEstadoFoto();
            }
          });
        },
        error: (err) => {
          console.error('Error al guardar la imagen:', err);
          this.mostrarError('Error al actualizar la foto de perfil');
          this.limpiarEstadoFoto();
        }
      });
    }
  }

  cancelarEdicionFoto(): void {
    this.editandoFoto = false;
    this.archivoSeleccionado = null;
    
    if (this.egresado?.id) {
      this.perfilService.getImage(this.egresado.id).subscribe({
        next: (res: any) => {
          if (res?.data && typeof res.data === 'string') {
            this.imagenPerfil = res.data;
          } else {
            this.imagenPerfil = null;
          }
        },
        error: (err) => {
          console.error('Error al obtener imagen:', err);
          this.imagenPerfil = null;
        }
      });
    } else {
      this.imagenPerfil = null;
    }
    
    const fileInput = document.querySelector('.file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  private limpiarEstadoFoto(): void {
    this.editandoFoto = false;
    this.archivoSeleccionado = null;
    const fileInput = document.querySelector('.file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  iniciarEdicionFoto(): void {
    this.editandoFoto = true;
    this.archivoSeleccionado = null;
  }

  validarArchivo(file: File): boolean {
    const formatosPermitidos = ['image/jpeg', 'image/png'];
    const tamañoMaximoMB = 2;
    
    if (!formatosPermitidos.includes(file.type)) {
      this.mostrarError('Formato no soportado. Use JPG o PNG.');
      return false;
    }
    
    if (file.size > tamañoMaximoMB * 1024 * 1024) {
      this.mostrarError(`El archivo es muy grande. Máximo: ${tamañoMaximoMB}MB`);
      return false;
    }
    
    return true;
  }

  getIniciales(): string {
    return `${this.egresado.nombre?.charAt(0) || ''}${this.egresado.apellido?.charAt(0) || ''}`.toUpperCase();
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}