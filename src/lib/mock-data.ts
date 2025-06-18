import type { Cultivar } from '@/types';

export const mockCultivars: Cultivar[] = [
  {
    id: '1',
    name: 'GreenLeaf Serenity',
    genetics: 'Indica',
    thc: { min: 18, max: 22 },
    cbd: { min: 0.5, max: 1.5 },
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
  },
  {
    id: '2',
    name: 'Golden Aura Uplift',
    genetics: 'Sativa',
    thc: { min: 20, max: 25 },
    cbd: { min: 0.2, max: 0.8 },
    effects: ['Uplifted', 'Energetic', 'Creative', 'Focused'],
    description: 'A vibrant sativa designed to boost creativity and energy. Ideal for daytime use, it provides a clear-headed, focused high that can help power through tasks or inspire artistic endeavors. Features a citrusy, zesty flavor profile.',
    images: [
      { id: 'img2-1', url: 'https://placehold.co/600x400.png', alt: 'Golden Aura Uplift Bud', "data-ai-hint": "cannabis flower" },
      { id: 'img2-2', url: 'https://placehold.co/600x400.png', alt: 'Golden Aura Uplift Trichomes', "data-ai-hint": "cannabis macro" },
    ],
    reviews: [
      { id: 'rev2-1', user: 'Charlie', rating: 5, text: 'My go-to for creative work! No couch-lock, just pure focus.', createdAt: new Date().toISOString(), sentimentScore: 0.95 },
    ],
  },
  {
    id: '3',
    name: 'Mystic Harmony Blend',
    genetics: 'Hybrid',
    thc: { min: 19, max: 23 },
    cbd: { min: 1, max: 2 },
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
  },
];

export const getAllEffects = (): string[] => {
  const allEffects = new Set<string>();
  mockCultivars.forEach(cultivar => {
    cultivar.effects.forEach(effect => allEffects.add(effect));
  });
  return Array.from(allEffects).sort();
};
