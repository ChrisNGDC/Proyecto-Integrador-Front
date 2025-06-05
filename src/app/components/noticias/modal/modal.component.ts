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

  loadDescription(): void {
    let links = document.getElementById('description')?.getElementsByTagName('a');
    if (links) {
      for (let i = 0; i < links.length; i++) {
        links[i].style.textDecoration = 'none';
        links[i].style.color = 'blue';
      }
    }
  }
}
