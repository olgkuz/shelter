import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';
import { API } from '../../../../shared/api';
import { PetService } from '../../../../servises/pet';
import { IPet } from '../../../../models/pet.model';
import { HighlightDirective } from '../../../../shared/derectives/highlight';

@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    RouterLink,
    FormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    HighlightDirective
  ],
  templateUrl: './pets.html',
  styleUrl: './pets.scss',
})
export class Pets implements OnInit, OnDestroy {
  pets: IPet[] = [];
  searchQuery = '';
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

  get filteredPets(): IPet[] {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      return this.pets;
    }

    return this.pets.filter((pet) => pet.name.toLowerCase().includes(query));
  }
}
