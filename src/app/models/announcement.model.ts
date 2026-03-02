export interface IAnnouncement {
  id: string;
  title: string;
  description: string;
  contact: string;
  published: boolean;
  coverImg: string;
  images: string[];
}

export interface IAnnouncementsServerRes {
  announcements: IAnnouncement[];
}
