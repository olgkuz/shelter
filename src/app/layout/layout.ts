import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Footer } from './footer/footer';
import { Header } from './header/header';
import { Aside } from './aside/aside';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, Footer, Header,Aside],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit{

  constructor () {}
  ngOnInit(): void {
    ;
  }

}
