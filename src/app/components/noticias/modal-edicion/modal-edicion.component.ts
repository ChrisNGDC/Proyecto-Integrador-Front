import { formatDate } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnInit,
  SecurityContext,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';
import { HtmlToMarkdownService } from '../../../services/html-to-markdown.service';

@Component({
  selector: 'app-modal-edicion',
  imports: [FormsModule],
  templateUrl: './modal-edicion.component.html',
  styleUrl: './modal-edicion.component.css',
})
export class ModalEdicionComponent implements OnInit {
  activeModal = inject(NgbActiveModal);

  @Input() evento: any;
  eventoModal: any;
  filetype = '';
  maxAllowedSize = 200 * 1024; // KB
  rows = 0;

  constructor(
    private sanitizer: DomSanitizer,
    private htmlToMarkdownService: HtmlToMarkdownService
  ) {}

  ngOnInit() {
    this.eventoModal = JSON.parse(JSON.stringify(this.evento));
    this.eventoModal.descripcion =
      this.htmlToMarkdownService.convert(this.eventoModal.descripcion) + '\n';
    this.rows = this.eventoModal.descripcion.split('\n').length * 2;
    if (this.evento.s3keyvalue.includes('png')) {
      this.filetype = 'png';
    } else if (this.evento.s3keyvalue.includes('jpg')) {
      this.filetype = 'jpg';
    } else if (this.evento.s3keyvalue.includes('jpeg')) {
      this.filetype = 'jpeg';
    }
  }
  validEvent(evento: any) {
    for (let key in evento) {
      if (
        (key != 'active' && evento[key] == '' && key != 's3key') ||
        (key == 's3keyvalue' && evento[key] == './add-image.png')
      ) {
        return false;
      }
    }
    return true;
  }
  save() {
    let fecha = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    this.eventoModal.fecha = fecha;
    if (this.validEvent(this.eventoModal)) {
      this.showNotification(
        'Evento creado/actualizado correctamente',
        'success'
      );
      setTimeout(() => {
        this.eventoModal.descripcion = this.sanitizer.sanitize(
          SecurityContext.HTML,
          marked.parse(this.eventoModal.descripcion)
        );
        this.activeModal.close([this.eventoModal, this.filetype]);
      }, 2500);
    } else {
      this.showNotification('Por favor, complete todos los campos', 'error');
    }
  }
  cancel() {
    this.activeModal.close(this.evento);
  }
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const error = document.getElementById('errorMessage')!;
    const imgSrc = document
      .getElementsByClassName('card-img')[0]
      .getAttribute('src');
    if (file && file.size <= this.maxAllowedSize) {
      error.style.display = 'none';
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const fileContent = fileReader.result as string;
        this.filetype = file.type.split('/')[1];
        this.eventoModal.s3keyvalue = fileContent;
      };
      fileReader.readAsDataURL(file);
      this.updateOverlay();
    } else {
      if (imgSrc?.includes('data:image/')) {
        error.style.position = 'static';
      } else {
        error.style.position = 'absolute';
      }
      error.style.display = 'flex';
    }
  }

  updateOverlay() {
    let overlay = document.getElementById('img-overlay')!;
    let img = document.getElementById('img')!;
    overlay.style.height = `${img.offsetHeight}px`;
  }

  showNotification(message: string, type: 'success' | 'error') {
    let modal = document.getElementsByTagName('app-modal-edicion')[0];
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `text-center fixed bottom-4 m-auto py-2 px-4 rounded shadow-lg z-50 notification-fade bg-${
      type === 'success' ? 'green-500' : 'red-500'
    } text-white`;
    modal.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('opacity-0');
      setTimeout(() => {
        modal.removeChild(notification);
      }, 500);
    }, 2000);
  }
}
