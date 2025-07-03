import { Component, inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-modal',
  imports: [],
	templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent{
	activeModal = inject(NgbActiveModal);

	@Input() evento: any;

  cerrarModal() {
    this.activeModal.close();
  }
}
