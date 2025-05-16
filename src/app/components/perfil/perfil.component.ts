import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { ChangePasswordComponent } from '../change-password/change-password.component';
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatExpansionModule,
    MatCardModule,
    ChangePasswordComponent
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})

export class PerfilComponent {
  usuario = {
    nombre: 'Abatar',
    fotoPerfil: '',
    datos: {
      nombreCompleto: 'Pedro Gomez',
      telefono: '11-12345678',
      email: 'pedro_gomez@gmail.com',
      titulo: 'Técnico superior en desarrollo de software',
      anioRecibido: '2023',
      poseeExperienciaLaboral: 'No',
      ubicacion: 'CABA - Buenos Aires'
    },
    descripcion: 'Descripción de recursos e valores objetivos'
  };

  imagenPerfil: string | null = this.usuario.fotoPerfil;
  archivoSeleccionado: File | null = null;
  editandoFoto = false;
  editandoDatosPersonales = false;
  editandoDatosProfesionales = false;
  editandoDescripcion = false;
  datosForm!: FormGroup;
  descripcionForm!: FormGroup;
  passwordExpanded = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.inicializarFormularios();
  }

  inicializarFormularios(): void {
    this.datosForm = this.fb.group({
      nombreCompleto: [this.usuario.datos.nombreCompleto, Validators.required],
      telefono: [this.usuario.datos.telefono],
      ubicacion: [this.usuario.datos.ubicacion],
      titulo: [this.usuario.datos.titulo],
      anioRecibido: [this.usuario.datos.anioRecibido],
      poseeExperienciaLaboral: [this.usuario.datos.poseeExperienciaLaboral]
    });
  
    this.descripcionForm = this.fb.group({
      descripcion: [this.usuario.descripcion]
    });
  }

  getIniciales(nombreCompleto: string): string {
    if (!nombreCompleto) return 'US';
    
    const nombres = nombreCompleto.split(' ');
    if (nombres.length === 1) return nombres[0].charAt(0).toUpperCase();
    
    return `${nombres[0].charAt(0)}${nombres[nombres.length - 1].charAt(0)}`.toUpperCase();
  }

  editarFoto(): void {
    this.editandoFoto = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      if (!this.validarArchivo(file)) {
        input.value = ''; // Resetear el input
        return;
      }
      
      this.archivoSeleccionado = file;
      
      // Crear preview temporal
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenPerfil = e.target?.result as string;
        this.usuario.fotoPerfil = this.imagenPerfil;
      };
      reader.readAsDataURL(file);
    }
  }

  guardarFoto(): void {
    if (this.imagenPerfil && this.archivoSeleccionado) {
      this.usuario.fotoPerfil = this.imagenPerfil;
      this.mostrarExito('Foto de perfil actualizada correctamente');
      this.cancelarEdicionFoto();
    }
  }
   

  cancelarEdicionFoto(): void {
    this.editandoFoto = false;
    this.archivoSeleccionado = null;
    this.imagenPerfil = null;
  }

  editarDatosPersonales(): void {
    this.editandoDatosPersonales = !this.editandoDatosPersonales;
    if (this.editandoDatosPersonales) {
      this.datosForm.patchValue({
        nombreCompleto: this.usuario.datos.nombreCompleto,
        telefono: this.usuario.datos.telefono,
        ubicacion: this.usuario.datos.ubicacion
      });
    }
  }

  guardarCambios(): void {
    if (this.datosForm.valid) {
      this.usuario.datos = {
        ...this.usuario.datos,
        ...this.datosForm.value
      };
      
      if (this.editandoDatosPersonales) {
        this.editandoDatosPersonales = false;
        this.mostrarExito('Datos personales actualizados correctamente');
      } else if (this.editandoDatosProfesionales) {
        this.editandoDatosProfesionales = false;
        this.mostrarExito('Datos profesionales actualizados correctamente');
      }
      
      // Llamada al servicio para guardar en el backend
      // this.perfilService.actualizarDatos(this.usuario).subscribe(...);
    }
  }

  editarDatosProfesionales(): void {
    this.editandoDatosProfesionales = !this.editandoDatosProfesionales;
    if (this.editandoDatosProfesionales) {
      this.datosForm.patchValue({
        titulo: this.usuario.datos.titulo,
        anioRecibido: this.usuario.datos.anioRecibido,
        experienciaLaboral: this.usuario.datos.poseeExperienciaLaboral
      });
    }
  }

  editarDescripcion(): void {
    this.editandoDescripcion = !this.editandoDescripcion;
  }

  guardarDescripcion(): void {
    if (this.descripcionForm.valid) {
      this.usuario.descripcion = this.descripcionForm.value.descripcion;
      this.editandoDescripcion = false;
      this.mostrarExito('Descripción actualizada correctamente');
    }
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

  confirmarCambio(): void {
    if (this.imagenPerfil && this.archivoSeleccionado) {
      // Aquí iría la lógica para guardar en el backend
      this.imagenPerfil = this.imagenPerfil;
      this.mostrarExito('Foto de perfil actualizada correctamente');
      this.resetearSeleccion();
      
      // Ejemplo de llamada a servicio:
      // this.perfilService.actualizarFoto(this.archivoSeleccionado).subscribe(...);
    }
  }

  cancelarCambio(): void {
    this.resetearSeleccion();
  }

  private resetearSeleccion(): void {
    this.archivoSeleccionado = null;
    this.imagenPerfil = null;
    const fileInput = document.querySelector('.file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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

  cancelarEdicionDescripcion() {
    this.editandoDescripcion = false;
    // Opcional: resetear el formulario al valor original
    this.descripcionForm.patchValue({
      descripcion: this.usuario.descripcion
    });
  }

  cancelarEdicionDatosPersonales() {
    this.editandoDatosPersonales = false;
    // Opcional: resetear el formulario al valor original
    this.datosForm.patchValue({
      nombreCompleto: this.usuario.datos.nombreCompleto,
      telefono: this.usuario.datos.telefono,
      email: this.usuario.datos.email,
      ubicacion: this.usuario.datos.ubicacion
    });
  }

  cancelarEdicionDatosProfesionales(): void {
    this.editandoDatosProfesionales = false;
    this.datosForm.patchValue({
      titulo: this.usuario.datos.titulo,
      anioRecibido: this.usuario.datos.anioRecibido,
      poseeExperienciaLaboral: this.usuario.datos.poseeExperienciaLaboral
    });
  }
}