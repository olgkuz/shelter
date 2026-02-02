import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  delay,
  map,
  Observable,
  of,
  Subject,
  tap,
  withLatestFrom
} from 'rxjs';
import { API } from '../shared/api';
import { IPet, IPetFilter, IPetsServerRes } from '../models/pet.model';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  // фильтры
  private filterSubject = new BehaviorSubject<IPetFilter>({
    status: null,
    sex: null,
    sterilized: null,
    vaccinated: null,
    specialCare: null,
    minAge: null,
    maxAge: null,
    q: null
  });
  readonly filter$ = this.filterSubject.asObservable();

  // поиск (удобно отдельно, если хочешь debounce в компоненте)
  private searchSubject = new Subject<string>();
  readonly search$ = this.searchSubject.asObservable();

  constructor(
    private http: HttpClient
  ) {}

  /** Список животных (можно: серверные фильтры через query params) */
  /* TEMP: temporarily unused
  getPets(): Observable<IPet[]> {
    this.loaderService.setLoader(true);

    return this.filter$.pipe(
      // небольшая задержка как у тебя (можешь убрать)
      delay(100),
      map((filter) => this.buildPetsParams(filter)),
      // делаем запрос каждый раз при изменении фильтра
      // если не хочешь автоперезапрос — сделай отдельный метод getPets(filter)
      // и вызывай из компонента
      // но я сохраняю стиль "реактивно"
      // ---
      // ВАЖНО: если filter$ будет часто меняться, добавь debounceTime в компоненте
      // ---
      // запрос
      // eslint-disable-next-line rxjs/no-nested-subscribe
      // (здесь ок, т.к. switchMap не нужен — просто map -> http.get)
      // но сделаем правильно: ниже через map + switchMap не тащим, чтобы было похоже на твой стиль
      // поэтому читаемо: делаем сразу запрос с params
      // ---
      // Реализация ниже:
      //   map(filter -> params)
      //   switchMap(params -> http.get)
      // Чтобы не тащить switchMap в import, просто импортни если хочешь. Здесь добавлю.
      // ---
      // (см. код ниже)
      // ---
      // placeholder: этот map заменится дальше
      tap(() => {})
    );
  }
  */

  /**
   * Вариант getPets() попроще (рекомендую): без автоперезапроса.
   * Просто запрашивает /pets с текущими фильтрами.
   */
  loadPets(): Observable<IPet[]> {
    const filter = this.filterSubject.value;
    const params = this.buildPetsParams(filter);

    return this.http.get<IPetsServerRes>(API.pets, { params }).pipe(
      delay(300),
      map((res) => Array.isArray(res?.pets) ? res.pets : []),
      catchError((err) => {
        console.log('loadPets error', err);
        return of([]);
      })
    );
  }

  /** Карточка животного */
  getPetById(id: string): Observable<IPet> {
    return this.http.get<IPet>(`${API.petById}/${id}`).pipe(
      catchError((err) => {
        console.log('getPetById error', err);
        return of(null as any);
      })
    );
  }

  /** Отдельный эндпоинт на фото (если используешь /pets/:id/photos) */
  /* TEMP: temporarily unused
  getPetPhotos(id: string): Observable<string[]> {
    return this.http.get<{ id: string; photos: string[] }>(`${API.petPhotos}/${id}/photos`).pipe(
      map((res) => (Array.isArray(res?.photos) ? res.photos : [])),
      catchError((err) => {
        console.log('getPetPhotos error', err);
        return of([]);
      })
    );
  }
  */

  /** Локальный поиск по массиву */
  /* TEMP: temporarily unused
  searchPets(pets: IPet[], value: string): IPet[] {
    if (!Array.isArray(pets)) return [];
    const q = (value || '').toLowerCase().trim();
    if (!q) return pets;

    return pets.filter((p) => {
      const hay = [
        p?.name,
        p?.description,
        p?.character,
        p?.status
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return hay.includes(q);
    });
  }
  */

  /** Локальная фильтрация по массиву (если захочешь фильтровать на фронте) */
  /* TEMP: temporarily unused
  applyFilters(pets: IPet[], filter: IPetFilter): IPet[] {
    if (!Array.isArray(pets)) return [];

    return pets.filter((p) => {
      if (filter.status && p.status !== filter.status) return false;
      if (filter.sex && p.sex !== filter.sex) return false;

      if (filter.sterilized !== null && filter.sterilized !== undefined) {
        if (Boolean(p.sterilized) !== Boolean(filter.sterilized)) return false;
      }

      if (filter.vaccinated !== null && filter.vaccinated !== undefined) {
        if (Boolean(p.vaccinated) !== Boolean(filter.vaccinated)) return false;
      }

      if (filter.specialCare !== null && filter.specialCare !== undefined) {
        if (Boolean(p.specialCare) !== Boolean(filter.specialCare)) return false;
      }

      if (filter.minAge !== null && filter.minAge !== undefined) {
        if (Number(p.age) < Number(filter.minAge)) return false;
      }

      if (filter.maxAge !== null && filter.maxAge !== undefined) {
        if (Number(p.age) > Number(filter.maxAge)) return false;
      }

      if (filter.q) {
        const q = String(filter.q).toLowerCase().trim();
        const hay = [
          p?.name,
          p?.description,
          p?.character,
          p?.status
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }
  */

  /** Обновить фильтр (частично) */
  updateFilter(partial: Partial<IPetFilter>): void {
    const current = this.filterSubject.value;
    this.filterSubject.next({ ...current, ...partial });
  }

  /** Сброс фильтров */
  /* TEMP: temporarily unused
  resetFilter(): void {
    this.filterSubject.next({
      status: null,
      sex: null,
      sterilized: null,
      vaccinated: null,
      specialCare: null,
      minAge: null,
      maxAge: null,
      q: null
    });
  }
  */

  /** Инициировать поиск (если хочешь подписываться) */
  /* TEMP: temporarily unused
  initSearch(value: string): void {
    this.searchSubject.next(value);
    this.updateFilter({ q: value });
  }
  */

  /** Собираем query params под сервер /pets */
  private buildPetsParams(filter: IPetFilter): HttpParams {
    let params = new HttpParams();

    if (filter.status) params = params.set('status', String(filter.status));
    if (filter.sex) params = params.set('sex', String(filter.sex));

    if (filter.sterilized !== null && filter.sterilized !== undefined) {
      params = params.set('sterilized', String(filter.sterilized));
    }
    if (filter.vaccinated !== null && filter.vaccinated !== undefined) {
      params = params.set('vaccinated', String(filter.vaccinated));
    }
    if (filter.specialCare !== null && filter.specialCare !== undefined) {
      params = params.set('specialCare', String(filter.specialCare));
    }

    if (filter.minAge !== null && filter.minAge !== undefined) {
      params = params.set('minAge', String(filter.minAge));
    }
    if (filter.maxAge !== null && filter.maxAge !== undefined) {
      params = params.set('maxAge', String(filter.maxAge));
    }

    if (filter.q) params = params.set('q', String(filter.q));

    return params;
  }
}




