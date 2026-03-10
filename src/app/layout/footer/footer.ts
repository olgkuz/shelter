import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  readonly brandYear = 2026;
  private adminClicks = 0;
  private readonly adminClicksRequired = 5;

  constructor(private router: Router) {}

  goToAdminLogin(): void {
    this.adminClicks += 1;

    if (this.adminClicks < this.adminClicksRequired) {
      return;
    }

    this.adminClicks = 0;
    this.router.navigate(['/admin/login']);
  }
}
