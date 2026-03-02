import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { IVetArticle } from '../../models/vet-article.model';
import { LoaderService } from '../../servises/loader';
import { VetAdviceService } from '../../servises/vet-advice';

@Component({
  selector: 'app-vet-advice',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './vet-advice.html',
  styleUrl: './vet-advice.scss',
})
export class VetAdvice implements OnInit, OnDestroy {
  articles: IVetArticle[] = [];
  loading = false;
  error = '';
  private sub: Subscription | null = null;

  constructor(
    private vetAdviceService: VetAdviceService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.loaderService.setLoader(true);
    this.sub = this.vetAdviceService.loadArticles().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.error = '';
        this.loading = false;
        this.loaderService.setLoader(false);
      },
      error: () => {
        this.error = 'Не удалось загрузить статьи.';
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
