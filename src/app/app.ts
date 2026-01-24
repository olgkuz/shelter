import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,               // 👈 ОБЯЗАТЕЛЬНО
  imports: [RouterOutlet],        // 👈 теперь это валидно
  templateUrl: './app.html',
  styleUrls: ['./app.scss']       // лучше во множественном числе
})
export class App {
  protected readonly title = signal('shelter');
}
