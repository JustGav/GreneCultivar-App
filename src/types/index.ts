
import type { Timestamp } from 'firebase/firestore';

export interface CultivarImage {
  id: string;
  url: string;
  alt: string;
  'data-ai-hint'?: string;
}

export interface Review {
  id:string;
  user: string;
  rating: number; // 1-5
  text: string;
  sentimentScore?: number;
  createdAt: string; // ISO date string
}

export type Genetics = 'Indica' | 'Sativa' | 'Hybrid' | 'Ruderalis';
export type CultivarStatus = 'recentlyAdded' | 'Live' | 'featured' | 'archived' | 'User Submitted' | 'Hide';

export interface CannabinoidProfile {
  min?: number;
  max?: number;
}

export interface YieldProfile {
  min?: number;
  max?: number;
}

export interface CultivationPhases {
  germination?: string;
  rooting?: string;
  vegetative?: string;
  flowering?: string;
  harvest?: string;
}

export interface PlantCharacteristics {
  minHeight?: number;
  maxHeight?: number;
  minMoisture?: number;
  maxMoisture?: number;
  yieldPerPlant?: YieldProfile;
  yieldPerWatt?: YieldProfile;
  yieldPerM2?: YieldProfile;
}

export type AdditionalInfoCategoryKey = 'geneticCertificate' | 'plantPicture' | 'cannabinoidInfo' | 'terpeneInfo';

export interface AdditionalFileInfo {
  id: string;
  name: string;
  url: string;
  fileType: 'image' | 'pdf' | 'document';
  category: AdditionalInfoCategoryKey;
  'data-ai-hint'?: string;
}

export interface Terpene {
  id: string;
  name: string;
  percentage?: number;
}

export interface PricingProfile {
  min?: number;
  max?: number;
  avg?: number;
}

export interface CultivarHistoryEntry {
  timestamp: string; // ISO date string
  event: string; // e.g., "Cultivar Created", "Status changed to verified"
  userId?: string; // Optional: Firebase Auth UID of the user who made the change
  details?: Record<string, any>; // Optional: for storing specifics about the change (e.g., { newStatus: 'Live', oldStatus: 'pending', changedByEmail: 'user@example.com' })
}

export interface Cultivar {
  id: string; // Firestore document ID
  name: string;
  genetics: Genetics;
  status: CultivarStatus;
  source?: string;
  thc: CannabinoidProfile;
  cbd: CannabinoidProfile;
  cbc?: CannabinoidProfile;
  cbg?: CannabinoidProfile;
  cbn?: CannabinoidProfile;
  thcv?: CannabinoidProfile;
  effects: string[];
  medicalEffects?: string[];
  flavors?: string[];
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
  terpeneProfile?: Terpene[];
  pricing?: PricingProfile;
  supplierUrl?: string;
  parents?: string[];
  children?: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  history: CultivarHistoryEntry[]; // Changed to non-optional, will be initialized
}

// For displaying logs, augmenting history entries with cultivar info
export interface DisplayLogEntry extends CultivarHistoryEntry {
  cultivarId: string;
  cultivarName: string;
  userDisplay: string; // e.g., "User Email (UID)" or "System"
}
