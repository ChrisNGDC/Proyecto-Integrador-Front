
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ title }}</h2>
          <button class="close-button" (click)="onCancel()">&times;</button>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
          <ng-content></ng-content> </div>
        <div class="modal-footer">
          <button *ngIf="showCancelButton" class="btn btn-secondary" (click)="onCancel()">{{ cancelButtonText }}</button>
          <button class="btn btn-primary" (click)="onConfirm()">{{ confirmButtonText }}</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() title: string = 'Título del Modal';
  @Input() message: string = 'Mensaje predeterminado del Modal.';
  @Input() confirmButtonText: string = 'Confirmar';
  @Input() cancelButtonText: string = 'Cancelar';
  @Input() showCancelButton: boolean = true;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    if (this.showCancelButton) {
      this.cancel.emit();
    } else {
      this.confirm.emit();
    }
  }
}
