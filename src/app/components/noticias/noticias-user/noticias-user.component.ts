import { Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';
import { NewsEventsService } from '../../../services/news-events.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-noticias-user',
  imports: [MatFormFieldModule, MatDatepickerModule, FormsModule, CommonModule],
  templateUrl: './noticias-user.component.html',
  styleUrl: './noticias-user.component.css',
})
export class NoticiasUserComponent {
  private modalService = inject(NgbModal);
  eventos: any;
  eventosFiltrados: any;
  loading = true;
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
}
