import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { API } from '../../../../shared/api';
import { PetService } from '../../../../servises/pet';
import { IPet } from '../../../../models/pet.model';

@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pets.html',
  styleUrl: './pets.scss',
})
export class Pets implements OnInit, OnDestroy {
  pets: IPet[] = [];
  loading = false;
  error = '';
  readonly imagesBase = API.images;

  private sub: Subscription | null = null;

  constructor(private petService: PetService) {}

  ngOnInit(): void {
    this.loading = true;
    this.sub = this.petService.loadPets().subscribe({
      next: (pets) => {
        this.pets = pets;
        this.error = '';
        this.loading = false;
      },
      error: () => {
        this.error = 'Не удалось загрузить список животных.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
