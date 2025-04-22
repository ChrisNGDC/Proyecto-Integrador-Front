import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-user-dashboard',
  imports: [],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {
constructor(private authService: AuthService, private router:Router, private readonly oidcSecurityService: OidcSecurityService) {}
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
