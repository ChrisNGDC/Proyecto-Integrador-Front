import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);


  ngOnInit(): void {
    this.authService.checkAuth();   
  }

  login(): void {
    this.authService.login();
    console.log('login');
  }
}

