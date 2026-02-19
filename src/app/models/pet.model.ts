export type PetSex = 'male' | 'female';

export type PetStatus = 'забронирован' | 'дома на испытательном' | 'ждет родителей';

export interface IPet {
  id: string;
  name: string;
  age: number;
  sex: PetSex;
  description: string;
  character: string;
  status: PetStatus;
  sterilized: boolean;
  vaccinated: boolean;
  specialCare: boolean;
  coverImg: string;
  images: string[];
  priorityToHome?: boolean;
  priorityOrder?: number;
}

export interface IPetsServerRes {
  pets: IPet[];
}

export interface IPetFilter {
  status?: PetStatus | null;
  sex?: PetSex | null;
  sterilized?: boolean | null;
  vaccinated?: boolean | null;
  specialCare?: boolean | null;
  minAge?: number | null;
  maxAge?: number | null;
  q?: string | null;
}
