import { Component, inject } from '@angular/core';
import { BbddService } from '../../../bbdd.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';
import { ModalEdicionComponent } from '../modal-edicion/modal-edicion.component';

import * as noticias from '../noticias.json';

@Component({
  selector: 'app-noticias-admin',
  imports: [],
  templateUrl: './noticias-admin.component.html',
  styleUrl: './noticias-admin.component.css',
})
export class NoticiasAdminComponent {
  private modalService = inject(NgbModal);
  eventos: any;
  eventosFiltrados: any;
  constructor(private bbddservice: BbddService) {
    this.getEventos();
  }
  async getEventos() {
    this.eventos = noticias.datos;
    this.eventosFiltrados = this.eventos;
    // this.bbddservice.getDatabase('noticiasYeventos').subscribe((data) => {
    //   this.eventos = data;
    //   this.getImages();
    // });
  }
  async getImages() {
    this.eventos.forEach((evento: any) => {
      this.bbddservice.getImage(evento.s3key).subscribe((data) => {
        evento['s3key'] =
          'data:image/png;base64,' + data['data' as keyof typeof data];
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
    this.eventos = this.eventos.filter(
      (evento: any) => evento.id !== eventoAEliminar.id
    );
    this.eventosFiltrados = this.eventos;
  }
  editarEvento(evento: any) {
    const modalRef = this.modalService.open(ModalEdicionComponent, {
      size: 'xl',
      centered: true,
    });
    modalRef.componentInstance.evento = evento;
    modalRef.result.then((data: any) => {
      // Eliminar esto y hacer lo de despues ↓
      let posicion = this.eventos.indexOf(evento);
      this.eventos = this.eventos.filter((elem: any) => elem.id !== evento.id);
      this.eventos.splice(posicion, 0, data);
      this.eventosFiltrados = this.eventos;
      // TODO: update server data
    }).catch((error: any) => console.log(error));
  }
  agregarEvento() {
    let eventoNuevo = {
      descripcion: "",
      fecha: "",
      id: "",
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
      // Eliminar esto y hacer lo de despues ↓
      if (data['titulo'] != ''){
        this.eventos.unshift(data);
        this.eventosFiltrados = this.eventos;
      }
      // TODO: update server data
    }).catch((error: any) => console.log(error));
  }
}
