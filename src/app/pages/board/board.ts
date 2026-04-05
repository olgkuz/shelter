import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { IAnnouncement } from '../../models/announcement.model';
import { AnnouncementsService } from '../../servises/announcements';
import { LoaderService } from '../../servises/loader';
import { API } from '../../shared/api';
import {
  normalizeText,
  validateImageFiles
} from '../../shared/validation/validation-rules';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board implements OnInit, OnDestroy {
  announcements: IAnnouncement[] = [];
  loading = false;
  error = '';
  formError = '';
  formSuccess = '';
  imagesError = '';
  private readonly outdatedReportedIds = new Set<string>();
  private sub: Subscription | null = null;
  readonly imagesBase = API.images;
  private announcementFiles: File[] = [];

  announcementForm = {
    title: '',
    description: '',
    contact: '',
    coverImg: '',
    images: [] as string[]
  };

  constructor(
    private announcementsService: AnnouncementsService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.loaderService.setLoader(true);
    this.sub = this.announcementsService.loadPublished().subscribe({
      next: (announcements) => {
        this.announcements = announcements;
        this.error = '';
        this.loading = false;
        this.loaderService.setLoader(false);
      },
      error: () => {
        this.error = 'Не удалось загрузить объявления.';
        this.loading = false;
        this.loaderService.setLoader(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.loaderService.setLoader(false);
  }

  getAnnouncementImage(item: IAnnouncement): string | null {
    const cover = (item.coverImg || '').trim();
    if (cover) return cover;

    const firstGallery = (item.images || []).find((img) => Boolean(img?.trim()));
    return firstGallery?.trim() || null;
  }

  reportOutdated(id: string): void {
    this.outdatedReportedIds.add(id);
  }

  isOutdatedReported(id: string): boolean {
    return this.outdatedReportedIds.has(id);
  }

  onAnnouncementImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const result = validateImageFiles(input?.files ?? null);

    this.imagesError = result.error;
    this.announcementFiles = result.files;
    this.announcementForm.images = result.names;
    this.announcementForm.coverImg = result.names[0] ?? '';
  }

  submitAnnouncement(): void {
    this.formError = '';
    this.formSuccess = '';

    if (this.imagesError) {
      this.formError = this.imagesError;
      return;
    }

    const payload = {
      title: normalizeText(this.announcementForm.title),
      description: normalizeText(this.announcementForm.description),
      contact: normalizeText(this.announcementForm.contact),
      published: false,
      coverImg: normalizeText(this.announcementForm.coverImg),
      images: this.announcementForm.images
    };

    const request$ = this.announcementFiles.length
      ? this.announcementsService.uploadAnnouncement(payload, this.announcementFiles)
      : this.announcementsService.createAnnouncement(payload);

    request$.subscribe((created) => {
      if (!created) {
        this.formError = 'Не удалось отправить объявление на модерацию.';
        return;
      }

      this.announcementForm = {
        title: '',
        description: '',
        contact: '',
        coverImg: '',
        images: []
      };
      this.announcementFiles = [];
      this.imagesError = '';
      this.formSuccess = 'Спасибо! Объявление отправлено на модерацию.';
    });
  }
}
