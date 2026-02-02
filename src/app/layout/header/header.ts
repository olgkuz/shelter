import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MenubarModule,
    ButtonModule,
    DatePipe
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy {

  dateTime: Date = new Date();

  menuItems: MenuItem[] = [];

  sosIcon = 'pi pi-exclamation-triangle';

  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.menuItems = this.initMenuItems();

    this.ngZone.runOutsideAngular(() => {
      setInterval(() => {
        this.dateTime = new Date();
      }, 1000);
    });
  }

  ngOnDestroy() {}

  initMenuItems(): MenuItem[] {
    return [

      // Главная
      {
        label: 'Главная',
        icon: 'pi pi-home',
        routerLink: ['/']
      },

      // Каталог животных
      {
        label: 'Питомцы',
        icon: 'pi pi-heart',
        routerLink: ['/pets']
      },

      // Советы ветеринара
      {
        label: 'Советы ветеринара',
        icon: 'pi pi-book',
        routerLink: ['/vet-advice']
      },

      // Доска объявлений
      {
        label: 'Объявления',
        icon: 'pi pi-comments',
        routerLink: ['/board']
      }

    ];
  }

  goToSOS(): void {
    this.router.navigate(['/sos']);
  }

  hoverSOS(val: boolean): void {
    this.sosIcon = val
      ? 'pi pi-exclamation-circle'
      : 'pi pi-exclamation-triangle';
  }
}
