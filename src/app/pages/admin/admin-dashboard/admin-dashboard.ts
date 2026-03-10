import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminPetDraft, VetArticle } from '../../../models/admin-content.model';
import { IAnnouncement } from '../../../models/announcement.model';
import { AdminAuthService } from '../../../servises/admin-auth';
import { AdminContentService } from '../../../servises/admin-content';
import { AnnouncementsService } from '../../../servises/announcements';
import {
  VALIDATION_LIMITS,
  VALIDATION_PATTERNS,
  isValidContact,
  isValidTitle,
  normalizeText,
  validateImageFiles
} from '../../../shared/validation/validation-rules';

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
  readonly contactPatternHtml = VALIDATION_PATTERNS.contactHtml;

  readonly petStatuses = [
    'забронирован',
    'ждет родителей',
    'находится под пожизненной опекой приюта'
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

  petFormError = '';
  articleFormError = '';
  announcementFormError = '';
  petImagesError = '';
  announcementImagesError = '';

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
    const result = validateImageFiles(input?.files ?? null);

    this.petImagesError = result.error;
    this.petForm.images = result.names;
    this.petForm.coverImg = result.names[0] ?? '';
  }

  onAnnouncementImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const result = validateImageFiles(input?.files ?? null);

    this.announcementImagesError = result.error;
    this.announcementFiles = result.files;
    this.announcementForm.images = result.names;
    this.announcementForm.coverImg = result.names[0] ?? '';
  }

  submitPet(): void {
    this.petFormError = '';

    if (this.petImagesError) {
      this.petFormError = this.petImagesError;
      return;
    }

    const validationError = this.validatePetForm();
    if (validationError) {
      this.petFormError = validationError;
      return;
    }

    const images = this.normalizeImageNames(this.petForm.images);
    const coverImg = normalizeText(this.petForm.coverImg) || images[0] || '';

    this.adminContentService.addPetDraft({
      name: normalizeText(this.petForm.name),
      age: Number(this.petForm.age),
      sex: this.petForm.sex,
      status: this.petForm.status as AdminPetDraft['status'],
      description: normalizeText(this.petForm.description),
      character: normalizeText(this.petForm.character),
      sterilized: this.petForm.sterilized,
      vaccinated: this.petForm.vaccinated,
      specialCare: this.petForm.specialCare,
      specialCareDetails: this.petForm.specialCare ? normalizeText(this.petForm.specialCareDetails) : '',
      priorityToHome: this.petForm.priorityToHome,
      coverImg,
      images
    });

    this.petForm = this.createDefaultPetForm();
    this.petImagesError = '';
    this.refreshData();
  }

  submitArticle(): void {
    this.articleFormError = '';

    const validationError = this.validateArticleForm();
    if (validationError) {
      this.articleFormError = validationError;
      return;
    }

    this.adminContentService.addArticle({
      title: normalizeText(this.articleForm.title),
      summary: normalizeText(this.articleForm.summary),
      content: normalizeText(this.articleForm.content)
    });

    this.articleForm = {
      title: '',
      summary: '',
      content: ''
    };

    this.refreshData();
  }

  submitAnnouncement(): void {
    this.announcementFormError = '';

    if (this.announcementImagesError) {
      this.announcementFormError = this.announcementImagesError;
      return;
    }

    const validationError = this.validateAnnouncementForm();
    if (validationError) {
      this.announcementFormError = validationError;
      return;
    }

    const images = this.normalizeImageNames(this.announcementForm.images);
    const coverImg = normalizeText(this.announcementForm.coverImg) || images[0] || '';

    const payload = {
      title: normalizeText(this.announcementForm.title),
      description: normalizeText(this.announcementForm.description),
      contact: normalizeText(this.announcementForm.contact),
      published: this.announcementForm.published,
      coverImg,
      images
    };

    const request$ = this.announcementFiles.length
      ? this.announcementsService.uploadAnnouncement(payload, this.announcementFiles)
      : this.announcementsService.createAnnouncement(payload);

    request$.subscribe((created) => {
      if (!created) {
        this.announcementsError = 'Не удалось сохранить объявление.';
        return;
      }

      this.announcementForm = this.createDefaultAnnouncementForm();
      this.announcementFiles = [];
      this.announcementImagesError = '';
      this.loadAnnouncements();
    });
  }

  deleteAnnouncement(id: string): void {
    this.announcementsService.deleteAnnouncement(id).subscribe((ok) => {
      if (!ok) {
        this.announcementsError = 'Не удалось удалить объявление.';
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

  private validatePetForm(): string | null {
    const name = normalizeText(this.petForm.name);
    const description = normalizeText(this.petForm.description);
    const character = normalizeText(this.petForm.character);
    const specialCareDetails = normalizeText(this.petForm.specialCareDetails);

    if (name.length < VALIDATION_LIMITS.petNameMin || name.length > VALIDATION_LIMITS.petNameMax) {
      return 'Имя питомца должно быть от 2 до 80 символов.';
    }

    if (!this.petAgeOptions.includes(Number(this.petForm.age))) {
      return 'Возраст питомца должен быть в диапазоне от 0 до 25 лет.';
    }

    if (this.petForm.sex !== 'male' && this.petForm.sex !== 'female') {
      return 'Укажите корректный пол питомца.';
    }

    if (!(this.petStatuses as readonly string[]).includes(this.petForm.status)) {
      return 'Укажите корректный статус питомца.';
    }

    if (
      description.length < VALIDATION_LIMITS.petDescriptionMin ||
      description.length > VALIDATION_LIMITS.petDescriptionMax
    ) {
      return 'Описание питомца должно быть от 10 до 1000 символов.';
    }

    if (
      character.length < VALIDATION_LIMITS.petCharacterMin ||
      character.length > VALIDATION_LIMITS.petCharacterMax
    ) {
      return 'Характер должен быть от 3 до 500 символов.';
    }

    if (
      this.petForm.specialCare &&
      (specialCareDetails.length < VALIDATION_LIMITS.specialCareDetailsMin ||
        specialCareDetails.length > VALIDATION_LIMITS.specialCareDetailsMax)
    ) {
      return 'Особенности ухода должны быть от 5 до 500 символов.';
    }

    return null;
  }

  private validateArticleForm(): string | null {
    const title = normalizeText(this.articleForm.title);
    const summary = normalizeText(this.articleForm.summary);
    const content = normalizeText(this.articleForm.content);

    if (!isValidTitle(title)) {
      return 'Заголовок статьи должен быть от 2 до 140 символов.';
    }

    if (
      summary.length < VALIDATION_LIMITS.articleSummaryMin ||
      summary.length > VALIDATION_LIMITS.articleSummaryMax
    ) {
      return 'Краткое описание статьи должно быть от 10 до 300 символов.';
    }

    if (
      content.length < VALIDATION_LIMITS.articleContentMin ||
      content.length > VALIDATION_LIMITS.articleContentMax
    ) {
      return 'Текст статьи должен быть от 30 до 10000 символов.';
    }

    return null;
  }

  private validateAnnouncementForm(): string | null {
    const title = normalizeText(this.announcementForm.title);
    const description = normalizeText(this.announcementForm.description);
    const contact = normalizeText(this.announcementForm.contact);

    if (!isValidTitle(title)) {
      return 'Заголовок объявления должен быть от 2 до 140 символов.';
    }

    if (
      description.length < VALIDATION_LIMITS.announcementDescriptionMin ||
      description.length > VALIDATION_LIMITS.announcementDescriptionMax
    ) {
      return 'Описание объявления должно быть от 10 до 1500 символов.';
    }

    if (!isValidContact(contact)) {
      return 'Контакт должен быть телефоном или email в корректном формате.';
    }

    return null;
  }

  private normalizeImageNames(images: string[]): string[] {
    return images
      .map((img) => normalizeText(img))
      .filter(Boolean)
      .slice(0, VALIDATION_LIMITS.maxImagesCount);
  }
}