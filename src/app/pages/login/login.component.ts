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
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
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
    
    try {
      await this.authService.login(this.username, this.password);      
      // Redirección basada en rol
      const isAdmin = await this.authService.isAdmin();
      console.log('Es admin:', isAdmin);
      const targetRoute = isAdmin ? '/admin-dashboard' : '/user-dashboard';
      await this.router.navigateByUrl(targetRoute);
      
    } catch (error) {
      this.errorMessage = 'Usuario o contraseña incorrectos';
      console.error('Error al iniciar sesión:', error);
    } finally {
      this.isLoading = false;
    }
  }
}