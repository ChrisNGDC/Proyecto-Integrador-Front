import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EgresadosService } from '../../services/egresado.service';
import { Egresado } from '../../models/egresado';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-egresados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './egresados.component.html',
  styleUrls: ['./egresados.component.css']
})
export class EgresadosComponent {
  // Estados
  activeTab = signal<'lista' | 'agregar'>('lista');
  editMode = signal(false);
  currentEgresadoId = signal<number | null>(null);
  searchQuery = signal('');
  egresados = signal<Egresado[]>([]);

  // Formulario
  egresadoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private egresadoService: EgresadosService,
    private authService: AuthService,
  ) {
    this.loadEgresados();

    this.egresadoForm = this.fb.group({
      mail: ['', [Validators.required, Validators.email]],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      telefono: ['', Validators.pattern(/^[0-9]*$/)],
      fechaNacimiento: ['', Validators.required],
      carrera: ['', Validators.required],
      anioEgreso: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      fotoPerfil: [''],
      genero: ['Binario'],
      ubicacion: [''],
      perfilLinkedin: [''],
      urlRepositorio: [''],
      experienciaLaboral: [''],
      situacionLaboral: [''],
    });
  }

  loadEgresados() {
    this.egresadoService.getEgresados().subscribe(data => {
      const ordenados = data.sort((a, b) => Number(a.id) - Number(b.id));
      this.egresados.set(ordenados);
    });
  }

  // Filtrado de egresados
  filteredEgresados() {
    const query = this.searchQuery().toLowerCase();
    return this.egresados().filter(egresado => 
      egresado.isActive && (
        egresado.nombre.toLowerCase().includes(query) ||
        egresado.apellido.toLowerCase().includes(query) ||
        egresado.id.toString().includes(query)
      )
    );
  }

  // Cambiar pestaña
  setActiveTab(tab: 'lista' | 'agregar') {
    this.activeTab.set(tab);
    this.editMode.set(false);
    this.egresadoForm.reset();
  }

  // Editar egresado
  editarEgresado(egresado: any) {
    this.activeTab.set('agregar');
    this.editMode.set(true);
    this.currentEgresadoId.set(egresado.id);
    
    // Convertir la fecha al formato correcto para el input date
    const egresadoData = {...egresado};
    if (egresadoData.fechaNacimiento) {
      const fecha = new Date(egresadoData.fechaNacimiento);
      egresadoData.fechaNacimiento = fecha.toISOString().split('T')[0];
    }
    
    this.egresadoForm.patchValue(egresadoData);
  }

  // Desactivar egresado
  desactivarEgresado(id: string) {
    if (confirm('¿Está seguro que desea desactivar este egresado?')) {
      this.egresadoService.deactivateEgresado(id).subscribe(() => {
        this.loadEgresados();
        this.mostrarMensaje('Egresado desactivado correctamente');
      });
    }
  }

  // Guardar cambios 
async guardarEgresado() {
  // Marcar todos los campos como tocados para mostrar errores
  this.egresadoForm.markAllAsTouched();

  // Verificar si el formulario es válido
  if (this.egresadoForm.invalid) {
    this.mostrarError('Por favor complete todos los campos obligatorios correctamente');
    return;
  }

  const dni = this.egresadoForm.value.dni;
  const mail = this.egresadoForm.value.mail;
  const pass = "Ifts11_" + this.egresadoForm.value.dni;
  
  if (!this.editMode()) {
    const dniDuplicado = this.egresados().some(e =>e.dni  === dni);
    const mailDuplicado = this.egresados().some(e => e.mail === mail);

    if (dniDuplicado) {
      this.mostrarError('Ya existe un egresado con ese DNI');
      return;
    }

    if (mailDuplicado) {
      this.mostrarError('Ya existe un egresado con ese mail');
      return;
    }
  }

  try {
    if (!this.editMode()) {
      await this.authService.signUp(mail, pass);
      console.log("Se registró el egresado: ", mail);
    }

    const formData = this.egresadoForm.value;
    const operacion = this.editMode() 
      ? this.egresadoService.updateEgresado(this.currentEgresadoId()!, formData)
      : this.egresadoService.createEgresado(formData);

    // Manejar la operación (que sí es un Observable)
    operacion.subscribe({
      next: () => {
        this.egresadoForm.reset();
        this.loadEgresados();
        this.mostrarMensaje(this.editMode() ? 'Egresado actualizado correctamente' : 'Egresado creado correctamente');
        this.activeTab.set('lista');
      },
      error: (error) => {
        this.mostrarError(this.editMode() ? 'Error al actualizar el egresado' : 'Error al crear el egresado');
        console.error('Error:', error);
      }
    });
  } catch (error) {
    this.mostrarError('Error al registrar el usuario: ' + (error instanceof Error ? error.message : 'Comuníquese con el administrador'));
    console.error('Error en registro:', error);
  }
}

  mostrarMensaje(mensaje: string) {
    console.log(mensaje);
    alert(mensaje);
  }

  mostrarError(mensaje: string) {
    console.error(mensaje);
    alert(mensaje);
  }
}