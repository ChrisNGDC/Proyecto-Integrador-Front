import { Injectable, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private _isAuthenticated$ = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuthenticated$.asObservable();
  userData$ = this.oidcSecurityService.userData$;

  constructor() {
    this.initAuth();
  }

  private initAuth(): void {
    this.oidcSecurityService.isAuthenticated$.subscribe(({ isAuthenticated }) => {
      this._isAuthenticated$.next(isAuthenticated);
      console.log('AuthService: isAuthenticated:', isAuthenticated);      
    });
  }
  checkAuth(): void {
    this.oidcSecurityService.checkAuth().subscribe(({ isAuthenticated, idToken }) => {
      if (isAuthenticated && idToken) {
        const decodedToken: any = jwtDecode(idToken);
        const isAdmin = decodedToken['cognito:groups']?.includes('Admin');
        const route = isAdmin ? '/admin-dashboard' : '/user-dashboard';
        this.router.navigate([route]);        
      }
    });
  }  
    
  isAdmin(): Observable<boolean> {
    return this.oidcSecurityService.getIdToken().pipe(
      map((token) => {
        if (!token) return false;
        const decodedToken: any = jwtDecode(token);
        console.log(decodedToken)
        return decodedToken['cognito:groups']?.includes('Admin') ?? false;
      })
    );
  }
  
  isAuthenticated(): Observable<boolean> {
    return this.oidcSecurityService.isAuthenticated$.pipe(
      map(({ isAuthenticated }) => isAuthenticated)
    );
  }
  

  getCurrentUser(){
    return this.oidcSecurityService.userData$.pipe(
      map((data) => data?.userData)
    );
  }
  
  getUserRole(): Observable<string | null> {
    return this.oidcSecurityService.userData$.pipe(
      map((data) => data?.userData?.['custom:role'] ?? null)
    );    
  }

  login(): void {
    this.oidcSecurityService.authorize(); 
  }

  logout(): void {
    sessionStorage.clear();
    window.location.href = `https://us-east-1irahhdiiv.auth.us-east-1.amazoncognito.com/logout?client_id=4l266lkv7t1pvsd9fochnljcdq&logout_uri=http://localhost:4200/login`;
  }
}




