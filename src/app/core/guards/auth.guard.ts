import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.token) {
      return true;
    }

    this.router.navigate(['/admin/login']);
    return false;
  }
}