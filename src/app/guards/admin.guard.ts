import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take, switchMap, of} from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated().pipe(
      take(1),
      map((isAuth) => {
        if (!isAuth) {
          return this.router.parseUrl('/login');
        }
        return true; // Seguimos, pero falta chequear si es admin
      }),
      switchMap((result) => {
        if (result !== true) return of(result); // ya redirigido
  
        return this.authService.isAdmin().pipe(
          take(1),
          map((isAdmin) => {
            return isAdmin ? true : this.router.parseUrl('/user-dashboard');
          })
        );
      })
    );
  }
}