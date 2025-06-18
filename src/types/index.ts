export interface CultivarImage {
  id: string;
  url: string;
  alt: string;
}

export interface Review {
  id: string;
  user: string;
  rating: number; // 1-5
  text: string;
  sentimentScore?: number;
  createdAt: string; // ISO date string
}

export type Genetics = 'Indica' | 'Sativa' | 'Hybrid';

export interface Cultivar {
  id: string;
  name: string;
  genetics: Genetics;
  thc: { min: number; max: number };
  cbd: { min: number; max: number };
  effects: string[];
  description: string;
  images: CultivarImage[];
  reviews: Review[];
}
