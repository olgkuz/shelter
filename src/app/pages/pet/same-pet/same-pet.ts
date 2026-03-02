import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { Subscription } from 'rxjs';
import { IPet } from '../../../models/pet.model';
import { LoaderService } from '../../../servises/loader';
import { PetService } from '../../../servises/pet';
import { API } from '../../../shared/api';

@Component({
  selector: 'app-same-pet',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink, GalleriaModule],
  templateUrl: './same-pet.html',
  styleUrl: './same-pet.scss',
})
export class SamePet implements OnChanges, OnDestroy {
  @Input() pet: IPet | null = null;

  readonly imagesBase = API.images;
  similarPets: IPet[] = [];
  galleryItems: Array<{
    pet: IPet;
    itemImageSrc: string | null;
    thumbnailImageSrc: string | null;
    alt: string;
    title: string;
  }> = [];
  responsiveOptions: Array<{ breakpoint: string; numVisible: number }> = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 4 },
    { breakpoint: '560px', numVisible: 3 }
  ];

  activeIndex = 0;
  isOpen = false;
  loading = false;

  private sub: Subscription | null = null;

  constructor(
    private petService: PetService,
    private loaderService: LoaderService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pet']) {
      this.activeIndex = 0;
      if (this.isOpen) {
        this.loadSimilarPets();
      }
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.loaderService.setLoader(false);
  }

  toggleOpen(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadSimilarPets();
    }
  }

  private loadSimilarPets(): void {
    if (!this.pet?.id) {
      this.similarPets = [];
      this.galleryItems = [];
      return;
    }

    this.loading = true;
    this.loaderService.setLoader(true);
    this.sub?.unsubscribe();
    this.sub = this.petService.getSimilarPets(this.pet.id).subscribe({
      next: (pets) => {
        this.similarPets = pets;
        this.galleryItems = pets.map((p) => {
          const image = this.resolvePetImage(p);
          return {
            pet: p,
            itemImageSrc: image ? `${this.imagesBase}/${image}` : null,
            thumbnailImageSrc: image ? `${this.imagesBase}/${image}` : null,
            alt: p.name,
            title: p.name
          };
        });
        this.activeIndex = 0;
        this.loading = false;
        this.loaderService.setLoader(false);
      },
      error: () => {
        this.similarPets = [];
        this.galleryItems = [];
        this.loading = false;
        this.loaderService.setLoader(false);
      }
    });
  }

  private resolvePetImage(pet: IPet): string | null {
    const cover = (pet.coverImg || '').trim();
    if (cover) return cover;

    const firstGallery = (pet.images || []).find((img) => Boolean(img?.trim()));
    return firstGallery?.trim() || null;
  }
}

