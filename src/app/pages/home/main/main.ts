import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main implements OnInit, OnDestroy {
  private intervalId: number | undefined;
  constructor(private cdr: ChangeDetectorRef) {}

  images = [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1920&q=80'
  ];

  currentIndex = 0;

  get currentImage(): string {
    return this.images[this.currentIndex];
  }

  ngOnInit(): void {
    this.startSlider();
  }

  ngOnDestroy(): void {
    this.stopSlider();
  }

  startSlider(): void {
    if (this.intervalId !== undefined) {
      return;
    }

    this.intervalId = window.setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.cdr.detectChanges();
    }, 5000);
  }

  stopSlider(): void {
    if (this.intervalId === undefined) {
      return;
    }

    window.clearInterval(this.intervalId);
    this.intervalId = undefined;
  }
}
