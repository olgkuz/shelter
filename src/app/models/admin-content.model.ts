export interface AdminPetDraft {
  id: string;
  name: string;
  age: number;
  sex: 'male' | 'female';
  status: string;
  coverImg?: string;
  description?: string;
  createdAt: string;
}

export interface VetArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
}

export type AnnouncementStatus = 'pending' | 'published' | 'rejected';

export interface Announcement {
  id: string;
  title: string;
  description: string;
  contact: string;
  createdAt: string;
  status: AnnouncementStatus;
  publishedAt?: string;
}
