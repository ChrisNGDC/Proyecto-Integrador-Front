import { formatDate } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

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
  filedata = {
    type: '',
    content: ''
  }
  maxAllowedSize = 15 * 1024; // 15KB

  ngOnInit() {
    this.eventoModal = JSON.parse(JSON.stringify(this.evento));
    this.filedata.content = this.evento.s3key;
  }
  validEvent(evento: any) {
    for (let key in evento) {
      if (evento[key] == '') {
        return false;
      }
    }
    return true;
  }
  save() {
    let fecha = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    this.eventoModal.fecha = fecha;
    if (this.validEvent(this.eventoModal)) {
      this.activeModal.close([this.eventoModal, this.filedata]);
    } else {
      alert('Ingrese un valor en todos los campos.');
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
        this.filedata.type = file.type.split('/')[1];
        this.filedata.content = fileContent;
        this.eventoModal.s3key = `noticiasYeventos/${this.evento.id}.${this.filedata.type}`;
      };
      fileReader.readAsDataURL(file);
    } else {
      if (imgSrc?.includes('data:image/')) {
        error.style.position = 'static';
      } else {
        error.style.position = 'absolute';
      }
      error.style.display = 'block';
    }
  }
}
