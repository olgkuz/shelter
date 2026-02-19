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
    'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=2400&q=80',
    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=2400&q=80',
    'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=2400&q=80'
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
