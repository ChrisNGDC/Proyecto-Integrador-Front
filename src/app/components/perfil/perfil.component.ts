import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PerfilService } from '../../services/perfil.service';
import { Usuario } from '../../models/usuario';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario!: Usuario;
  imagenPerfil: string | null = null;
  archivoSeleccionado: File | null = null;
  editandoFoto = false;
  editandoDatosPersonales = false;
  editandoDatosProfesionales = false;
  editandoDescripcion = false;
  datosForm!: FormGroup;
  descripcionForm!: FormGroup;
  usuarioEmail: string | null = null;
  cargando = true;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private perfilService: PerfilService,
  ) {}

  ngOnInit(): void {
    this.inicializarFormulariosVacios();
    this.cargarDatosPerfil();
  }

  inicializarFormulariosVacios(): void {
    this.datosForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      telefono: [''],
      ubicacion: [''],
      titulo: [''],
      anioRecibido: [''],
      poseeExperienciaLaboral: ['']
    });
  
    this.descripcionForm = this.fb.group({
      descripcion: ['']
    });
  }

  cargarDatosPerfil(): void {
    this.cargando = true;
    this.perfilService.obtenerPerfil().subscribe({
      next: (usuario: Usuario) => {
        this.usuario = usuario;
        this.imagenPerfil = usuario.fotoPerfil;
        this.inicializarFormulariosConDatos();
        this.cargando = false;
      },
      error: (err: Error) => {
        this.mostrarError('Error al cargar el perfil');
        console.error(err);
        this.cargando = false;
      }
    });
  }

  inicializarFormulariosConDatos(): void {
    if (!this.usuario) return;
    
    this.datosForm.patchValue({
      nombreCompleto: this.usuario.datos.nombreCompleto,
      telefono: this.usuario.datos.telefono,
      ubicacion: this.usuario.datos.ubicacion,
      titulo: this.usuario.datos.titulo,
      anioRecibido: this.usuario.datos.anioRecibido,
      poseeExperienciaLaboral: this.usuario.datos.poseeExperienciaLaboral
    });
  
    this.descripcionForm.patchValue({
      descripcion: this.usuario.descripcion
    });
  }

  guardarFoto(): void {
    if (this.imagenPerfil && this.archivoSeleccionado) {
      this.perfilService.subirFotoPerfil(this.archivoSeleccionado).subscribe({
        next: (response: {fotoPerfil: string}) => {
          this.usuario.fotoPerfil = response.fotoPerfil;
          this.mostrarExito('Foto de perfil actualizada correctamente');
          this.cancelarEdicionFoto();
        },
        error: (err: Error) => {
          this.mostrarError('Error al subir la foto de perfil');
          console.error(err);
        }
      });
    }
  }

  guardarCambios(): void {
    if (this.datosForm.valid) {
      const datosActualizados = this.datosForm.value;
      
      const servicio$ = this.editandoDatosPersonales 
        ? this.perfilService.actualizarDatosPersonales(datosActualizados)
        : this.perfilService.actualizarDatosProfesionales(datosActualizados);

      servicio$.subscribe({
        next: (usuarioActualizado: Usuario) => {
          this.usuario = usuarioActualizado;
          if (this.editandoDatosPersonales) {
            this.editandoDatosPersonales = false;
            this.mostrarExito('Datos personales actualizados correctamente');
          } else {
            this.editandoDatosProfesionales = false;
            this.mostrarExito('Datos profesionales actualizados correctamente');
          }
        },
        error: (err: Error) => {
          this.mostrarError('Error al actualizar los datos');
          console.error(err);
        }
      });
    }
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