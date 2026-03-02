import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, Subscription, switchMap } from 'rxjs';
import { IVetArticle } from '../../../models/vet-article.model';
import { LoaderService } from '../../../servises/loader';
import { VetAdviceService } from '../../../servises/vet-advice';

@Component({
  selector: 'app-vet-article',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vet-article.html',
  styleUrl: './vet-article.scss',
})
export class VetArticlePage implements OnInit, OnDestroy {
  article: IVetArticle | null = null;
  loading = false;
  error = '';

  private sub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private vetAdviceService: VetAdviceService,
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
            this.error = 'Некорректный id статьи.';
            return of(null);
          }
          return this.vetAdviceService.getArticleById(id);
        })
      )
      .subscribe({
        next: (article) => {
          if (!article) {
            this.error = 'Статья не найдена.';
            this.loading = false;
            this.loaderService.setLoader(false);
            return;
          }

          this.article = article;
          this.error = '';
          this.loading = false;
          this.loaderService.setLoader(false);
        },
        error: () => {
          this.error = 'Не удалось загрузить статью.';
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
