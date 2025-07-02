import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, RouterModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent {
    constructor(private authService: AuthService,private router: Router ) {}

  async ngOnInit() {
    try {
      const user = await this.authService.getCurrentUser();
      console.log('Usuario actual:', user);
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      this.router.navigate(['/login']);
    }
  }
  
  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}