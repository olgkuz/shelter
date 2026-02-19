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

  constructor(private router: Router) {}

  goToAdminLogin(): void {
    this.router.navigate(['/admin/login']);
  }
}
