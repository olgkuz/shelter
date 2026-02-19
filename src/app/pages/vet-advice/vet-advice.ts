import { Component } from '@angular/core';
import { VetArticle } from '../../models/admin-content.model';
import { AdminContentService } from '../../servises/admin-content';

@Component({
  selector: 'app-vet-advice',
  standalone: true,
  imports: [],
  templateUrl: './vet-advice.html',
  styleUrl: './vet-advice.scss',
})
export class VetAdvice {
  articles: VetArticle[] = [];

  constructor(private adminContentService: AdminContentService) {
    this.articles = this.adminContentService.getArticles();
  }
}
