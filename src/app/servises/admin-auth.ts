import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private readonly authStorageKey = 'shelter_admin_auth';
  private readonly adminLogin = 'admin';
  private readonly adminPassword = '123456';

  login(login: string, password: string): boolean {
    const isValid = login === this.adminLogin && password === this.adminPassword;

    if (isValid) {
      localStorage.setItem(this.authStorageKey, '1');
    }

    return isValid;
  }

  logout(): void {
    localStorage.removeItem(this.authStorageKey);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem(this.authStorageKey) === '1';
  }
}
