import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    try {
      const isAuthenticated = await this.authService.isAuthenticated();      
      if (!isAuthenticated) {
        return this.router.createUrlTree(['/login']);
      }
      const isAdmin = await this.authService.isAdmin();      
      if (!isAdmin) {
        // Si está autenticado pero no es admin, redirige al dashboard de usuario
        return this.router.createUrlTree(['/user-dashboard']);
      }      
      return true;
    } catch (error) {
      // En caso de error, redirige al login
      return this.router.createUrlTree(['/login']);
    }
  }
}