import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, delay, map, Observable, of } from 'rxjs';
import { IAnnouncement, IAnnouncementsServerRes } from '../models/announcement.model';
import { API } from '../shared/api';
import {
  VALIDATION_LIMITS,
  isValidContact,
  isValidTitle,
  normalizeText
} from '../shared/validation/validation-rules';

export interface CreateAnnouncementPayload {
  title: string;
  description: string;
  contact: string;
  published?: boolean;
  coverImg?: string;
  images?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AnnouncementsService {
  constructor(private http: HttpClient) {}

  loadPublished(): Observable<IAnnouncement[]> {
    return this.http.get<IAnnouncementsServerRes | IAnnouncement[]>(API.announcementsPublished).pipe(
      delay(300),
      map((res) => this.extractAnnouncements(res)),
      catchError((err) => {
        console.log('loadPublished announcements error', err);
        return of([]);
      })
    );
  }

  loadAll(): Observable<IAnnouncement[]> {
    return this.http.get<IAnnouncementsServerRes | IAnnouncement[]>(API.announcements).pipe(
      delay(150),
      map((res) => this.extractAnnouncements(res)),
      catchError((err) => {
        console.log('loadAll announcements error', err);
        return of([]);
      })
    );
  }

  createAnnouncement(payload: CreateAnnouncementPayload): Observable<IAnnouncement | null> {
    const normalized = this.normalizePayload(payload);
    if (!normalized) {
      return of(null);
    }

    return this.http.post<IAnnouncement>(API.announcements, normalized).pipe(
      catchError((err) => {
        console.log('createAnnouncement error', err);
        return of(null);
      })
    );
  }

  uploadAnnouncement(payload: CreateAnnouncementPayload, files: File[]): Observable<IAnnouncement | null> {
    const normalized = this.normalizePayload(payload);
    if (!normalized) {
      return of(null);
    }

    const formData = new FormData();
    formData.append('title', normalized.title);
    formData.append('description', normalized.description);
    formData.append('contact', normalized.contact);
    formData.append('published', String(Boolean(normalized.published)));

    if (normalized.coverImg?.trim()) {
      formData.append('coverImg', normalized.coverImg.trim());
    }

    (normalized.images || []).forEach((image) => {
      const trimmed = image.trim();
      if (trimmed) {
        formData.append('images', trimmed);
      }
    });

    files.forEach((file) => {
      formData.append('images', file);
    });

    return this.http.post<IAnnouncement>(`${API.announcements}/upload`, formData).pipe(
      catchError((err) => {
        console.log('uploadAnnouncement error', err);
        return of(null);
      })
    );
  }

  deleteAnnouncement(id: string): Observable<boolean> {
    return this.http.delete<IAnnouncement | null>(`${API.announcementById}/${id}`).pipe(
      map((res) => Boolean(res)),
      catchError((err) => {
        console.log('deleteAnnouncement error', err);
        return of(false);
      })
    );
  }

  approveAnnouncement(id: string): Observable<IAnnouncement | null> {
    return this.http.post<IAnnouncement>(`${API.announcementById}/${id}/approve`, {}).pipe(
      catchError((err) => {
        console.log('approveAnnouncement error', err);
        return of(null);
      })
    );
  }

  rejectAnnouncement(id: string): Observable<IAnnouncement | null> {
    return this.http.post<IAnnouncement>(`${API.announcementById}/${id}/reject`, {}).pipe(
      catchError((err) => {
        console.log('rejectAnnouncement error', err);
        return of(null);
      })
    );
  }

  private extractAnnouncements(
    res: IAnnouncementsServerRes | IAnnouncement[] | null | undefined
  ): IAnnouncement[] {
    if (Array.isArray(res)) {
      return res;
    }

    return Array.isArray(res?.announcements) ? res.announcements : [];
  }

  private normalizePayload(payload: CreateAnnouncementPayload): CreateAnnouncementPayload | null {
    const title = normalizeText(payload.title);
    const description = normalizeText(payload.description);
    const contact = normalizeText(payload.contact);
    const coverImg = normalizeText(payload.coverImg || '');
    const images = (payload.images || [])
      .map((img) => normalizeText(img))
      .filter(Boolean)
      .slice(0, VALIDATION_LIMITS.maxImagesCount);

    if (!isValidTitle(title)) return null;
    if (
      description.length < VALIDATION_LIMITS.announcementDescriptionMin ||
      description.length > VALIDATION_LIMITS.announcementDescriptionMax
    ) return null;
    if (!isValidContact(contact)) return null;

    return {
      title,
      description,
      contact,
      published: Boolean(payload.published),
      coverImg,
      images
    };
  }
}
