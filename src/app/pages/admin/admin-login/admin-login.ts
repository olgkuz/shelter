import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
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
export class AdminLogin implements OnDestroy {
  private readonly maxAttempts = 5;
  private readonly lockDurationMs = 60_000;
  private failedAttempts = 0;
  private unlockTimer: ReturnType<typeof setTimeout> | null = null;

  loginValue = '';
  passwordValue = '';
  error = '';
  isLocked = false;

  constructor(
    private adminAuthService: AdminAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onSubmit(): void {
    if (this.isLocked) {
      this.error = 'Слишком много попыток. Повторите вход через минуту.';
      return;
    }

    const login = this.loginValue.trim();
    const password = this.passwordValue.trim();

    if (login.length < 3 || login.length > 64) {
      this.error = 'Логин должен быть от 3 до 64 символов.';
      return;
    }

    if (password.length < 6 || password.length > 128) {
      this.error = 'Пароль должен быть от 6 до 128 символов.';
      return;
    }

    const isAuth = this.adminAuthService.login(login, password);

    if (!isAuth) {
      this.failedAttempts += 1;

      if (this.failedAttempts >= this.maxAttempts) {
        this.lockLogin();
        return;
      }

      this.error = 'Неверный логин или пароль';
      return;
    }

    this.failedAttempts = 0;
    this.error = '';
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    this.router.navigateByUrl(redirect || '/admin');
  }

  ngOnDestroy(): void {
    if (this.unlockTimer) {
      clearTimeout(this.unlockTimer);
    }
  }

  private lockLogin(): void {
    this.isLocked = true;
    this.error = 'Слишком много попыток. Повторите вход через минуту.';
    this.failedAttempts = 0;

    if (this.unlockTimer) {
      clearTimeout(this.unlockTimer);
    }

    this.unlockTimer = setTimeout(() => {
      this.isLocked = false;
      this.error = '';
      this.unlockTimer = null;
    }, this.lockDurationMs);
  }
}

