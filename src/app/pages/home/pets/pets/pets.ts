import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';
import { API } from '../../../../shared/api';
import { LoaderService } from '../../../../servises/loader';
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
  @Input() viewMode: 'full' | 'home' = 'full';

  pets: IPet[] = [];
  searchQuery = '';
  loading = false;
  error = '';
  readonly imagesBase = API.images;
  readonly homePreviewLimit = 8;

  private sub: Subscription | null = null;

  constructor(
    private petService: PetService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.loaderService.setLoader(true);
    this.sub = this.petService.loadPets().subscribe({
      next: (pets) => {
        this.pets = pets;
        this.error = '';
        this.loading = false;
        this.loaderService.setLoader(false);
      },
      error: () => {
        this.error = 'Не удалось загрузить список животных.';
        this.loading = false;
        this.loaderService.setLoader(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.loaderService.setLoader(false);
  }

  get isHomePreview(): boolean {
    return this.viewMode === 'home';
  }

  get visiblePets(): IPet[] {
    const query = this.searchQuery.trim().toLowerCase();
    const sourcePets = this.sortedPets;
    const filtered = query
      ? sourcePets.filter((pet) => pet.name.toLowerCase().includes(query))
      : sourcePets;

    if (!this.isHomePreview) {
      return filtered;
    }

    return filtered.slice(0, this.homePreviewLimit);
  }

  private get sortedPets(): IPet[] {
    return [...this.pets].sort((a, b) => {
      const aPriority = this.getPriorityValue(a);
      const bPriority = this.getPriorityValue(b);

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return a.name.localeCompare(b.name);
    });
  }

  private getPriorityValue(pet: IPet): number {
    if (typeof pet.priorityOrder === 'number') {
      return pet.priorityOrder;
    }

    return pet.priorityToHome ? 0 : 1000;
  }

  get filteredPets(): IPet[] {
    return this.visiblePets;
  }
}



