import { Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';
import { ModalEdicionComponent } from '../modal-edicion/modal-edicion.component';
import { NewsEventsService } from '../../../services/news-events.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-noticias-admin',
  imports: [MatProgressSpinnerModule, FormsModule, CommonModule],
  templateUrl: './noticias-admin.component.html',
  styleUrl: './noticias-admin.component.css',
})
export class NoticiasAdminComponent {
  private modalService = inject(NgbModal);
  loading = true;
  eventos: any;
  eventosFiltrados: any;
  fechas = {
    inicio: null,
    fin: new Date(Date.now()),
  };
  busqueda = '';
  constructor(private neService: NewsEventsService) {
    this.getEventos();
  }
  async getEventos() {
    this.eventos = [];
    this.eventosFiltrados = [];
    this.loading = true;
    this.neService.getNewsAndEvents().subscribe((data) => {
      this.eventos = data;
      this.getImages().then(() => {
        this.eventosFiltrados = this.eventos;
        this.eventosFiltrados.sort(
          (a: any, b: any) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        setTimeout(() => {
          this.loading = false;
        }, 2500);
      });
    });
  }
  async getImages() {
    this.eventos.forEach((evento: any) => {
      this.neService.getImage(evento.s3key).subscribe((data) => {
        evento['s3keyvalue'] = data['data' as keyof typeof data];
      });
    });
  }
  open(evento: any) {
    const modalRef = this.modalService.open(ModalComponent, {
      size: 'xl',
      centered: true,
    });
    modalRef.componentInstance.evento = evento;
  }
  filtrar() {
    let buscadosPalabras: any[] = [];
    let buscadosFechas: any[] = [];
    if (this.busqueda != '') {
      this.eventos.forEach((evento: any) => {
        if (
          evento['titulo']
            .toLowerCase()
            .includes(this.busqueda.toLowerCase()) ||
          evento['resumen']
            .toLowerCase()
            .includes(this.busqueda.toLowerCase()) ||
          evento['descripcion']
            .toLowerCase()
            .includes(this.busqueda.toLowerCase())
        ) {
          buscadosPalabras.push(evento);
        }
      });
    } else {
      this.eventosFiltrados = this.eventos;
    }
    if (this.fechas.inicio != null) {
      this.eventos.forEach((evento: any) => {
        if (
          evento['fecha'] >= this.fechas.inicio! &&
          evento['fecha'] <=
            this.fechas.fin.getFullYear() +
              '-' +
              this.fechas.fin.getMonth() +
              '-' +
              this.fechas.fin.getDate()
        ) {
          buscadosFechas.push(evento);
        }
      });
    }
    if (this.busqueda != '') {
      if (this.fechas.inicio != null) {
        this.eventosFiltrados = buscadosPalabras.filter((item) =>
          buscadosFechas.includes(item)
        );
      } else {
        this.eventosFiltrados = buscadosPalabras;
      }
    } else if (this.fechas.inicio != null) {
      this.eventosFiltrados = buscadosFechas;
    }
    this.eventosFiltrados.sort(
      (a: any, b: any) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }
  eliminarEvento(eventoAEliminar: any) {
    this.neService.deleteImage(eventoAEliminar.s3key).subscribe(() => {});
    this.neService
      .deleteNewsAndEvents(eventoAEliminar.id)
      .subscribe(() => this.getEventos());
  }
  activarEvento(eventoADesactivar: any) {
    this.neService
      .activateNewsAndEvents(eventoADesactivar.id)
      .subscribe(() => this.getEventos());
  }
  desactivarEvento(eventoADesactivar: any) {
    this.neService
      .deactivateNewsAndEvents(eventoADesactivar.id)
      .subscribe(() => this.getEventos());
  }
  editarEvento(evento: any) {
    console.log(evento)
    const modalRef = this.modalService.open(ModalEdicionComponent, {
      size: 'xl',
      centered: true,
    });
    modalRef.componentInstance.evento = evento;
    modalRef.result
      .then((data: any[]) => {
        const evento = data[0];
        const filetype = data[1];
        const id = evento.id;
        const filecontent = evento.s3keyvalue;
        delete evento.id;
        delete evento.s3keyvalue;
        evento.s3key = `noticiasYeventos/${id}.${filetype}`;
        this.neService
          .saveImage(
            'noticiasYeventos',
            `${id}.${filetype}`,
            filecontent
          )
          .subscribe(() => {
            this.neService
              .patchNewsAndEvents(id, JSON.stringify(evento))
              .subscribe(() => this.getEventos());
          });
      })
      .catch((error: any) => console.log(error));
  }
  agregarEvento() {
    let eventoNuevo = {
      descripcion: '',
      fecha: '',
      resumen: '',
      s3key: '',
      titulo: '',
      s3keyvalue: '',
      active: true,
    };
    const modalRef = this.modalService.open(ModalEdicionComponent, {
      size: 'xl',
      centered: true,
    });
    modalRef.componentInstance.evento = eventoNuevo;
    modalRef.result
      .then((data: any[]) => {
        const evento = data[0];
        const filetype = data[1];
        const filecontent = evento.s3keyvalue;
        delete evento.s3keyvalue;
        evento.s3key = `${filetype}`;
        this.neService.putNewsAndEvents(evento).subscribe((id) => {
          this.neService
            .saveImage(
              'noticiasYeventos',
              `${id}.${filetype}`,
              filecontent
            )
            .subscribe(() => {
              this.getEventos();
            });
        });
      })
      .catch((error: any) => console.log(error));
  }
}
