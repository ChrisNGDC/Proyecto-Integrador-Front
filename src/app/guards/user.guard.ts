import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    try {
      const isAuthenticated = await this.authService.isAuthenticated();      
      if (!isAuthenticated) {
        return this.router.createUrlTree(['/login']);
      }
      const isAdmin = await this.authService.isAdmin();      
      if (isAdmin) {
        // Si es admin tratando de acceder a ruta de usuario, redirige al dashboard de admin
        return this.router.createUrlTree(['/admin-dashboard']);
      }      
      return true;
    } catch (error) {
      return this.router.createUrlTree(['/login']);
    }
  }
}