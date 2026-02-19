import { Injectable } from '@angular/core';
import { AdminPetDraft, Announcement, VetArticle } from '../models/admin-content.model';

@Injectable({
  providedIn: 'root'
})
export class AdminContentService {
  private readonly petsKey = 'shelter_admin_pet_drafts';
  private readonly articlesKey = 'shelter_admin_articles';
  private readonly announcementsKey = 'shelter_admin_announcements';

  getPetDrafts(): AdminPetDraft[] {
    return this.read<AdminPetDraft>(this.petsKey);
  }

  addPetDraft(payload: Omit<AdminPetDraft, 'id' | 'createdAt'>): void {
    const next: AdminPetDraft = {
      ...payload,
      id: this.createId(),
      createdAt: new Date().toISOString()
    };

    const current = this.getPetDrafts();
    this.write(this.petsKey, [next, ...current]);
  }

  getArticles(): VetArticle[] {
    return this.read<VetArticle>(this.articlesKey);
  }

  addArticle(payload: Omit<VetArticle, 'id' | 'createdAt'>): void {
    const next: VetArticle = {
      ...payload,
      id: this.createId(),
      createdAt: new Date().toISOString()
    };

    const current = this.getArticles();
    this.write(this.articlesKey, [next, ...current]);
  }

  getAnnouncements(): Announcement[] {
    return this.read<Announcement>(this.announcementsKey);
  }

  submitAnnouncement(payload: Omit<Announcement, 'id' | 'createdAt' | 'status' | 'publishedAt'>): void {
    const next: Announcement = {
      ...payload,
      id: this.createId(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const current = this.getAnnouncements();
    this.write(this.announcementsKey, [next, ...current]);
  }

  approveAnnouncement(id: string): void {
    const next = this.getAnnouncements().map((item) =>
      item.id === id
        ? { ...item, status: 'published' as const, publishedAt: new Date().toISOString() }
        : item
    );
    this.write(this.announcementsKey, next);
  }

  rejectAnnouncement(id: string): void {
    const next = this.getAnnouncements().map((item) =>
      item.id === id
        ? { ...item, status: 'rejected' as const }
        : item
    );
    this.write(this.announcementsKey, next);
  }

  getPublishedAnnouncements(): Announcement[] {
    return this.getAnnouncements().filter((item) => item.status === 'published');
  }

  private createId(): string {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private read<T>(key: string): T[] {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed as T[] : [];
    } catch {
      return [];
    }
  }

  private write(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
