import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, delay, map, Observable, of } from 'rxjs';
import { IVetArticle, IVetArticlesServerRes } from '../models/vet-article.model';
import { API } from '../shared/api';

export interface CreateVetArticlePayload {
  title: string;
  summary: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class VetAdviceService {
  constructor(private http: HttpClient) {}

  loadArticles(): Observable<IVetArticle[]> {
    return this.http.get<IVetArticlesServerRes | IVetArticle[]>(API.vetAdvice).pipe(
      delay(300),
      map((res) => this.extractArticles(res)),
      catchError((err) => {
        console.log('loadArticles error', err);
        return of([]);
      })
    );
  }

  getArticleById(id: string): Observable<IVetArticle | null> {
    return this.http.get<IVetArticle>(`${API.vetAdviceById}/${id}`).pipe(
      catchError((err) => {
        console.log('getArticleById error', err);
        return of(null);
      })
    );
  }

  createArticle(payload: CreateVetArticlePayload): Observable<IVetArticle | null> {
    return this.http.post<IVetArticle>(API.vetAdvice, payload).pipe(
      catchError((err) => {
        console.log('createArticle error', err);
        return of(null);
      })
    );
  }

  private extractArticles(res: IVetArticlesServerRes | IVetArticle[] | null | undefined): IVetArticle[] {
    if (Array.isArray(res)) {
      return res;
    }

    return Array.isArray(res?.articles) ? res.articles : [];
  }
}
