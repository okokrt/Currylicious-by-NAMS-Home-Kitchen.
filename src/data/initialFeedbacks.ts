import { Feedback } from '../types';

export const INITIAL_FEEDBACKS: Feedback[] = [
  {
    id: 'fb-1',
    customerName: 'Maria Santos',
    rating: 5,
    comment: 'The Butter Chicken Curry is so rich and creamy! Paired it with Garlic Butter Naan. Absolute perfection for dinner.',
    photoUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600',
    createdAt: '2026-07-25T14:30:00Z',
    dishName: 'Creamy Butter Chicken Curry',
  },
  {
    id: 'fb-2',
    customerName: 'Juan Dela Cruz',
    rating: 5,
    comment: 'Curry Pork Sisig is a masterpiece fusion! Crispy, spicy, with that rich curry leaf aroma. Will order again definitely!',
    photoUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600',
    createdAt: '2026-07-26T18:15:00Z',
    dishName: 'Curry Pork Sisig Special',
  },
  {
    id: 'fb-3',
    customerName: 'Angela Tan',
    rating: 4,
    comment: 'Super fast delivery and food arrived piping hot! The samosas are super crunchy and flavorful.',
    createdAt: '2026-07-27T11:40:00Z',
    dishName: 'Crispy Vegetable Samosas',
  }
];
