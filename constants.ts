import type { HistoricalScene } from './types';

export const HISTORICAL_SCENES: HistoricalScene[] = [
  {
    id: 'renaissance',
    name: 'Renaissance Portrait',
    prompt: 'A detailed and dramatic oil painting of the person in the style of a Renaissance master like Leonardo da Vinci or Rembrandt. The lighting should be chiaroscuro, and the attire should be opulent and period-accurate.',
    imageUrl: 'https://images.unsplash.com/photo-1561069934-eee225952461?w=400&h=400&fit=crop',
    imageKeywords: ['renaissance', 'painting', 'portrait'],
  },
  {
    id: 'wwii',
    name: 'WWII Correspondent',
    prompt: 'A gritty, black and white photograph of the person as a war correspondent during World War II, with a vintage camera. The background should show a historic European city with a sense of urgency and history.',
    imageUrl: 'https://images.unsplash.com/photo-1494959764136-6be9eb3c261e?w=400&h=400&fit=crop',
    imageKeywords: ['ww2', 'historic', 'black and white'],
  },
  {
    id: 'noir',
    name: 'Film Noir Detective',
    prompt: 'A shadowy, high-contrast scene from a 1940s film noir. The person is a detective in a trench coat, standing on a rain-slicked city street at night, with dramatic lighting from a streetlamp.',
    imageUrl: 'https://images.unsplash.com/photo-1519068039123-559a45198a24?w=400&h=400&fit=crop',
    imageKeywords: ['film noir', 'detective', 'night city'],
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Future',
    prompt: 'A vibrant, neon-lit cyberpunk city of the future. The person has futuristic cybernetic enhancements and is surrounded by flying vehicles and holographic advertisements.',
    imageUrl: 'https://images.unsplash.com/photo-1593349348148-9599d150244a?w=400&h=400&fit=crop',
    imageKeywords: ['cyberpunk', 'neon', 'future city'],
  },
  {
    id: 'viking',
    name: 'Viking Explorer',
    prompt: 'A rugged Viking explorer standing on the prow of a longship, navigating through icy fjords. The person has braided hair and is wearing furs and leather armor.',
    imageUrl: 'https://images.unsplash.com/photo-1531639333923-91b35e69192f?w=400&h=400&fit=crop',
    imageKeywords: ['viking', 'fjord', 'longship'],
  },
  {
    id: 'impressionism',
    name: 'Impressionist Painting',
    prompt: 'The person is featured in a sun-dappled garden scene, painted in the soft, vibrant style of an Impressionist master like Monet or Renoir, with visible brushstrokes.',
    imageUrl: 'https://images.unsplash.com/photo-1589255739506-5054e031f5f2?w=400&h=400&fit=crop',
    imageKeywords: ['impressionism', 'painting', 'garden'],
  },
];