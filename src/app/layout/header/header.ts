import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [DatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit,OnDestroy{
  dateTime = new Date();
  constructor() {}
  ngOnInit(): void {
    setInterval( () => {
      this.dateTime = new Date ();
    }, 1000)
  }
  ngOnDestroy() {}
}
