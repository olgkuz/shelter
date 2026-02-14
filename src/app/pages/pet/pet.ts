import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, Subscription, switchMap } from 'rxjs';
import { CardModule } from 'primeng/card';
import { API } from '../../shared/api';
import { LoaderService } from '../../servises/loader';
import { PetService } from '../../servises/pet';
import { IPet } from '../../models/pet.model';
import { SamePet } from './same-pet/same-pet';

@Component({
  selector: 'app-pet',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink, CardModule, SamePet],
  templateUrl: './pet.html',
  styleUrl: './pet.scss',
})
export class Pet implements OnInit, OnDestroy {
  pet: IPet | null = null;
  loading = false;
  error = '';
  readonly imagesBase = API.images;

  private sub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private petService: PetService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.loaderService.setLoader(true);
    this.sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            this.error = 'Некорректный id питомца.';
            return of(null);
          }
          return this.petService.getPetById(id);
        })
      )
      .subscribe({
        next: (pet) => {
          if (!pet) {
            this.error = 'Не удалось загрузить карточку питомца. Проверьте, что backend запущен на http://localhost:3000';
            this.loading = false;
            this.loaderService.setLoader(false);
            return;
          }
          this.pet = pet;
          this.error = '';
          this.loading = false;
          this.loaderService.setLoader(false);
        },
        error: () => {
          this.error = 'Не удалось загрузить карточку питомца.';
          this.loading = false;
          this.loaderService.setLoader(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.loaderService.setLoader(false);
  }
}


