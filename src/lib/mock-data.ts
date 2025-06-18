
import type { Cultivar, Terpene } from '@/types';

export const TERPENE_CATEGORIES = {
  PRIMARY: "Primary (Major) Terpenes",
  SECONDARY: "Secondary (Minor) Terpenes",
  ADDITIONAL: "Additional Terpenes (often at trace levels)",
};

export const TERPENE_OPTIONS: { name: string; category: string }[] = [
  { name: "Myrcene", category: TERPENE_CATEGORIES.PRIMARY },
  { name: "Beta-Caryophyllene", category: TERPENE_CATEGORIES.PRIMARY },
  { name: "Limonene", category: TERPENE_CATEGORIES.PRIMARY },
  { name: "Alpha-Pinene", category: TERPENE_CATEGORIES.PRIMARY },
  { name: "Beta-Pinene", category: TERPENE_CATEGORIES.PRIMARY },
  { name: "Linalool", category: TERPENE_CATEGORIES.PRIMARY },
  { name: "Humulene", category: TERPENE_CATEGORIES.PRIMARY },
  { name: "Terpinolene", category: TERPENE_CATEGORIES.PRIMARY },
  { name: "Ocimene", category: TERPENE_CATEGORIES.PRIMARY },

  { name: "Nerolidol", category: TERPENE_CATEGORIES.SECONDARY },
  { name: "Valencene", category: TERPENE_CATEGORIES.SECONDARY },
  { name: "Camphene", category: TERPENE_CATEGORIES.SECONDARY },
  { name: "Sabinene", category: TERPENE_CATEGORIES.SECONDARY },
  { name: "Alpha-Terpineol", category: TERPENE_CATEGORIES.SECONDARY },
  { name: "Geraniol", category: TERPENE_CATEGORIES.SECONDARY },
  { name: "Guaiol", category: TERPENE_CATEGORIES.SECONDARY },
  { name: "Camphor", category: TERPENE_CATEGORIES.SECONDARY },
  { name: "Bisabolol", category: TERPENE_CATEGORIES.SECONDARY },
  { name: "Farnesene", category: TERPENE_CATEGORIES.SECONDARY },
  { name: "Phellandrene", category: TERPENE_CATEGORIES.SECONDARY },
  { name: "Isopulegol", category: TERPENE_CATEGORIES.SECONDARY },
  { name: "Eucalyptol (1,8-Cineole)", category: TERPENE_CATEGORIES.SECONDARY },

  { name: "Borneol", category: TERPENE_CATEGORIES.ADDITIONAL },
  { name: "Cedrene", category: TERPENE_CATEGORIES.ADDITIONAL },
  { name: "Fenchol", category: TERPENE_CATEGORIES.ADDITIONAL },
  { name: "Terpineol", category: TERPENE_CATEGORIES.ADDITIONAL },
  { name: "Bergamotene", category: TERPENE_CATEGORIES.ADDITIONAL },
];

export const groupTerpenesByCategory = () => {
  const grouped = TERPENE_OPTIONS.reduce((acc, terpene) => {
    const category = terpene.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(terpene.name);
    return acc;
  }, {} as Record<string, string[]>);
  
  const orderedCategories = [
    TERPENE_CATEGORIES.PRIMARY,
    TERPENE_CATEGORIES.SECONDARY,
    TERPENE_CATEGORIES.ADDITIONAL,
  ];

  return orderedCategories
    .filter(categoryLabel => grouped[categoryLabel])
    .map(categoryLabel => ({
      label: categoryLabel,
      options: grouped[categoryLabel].sort(),
  }));
};

export const EFFECT_OPTIONS: string[] = [
  'Relaxed', 'Sleepy', 'Happy', 'Uplifted', 'Energetic', 'Creative', 'Focused', 
  'Euphoric', 'Talkative', 'Giggly', 'Hungry', 'Tingly', 'Aroused', 'Calm', 'Inspired',
  'Dry Mouth', 'Dry Eyes', 'Paranoid', 'Anxious', 'Dizzy' 
].sort();

export const MEDICAL_EFFECT_OPTIONS: string[] = [
  'Pain Relief', 'Stress Relief', 'Anxiety Relief', 'Anti-inflammatory', 'Nausea Relief', 
  'Appetite Stimulation', 'Sleep Aid', 'Depression Relief', 'Muscle Spasm Relief', 
  'Seizure Reduction', 'Headache Relief', 'Migraine Relief', 'PTSD Symptom Relief', 
  'ADHD/ADD Symptom Relief', 'Arthritis Relief', 'Cancer Symptom Relief', 'Anti-emetic',
  'Neuroprotective', 'Glaucoma Relief', 'Fibromyalgia Relief'
].sort();

export const FLAVOR_OPTIONS: string[] = [
  'Earthy', 'Sweet', 'Citrus', 'Diesel', 'Pungent', 'Woody', 'Pine', 'Spicy/Herbal', 
  'Berry', 'Tropical', 'Flowery', 'Skunky', 'Chemical', 'Fruity', 'Nutty', 'Minty', 
  'Vanilla', 'Coffee', 'Grape', 'Lemon', 'Orange', 'Pepper', 'Ammonia', 'Blueberry',
  'Cheese', 'Chestnut', 'Lavender', 'Lime', 'Mango', 'Menthol', 'Peach', 'Pear', 'Plum',
  'Rose', 'Sage', 'Strawberry', 'Tar', 'Tea', 'Tobacco', 'Tree Fruit', 'Violet'
].sort();


// mockCultivars array has been removed as data will now be fetched from Firebase.
// You will need to seed your Firestore 'cultivars' collection with initial data.
// The structure of each cultivar document should match the Cultivar type in src/types/index.ts.

export const getAllEffects = (): string[] => {
  return EFFECT_OPTIONS;
};
