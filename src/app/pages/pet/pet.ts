import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, Subscription, switchMap } from 'rxjs';
import { CardModule } from 'primeng/card';
import { API } from '../../shared/api';
import { PetService } from '../../servises/pet';
import { IPet } from '../../models/pet.model';

@Component({
  selector: 'app-pet',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule],
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
    private petService: PetService
  ) {}

  ngOnInit(): void {
    this.loading = true;
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
            this.loading = false;
            return;
          }
          this.pet = pet;
          this.error = '';
          this.loading = false;
        },
        error: () => {
          this.error = 'Не удалось загрузить карточку питомца.';
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
