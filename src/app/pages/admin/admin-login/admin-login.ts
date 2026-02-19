import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminAuthService } from '../../../servises/admin-auth';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin {
  loginValue = '';
  passwordValue = '';
  error = '';

  constructor(
    private adminAuthService: AdminAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onSubmit(): void {
    const isAuth = this.adminAuthService.login(this.loginValue.trim(), this.passwordValue.trim());

    if (!isAuth) {
      this.error = 'Неверный логин или пароль';
      return;
    }

    this.error = '';
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    this.router.navigateByUrl(redirect || '/admin');
  }
}
