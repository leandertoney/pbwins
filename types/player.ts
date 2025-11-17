export type WinRecord = {
  id?: string;
  opponent?: string;
  date?: string;
  location?: string;
  score?: string;
};

export type PlayerRecord = {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  slug?: string;
  duprRating?: number;
  rating?: number;
  ageGroup?: string;
  gender?: string;
  city?: string;
  state?: string;
  wins?: number | WinRecord[];
  winRecords?: WinRecord[];
  losses?: number;
  duprProfileUrl?: string;
  imageUrl?: string;
  createdAt?: number;
  isPro?: boolean;
};
