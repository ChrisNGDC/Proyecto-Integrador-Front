import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  // Datos de ejemplo
  egresados = signal([
    {
      id: 1,
      nroAlumno: '123456789',
      nombre: 'Guadalupe',
      apellido: 'Sírio',
      carrera: 'Tecnicatura superior en Desarrollo de Software',
      anioEgreso: 2025,
      fechaNacimiento: '26/10/1989',
      direccion: 'Paso 446',
      mail: 'guadalupe.sirio@gmail.com',
      telefono: '1123193617',
      activo: true
    },
    {
      id: 2,
      nroAlumno: '123456790',
      nombre: 'Harold',
      apellido: 'Guevara',
      carrera: 'Licenciado ....',
      anioEgreso: 2026,
      fechaNacimiento: '30/11/1987',
      direccion: 'Paso 446',
      mail: 'harold.guevara.nuinunez@gmail.com',
      telefono: '1125432055',
      activo: true
    },
    // Más egresados pueden agregarse aquí
  ]);

  // Formulario
  egresadoForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService,) {
    this.egresadoForm = this.fb.group({
      nroAlumno: ['', Validators.required],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      carrera: ['', Validators.required],
      anioEgreso: ['', [Validators.required, Validators.min(2000), Validators.max(new Date().getFullYear())]],
      fechaNacimiento: ['', Validators.required],
      direccion: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      dni: ['', Validators.required],
    });
  }

  // Filtrado de egresados
  filteredEgresados() {
    const query = this.searchQuery().toLowerCase();
    return this.egresados().filter(egresado => 
      egresado.activo && (
        egresado.nombre.toLowerCase().includes(query) ||
        egresado.apellido.toLowerCase().includes(query) ||
        egresado.nroAlumno.includes(query)
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
  desactivarEgresado(id: number) {
    if (confirm('¿Está seguro que desea desactivar este egresado?')) {
      this.egresados.update(egresados => 
        egresados.map(e => e.id === id ? {...e, activo: false} : e)
      );
    }
  }

  // Guardar cambios
  guardarEgresado() {
   const pass:string = "Ifts11"+this.egresadoForm.value.dni ;
   const mail:string = this.egresadoForm.value.mail;
    this.authService.signUp(mail, pass);
    console.log("se registró el egresado: ", mail);
    this.egresadoForm.reset();
   /* if (this.egresadoForm.valid) {
      const formData = this.egresadoForm.value;
"prueba@prueba.com.ar","Pass123_", "prueba@prueba.com.ar"
      if (this.editMode()) {
        // Actualizar existente
        this.egresados.update(egresados => 
          egresados.map(e => 
            e.id === this.currentEgresadoId() ? {...e, ...formData} : e
          )
        );
      } else {
        // Agregar nuevo
        const newId = Math.max(...this.egresados().map(e => e.id)) + 1;
        this.egresados.update(egresados => [
          ...egresados,
          {
            id: newId,
            ...formData,
            activo: true
          }
        ]);
      }

      this.setActiveTab('lista');
    }*/
  }
}