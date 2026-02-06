import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { IPet } from '../../../models/pet.model';
import { PetService } from '../../../servises/pet';
import { API } from '../../../shared/api';

@Component({
  selector: 'app-same-pet',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './same-pet.html',
  styleUrl: './same-pet.scss',
})
export class SamePet implements OnChanges, OnDestroy {
  @Input() pet: IPet | null = null;

  readonly imagesBase = API.images;
  similarPets: IPet[] = [];
  isOpen = false;
  loading = false;
  currentIndex = 0;

  private sub: Subscription | null = null;

  constructor(private petService: PetService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pet']) {
      this.currentIndex = 0;
      if (this.isOpen) {
        this.loadSimilarPets();
      }
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleOpen(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadSimilarPets();
    }
  }

  showNext(): void {
    if (!this.similarPets.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.similarPets.length;
  }

  showPrev(): void {
    if (!this.similarPets.length) return;
    this.currentIndex =
      (this.currentIndex - 1 + this.similarPets.length) % this.similarPets.length;
  }

  private loadSimilarPets(): void {
    if (!this.pet?.id) {
      this.similarPets = [];
      return;
    }

    this.loading = true;
    this.sub?.unsubscribe();
    this.sub = this.petService.getSimilarPets(this.pet.id).subscribe({
      next: (pets) => {
        this.similarPets = pets;
        this.currentIndex = 0;
        this.loading = false;
      },
      error: () => {
        this.similarPets = [];
        this.loading = false;
      }
    });
  }
}
