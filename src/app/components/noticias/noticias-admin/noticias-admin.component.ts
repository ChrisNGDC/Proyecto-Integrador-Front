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
        }, 2000);
      });
    });
  }
  async getImages() {
    this.eventos.forEach((evento: any) => {
      this.neService.getImage(evento.s3key).subscribe((data) => {
        evento['s3key'] = data['data' as keyof typeof data];
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
    this.neService
      .deleteNewsAndEvents(eventoAEliminar.id)
      .subscribe(() => this.getEventos());
  }
  editarEvento(evento: any) {
    const modalRef = this.modalService.open(ModalEdicionComponent, {
      size: 'xl',
      centered: true,
    });
    modalRef.componentInstance.evento = evento;
    modalRef.result
      .then((data: any[]) => {
        const evento = data[0];
        const filedata = data[1];
        let id = evento.id;
        delete evento.id;
        this.neService
          .saveImage(
            'noticiasYeventos',
            `${id}.${filedata.type}`,
            filedata.content
          )
          .subscribe((data) => {
            console.log(data);
          });
        this.neService
          .patchNewsAndEvents(id, JSON.stringify(evento))
          .subscribe(() => this.getEventos());
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
    };
    const modalRef = this.modalService.open(ModalEdicionComponent, {
      size: 'xl',
      centered: true,
    });
    modalRef.componentInstance.evento = eventoNuevo;
    modalRef.result
      .then((data: any[]) => {
        const evento = data[0];
        const filedata = data[1];
        this.neService
          .saveImage(
            'noticiasYeventos',
            `${evento.id}.${filedata.type}`,
            filedata.content
          )
          .subscribe((data) => {
            console.log(data);
          });
        this.neService.putNewsAndEvents(evento).subscribe(() => {
          this.getEventos();
        });
      })
      .catch((error: any) => console.log(error));
  }
}
