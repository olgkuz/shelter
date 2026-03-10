import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IAnnouncement } from '../../models/announcement.model';
import { AnnouncementsService } from '../../servises/announcements';
import { LoaderService } from '../../servises/loader';
import { API } from '../../shared/api';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board implements OnInit, OnDestroy {
  announcements: IAnnouncement[] = [];
  loading = false;
  error = '';
  private readonly outdatedReportedIds = new Set<string>();
  private sub: Subscription | null = null;
  readonly imagesBase = API.images;

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
}
