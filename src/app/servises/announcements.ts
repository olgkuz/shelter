import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, delay, map, Observable, of } from 'rxjs';
import { IAnnouncement, IAnnouncementsServerRes } from '../models/announcement.model';
import { API } from '../shared/api';

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
    return this.http.post<IAnnouncement>(API.announcements, payload).pipe(
      catchError((err) => {
        console.log('createAnnouncement error', err);
        return of(null);
      })
    );
  }

  uploadAnnouncement(payload: CreateAnnouncementPayload, files: File[]): Observable<IAnnouncement | null> {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('contact', payload.contact);
    formData.append('published', String(Boolean(payload.published)));

    if (payload.coverImg?.trim()) {
      formData.append('coverImg', payload.coverImg.trim());
    }

    (payload.images || []).forEach((image) => {
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

  private extractAnnouncements(
    res: IAnnouncementsServerRes | IAnnouncement[] | null | undefined
  ): IAnnouncement[] {
    if (Array.isArray(res)) {
      return res;
    }

    return Array.isArray(res?.announcements) ? res.announcements : [];
  }
}
