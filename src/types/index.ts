
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

export type Genetics = 'Indica' | 'Sativa' | 'Hybrid' | 'Ruderalis';

export interface CannabinoidProfile {
  min: number;
  max: number;
}

export interface YieldProfile {
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
  minMoisture?: number; // %
  maxMoisture?: number; // %
  yieldPerPlant?: YieldProfile; // g
  yieldPerWatt?: YieldProfile; // g/W
  yieldPerM2?: YieldProfile; // g/m²
}

export type AdditionalInfoCategoryKey = 'geneticCertificate' | 'plantPicture' | 'cannabinoidInfo' | 'terpeneInfo';

export interface AdditionalFileInfo {
  id: string;
  name: string;
  url: string; // Placeholder URL
  fileType: 'image' | 'pdf' | 'document';
  category: AdditionalInfoCategoryKey;
  'data-ai-hint'?: string; // For images
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
  additionalInfo?: {
    geneticCertificate?: AdditionalFileInfo[];
    plantPicture?: AdditionalFileInfo[];
    cannabinoidInfo?: AdditionalFileInfo[];
    terpeneInfo?: AdditionalFileInfo[];
  };
}
