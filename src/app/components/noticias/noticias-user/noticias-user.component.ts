import { Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';
import { NewsEventsService } from '../../../services/news-events.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-noticias-user',
  imports: [MatProgressSpinnerModule],
  templateUrl: './noticias-user.component.html',
  styleUrl: './noticias-user.component.css',
})
export class NoticiasUserComponent {
  private modalService = inject(NgbModal);
  eventos: any;
  eventosFiltrados: any;
  loading = true;
  constructor(private neService: NewsEventsService) {
    this.getEventos().then(() => {setTimeout(() => this.loading = false, 2000)});
  }
  async getEventos() {
    this.neService.getNewsAndEvents().subscribe((data) => {
      this.eventos = data;
      // this.getImages();
      this.eventosFiltrados = this.eventos
    });
  }
  async getImages() {
    this.eventos.forEach((evento: any) => {
      this.neService
        .getImage(evento.s3key)
        .subscribe((data) => {
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
    let busqueda = event.target.value.toLowerCase()
    if (busqueda == '') {
      this.eventosFiltrados = this.eventos;
    } else {
      this.eventosFiltrados = []
      this.eventos.forEach((evento: any) => {
        if (evento['titulo'].toLowerCase().includes(busqueda) || evento['resumen'].toLowerCase().includes(busqueda) || evento['descripcion'].toLowerCase().includes(busqueda)) {
          this.eventosFiltrados.push(evento)
        }
      })
    }
  }
}
