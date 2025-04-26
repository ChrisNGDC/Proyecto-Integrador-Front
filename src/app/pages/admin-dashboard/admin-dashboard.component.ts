import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  constructor(private authService: AuthService, private router: Router, private oidcSecurityService: OidcSecurityService // Inject OidcSecurityService
  ) {}
  onInit() {
    this.oidcSecurityService.getIdToken().subscribe(token => {
      console.log('ID Token:', token);
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
