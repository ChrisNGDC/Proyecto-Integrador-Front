import { Component, inject } from '@angular/core';
import { BbddService } from '../../../bbdd.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';

import * as noticias from '../noticias.json'

@Component({
  selector: 'app-noticias-user',
  imports: [],
  templateUrl: './noticias-user.component.html',
  styleUrl: './noticias-user.component.css',
})
export class NoticiasUserComponent {
  private modalService = inject(NgbModal);
  eventos: any;
  constructor(private bbddservice: BbddService) {
    this.getEventos();
  }
  async getEventos() {
    this.eventos = noticias.datos
    // this.bbddservice.getDatabase('noticiasYeventos').subscribe((data) => {
    //   this.eventos = data;
    //   this.getImages();
    // });
  }
  async getImages() {
    this.eventos.forEach((evento: any) => {
      this.bbddservice
        .getImage(evento.s3key)
        .subscribe((data) => {
          evento['s3key'] =
            'data:image/png;base64,' + data['data' as keyof typeof data];
        });
    });
  }
  open(eventCard: HTMLElement, evento: any) {
    eventCard.scrollIntoView({ behavior: 'smooth' });
    const modalRef = this.modalService.open(ModalComponent, {
      size: 'xl',
      centered: true,
    });
    modalRef.componentInstance.evento = evento;
  }
}
