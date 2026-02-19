import { Component } from '@angular/core';
import { Announcement } from '../../models/admin-content.model';
import { AdminContentService } from '../../servises/admin-content';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  announcements: Announcement[] = [];

  constructor(private adminContentService: AdminContentService) {
    this.announcements = this.adminContentService.getPublishedAnnouncements();
  }
}
