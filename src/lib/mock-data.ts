
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
  
  // Ensure consistent order of categories
  const orderedCategories = [
    TERPENE_CATEGORIES.PRIMARY,
    TERPENE_CATEGORIES.SECONDARY,
    TERPENE_CATEGORIES.ADDITIONAL,
  ];

  return orderedCategories
    .filter(categoryLabel => grouped[categoryLabel]) // Only include categories that have terpenes
    .map(categoryLabel => ({
      label: categoryLabel,
      options: grouped[categoryLabel].sort(),
  }));
};


export const mockCultivars: Cultivar[] = [
  {
    id: '1',
    name: 'GreenLeaf Serenity',
    genetics: 'Indica',
    thc: { min: 18, max: 22 },
    cbd: { min: 0.5, max: 1.5 },
    cbc: { min: 0.1, max: 0.3 },
    cbg: { min: 0.2, max: 0.5 },
    cbn: { min: 0.05, max: 0.2 },
    thcv: { min: 0.1, max: 0.4 },
    effects: ['Relaxed', 'Sleepy', 'Happy'],
    description: 'A calming indica strain perfect for unwinding after a long day. Offers a sense of deep relaxation and tranquility, often leading to a restful night\'s sleep. Its earthy aroma is complemented by subtle sweet notes.',
    images: [
      { id: 'img1-1', url: 'https://placehold.co/600x400.png', alt: 'GreenLeaf Serenity Bud 1', "data-ai-hint": "cannabis bud" },
      { id: 'img1-2', url: 'https://placehold.co/600x400.png', alt: 'GreenLeaf Serenity Plant', "data-ai-hint": "cannabis plant" },
      { id: 'img1-3', url: 'https://placehold.co/600x400.png', alt: 'GreenLeaf Serenity Close-up', "data-ai-hint": "trichome macro" },
    ],
    reviews: [
      { id: 'rev1-1', user: 'Alice', rating: 5, text: 'Absolutely fantastic for my insomnia. Best sleep I\'ve had in weeks!', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), sentimentScore: 0.9 },
      { id: 'rev1-2', user: 'Bob', rating: 4, text: 'Very relaxing, a bit too much munchies though. Great for movie nights.', createdAt: new Date(Date.now() - 86400000).toISOString(), sentimentScore: 0.7 },
    ],
    cultivationPhases: {
      rooting: "7-14 days",
      vegetative: "4-6 weeks",
      flowering: "8-9 weeks",
      harvest: "After 8-9 weeks of flowering"
    },
    plantCharacteristics: {
      minHeight: 60,
      maxHeight: 100,
      minMoisture: 10,
      maxMoisture: 12,
      yieldPerPlant: { min: 30, max: 60 }, 
      yieldPerWatt: { min: 0.5, max: 1.0 }, 
      yieldPerM2: { min: 300, max: 500 } 
    },
    additionalInfo: {
      geneticCertificate: [
        { id: 'gc1-1', name: 'GreenLeaf_GC_Auth.pdf', url: 'https://placehold.co/200x100.png?text=GeneticCert.pdf', fileType: 'pdf', category: 'geneticCertificate' },
      ],
      plantPicture: [ 
        { id: 'pp1-1', name: 'Mother_Plant_GLS.jpg', url: 'https://placehold.co/120x90.png', fileType: 'image', category: 'plantPicture', 'data-ai-hint': 'cannabis motherPlant' },
      ],
      cannabinoidInfo: [
        { id: 'ci1-1', name: 'Lab_Report_Cannabinoids_GLS.pdf', url: 'https://placehold.co/200x100.png?text=CannabinoidData.pdf', fileType: 'pdf', category: 'cannabinoidInfo' },
      ],
      terpeneInfo: [
        { id: 'ti1-1', name: 'Terpene_Profile_GLS.jpg', url: 'https://placehold.co/120x90.png', fileType: 'image', category: 'terpeneInfo', 'data-ai-hint': 'terpene chart' },
        { id: 'ti1-2', name: 'Detailed_Terpenes_GLS.pdf', url: 'https://placehold.co/200x100.png?text=TerpeneReport.pdf', fileType: 'pdf', category: 'terpeneInfo' },
      ],
    },
    terpeneProfile: [
      { id: 'tp1-1-gls', name: 'Myrcene', description: 'Earthy, musky, herbal', percentage: 0.8 },
      { id: 'tp1-2-gls', name: 'Beta-Caryophyllene', description: 'Spicy, peppery, woody', percentage: 0.5 },
      { id: 'tp1-3-gls', name: 'Limonene', description: 'Citrus, lemon, fresh', percentage: 0.3 },
    ]
  },
  {
    id: '2',
    name: 'Golden Aura Uplift',
    genetics: 'Sativa',
    thc: { min: 20, max: 25 },
    cbd: { min: 0.2, max: 0.8 },
    cbc: { min: 0.2, max: 0.4 },
    cbg: { min: 0.3, max: 0.7 },
    cbn: { min: 0.1, max: 0.3 },
    thcv: { min: 0.3, max: 0.8 },
    effects: ['Uplifted', 'Energetic', 'Creative', 'Focused'],
    description: 'A vibrant sativa designed to boost creativity and energy. Ideal for daytime use, it provides a clear-headed, focused high that can help power through tasks or inspire artistic endeavors. Features a citrusy, zesty flavor profile.',
    images: [
      { id: 'img2-1', url: 'https://placehold.co/600x400.png', alt: 'Golden Aura Uplift Bud', "data-ai-hint": "cannabis flower" },
      { id: 'img2-2', url: 'https://placehold.co/600x400.png', alt: 'Golden Aura Uplift Trichomes', "data-ai-hint": "cannabis macro" },
    ],
    reviews: [
      { id: 'rev2-1', user: 'Charlie', rating: 5, text: 'My go-to for creative work! No couch-lock, just pure focus.', createdAt: new Date().toISOString(), sentimentScore: 0.95 },
    ],
    cultivationPhases: {
      rooting: "10-16 days",
      vegetative: "3-5 weeks",
      flowering: "9-11 weeks",
      harvest: "After 9-11 weeks of flowering"
    },
    plantCharacteristics: {
      minHeight: 100,
      maxHeight: 180,
      minMoisture: 9,
      maxMoisture: 11,
      yieldPerWatt: { min: 0.8, max: 1.2 }, 
      yieldPerM2: { min: 400, max: 600 } 
    },
    additionalInfo: {
      plantPicture: [
        { id: 'pp2-1', name: 'GoldenAura_Seedling.jpg', url: 'https://placehold.co/120x90.png', fileType: 'image', category: 'plantPicture', 'data-ai-hint': 'cannabis seedling' },
      ],
      terpeneInfo: [
        { id: 'ti2-1', name: 'GAU_Terpene_Analysis.pdf', url: 'https://placehold.co/200x100.png?text=GAU_Terpenes.pdf', fileType: 'pdf', category: 'terpeneInfo' },
      ]
    },
    terpeneProfile: [
      { id: 'tp2-1-gau', name: 'Terpinolene', description: 'Fruity, floral, piney', percentage: 1.2 },
      { id: 'tp2-2-gau', name: 'Ocimene', description: 'Sweet, herbal, woody', percentage: 0.6 },
    ]
  },
  {
    id: '3',
    name: 'Mystic Harmony Blend',
    genetics: 'Hybrid',
    thc: { min: 19, max: 23 },
    cbd: { min: 1, max: 2 },
    cbc: { min: 0.3, max: 0.6 },
    cbg: { min: 0.4, max: 0.8 },
    thcv: { min: 0.2, max: 0.5 },
    effects: ['Balanced', 'Happy', 'Relaxed', 'Euphoric'],
    description: 'A well-balanced hybrid that offers the best of both worlds. It starts with a gentle euphoric lift, gradually easing into a comfortable state of relaxation without heavy sedation. Notes of pine and berry.',
    images: [
      { id: 'img3-1', url: 'https://placehold.co/600x400.png', alt: 'Mystic Harmony Blend Detail', "data-ai-hint": "marijuana bud" },
      { id: 'img3-2', url: 'https://placehold.co/600x400.png', alt: 'Mystic Harmony Blend Leaves', "data-ai-hint": "cannabis leaves" },
      { id: 'img3-3', url: 'https://placehold.co/600x400.png', alt: 'Mystic Harmony Blend Buds Stacked', "data-ai-hint": "cannabis harvest" },
    ],
    reviews: [
      { id: 'rev3-1', user: 'Diana', rating: 4, text: 'Good for social gatherings, makes me giggly and relaxed.', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), sentimentScore: 0.8 },
      { id: 'rev3-2', user: 'Edward', rating: 5, text: 'Perfectly balanced, helps with my anxiety without making me sleepy.', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), sentimentScore: 0.88 },
    ],
    cultivationPhases: {
      rooting: "7-12 days",
      vegetative: "4-7 weeks",
      flowering: "8-10 weeks",
      harvest: "After 8-10 weeks of flowering"
    },
    plantCharacteristics: {
      minHeight: 80,
      maxHeight: 150,
      minMoisture: 10,
      maxMoisture: 12,
      yieldPerPlant: { min: 25, max: 50 } 
    },
    terpeneProfile: [
      { id: 'tp3-1-mhb', name: 'Alpha-Pinene', description: 'Pine, woody, sharp', percentage: 0.7 },
      { id: 'tp3-2-mhb', name: 'Humulene', description: 'Earthy, woody, spicy', percentage: 0.4 },
    ]
  },
  {
    id: '4',
    name: 'Crimson Peak Power',
    genetics: 'Sativa',
    thc: { min: 22, max: 28 },
    cbd: { min: 0.1, max: 0.5 },
    effects: ['Energetic', 'Euphoric', 'Talkative'],
    description: 'A potent Sativa known for its strong cerebral effects and energizing buzz. Not for the faint of heart, Crimson Peak Power delivers a rush of euphoria and creativity. It has a spicy, peppery aroma.',
    images: [
      { id: 'img4-1', url: 'https://placehold.co/600x400.png', alt: 'Crimson Peak Power Bud Structure', "data-ai-hint": "sativa bud" },
    ],
    reviews: [],
    cultivationPhases: {
      rooting: "12-18 days",
      vegetative: "5-8 weeks",
      flowering: "10-12 weeks",
      harvest: "After 10-12 weeks of flowering"
    },
    plantCharacteristics: {
        minHeight: 120,
        maxHeight: 200,
        yieldPerPlant: { min: 50, max: 90 }, 
        yieldPerWatt: { min: 0.7, max: 1.1 }, 
    },
    additionalInfo: {
      geneticCertificate: [
        { id: 'gc4-1', name: 'CPP_Genetics_Official.pdf', url: 'https://placehold.co/200x100.png?text=CPP_Genetics.pdf', fileType: 'pdf', category: 'geneticCertificate' },
      ]
    },
    terpeneProfile: []
  },
  {
    id: '5',
    name: 'Arctic AutoBloom',
    genetics: 'Ruderalis',
    thc: { min: 10, max: 15 },
    cbd: { min: 0.5, max: 1.0 },
    effects: ['Mild', 'Relaxed', 'Quick Onset'],
    description: 'A hardy Ruderalis strain known for its autoflowering capabilities and resilience. Provides a mild, manageable effect perfect for beginners or those seeking a less intense experience. Earthy and slightly woody notes.',
    images: [
      { id: 'img5-1', url: 'https://placehold.co/600x400.png', alt: 'Arctic AutoBloom Plant', "data-ai-hint": "ruderalis plant" },
    ],
    reviews: [
      { id: 'rev5-1', user: 'Frank', rating: 4, text: 'Super easy to grow and harvest. Decent, mild buzz.', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), sentimentScore: 0.6 },
    ],
    cultivationPhases: {
      rooting: "5-10 days",
      vegetative: "2-3 weeks",
      flowering: "6-8 weeks (autoflower)",
      harvest: "Around 8-10 weeks from seed"
    },
    plantCharacteristics: {
      minHeight: 30,
      maxHeight: 70,
      minMoisture: 10,
      maxMoisture: 13,
      yieldPerPlant: { min: 15, max: 30 },
    },
    terpeneProfile: [
      { id: 'tp5-1-aab', name: 'Linalool', description: 'Floral, lavender, sweet', percentage: 0.9 },
    ]
  }
];

export const getAllEffects = (): string[] => {
  const allEffects = new Set<string>();
  mockCultivars.forEach(cultivar => {
    cultivar.effects.forEach(effect => allEffects.add(effect));
  });
  return Array.from(allEffects).sort();
};
