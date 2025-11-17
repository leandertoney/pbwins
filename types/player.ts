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
  singlesRating?: number;
  ageGroup?: string;
  gender?: string;
  birthYear?: number;
  city?: string;
  state?: string;
  country?: string;
  locationRaw?: string;
  wins?: number | WinRecord[];
  winRecords?: WinRecord[];
  losses?: number;
  duprProfileUrl?: string;
  imageUrl?: string;
  createdAt?: number;
  updatedAt?: number;
  bio?: string;
  isPro?: boolean;
};
