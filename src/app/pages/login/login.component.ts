import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpinnerComponent } from '../../components/spinner/spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule, SpinnerComponent]
})
export class LoginComponent {
  // Propiedades para mensajes de error y éxito
  errorMessage = '';
  successMessage = '';
  // Propiedades para imputs login
  username = '';
  password = '';  
  // Propiedades para inputs recuperación de contraseña
  recoveryCode = '';
  newPassword = '';
  confirmPassword = '';
  // Estados de la interfaz  
  isLoading = false;
  isRecoveringPassword = false;
  codeSent = false;
  // Propiedades para mostrar contraseñas
  showLoginPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
 

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    try {
      const isAuthenticated = await this.authService.isAuthenticated();
      
      if (isAuthenticated) {
        const isAdmin = await this.authService.isAdmin();
        this.router.navigate([isAdmin ? '/admin-dashboard' : '/user-dashboard']);
      }
    } catch (error) {
      console.log('Verificación de sesión fallida:', error);    
    }
  }

  async onLogin() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    try {
      await this.authService.login(this.username, this.password);      
      const isAdmin = await this.authService.isAdmin();
      const targetRoute = isAdmin ? '/admin-dashboard' : '/user-dashboard';
      await this.router.navigateByUrl(targetRoute);
    } catch (error) {
      this.errorMessage = 'Usuario o contraseña incorrectos';
      console.error('Error al iniciar sesión:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onForgotPassword() {
    if (!this.username) {
      this.errorMessage = 'Por favor ingresa tu correo electrónico';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    

    try {
      await this.authService.forgotPassword(this.username);     
      this.codeSent = true;
      this.successMessage = `Se ha enviado un código de verificación a ${this.username}`;
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al solicitar recuperación de contraseña';      
    } finally {
      this.isLoading = false;
    }
  }

  async onResetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.confirmPasswordReset(
        this.username,
        this.recoveryCode,
        this.newPassword
      );
      
      this.successMessage = 'Contraseña restablecida correctamente. Ahora puedes iniciar sesión.';
      this.isRecoveringPassword = false;
      this.codeSent = false;
      this.newPassword = '';
      this.confirmPassword = '';
      this.recoveryCode = '';
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al restablecer la contraseña';
    } finally {
      this.isLoading = false;
    }
  }

  backToLogin() {
    this.isRecoveringPassword = false;
    this.codeSent = false;    
    this.errorMessage = '';
    this.successMessage = '';
  }

  isRecoveringPasswordMode() {
    this.isRecoveringPassword = true; 
    this.codeSent = false;
    this.errorMessage = '';
    this.successMessage = '';
  }
  
  toggleLoginPasswordVisibility(): void {
    this.showLoginPassword = !this.showLoginPassword;
  }
  
  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }
  
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}