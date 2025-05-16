import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPasswordSection = false;

  @Output() passwordChanged = new EventEmitter<void>();

  constructor(private authService: AuthService) {}
  async togglePasswordSection() {
    this.showPasswordSection = !this.showPasswordSection;  
  }

  async onChangePassword() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas nuevas no coinciden';
      this.isLoading = false;
      return;
    }

    try {
      const user = await this.authService.getCurrentUser();
      console.log(user.signInDetails);
      console.log(user.userId);
      console.log(user.username);
      await this.authService.changePassword(this.currentPassword, this.newPassword);
      this.successMessage = 'Contraseña cambiada exitosamente';
      this.clearForm();
     this.passwordChanged.emit();
      setTimeout(() => {
        this.successMessage = '';
        this.togglePasswordSection();
      }, 4000);      
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
  }
  
  private clearForm() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  private getErrorMessage(error: any): string {
    if (error.name === 'NotAuthorizedException') {
      return 'La contraseña actual es incorrecta';
    }
    if (error.name === 'InvalidPasswordException') {
      return 'La nueva contraseña no cumple con los requisitos de complejidad';
    }
    if (error.name === 'LimitExceededException') {
      return 'Has excedido el número máximo de intentos. Por favor, espera unos minutos antes de intentarlo nuevamente.';
    }
    return 'Error al cambiar la contraseña. Por favor, inténtalo nuevamente.';
  }
}