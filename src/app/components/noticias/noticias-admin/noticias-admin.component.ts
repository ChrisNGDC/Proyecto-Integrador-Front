import { Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';
import { ModalEdicionComponent } from '../modal-edicion/modal-edicion.component';
import { NewsEventsService } from '../../../services/news-events.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-noticias-admin',
  imports: [MatProgressSpinnerModule],
  templateUrl: './noticias-admin.component.html',
  styleUrl: './noticias-admin.component.css',
})
export class NoticiasAdminComponent {
  private modalService = inject(NgbModal);
  loading = true;
  eventos: any;
  eventosFiltrados: any;
  constructor(private neService: NewsEventsService) {
    this.getEventos().then(() => {setTimeout(() => this.loading = false, 2000)});
  }
  async getEventos() {
    this.neService.getNewsAndEvents().subscribe((data) => {
      this.eventos = data;
      // this.getImages();
      this.eventosFiltrados = this.eventos;
    });
  }
  // async getImages() {
  //   this.eventos.forEach((evento: any) => {
  //     this.neService.getImage(evento.s3key).subscribe((data) => {
  //       evento['s3key'] =
  //         'data:image/png;base64,' + data['data' as keyof typeof data];
  //     });
  //   });
  // }
  open(evento: any) {
    const modalRef = this.modalService.open(ModalComponent, {
      size: 'xl',
      centered: true,
    });
    modalRef.componentInstance.evento = evento;
  }
  filtrar(event: any) {
    let busqueda = event.target.value.toLowerCase();
    if (busqueda == '') {
      this.eventosFiltrados = this.eventos;
    } else {
      this.eventosFiltrados = [];
      this.eventos.forEach((evento: any) => {
        if (
          evento['titulo'].toLowerCase().includes(busqueda) ||
          evento['resumen'].toLowerCase().includes(busqueda) ||
          evento['descripcion'].toLowerCase().includes(busqueda)
        ) {
          this.eventosFiltrados.push(evento);
        }
      });
    }
  }
  eliminarEvento(eventoAEliminar: any) {
    this.neService.deleteNewsAndEvents(eventoAEliminar.id).subscribe(() => this.getEventos())
  }
  editarEvento(evento: any) {
    const modalRef = this.modalService.open(ModalEdicionComponent, {
      size: 'xl',
      centered: true,
    });
    modalRef.componentInstance.evento = evento;
    modalRef.result.then((data: any) => {
      let id = data.id;
      delete data.id;
      this.neService.patchNewsAndEvents(id, JSON.stringify(data)).subscribe(() => this.getEventos())
    }).catch((error: any) => console.log(error));
  }
  agregarEvento() {
    let eventoNuevo = {
      descripcion: "",
      fecha: "",
      resumen: "",
      s3key: "",
      titulo: ""
    };
    const modalRef = this.modalService.open(ModalEdicionComponent, {
      size: 'xl',
      centered: true,
    });
    modalRef.componentInstance.evento = eventoNuevo;
    modalRef.result.then((data: any) => {
      if (data.titulo != "" && data.resumen != "" && data.descripcion != "" && data.fecha != "") {
        this.neService.putNewsAndEvents(data).subscribe(() => this.getEventos())
      }
    }).catch((error: any) => console.log(error));
  }
}
