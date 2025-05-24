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
  snackBar: any;

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
      dni: ['', Validators.required],
      telefono: [''],
      fechaNacimiento: ['', Validators.required],
      carrera: ['', Validators.required],
      anioEgreso: ['', Validators.required],
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
    this.egresadoForm.patchValue(egresado);
  }

  // Desactivar egresado
  desactivarEgresado(id: string) {
    if (confirm('¿Está seguro que desea desactivar este egresado?')) {
      this.egresadoService.deactivateEgresado(id).subscribe(() => {
        this.loadEgresados();
      });
    }
  }

  // Guardar cambios
  guardarEgresado() {
    if (this.egresadoForm.valid) {

      const pass = "Ifts11_" + this.egresadoForm.value.dni
      console.log("La contraseña es: "+pass)
      this.authService.signUp(this.egresadoForm.value.mail, pass);
      console.log("se registró el egresado: ", this.egresadoForm.value.mail);
      //this.egresadoForm.reset();

      const formData = this.egresadoForm.value;

      const operacion = this.editMode() 
        ? this.egresadoService.updateEgresado(this.currentEgresadoId()!, formData)
        : this.egresadoService.createEgresado(formData);

      operacion.subscribe({
        next: () => {
          this.egresadoForm.reset();
          this.loadEgresados();
          this.mostrarMensaje(this.editMode() ? 'Egresado actualizado' : 'Egresado creado');
          this.activeTab.set('lista');
          console.log('Tab actual:', this.activeTab());
        },
        error: (error) => {
          this.mostrarError(this.editMode() ? 'Error al actualizar' : 'Error al crear');
        }
      });
    }else {
      this.egresadoForm.markAllAsTouched(); // <- Esto hace que se vean los errores
      return;
    }
  }

  mostrarMensaje(mensaje: string) {
    console.log(mensaje);
  }

  mostrarError(mensaje: string) {
    console.error(mensaje);
  }
}