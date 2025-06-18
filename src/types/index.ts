
export interface CultivarImage {
  id: string;
  url: string;
  alt: string;
  'data-ai-hint'?: string;
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

export interface CannabinoidProfile {
  min: number;
  max: number;
}

export interface CultivationPhases {
  rooting: string; // e.g., "1-2 weeks"
  vegetative: string; // e.g., "4-8 weeks"
  flowering: string; // e.g., "8-10 weeks"
  harvest: string; // e.g., "After 9 weeks of flowering"
}

export interface PlantCharacteristics {
  minHeight?: number; // cm
  maxHeight?: number; // cm
}

export interface Cultivar {
  id: string;
  name: string;
  genetics: Genetics;
  thc: CannabinoidProfile;
  cbd: CannabinoidProfile;
  cbc?: CannabinoidProfile;
  cbg?: CannabinoidProfile;
  cbn?: CannabinoidProfile;
  thcv?: CannabinoidProfile;
  effects: string[];
  description: string;
  images: CultivarImage[];
  reviews: Review[];
  cultivationPhases?: CultivationPhases;
  plantCharacteristics?: PlantCharacteristics;
}
