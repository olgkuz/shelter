import { PetSex, PetStatus } from './pet.model';

export interface AdminPetDraft {
  id: string;
  name: string;
  age: number;
  sex: PetSex;
  status: PetStatus;
  description: string;
  character: string;
  sterilized: boolean;
  vaccinated: boolean;
  specialCare: boolean;
  specialCareDetails: string;
  priorityToHome?: boolean;
  coverImg: string;
  images: string[];
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
  coverImg?: string;
  images?: string[];
  createdAt: string;
  status: AnnouncementStatus;
  publishedAt?: string;
}
