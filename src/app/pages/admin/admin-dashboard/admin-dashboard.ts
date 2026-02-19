import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../../servises/admin-auth';
import { AdminContentService } from '../../../servises/admin-content';
import { AdminPetDraft, Announcement, VetArticle } from '../../../models/admin-content.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
  activeTab: 'pets' | 'articles' | 'announcements' = 'pets';

  petForm = {
    name: '',
    age: 1,
    sex: 'male' as 'male' | 'female',
    status: 'ждет родителей',
    coverImg: '',
    description: ''
  };

  articleForm = {
    title: '',
    summary: '',
    content: ''
  };

  announcementForm = {
    title: '',
    description: '',
    contact: ''
  };

  petDrafts: AdminPetDraft[] = [];
  articles: VetArticle[] = [];
  announcements: Announcement[] = [];

  constructor(
    private adminAuthService: AdminAuthService,
    private adminContentService: AdminContentService,
    private router: Router
  ) {
    this.refreshData();
  }

  logout(): void {
    this.adminAuthService.logout();
    this.router.navigate(['/admin/login']);
  }

  setTab(tab: 'pets' | 'articles' | 'announcements'): void {
    this.activeTab = tab;
  }

  submitPet(): void {
    this.adminContentService.addPetDraft({
      name: this.petForm.name.trim(),
      age: Number(this.petForm.age),
      sex: this.petForm.sex,
      status: this.petForm.status.trim(),
      coverImg: this.petForm.coverImg.trim(),
      description: this.petForm.description.trim()
    });

    this.petForm = {
      name: '',
      age: 1,
      sex: 'male',
      status: 'ждет родителей',
      coverImg: '',
      description: ''
    };

    this.refreshData();
  }

  submitArticle(): void {
    this.adminContentService.addArticle({
      title: this.articleForm.title.trim(),
      summary: this.articleForm.summary.trim(),
      content: this.articleForm.content.trim()
    });

    this.articleForm = {
      title: '',
      summary: '',
      content: ''
    };

    this.refreshData();
  }

  submitAnnouncement(): void {
    this.adminContentService.submitAnnouncement({
      title: this.announcementForm.title.trim(),
      description: this.announcementForm.description.trim(),
      contact: this.announcementForm.contact.trim()
    });

    this.announcementForm = {
      title: '',
      description: '',
      contact: ''
    };

    this.refreshData();
  }

  approveAnnouncement(id: string): void {
    this.adminContentService.approveAnnouncement(id);
    this.refreshData();
  }

  rejectAnnouncement(id: string): void {
    this.adminContentService.rejectAnnouncement(id);
    this.refreshData();
  }

  private refreshData(): void {
    this.petDrafts = this.adminContentService.getPetDrafts();
    this.articles = this.adminContentService.getArticles();
    this.announcements = this.adminContentService.getAnnouncements();
  }
}
