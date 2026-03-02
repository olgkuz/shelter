import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../../servises/admin-auth';
import { AdminContentService } from '../../../servises/admin-content';
import { AdminPetDraft, VetArticle } from '../../../models/admin-content.model';
import { AnnouncementsService } from '../../../servises/announcements';
import { IAnnouncement } from '../../../models/announcement.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
  activeTab: 'pets' | 'articles' | 'announcements' = 'pets';
  readonly petAgeOptions = Array.from({ length: 26 }, (_, index) => index);

  readonly petStatuses = [
    'Р·Р°Р±СЂРѕРЅРёСЂРѕРІР°РЅ',
    'Р¶РґРµС‚ СЂРѕРґРёС‚РµР»РµР№',
    'РЅР°С…РѕРґРёС‚СЃСЏ РїРѕРґ РїРѕР¶РёР·РЅРµРЅРЅРѕР№ РѕРїРµРєРѕР№ РїСЂРёСЋС‚Р°'
  ] as const;

  petForm = this.createDefaultPetForm();

  articleForm = {
    title: '',
    summary: '',
    content: ''
  };

  announcementForm = this.createDefaultAnnouncementForm();
  private announcementFiles: File[] = [];

  petDrafts: AdminPetDraft[] = [];
  articles: VetArticle[] = [];
  announcements: IAnnouncement[] = [];
  announcementsLoading = false;
  announcementsError = '';

  constructor(
    private adminAuthService: AdminAuthService,
    private adminContentService: AdminContentService,
    private announcementsService: AnnouncementsService,
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

  onPetImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const files = input?.files;
    if (!files) return;

    const names = Array.from(files)
      .slice(0, 5)
      .map((file) => file.name.trim())
      .filter(Boolean);

    this.petForm.images = names;
    this.petForm.coverImg = names[0] ?? '';
  }

  onAnnouncementImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const files = input?.files;
    if (!files) return;

    const selectedFiles = Array.from(files).slice(0, 5);
    const names = selectedFiles
      .map((file) => file.name.trim())
      .filter(Boolean);

    this.announcementFiles = selectedFiles;
    this.announcementForm.images = names;
    this.announcementForm.coverImg = names[0] ?? '';
  }

  submitPet(): void {
    const images = this.petForm.images
      .map((img) => img.trim())
      .filter(Boolean)
      .slice(0, 5);
    const coverImg = this.petForm.coverImg.trim() || images[0] || '';

    this.adminContentService.addPetDraft({
      name: this.petForm.name.trim(),
      age: Number(this.petForm.age),
      sex: this.petForm.sex,
      status: this.petForm.status as AdminPetDraft['status'],
      description: this.petForm.description.trim(),
      character: this.petForm.character.trim(),
      sterilized: this.petForm.sterilized,
      vaccinated: this.petForm.vaccinated,
      specialCare: this.petForm.specialCare,
      specialCareDetails: this.petForm.specialCare ? this.petForm.specialCareDetails.trim() : '',
      priorityToHome: this.petForm.priorityToHome,
      coverImg,
      images
    });

    this.petForm = this.createDefaultPetForm();
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
    const images = this.announcementForm.images
      .map((img) => img.trim())
      .filter(Boolean)
      .slice(0, 5);
    const coverImg = this.announcementForm.coverImg.trim() || images[0] || '';

    const payload = {
      title: this.announcementForm.title.trim(),
      description: this.announcementForm.description.trim(),
      contact: this.announcementForm.contact.trim(),
      published: this.announcementForm.published,
      coverImg,
      images
    };

    const request$ = this.announcementFiles.length
      ? this.announcementsService.uploadAnnouncement(payload, this.announcementFiles)
      : this.announcementsService.createAnnouncement(payload);

    request$.subscribe((created) => {
      if (!created) {
        this.announcementsError = 'РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ РѕР±СЉСЏРІР»РµРЅРёРµ.';
        return;
      }

      this.announcementForm = this.createDefaultAnnouncementForm();
      this.announcementFiles = [];
      this.loadAnnouncements();
    });
  }

  deleteAnnouncement(id: string): void {
    this.announcementsService.deleteAnnouncement(id).subscribe((ok) => {
      if (!ok) {
        this.announcementsError = 'РќРµ СѓРґР°Р»РѕСЃСЊ СѓРґР°Р»РёС‚СЊ РѕР±СЉСЏРІР»РµРЅРёРµ.';
        return;
      }
      this.loadAnnouncements();
    });
  }

  private refreshData(): void {
    this.petDrafts = this.adminContentService.getPetDrafts();
    this.articles = this.adminContentService.getArticles();
    this.loadAnnouncements();
  }

  private loadAnnouncements(): void {
    this.announcementsLoading = true;
    this.announcementsError = '';
    this.announcementsService.loadAll().subscribe((announcements) => {
      this.announcements = announcements;
      this.announcementsLoading = false;
    });
  }

  private createDefaultPetForm() {
    return {
      name: '',
      age: 1,
      sex: 'male' as 'male' | 'female',
      status: this.petStatuses[1],
      description: '',
      character: '',
      sterilized: false,
      vaccinated: false,
      specialCare: false,
      specialCareDetails: '',
      priorityToHome: false,
      coverImg: '',
      images: [] as string[]
    };
  }

  private createDefaultAnnouncementForm() {
    return {
      title: '',
      description: '',
      contact: '',
      published: true,
      coverImg: '',
      images: [] as string[]
    };
  }
}
