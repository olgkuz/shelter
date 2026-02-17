import { Component, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Footer } from './footer/footer';
import { Header } from './header/header';
import { Aside } from './aside/aside';
import { LoaderComponent } from '../shared/components/loader/loader';
import { LoaderService } from '../servises/loader';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, NgIf, Footer, Header, Aside, LoaderComponent, AsyncPipe, ToastModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  showAside = false;
  loader$ = inject(LoaderService).loader$;

}
