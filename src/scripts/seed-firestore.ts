
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import type { Cultivar, CannabinoidProfile, CultivationPhases, PlantCharacteristics, YieldProfile, AdditionalFileInfo, AdditionalInfoCategoryKey, Terpene, PricingProfile, CultivarImage, Review, CultivarStatus } from '../src/types';

const SERVICE_ACCOUNT_KEY_PATH = './serviceAccountKey.json'; 
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'grenecultivar'; 

const serviceAccount = require(SERVICE_ACCOUNT_KEY_PATH) as ServiceAccount;

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${FIREBASE_PROJECT_ID}.firebaseio.com`
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  if ((error as any).code === 'MODULE_NOT_FOUND' && (error as any).message.includes(SERVICE_ACCOUNT_KEY_PATH)) {
    console.error(`\n>>> SERVICE ACCOUNT KEY NOT FOUND at "${SERVICE_ACCOUNT_KEY_PATH}" <<<`);
    console.error("Please ensure you've downloaded your Firebase service account key JSON file and updated the 'SERVICE_ACCOUNT_KEY_PATH' variable in this script.");
  } else if ((error as any).code === 'app/duplicate-app') {
    console.warn('Firebase Admin SDK already initialized. This is normal if running script multiple times in some environments.');
  } else {
    process.exit(1);
  }
}

const db = admin.firestore();
const cultivarsCollection = db.collection('cultivars');

const mockCultivarsData: Omit<Cultivar, 'id' | 'reviews'>[] = [
  {
    name: 'Cosmic Haze',
    genetics: 'Sativa',
    status: 'verified',
    source: 'Internal Lab Test CH-001',
    description: 'An uplifting Sativa known for its cerebral effects and citrus aroma. Perfect for daytime use and creative endeavors.',
    supplierUrl: 'https://example.com/cosmic-haze',
    parents: ['Super Silver Haze', 'Galaxy OG'],
    children: ['Nebula Sparkle'],
    thc: { min: 20, max: 25 },
    cbd: { min: 0, max: 1 },
    cbc: { min: 0.1, max: 0.5 },
    cbg: { min: 0.5, max: 1.5 },
    images: [
      { id: 'img-ch-1', url: 'https://placehold.co/600x400.png', alt: 'Cosmic Haze bud', 'data-ai-hint': 'cannabis bud' },
      { id: 'img-ch-2', url: 'https://placehold.co/600x400.png', alt: 'Cosmic Haze plant', 'data-ai-hint': 'cannabis plant' },
    ],
    effects: ['Energetic', 'Creative', 'Uplifted', 'Happy'],
    medicalEffects: ['Stress Relief', 'Depression Relief', 'Fatigue'],
    terpeneProfile: [
      { id: 'tp-ch-1', name: 'Limonene', percentage: 1.2, description: 'Citrus aroma' },
      { id: 'tp-ch-2', name: 'Terpinolene', percentage: 0.8, description: 'Fruity, floral notes' },
    ],
    cultivationPhases: {
      germination: '3-5 days',
      rooting: '7-10 days',
      vegetative: '4-6 weeks',
      flowering: '9-11 weeks',
      harvest: 'After 9-11 weeks of flowering',
    },
    plantCharacteristics: {
      minHeight: 100,
      maxHeight: 180,
      minMoisture: 9,
      maxMoisture: 12,
      yieldPerPlant: { min: 300, max: 500 },
      yieldPerM2: { min: 450, max: 600 },
    },
    pricing: { min: 10, max: 15, avg: 12.50 },
    additionalInfo: {
      geneticCertificate: [{ id: 'cert-ch-1', name: 'Cosmic Haze COA', url: 'https://placehold.co/doc.pdf', fileType: 'pdf', category: 'geneticCertificate' }],
      plantPicture: [
        { id: 'addpic-ch-1', name: 'Trichome Macro', url: 'https://placehold.co/300x200.png', fileType: 'image', category: 'plantPicture', 'data-ai-hint': 'trichome macro' }
      ],
      cannabinoidInfo: [],
      terpeneInfo: [],
    },
  },
  {
    name: 'Indica Dream',
    genetics: 'Indica',
    status: 'recentlyAdded',
    source: 'Community Submission ID-002',
    description: 'A deeply relaxing Indica, perfect for unwinding at the end of the day. Features earthy and sweet notes.',
    supplierUrl: 'https://example.com/indica-dream',
    parents: ['Afghan Kush', 'Northern Lights'],
    thc: { min: 18, max: 22 },
    cbd: { min: 0, max: 2 },
    images: [
      { id: 'img-id-1', url: 'https://placehold.co/600x400.png', alt: 'Indica Dream bud', 'data-ai-hint': 'dark bud' },
    ],
    effects: ['Relaxed', 'Sleepy', 'Happy', 'Hungry'],
    medicalEffects: ['Pain Relief', 'Insomnia', 'Stress Relief'],
    terpeneProfile: [
      { id: 'tp-id-1', name: 'Myrcene', percentage: 1.5, description: 'Earthy, musky' },
      { id: 'tp-id-2', name: 'Beta-Caryophyllene', percentage: 0.7, description: 'Peppery, spicy' },
    ],
    cultivationPhases: {
      flowering: '8-9 weeks',
      germination: '4-7 days',
    },
    plantCharacteristics: {
      minHeight: 60,
      maxHeight: 120,
      yieldPerWatt: { min: 0.8, max: 1.2 },
    },
    pricing: { min: 9, max: 13, avg: 11.00 },
    additionalInfo: {
        geneticCertificate: [],
        plantPicture: [],
        cannabinoidInfo: [],
        terpeneInfo: [],
    }
  },
  {
    name: 'Hybrid Harmony',
    genetics: 'Hybrid',
    status: 'verified',
    description: 'A balanced hybrid offering the best of both worlds. Provides a gentle euphoria and relaxation without heavy sedation.',
    thc: { min: 19, max: 23 },
    cbd: { min: 0.5, max: 1.5 },
    images: [
        { id: 'img-hh-1', url: 'https://placehold.co/600x400.png', alt: 'Hybrid Harmony flower', 'data-ai-hint': 'green flower' },
    ],
    effects: ['Happy', 'Uplifted', 'Relaxed', 'Focused'],
    medicalEffects: ['Anxiety Relief', 'Mild Pain Relief'],
    terpeneProfile: [
        { id: 'tp-hh-1', name: 'Limonene', description: 'Citrus notes' },
        { id: 'tp-hh-2', name: 'Linalool', description: 'Floral, sweet' },
    ],
    cultivationPhases: {
        vegetative: '3-5 weeks',
        flowering: '8-10 weeks',
    },
    plantCharacteristics: {
        minHeight: 80,
        maxHeight: 150,
    },
    pricing: { avg: 11.75 },
    additionalInfo: {
        geneticCertificate: [],
        plantPicture: [],
        cannabinoidInfo: [],
        terpeneInfo: [],
    }
  },
  {
    name: 'Ruderalis Ranger',
    genetics: 'Ruderalis',
    status: 'recentlyAdded',
    description: 'A hardy autoflowering strain, known for its resilience and quick turnaround. Lower THC but great for beginners.',
    thc: { min: 8, max: 14 },
    cbd: { min: 1, max: 4 },
    images: [
      { id: 'img-rr-1', url: 'https://placehold.co/600x400.png', alt: 'Ruderalis Ranger plant', 'data-ai-hint': 'small plant' },
    ],
    effects: ['Calm', 'Mildly Relaxed'],
    cultivationPhases: {
        germination: '2-4 days',
        flowering: '6-8 weeks (auto)',
    },
    plantCharacteristics: {
        minHeight: 40,
        maxHeight: 80,
    },
    additionalInfo: {
        geneticCertificate: [],
        plantPicture: [],
        cannabinoidInfo: [],
        terpeneInfo: [],
    }
  },
];

const prepareDataForFirestore = (data: Record<string, any>): Record<string, any> => {
  const cleanedData: Record<string, any> = {};
  for (const key in data) {
    if (data[key] !== undefined) {
      cleanedData[key] = data[key];
    }
  }
  // Ensure essential array fields are present, even if empty
  const arrayFields: (keyof Omit<Cultivar, 'id' | 'reviews'>)[] = ['images', 'parents', 'children', 'effects', 'medicalEffects', 'terpeneProfile'];
    arrayFields.forEach(field => {
      if (cleanedData[field] === undefined) {
        cleanedData[field] = [];
      }
    });

    if (cleanedData.additionalInfo && typeof cleanedData.additionalInfo === 'object') {
      const ai = cleanedData.additionalInfo as NonNullable<Cultivar['additionalInfo']>;
      const expectedAICategories: (keyof NonNullable<Cultivar['additionalInfo']>)[] = ['geneticCertificate', 'plantPicture', 'cannabinoidInfo', 'terpeneInfo'];
      expectedAICategories.forEach(catKey => {
        if (ai[catKey] === undefined) {
          (ai[catKey] as any) = [];
        }
      });
    } else {
      cleanedData.additionalInfo = {
        geneticCertificate: [],
        plantPicture: [],
        cannabinoidInfo: [],
        terpeneInfo: [],
      };
    }

    // Ensure status is set, default to 'recentlyAdded' if not provided
    if (cleanedData.status === undefined) {
      cleanedData.status = 'recentlyAdded';
    }

  return cleanedData;
};


async function seedDatabase() {
  console.log(`Starting to seed ${mockCultivarsData.length} cultivars into Firestore...`);

  for (const cultivarData of mockCultivarsData) {
    try {
      const dataToSave = {
        ...cultivarData,
        reviews: [], 
      };
      const cleanedData = prepareDataForFirestore(dataToSave);
      const docRef = await cultivarsCollection.add(cleanedData);
      console.log(`Added cultivar "${cultivarData.name}" (Status: ${cleanedData.status}) with ID: ${docRef.id}`);
    } catch (error) {
      console.error(`Error adding cultivar "${cultivarData.name}":`, error);
    }
  }
  console.log('Database seeding completed.');
}

seedDatabase().catch(error => {
  console.error('Error during database seeding process:', error);
  process.exit(1);
});
